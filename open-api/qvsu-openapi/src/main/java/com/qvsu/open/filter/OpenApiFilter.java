package com.qvsu.open.filter;

import com.alibaba.fastjson.JSON;
import com.qvsu.open.model.OpenAuthContext;
import com.qvsu.open.model.OpenResult;
import com.qvsu.open.service.OpenApiLogService;
import com.qvsu.open.service.OpenApiSecurityService;
import com.qvsu.open.trace.TraceContext;
import com.qvsu.open.web.CachedBodyHttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * OpenAPI 鉴权过滤器
 */
@Component
public class OpenApiFilter extends OncePerRequestFilter
{
    private static final Logger log = LoggerFactory.getLogger(OpenApiFilter.class);

    private final OpenApiSecurityService openApiSecurityService;

    private final OpenApiLogService openApiLogService;

    public OpenApiFilter(OpenApiSecurityService openApiSecurityService, OpenApiLogService openApiLogService)
    {
        this.openApiSecurityService = openApiSecurityService;
        this.openApiLogService = openApiLogService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
    {
        return !request.getRequestURI().startsWith("/open/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException
    {
        CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request);

        String traceId = request.getHeader("X-Trace-Id");
        if (traceId == null || traceId.trim().isEmpty())
        {
            traceId = UUID.randomUUID().toString();
        }

        long start = System.currentTimeMillis();
        OpenAuthContext authContext = null;
        String requestBody = cachedRequest.getBodyAsString();
        int status = 0;
        String errorMsg = null;
        Integer responseCode = 200;
        String responseBody = null;

        TraceContext.set(traceId);
        MDC.put("traceId", traceId);
        response.setHeader("X-Trace-Id", traceId);
        request.setAttribute("OPEN_TRACE_ID", traceId);

        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);

        log.info("[OpenAPI] 收到请求: traceId={}, method={}, path={}, clientIp={}", traceId, method, requestPath, clientIp);

        try
        {
            authContext = openApiSecurityService.authenticate(cachedRequest, requestBody);
            request.setAttribute("OPEN_AUTH_CONTEXT", authContext);
            log.info("[OpenAPI] 鉴权通过，开始转发: traceId={}, appKey={}, appName={}", traceId, authContext.getAppKey(), authContext.getAppName());
            filterChain.doFilter(cachedRequest, response);
        }
        catch (OpenApiSecurityService.OpenApiSecurityException ex)
        {
            status = 1;
            errorMsg = ex.getMessage();
            responseBody = writeError(response, ex.getCode(), ex.getMessage());
            log.warn("[OpenAPI] 鉴权失败: traceId={}, path={}, code={}, msg={}", traceId, requestPath, ex.getCode(), ex.getMessage());
        }
        catch (Exception ex)
        {
            status = 2;
            errorMsg = ex.getMessage();
            responseBody = writeError(response, 50001, "系统处理异常");
            log.error("[OpenAPI] 请求处理异常: traceId={}, path={}", traceId, requestPath, ex);
        }
        finally
        {
            long cost = System.currentTimeMillis() - start;
            if (responseBody == null)
            {
                Object bodyAttr = request.getAttribute("OPEN_RESPONSE_BODY");
                responseBody = bodyAttr == null ? null : String.valueOf(bodyAttr);
            }
            if (responseCode == null)
            {
                Object codeAttr = request.getAttribute("OPEN_RESPONSE_CODE");
                responseCode = codeAttr instanceof Integer ? (Integer) codeAttr : response.getStatus();
            }
            else
            {
                Object codeAttr = request.getAttribute("OPEN_RESPONSE_CODE");
                if (codeAttr instanceof Integer)
                {
                    responseCode = (Integer) codeAttr;
                }
            }
            openApiLogService.save(traceId, authContext, cachedRequest, response, requestBody, responseCode, responseBody, status, errorMsg, cost);

            log.info("[OpenAPI] 请求完成: traceId={}, path={}, status={}, cost={}ms", traceId, requestPath, status == 0 ? "成功" : "失败", cost);

            TraceContext.clear();
            MDC.remove("traceId");
        }
    }

    private String getClientIp(HttpServletRequest request)
    {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip))
        {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip))
        {
            ip = request.getRemoteAddr();
        }
        // 多级代理时取第一个IP
        if (ip != null && ip.contains(","))
        {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private String writeError(HttpServletResponse response, int code, String msg) throws IOException
    {
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(200);
        String body = JSON.toJSONString(OpenResult.fail(code, msg));
        response.getWriter().write(body);
        response.getWriter().flush();
        return body;
    }
}
