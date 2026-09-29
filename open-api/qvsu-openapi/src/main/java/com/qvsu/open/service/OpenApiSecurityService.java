package com.qvsu.open.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.qvsu.common.utils.StringUtils;
import com.qvsu.open.model.OpenAuthContext;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * OpenAPI security service (appKey/sign/nonce/permission).
 */
@Service
public class OpenApiSecurityService
{
    private static final Logger log = LoggerFactory.getLogger(OpenApiSecurityService.class);
    public static final String HEADER_APP_KEY = "X-App-Key";
    public static final String HEADER_TIMESTAMP = "X-Timestamp";
    public static final String HEADER_NONCE = "X-Nonce";
    public static final String HEADER_SIGN = "X-Sign";

    private static final long ALLOW_TIME_DRIFT_MS = TimeUnit.MINUTES.toMillis(5);
    private static final long NONCE_EXPIRE_MS = TimeUnit.MINUTES.toMillis(5);
    private static final ConcurrentHashMap<String, Long> NONCE_CACHE = new ConcurrentHashMap<String, Long>();

    private final JdbcTemplate jdbcTemplate;

    public OpenApiSecurityService(JdbcTemplate jdbcTemplate)
    {
        this.jdbcTemplate = jdbcTemplate;
    }

    public OpenAuthContext authenticate(HttpServletRequest request, String body)
    {
        String requestPath = normalizePath(request.getRequestURI());
        String method = request.getMethod();
        log.info("[OpenAPI] 请求鉴权开始: {} {}", method, requestPath);

        OpenApiInfo apiInfo = loadApiInfo(requestPath, method);
        if (apiInfo == null)
        {
            log.warn("[OpenAPI] API未找到或已禁用: {} {}", method, requestPath);
            throw new OpenApiSecurityException(40004, "API is disabled or not exposed");
        }

        if (!apiInfo.needSign)
        {
            log.info("[OpenAPI] 无需签名，跳过鉴权: {} {}", method, requestPath);
            OpenAuthContext context = new OpenAuthContext();
            context.setAppKey(trim(request.getHeader(HEADER_APP_KEY)));
            context.setAppName("anonymous");
            context.setApiPath(requestPath);
            context.setMethod(method);
            context.setTargetUrl(apiInfo.targetUrl);
            context.setTimeoutMs(Optional.ofNullable(apiInfo.timeoutMs).orElse(5000));
            return context;
        }

        String appKey = trim(request.getHeader(HEADER_APP_KEY));
        String timestampText = trim(request.getHeader(HEADER_TIMESTAMP));
        String nonce = trim(request.getHeader(HEADER_NONCE));
        String sign = trim(request.getHeader(HEADER_SIGN));

        if (StringUtils.isAnyBlank(appKey, timestampText, nonce, sign))
        {
            log.warn("[OpenAPI] 缺少认证头: appKey={}, timestamp={}, nonce={}, sign={}", appKey, timestampText, nonce, sign);
            throw new OpenApiSecurityException(40001, "missing auth headers");
        }

        long timestamp = parseTimestamp(timestampText);
        long now = System.currentTimeMillis();
        if (Math.abs(now - timestamp) > ALLOW_TIME_DRIFT_MS)
        {
            log.warn("[OpenAPI] 时间戳过期: appKey={}, timestamp={}, now={}, drift={}ms", appKey, timestamp, now, Math.abs(now - timestamp));
            throw new OpenApiSecurityException(40002, "timestamp expired");
        }

        OpenAppInfo appInfo = loadAppInfo(appKey);
        if (appInfo == null)
        {
            log.warn("[OpenAPI] 应用不存在或已禁用: appKey={}", appKey);
            throw new OpenApiSecurityException(40001, "appKey invalid or disabled");
        }

        checkNonce(appKey, nonce, now);

        if (!hasPermission(appInfo.id, apiInfo.id))
        {
            log.warn("[OpenAPI] 应用无权限访问API: appKey={}, appName={}, apiPath={}", appKey, appInfo.appName, requestPath);
            throw new OpenApiSecurityException(40004, "api permission denied");
        }

        verifySignature(appInfo.appSecret, appKey, timestampText, nonce, request, body, sign);

        log.info("[OpenAPI] 鉴权成功: appKey={}, appName={}, apiPath={}", appKey, appInfo.appName, requestPath);
        OpenAuthContext context = new OpenAuthContext();
        context.setAppKey(appKey);
        context.setAppName(appInfo.appName);
        context.setApiPath(requestPath);
        context.setMethod(method);
        context.setTargetUrl(apiInfo.targetUrl);
        context.setTimeoutMs(Optional.ofNullable(apiInfo.timeoutMs).orElse(5000));
        return context;
    }

    private void verifySignature(String appSecret, String appKey, String timestamp, String nonce,
            HttpServletRequest request, String body, String requestSign)
    {
        Map<String, String> signMap = new HashMap<String, String>();
        signMap.put("appKey", appKey);
        signMap.put("timestamp", timestamp);
        signMap.put("nonce", nonce);
        signMap.putAll(extractBizParams(request, body));

        String plain = signMap.entrySet()
                .stream()
                .filter(e -> StringUtils.isNotBlank(e.getValue()))
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
        plain = plain + "&appSecret=" + appSecret;
        String currentSign = hmacSha256Hex(plain, appSecret);

        if (!StringUtils.equalsIgnoreCase(currentSign, requestSign))
        {
            log.warn("[OpenAPI] 签名验证失败: appKey={}, expected={}, actual={}", appKey, currentSign, requestSign);
            throw new OpenApiSecurityException(40003, "signature verify failed");
        }
        log.debug("[OpenAPI] 签名验证成功: appKey={}", appKey);
    }

    private Map<String, String> extractBizParams(HttpServletRequest request, String body)
    {
        Map<String, String> params = new HashMap<String, String>();

        Enumeration<String> names = request.getParameterNames();
        while (names.hasMoreElements())
        {
            String key = names.nextElement();
            String value = request.getParameter(key);
            if (!isReservedSignField(key) && StringUtils.isNotBlank(value))
            {
                params.put(key, value);
            }
        }

        if (StringUtils.isNotBlank(body) && isJsonBody(request))
        {
            try
            {
                JSONObject jsonObject = JSON.parseObject(body);
                if (jsonObject != null)
                {
                    jsonObject.forEach((key, value) -> {
                        if (!isReservedSignField(key) && value != null)
                        {
                            params.put(key, String.valueOf(value));
                        }
                    });
                }
            }
            catch (Exception ignored)
            {
            }
        }

        return params;
    }

    private boolean isJsonBody(HttpServletRequest request)
    {
        String contentType = request.getContentType();
        return StringUtils.isNotBlank(contentType) && contentType.toLowerCase().contains("application/json");
    }

    private boolean isReservedSignField(String field)
    {
        return "appKey".equalsIgnoreCase(field) || "timestamp".equalsIgnoreCase(field)
                || "nonce".equalsIgnoreCase(field) || "sign".equalsIgnoreCase(field)
                || "appSecret".equalsIgnoreCase(field);
    }

    private long parseTimestamp(String timestamp)
    {
        try
        {
            return Long.parseLong(timestamp);
        }
        catch (Exception ex)
        {
            throw new OpenApiSecurityException(40002, "timestamp format invalid");
        }
    }

    private void checkNonce(String appKey, String nonce, long now)
    {
        if (NONCE_CACHE.size() > 100000)
        {
            log.info("[OpenAPI] Nonce缓存过大，开始清理: size={}", NONCE_CACHE.size());
            cleanupNonce(now);
        }

        String nonceKey = appKey + ":" + nonce;
        Long old = NONCE_CACHE.putIfAbsent(nonceKey, now + NONCE_EXPIRE_MS);
        if (old != null && old > now)
        {
            log.warn("[OpenAPI] Nonce已使用: appKey={}, nonce={}", appKey, nonce);
            throw new OpenApiSecurityException(40005, "nonce already used");
        }
    }

    private void cleanupNonce(long now)
    {
        List<String> expiredKeys = new ArrayList<String>();
        NONCE_CACHE.forEach((k, v) -> {
            if (v == null || v < now)
            {
                expiredKeys.add(k);
            }
        });
        expiredKeys.forEach(NONCE_CACHE::remove);
    }

    private OpenAppInfo loadAppInfo(String appKey)
    {
        log.debug("[OpenAPI] 查询应用信息: appKey={}", appKey);
        List<OpenAppInfo> list = jdbcTemplate.query(
                "select s_id, app_name, app_secret from open_app where app_key=? and status=1 and (expire_time is null or expire_time > now()) limit 1",
                (rs, rowNum) -> {
                    OpenAppInfo appInfo = new OpenAppInfo();
                    appInfo.id = rs.getLong("s_id");
                    appInfo.appName = rs.getString("app_name");
                    appInfo.appSecret = rs.getString("app_secret");
                    return appInfo;
                },
                appKey);
        if (list.isEmpty())
        {
            log.debug("[OpenAPI] 应用不存在或已禁用: appKey={}", appKey);
            return null;
        }
        log.debug("[OpenAPI] 找到应用: appKey={}, appName={}", appKey, list.get(0).appName);
        return list.get(0);
    }

    private OpenApiInfo loadApiInfo(String apiPath, String method)
    {
        log.debug("[OpenAPI] 查询API信息: apiPath={}, method={}", apiPath, method);

        // 先查询所有匹配 api_path 的记录（不限状态），用于调试
        List<Map<String, Object>> debugList = jdbcTemplate.queryForList(
                "select s_id, api_path, method, status from open_api where api_path=?", apiPath);
        if (debugList.isEmpty())
        {
            log.warn("[OpenAPI] API路径不存在: apiPath={}", apiPath);
            throw new OpenApiSecurityException(40004, "api path not found: " + apiPath);
        }
        Map<String, Object> debugRow = debugList.get(0);
        int status = ((Number) debugRow.get("status")).intValue();
        if (status != 1)
        {
            log.warn("[OpenAPI] API已禁用: apiPath={}, status={}", apiPath, status);
            throw new OpenApiSecurityException(40004, "api status disabled: " + apiPath);
        }

        List<OpenApiInfo> list = jdbcTemplate.query(
                "select s_id, target_url, timeout_ms, need_sign from open_api where api_path=? and method=? and status=1 limit 1",
                (rs, rowNum) -> {
                    OpenApiInfo apiInfo = new OpenApiInfo();
                    apiInfo.id = rs.getLong("s_id");
                    apiInfo.targetUrl = rs.getString("target_url");
                    apiInfo.timeoutMs = rs.getInt("timeout_ms");
                    apiInfo.needSign = rs.getInt("need_sign") == 1;
                    return apiInfo;
                },
                apiPath, method);

        if (!list.isEmpty())
        {
            log.debug("[OpenAPI] 找到精确匹配API: apiPath={}, method={}", apiPath, method);
            return list.get(0);
        }

        if (!"POST".equalsIgnoreCase(method))
        {
            log.debug("[OpenAPI] 尝试POST方法兼容: apiPath={}", apiPath);
            List<OpenApiInfo> compatible = jdbcTemplate.query(
                    "select s_id, target_url, timeout_ms, need_sign from open_api where api_path=? and method='POST' and status=1 limit 1",
                    (rs, rowNum) -> {
                        OpenApiInfo apiInfo = new OpenApiInfo();
                        apiInfo.id = rs.getLong("s_id");
                        apiInfo.targetUrl = rs.getString("target_url");
                        apiInfo.timeoutMs = rs.getInt("timeout_ms");
                        apiInfo.needSign = rs.getInt("need_sign") == 1;
                        return apiInfo;
                    },
                    apiPath);
            if (!compatible.isEmpty())
            {
                log.debug("[OpenAPI] 找到POST兼容API: apiPath={}", apiPath);
                return compatible.get(0);
            }
        }

        log.warn("[OpenAPI] 未找到匹配的API: apiPath={}, method={}", apiPath, method);
        return null;
    }

    private boolean hasPermission(Long appId, Long apiId)
    {
        Integer count = jdbcTemplate.queryForObject(
                "select count(1) from open_app_api where app_id=? and api_id=?",
                Integer.class,
                appId,
                apiId);
        return count != null && count > 0;
    }

    private String hmacSha256Hex(String data, String key)
    {
        try
        {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest)
            {
                String hex = Integer.toHexString(b & 0xff);
                if (hex.length() == 1)
                {
                    sb.append('0');
                }
                sb.append(hex);
            }
            return sb.toString();
        }
        catch (Exception e)
        {
            log.error("[OpenAPI] 签名计算失败", e);
            throw new OpenApiSecurityException(50001, "signature calculation failed");
        }
    }

    private String trim(String value)
    {
        return value == null ? null : value.trim();
    }

    private String normalizePath(String path)
    {
        if (path != null && path.length() > 1 && path.endsWith("/"))
        {
            return path.substring(0, path.length() - 1);
        }
        return path;
    }

    private static class OpenAppInfo
    {
        private Long id;
        private String appName;
        private String appSecret;
    }

    private static class OpenApiInfo
    {
        private Long id;
        private String targetUrl;
        private Integer timeoutMs;
        private boolean needSign;
    }

    public static class OpenApiSecurityException extends RuntimeException
    {
        private final int code;

        public OpenApiSecurityException(int code, String message)
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
