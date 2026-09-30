package cloud.joysky.llmgateway.open.service;

import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.open.model.OpenAuthContext;
import java.net.SocketTimeoutException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * OpenAPI 代理转发
 */
@Service
public class OpenApiProxyService
{
    private static final Logger log = LoggerFactory.getLogger(OpenApiProxyService.class);

    public ResponseEntity<byte[]> forward(OpenAuthContext context, HttpServletRequest request, byte[] body)
    {
        try
        {
            HttpMethod httpMethod = HttpMethod.resolve(request.getMethod());
            if (httpMethod == null)
            {
                log.error("[OpenAPI] 不支持的请求方法: method={}", request.getMethod());
                throw new OpenProxyException(50001, "不支持的请求方法");
            }

            RestTemplate restTemplate = new RestTemplate(buildFactory(context.getTimeoutMs()));
            HttpHeaders headers = copyHeaders(request);
            headers.set("X-Trace-Id", request.getAttribute("OPEN_TRACE_ID") == null ? "" : String.valueOf(request.getAttribute("OPEN_TRACE_ID")));

            String forwardUrl = buildForwardUrl(context.getTargetUrl(), request.getQueryString());
            HttpEntity<byte[]> entity = new HttpEntity<byte[]>(body == null ? new byte[0] : body, headers);

            log.info("[OpenAPI] 开始转发: method={}, url={}, timeout={}ms", httpMethod, forwardUrl, context.getTimeoutMs());
            long start = System.currentTimeMillis();
            ResponseEntity<byte[]> response = restTemplate.exchange(forwardUrl, httpMethod, entity, byte[].class);
            long cost = System.currentTimeMillis() - start;
            log.info("[OpenAPI] 转发完成: url={}, httpStatus={}, cost={}ms", forwardUrl, response.getStatusCodeValue(), cost);

            return response;
        }
        catch (ResourceAccessException ex)
        {
            if (isTimeout(ex))
            {
                log.error("[OpenAPI] 请求超时: targetUrl={}, timeout={}ms", context.getTargetUrl(), context.getTimeoutMs());
                throw new OpenProxyException(50002, "请求超时");
            }
            log.error("[OpenAPI] 后端服务调用失败: targetUrl={}", context.getTargetUrl(), ex);
            throw new OpenProxyException(50001, "后端服务调用失败: " + ex.getMessage());
        }
        catch (RestClientException ex)
        {
            log.error("[OpenAPI] 后端服务调用异常: targetUrl={}", context.getTargetUrl(), ex);
            throw new OpenProxyException(50001, "后端服务调用失败: " + ex.getMessage());
        }
    }

    private String buildForwardUrl(String targetUrl, String queryString)
    {
        if (StringUtils.isBlank(queryString))
        {
            return targetUrl;
        }
        String connector = Optional.ofNullable(targetUrl).orElse("").contains("?") ? "&" : "?";
        return targetUrl + connector + queryString;
    }

    private HttpHeaders copyHeaders(HttpServletRequest request)
    {
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames == null)
        {
            return headers;
        }

        while (headerNames.hasMoreElements())
        {
            String name = headerNames.nextElement();
            if (isSkipHeader(name))
            {
                continue;
            }
            headers.put(name, Collections.list(request.getHeaders(name)));
        }
        return headers;
    }

    private boolean isSkipHeader(String name)
    {
        if (name == null)
        {
            return true;
        }
        String lower = name.toLowerCase();
        return "host".equals(lower) || "content-length".equals(lower)
                || "x-app-key".equals(lower) || "x-timestamp".equals(lower)
                || "x-nonce".equals(lower) || "x-sign".equals(lower);
    }

    private SimpleClientHttpRequestFactory buildFactory(Integer timeoutMs)
    {
        int timeout = timeoutMs == null || timeoutMs <= 0 ? 5000 : timeoutMs;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        return factory;
    }

    private boolean isTimeout(ResourceAccessException ex)
    {
        Throwable cause = ex.getCause();
        if (cause instanceof SocketTimeoutException)
        {
            return true;
        }
        String msg = ex.getMessage();
        return msg != null && msg.toLowerCase().contains("timed out");
    }

    public static class OpenProxyException extends RuntimeException
    {
        private final int code;

        public OpenProxyException(int code, String message)
        {
            super(message);
            this.code = code;
        }

        public int getCode()
        {
            return code;
        }
    }
}
