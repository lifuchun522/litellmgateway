package com.qvsu.open.service;

import com.qvsu.common.utils.IpUtils;
import com.qvsu.common.utils.StringUtils;
import com.qvsu.open.model.OpenAuthContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * OpenAPI 调用日志
 */
@Service
public class OpenApiLogService
{
    private static final Logger log = LoggerFactory.getLogger(OpenApiLogService.class);
    private static final int TEXT_MAX_LENGTH = 4000;

    private final JdbcTemplate jdbcTemplate;

    public OpenApiLogService(JdbcTemplate jdbcTemplate)
    {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(String traceId, OpenAuthContext authContext, HttpServletRequest request, HttpServletResponse response,
            String requestBody, Integer httpCode, String responseBody, Integer status, String errorMsg, long costMs)
    {
        try
        {
            jdbcTemplate.update(
                    "insert into open_call_log(trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time) values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    traceId,
                    authContext == null ? null : authContext.getAppKey(),
                    authContext == null ? null : authContext.getAppName(),
                    request.getRequestURI(),
                    request.getMethod(),
                    cut(requestBody),
                    httpCode,
                    cut(responseBody),
                    (int) costMs,
                    status,
                    cut(errorMsg),
                    IpUtils.getIpAddr(request),
                    new java.util.Date());
            log.debug("[OpenAPI] 调用日志已保存: traceId={}, status={}, cost={}ms", traceId, status, costMs);
        }
        catch (Exception ex)
        {
            log.error("[OpenAPI] 保存调用日志失败: traceId={}", traceId, ex);
        }
    }

    private String cut(String text)
    {
        if (StringUtils.isEmpty(text))
        {
            return text;
        }
        return text.length() <= TEXT_MAX_LENGTH ? text : text.substring(0, TEXT_MAX_LENGTH);
    }
}
