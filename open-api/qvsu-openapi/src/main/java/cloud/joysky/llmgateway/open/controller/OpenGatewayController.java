package cloud.joysky.llmgateway.open.controller;

import com.alibaba.fastjson.JSON;
import cloud.joysky.llmgateway.open.model.OpenAuthContext;
import cloud.joysky.llmgateway.open.model.OpenResult;
import cloud.joysky.llmgateway.open.service.OpenApiProxyService;
import cloud.joysky.llmgateway.open.trace.TraceContext;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * OpenAPI 统一代理入口
 */
@RestController
public class OpenGatewayController
{
    private static final Logger log = LoggerFactory.getLogger(OpenGatewayController.class);

    private final OpenApiProxyService openApiProxyService;

    public OpenGatewayController(OpenApiProxyService openApiProxyService)
    {
        this.openApiProxyService = openApiProxyService;
    }

    @RequestMapping("/open/**")
    public ResponseEntity<?> gateway(HttpServletRequest request) throws IOException
    {
        String traceId = TraceContext.get();
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        Object contextObj = request.getAttribute("OPEN_AUTH_CONTEXT");
        if (!(contextObj instanceof OpenAuthContext))
        {
            log.error("[OpenAPI] 鉴权上下文丢失: traceId={}, path={}", traceId, requestPath);
            OpenResult<?> result = OpenResult.fail(40001, "鉴权上下文丢失");
            request.setAttribute("OPEN_RESPONSE_BODY", JSON.toJSONString(result));
            request.setAttribute("OPEN_RESPONSE_CODE", 200);
            request.setAttribute("OPEN_RESPONSE_HEADERS", buildDefaultResponseHeaders());
            return ResponseEntity.ok().header("X-Trace-Id", traceId).body(result);
        }

        OpenAuthContext context = (OpenAuthContext) contextObj;
        log.info("[OpenAPI] 开始转发请求: traceId={}, appKey={}, targetUrl={}, path={}", traceId, context.getAppKey(), context.getTargetUrl(), requestPath);

        try
        {
            byte[] body = StreamUtils.copyToByteArray(request.getInputStream());
            ResponseEntity<byte[]> response = openApiProxyService.forward(context, request, body);

            Object data = parseProxyBody(response.getBody());
            OpenResult<Object> result = OpenResult.ok(data);
            String responseBody = JSON.toJSONString(result);
            request.setAttribute("OPEN_RESPONSE_BODY", responseBody);
            request.setAttribute("OPEN_RESPONSE_CODE", 200);
            request.setAttribute("OPEN_RESPONSE_HEADERS", buildHeadersJson(response.getHeaders()));

            log.info("[OpenAPI] 转发成功: traceId={}, httpStatus={}, path={}", traceId, response.getStatusCodeValue(), requestPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Trace-Id", traceId)
                    .body(result);
        }
        catch (OpenApiProxyService.OpenProxyException ex)
        {
            log.warn("[OpenAPI] 转发失败: traceId={}, code={}, msg={}, path={}", traceId, ex.getCode(), ex.getMessage(), requestPath);
            OpenResult<?> result = OpenResult.fail(ex.getCode(), ex.getMessage());
            request.setAttribute("OPEN_RESPONSE_BODY", JSON.toJSONString(result));
            request.setAttribute("OPEN_RESPONSE_CODE", 200);
            request.setAttribute("OPEN_RESPONSE_HEADERS", buildDefaultResponseHeaders());
            return ResponseEntity.ok()
                    .header("X-Trace-Id", traceId)
                    .body(result);
        }
        catch (Exception ex)
        {
            log.error("[OpenAPI] 转发异常: traceId={}, path={}", traceId, requestPath, ex);
            OpenResult<?> result = OpenResult.fail(50001, "转发异常");
            request.setAttribute("OPEN_RESPONSE_BODY", JSON.toJSONString(result));
            request.setAttribute("OPEN_RESPONSE_CODE", 200);
            request.setAttribute("OPEN_RESPONSE_HEADERS", buildDefaultResponseHeaders());
            return ResponseEntity.ok()
                    .header("X-Trace-Id", traceId)
                    .body(result);
        }
    }

    private Object parseProxyBody(byte[] body)
    {
        if (body == null || body.length == 0)
        {
            return null;
        }
        String text = new String(body, StandardCharsets.UTF_8);
        try
        {
            return JSON.parse(text);
        }
        catch (Exception ignored)
        {
            return text;
        }
    }

    private String buildDefaultResponseHeaders()
    {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Trace-Id", TraceContext.get());
        return buildHeadersJson(headers);
    }

    private String buildHeadersJson(HttpHeaders headers)
    {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        headers.forEach((key, values) -> map.put(key, values == null || values.size() != 1 ? values : values.get(0)));
        return JSON.toJSONString(map);
    }
}
