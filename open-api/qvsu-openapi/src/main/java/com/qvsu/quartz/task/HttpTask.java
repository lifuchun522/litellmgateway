package com.qvsu.quartz.task;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

/**
 * HTTP 定时任务调度
 * 支持自定义 HTTP 接口调用，支持各种请求方式、请求头、请求体、请求参数
 */
@Component("httpTask")
public class HttpTask
{
    private static final Logger log = LoggerFactory.getLogger(HttpTask.class);

    private final RestTemplate restTemplate;

    public HttpTask(RestTemplate restTemplate)
    {
        this.restTemplate = restTemplate;
    }

    /**
     * GET 请求
     * 调用示例：httpTask.get('https://api.example.com/health')
     */
    public void get(String url)
    {
        doGet(url, null, null);
    }

    /**
     * GET 请求（带请求头）
     * 调用示例：httpTask.doGet('https://api.example.com/data', '{"Authorization":"Bearer token"}', null)
     */
    public void doGet(String url, String headersJson, String queryParams)
    {
        log.info("[HttpTask] 执行GET请求: url={}", url);
        try
        {
            String fullUrl = buildUrlWithParams(url, queryParams);
            HttpHeaders headers = parseHeaders(headersJson);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, entity, String.class);
            log.info("[HttpTask] GET请求完成: url={}, httpStatus={}", fullUrl, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] GET请求失败: url={}", url, ex);
        }
    }

    /**
     * POST 请求（JSON Body）
     * 调用示例：httpTask.post('https://api.example.com/data', '{"name":"test"}')
     */
    public void post(String url, String body)
    {
        doPost(url, null, body, "application/json");
    }

    /**
     * POST 请求（完整参数）
     * 调用示例：httpTask.doPost('https://api.example.com/data', '{"Authorization":"Bearer token"}', '{"name":"test"}', 'application/json')
     */
    public void doPost(String url, String headersJson, String body, String contentType)
    {
        log.info("[HttpTask] 执行POST请求: url={}", url);
        try
        {
            HttpHeaders headers = parseHeaders(headersJson);
            if (contentType == null || contentType.isEmpty())
            {
                contentType = "application/json";
            }
            headers.set("Content-Type", contentType);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            log.info("[HttpTask] POST请求完成: url={}, httpStatus={}", url, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] POST请求失败: url={}", url, ex);
        }
    }

    /**
     * PUT 请求
     * 调用示例：httpTask.put('https://api.example.com/data/1', '{"name":"updated"}')
     */
    public void put(String url, String body)
    {
        doPut(url, null, body);
    }

    /**
     * PUT 请求（带请求头）
     */
    public void doPut(String url, String headersJson, String body)
    {
        log.info("[HttpTask] 执行PUT请求: url={}", url);
        try
        {
            HttpHeaders headers = parseHeaders(headersJson);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
            log.info("[HttpTask] PUT请求完成: url={}, httpStatus={}", url, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] PUT请求失败: url={}", url, ex);
        }
    }

    /**
     * DELETE 请求
     * 调用示例：httpTask.delete('https://api.example.com/data/1')
     */
    public void delete(String url)
    {
        doDelete(url, null);
    }

    /**
     * DELETE 请求（带请求头）
     */
    public void doDelete(String url, String headersJson)
    {
        log.info("[HttpTask] 执行DELETE请求: url={}", url);
        try
        {
            HttpHeaders headers = parseHeaders(headersJson);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            log.info("[HttpTask] DELETE请求完成: url={}, httpStatus={}", url, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] DELETE请求失败: url={}", url, ex);
        }
    }

    /**
     * PATCH 请求
     * 调用示例：httpTask.patch('https://api.example.com/data/1', '{"status":"active"}')
     */
    public void patch(String url, String body)
    {
        doPatch(url, null, body);
    }

    /**
     * PATCH 请求（带请求头）
     */
    public void doPatch(String url, String headersJson, String body)
    {
        log.info("[HttpTask] 执行PATCH请求: url={}", url);
        try
        {
            HttpHeaders headers = parseHeaders(headersJson);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            log.info("[HttpTask] PATCH请求完成: url={}, httpStatus={}", url, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] PATCH请求失败: url={}", url, ex);
        }
    }

    /**
     * 通用HTTP请求方法
     * 调用示例：httpTask.request('GET', 'https://api.example.com/data', '{"Authorization":"Bearer token"}', null, 'application/json')
     */
    public void request(String method, String url, String headersJson, String body, String contentType)
    {
        log.info("[HttpTask] 执行HTTP请求: method={}, url={}", method, url);
        try
        {
            HttpMethod httpMethod = HttpMethod.resolve(method.toUpperCase());
            if (httpMethod == null)
            {
                log.error("[HttpTask] 不支持的请求方法: {}", method);
                return;
            }

            HttpHeaders headers = parseHeaders(headersJson);
            if (contentType != null && !contentType.isEmpty())
            {
                headers.set("Content-Type", contentType);
            }
            else if (body != null && !body.isEmpty())
            {
                headers.set("Content-Type", "application/json");
            }

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, httpMethod, entity, String.class);
            log.info("[HttpTask] HTTP请求完成: method={}, url={}, httpStatus={}", method, url, response.getStatusCodeValue());
            log.debug("[HttpTask] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[HttpTask] HTTP请求失败: method={}, url={}", method, url, ex);
        }
    }

    /**
     * 解析请求头JSON
     */
    private HttpHeaders parseHeaders(String headersJson)
    {
        HttpHeaders headers = new HttpHeaders();
        if (headersJson == null || headersJson.isEmpty())
        {
            return headers;
        }
        try
        {
            JSONObject jsonObject = JSON.parseObject(headersJson);
            for (Map.Entry<String, Object> entry : jsonObject.entrySet())
            {
                headers.set(entry.getKey(), String.valueOf(entry.getValue()));
            }
        }
        catch (Exception ex)
        {
            log.warn("[HttpTask] 解析请求头失败: {}", headersJson, ex);
        }
        return headers;
    }

    /**
     * 构建带参数的URL
     */
    private String buildUrlWithParams(String url, String queryParams)
    {
        if (queryParams == null || queryParams.isEmpty())
        {
            return url;
        }
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + queryParams;
    }
}
