package cloud.joysky.llmgateway.open.doc;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.open.domain.OpenApi;
import cloud.joysky.llmgateway.open.domain.OpenApp;
import cloud.joysky.llmgateway.open.service.OpenManageService;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;


@Service
public class ApiDocService
{
    private static final String DEFAULT_BASE_URL = "{{baseUrl}}";

    private final OpenManageService openManageService;

    public ApiDocService(OpenManageService openManageService)
    {
        this.openManageService = openManageService;
    }

    public String generateHtml(Long appId, List<Long> apiIds)
    {
        return generateHtml(appId, apiIds, DEFAULT_BASE_URL);
    }

    public String generateHtml(Long appId, List<Long> apiIds, String baseUrl)
    {
        OpenApp app = appId == null ? null : openManageService.selectAppById(appId);
        List<OpenApi> apis = Optional.ofNullable(openManageService.selectApisByIds(apiIds)).orElse(Collections.emptyList());

        String title = Optional.ofNullable(app)
                .map(OpenApp::getAppName)
                .orElse("OpenAPI") + " 接入文档";

        String finalBaseUrl = normalizeBaseUrl(baseUrl);
        String sections = apis.stream().map(api -> apiSection(api, finalBaseUrl)).collect(Collectors.joining(""));

        return "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'><title>" + esc(title)
                + "</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI';max-width:1100px;margin:auto;padding:24px;}"
                + "h1{color:#1f3864}.meta{color:#666;margin-bottom:24px}.api{border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;}"
                + "pre{background:#111827;color:#f3f4f6;padding:12px;border-radius:6px;overflow:auto;white-space:pre-wrap;}table{width:100%;border-collapse:collapse;}"
                + "td{border:1px solid #eee;padding:8px;vertical-align:top;}</style></head><body><h1>" + esc(title)
                + "</h1><p class='meta'>鉴权 Header: X-App-Key / X-Timestamp / X-Nonce / X-Sign（仅开启鉴权接口需要）</p>"
                + "<h2>错误码</h2><table><tr><td>0</td><td>成功</td></tr><tr><td>40001</td><td>appKey 不存在或已禁用 / 缺少鉴权头</td></tr>"
                + "<tr><td>40002</td><td>timestamp 超时</td></tr><tr><td>40003</td><td>签名错误</td></tr>"
                + "<tr><td>40004</td><td>无接口访问权限</td></tr><tr><td>40005</td><td>nonce 重放</td></tr>"
                + "<tr><td>50001</td><td>后端服务调用失败</td></tr></table><h2>接口列表</h2>" + sections
                + "</body></html>";
    }

    public String generateApiHtml(Long apiId)
    {
        return generateApiHtml(apiId, DEFAULT_BASE_URL);
    }

    public String generateApiHtml(Long apiId, String baseUrl)
    {
        OpenApi api = openManageService.selectApiById(apiId);
        if (api == null)
        {
            return "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'><title>接口不存在</title></head><body><h2>接口不存在</h2></body></html>";
        }
        String title = Optional.ofNullable(api.getApiName()).orElse("接口文档");
        return "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'><title>" + esc(title)
                + "</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI';max-width:1050px;margin:auto;padding:24px;}"
                + "h1{color:#1f3864;margin-bottom:8px}.meta{color:#666;margin-bottom:20px}.panel{border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;}"
                + "pre{background:#111827;color:#f3f4f6;padding:12px;border-radius:6px;overflow:auto;white-space:pre-wrap;}table{width:100%;border-collapse:collapse;}"
                + "td{border:1px solid #eee;padding:8px;vertical-align:top;}</style></head><body><h1>" + esc(title)
                + "</h1><p class='meta'>接口ID：" + esc(String.valueOf(api.getsId())) + "</p>" + apiSection(api, normalizeBaseUrl(baseUrl)) + "</body></html>";
    }

    public String buildCurlExample(OpenApi api)
    {
        return buildCurlExample(api, DEFAULT_BASE_URL);
    }

    public String buildCurlExample(OpenApi api, String baseUrl)
    {
        String method = Optional.ofNullable(api.getMethod()).map(String::toUpperCase).orElse("POST");
        String path = Optional.ofNullable(api.getApiPath()).map(String::trim).orElse("");
        if (!path.startsWith("/"))
        {
            path = "/" + path;
        }

        String reqExample = Optional.ofNullable(api.getReqExample()).orElse("").trim();
        Map<String, String> bizParams = parseBizParams(reqExample);
        String query = "GET".equals(method) ? buildQueryString(bizParams) : "";
        String requestUrl = normalizeBaseUrl(baseUrl) + path + (StringUtils.isBlank(query) ? "" : ("?" + query));

        if (isNeedSign(api))
        {
            return buildSignedCurl(method, requestUrl, reqExample, bizParams, openManageService.selectUsableAppByApiId(api.getsId()));
        }
        return buildUnsignedCurl(method, requestUrl, reqExample);
    }


    private String buildUnsignedCurl(String method, String requestUrl, String reqExample)
    {
        StringBuilder curl = new StringBuilder();
        curl.append("curl -X ").append(method).append(" \\\n");
        curl.append("  \"").append(requestUrl).append("\" \\\n");
        curl.append("  -H \"Content-Type: application/json\"");
        if (!"GET".equals(method) && StringUtils.isNotBlank(reqExample))
        {
            curl.append(" \\\n");
            curl.append("  -d '").append(escapeSingleQuote(reqExample)).append("'");
        }
        return curl.toString();
    }

    private String buildSignedCurl(String method, String requestUrl, String reqExample, Map<String, String> bizParams, OpenApp exampleApp)
    {
        if (exampleApp == null || StringUtils.isAnyBlank(exampleApp.getAppKey(), exampleApp.getAppSecret()))
        {
            return "# 当前接口已开启鉴权，但未找到已授权且启用的应用，请先在应用管理/授权管理中绑定一个可用应用后再测试。\n"
                    + buildUnsignedCurl(method, requestUrl, reqExample);
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString().replace("-", "");
        String sign = buildRequestSign(exampleApp.getAppKey(), exampleApp.getAppSecret(), timestamp, nonce, bizParams);

        StringBuilder curl = new StringBuilder();
        curl.append("curl -X ").append(method).append(" \\\n");
        curl.append("  \"").append(requestUrl).append("\" \\\n");
        curl.append("  -H \"Content-Type: application/json\" \\\n");
        curl.append("  -H \"X-App-Key: ").append(escapeDoubleQuote(exampleApp.getAppKey())).append("\" \\\n");
        curl.append("  -H \"X-Timestamp: ").append(timestamp).append("\" \\\n");
        curl.append("  -H \"X-Nonce: ").append(nonce).append("\" \\\n");
        curl.append("  -H \"X-Sign: ").append(sign).append("\"");
        if (!"GET".equals(method) && StringUtils.isNotBlank(reqExample))
        {
            curl.append(" \\\n");
            curl.append("  -d '").append(escapeSingleQuote(reqExample)).append("'");
        }
        return curl.toString();
    }

    private String buildRequestSign(String appKey, String appSecret, String timestamp, String nonce, Map<String, String> bizParams)
    {
        TreeMap<String, String> signParams = new TreeMap<String, String>();
        signParams.put("appKey", appKey);
        signParams.put("timestamp", timestamp);
        signParams.put("nonce", nonce);
        Optional.ofNullable(bizParams).ifPresent(signParams::putAll);
        String plain = signParams.entrySet().stream()
                .filter(entry -> StringUtils.isNotBlank(entry.getValue()))
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
        return hmacSha256Hex(plain + "&appSecret=" + appSecret, appSecret);
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
            return "";
        }
    }



    private Map<String, String> parseBizParams(String reqExample)
    {
        if (StringUtils.isBlank(reqExample))
        {
            return Collections.emptyMap();
        }
        try
        {
            JSONObject jsonObject = JSON.parseObject(reqExample);
            if (jsonObject == null || jsonObject.isEmpty())
            {
                return Collections.emptyMap();
            }
            Map<String, String> result = new LinkedHashMap<String, String>();
            jsonObject.forEach((k, v) -> {
                if (v != null)
                {
                    result.put(k, String.valueOf(v));
                }
            });
            return result;
        }
        catch (Exception ignored)
        {
            return Collections.emptyMap();
        }
    }

    private String buildQueryString(Map<String, String> params)
    {
        if (params == null || params.isEmpty())
        {
            return "";
        }
        return params.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String urlEncode(String text)
    {
        try
        {
            return URLEncoder.encode(Optional.ofNullable(text).orElse(""), "UTF-8");
        }
        catch (UnsupportedEncodingException e)
        {
            return Optional.ofNullable(text).orElse("");
        }
    }

    private boolean isNeedSign(OpenApi api)
    {
        return Optional.ofNullable(api.getNeedSign()).orElse(1) == 1;
    }

    private String escapeSingleQuote(String text)
    {
        return Optional.ofNullable(text).orElse("").replace("'", "'\"'\"'");
    }

    private String escapeDoubleQuote(String text)
    {
        return Optional.ofNullable(text).orElse("").replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String apiSection(OpenApi api, String baseUrl)
    {
        return "<div class='panel'><h3>" + esc(api.getApiName()) + "</h3><p>" + esc(api.getDescription()) + "</p>"
                + "<table><tr><td style='width:120px;'>请求路径</td><td><code>" + esc(api.getApiPath()) + "</code></td></tr>"
                + "<tr><td>请求方法</td><td>" + esc(api.getMethod()) + "</td></tr>"
                + "<tr><td>需要鉴权</td><td>" + (isNeedSign(api) ? "是" : "否") + "</td></tr>"
                + "<tr><td>上游地址</td><td>" + esc(api.getTargetUrl()) + "</td></tr></table>"
                + "<h4>请求示例（cURL）</h4><pre>" + esc(buildCurlExample(api, baseUrl)) + "</pre>"
                + "<h4>请求参数示例</h4><pre>" + esc(api.getReqExample()) + "</pre>"
                + "<h4>响应示例</h4><pre>" + esc(api.getRespExample()) + "</pre></div>";
    }

    private String normalizeBaseUrl(String baseUrl)
    {
        String resolved = Optional.ofNullable(baseUrl).map(String::trim).filter(StringUtils::isNotBlank).orElse(DEFAULT_BASE_URL);
        return resolved.endsWith("/") ? resolved.substring(0, resolved.length() - 1) : resolved;
    }


    private String esc(String text)
    {
        if (text == null)
        {
            return "";
        }
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
