package com.qvsu.openapi;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

/**
 * OpenAPI integration tests.
 *
 * Required test seed data:
 * appKey: ak_selftest_demo
 * appSecret: sk_selftest_demo_1234567890abcdef
 */
public class OpenApiManagementIntegrationTest
{
    private static final String BASE_URL = System.getProperty("openapi.test.baseUrl", "http://localhost:5656");
    private static final String USERNAME = System.getProperty("openapi.test.username", "admin");
    private static final String PASSWORD = System.getProperty("openapi.test.password", "admin123");
    private static final String CAPTCHA_CODE = System.getProperty("openapi.test.captchaCode", "");
    private static final String APP_KEY = System.getProperty("openapi.test.appKey", "ak_selftest_demo");
    private static final String APP_SECRET = System.getProperty("openapi.test.appSecret", "sk_selftest_demo_1234567890abcdef");

    @Test
    public void shouldProxyHttpbinCategories()
    {
        SuiteResult suite = runProxySuite();
        if (!suite.failedCases.isEmpty())
        {
            Assertions.fail(suite.render());
        }
    }

    @Test
    public void shouldLoginAndSeeOpenApiMenusWhenCaptchaProvided()
    {
        Assumptions.assumeTrue(CAPTCHA_CODE != null && !CAPTCHA_CODE.trim().isEmpty(),
                "captcha code not provided, skip login-ui assertions.");
        SuiteResult suite = runLoginSuite();
        if (!suite.failedCases.isEmpty())
        {
            Assertions.fail(suite.render());
        }
    }

    public static void main(String[] args)
    {
        OpenApiManagementIntegrationTest test = new OpenApiManagementIntegrationTest();
        SuiteResult proxy = test.runProxySuite();
        System.out.println(proxy.render());
        if (!proxy.failedCases.isEmpty())
        {
            throw new IllegalStateException("Proxy suite failed.");
        }
    }

    private SuiteResult runLoginSuite()
    {
        CookieHandler.setDefault(new CookieManager());
        SuiteResult suite = new SuiteResult("Login + menu suite");

        HttpResponse loginPage = get("/login");
        suite.record(http200(loginPage), "GET /login", loginPage.body);
        suite.record(contains(loginPage.body, "validateCode"), "login page has captcha", loginPage.body);

        JSONObject loginResp = postForm("/login", mapOf(
                "username", USERNAME,
                "password", PASSWORD,
                "rememberMe", "false",
                "validateCode", CAPTCHA_CODE));
        suite.record(code0(loginResp), "POST /login", loginResp.toJSONString());

        HttpResponse index = get("/index");
        suite.record(http200(index), "GET /index", index.body);
        suite.record(contains(index.body, "/admin/open/app"), "index contains open api menu", index.body);
        suite.record(http200(get("/admin/open/app")), "GET /admin/open/app", "");
        suite.record(http200(get("/admin/open/api")), "GET /admin/open/api", "");
        suite.record(http200(get("/admin/open/auth")), "GET /admin/open/auth", "");
        suite.record(http200(get("/admin/open/log")), "GET /admin/open/log", "");
        suite.record(http200(get("/admin/open/doc")), "GET /admin/open/doc", "");
        return suite;
    }

    private SuiteResult runProxySuite()
    {
        SuiteResult suite = new SuiteResult("Proxy category suite");
        String nonceSeed = String.valueOf(System.currentTimeMillis());

        JSONObject getResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/get",
                mapOf("demo", "1", "category", "get"),
                null,
                "n-get-" + nonceSeed);
        suite.record(code0(getResp), "GET category", getResp.toJSONString());
        suite.record(getResp.getJSONObject("data") != null
                        && getResp.getJSONObject("data").getJSONObject("args") != null
                        && "1".equals(getResp.getJSONObject("data").getJSONObject("args").getString("demo")),
                "GET args echoed", getResp.toJSONString());

        JSONObject postResp = callOpenApi(
                "POST",
                "/open/selftest/httpbin/post",
                null,
                "{\"orderNo\":\"SO1001\",\"amount\":\"88.5\"}",
                "n-post-" + nonceSeed);
        suite.record(code0(postResp), "POST category", postResp.toJSONString());
        suite.record(postResp.getJSONObject("data") != null
                        && postResp.getJSONObject("data").getJSONObject("json") != null
                        && "SO1001".equals(postResp.getJSONObject("data").getJSONObject("json").getString("orderNo")),
                "POST json echoed", postResp.toJSONString());

        JSONObject putResp = callOpenApi(
                "PUT",
                "/open/selftest/httpbin/put",
                null,
                "{\"name\":\"qvsu\",\"status\":\"ok\"}",
                "n-put-" + nonceSeed);
        suite.record(code0(putResp), "PUT category", putResp.toJSONString());
        suite.record(putResp.getJSONObject("data") != null
                        && putResp.getJSONObject("data").getJSONObject("json") != null
                        && "qvsu".equals(putResp.getJSONObject("data").getJSONObject("json").getString("name")),
                "PUT json echoed", putResp.toJSONString());

        JSONObject deleteResp = callOpenApi(
                "DELETE",
                "/open/selftest/httpbin/delete",
                null,
                "{\"id\":\"A001\"}",
                "n-delete-" + nonceSeed);
        suite.record(code0(deleteResp), "DELETE category", deleteResp.toJSONString());
        suite.record(deleteResp.getJSONObject("data") != null
                        && deleteResp.getJSONObject("data").getJSONObject("json") != null
                        && "A001".equals(deleteResp.getJSONObject("data").getJSONObject("json").getString("id")),
                "DELETE json echoed", deleteResp.toJSONString());

        JSONObject headersResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/headers",
                null,
                null,
                "n-headers-" + nonceSeed);
        suite.record(code0(headersResp), "HEADERS category", headersResp.toJSONString());
        suite.record(headersResp.getJSONObject("data") != null
                        && headersResp.getJSONObject("data").getJSONObject("headers") != null
                        && headersResp.getJSONObject("data").getJSONObject("headers").containsKey("X-Trace-Id"),
                "trace id forwarded", headersResp.toJSONString());

        JSONObject ipResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/ip",
                null,
                null,
                "n-ip-" + nonceSeed);
        suite.record(code0(ipResp), "IP category", ipResp.toJSONString());
        suite.record(ipResp.getJSONObject("data") != null
                        && ipResp.getJSONObject("data").containsKey("origin"),
                "IP returned", ipResp.toJSONString());

        JSONObject uaResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/user-agent",
                null,
                null,
                "n-ua-" + nonceSeed);
        suite.record(code0(uaResp), "User-Agent category", uaResp.toJSONString());
        suite.record(uaResp.getJSONObject("data") != null
                        && uaResp.getJSONObject("data").containsKey("user-agent"),
                "user-agent returned", uaResp.toJSONString());

        JSONObject uuidResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/uuid",
                null,
                null,
                "n-uuid-" + nonceSeed);
        suite.record(code0(uuidResp), "UUID category", uuidResp.toJSONString());
        suite.record(uuidResp.getJSONObject("data") != null
                        && uuidResp.getJSONObject("data").containsKey("uuid"),
                "uuid returned", uuidResp.toJSONString());

        JSONObject timeoutResp = callOpenApi(
                "GET",
                "/open/selftest/httpbin/timeout",
                null,
                null,
                "n-timeout-" + nonceSeed);
        suite.record(timeoutResp != null && Integer.valueOf(50002).equals(timeoutResp.getInteger("code")),
                "timeout category", timeoutResp == null ? "" : timeoutResp.toJSONString());

        return suite;
    }

    private JSONObject callOpenApi(String method, String path, Map<String, String> queryParams, String jsonBody, String nonce)
    {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String query = encodeQuery(queryParams);
        String fullPath = path + (query.isEmpty() ? "" : "?" + query);
        Map<String, String> signFields = new LinkedHashMap<String, String>();
        signFields.put("appKey", APP_KEY);
        signFields.put("timestamp", timestamp);
        signFields.put("nonce", nonce);
        if (queryParams != null)
        {
            signFields.putAll(queryParams);
        }
        if (jsonBody != null && !jsonBody.trim().isEmpty())
        {
            JSONObject body = JSON.parseObject(jsonBody);
            for (String key : body.keySet())
            {
                Object value = body.get(key);
                if (value != null)
                {
                    signFields.put(key, String.valueOf(value));
                }
            }
        }
        String sign = sign(signFields, APP_SECRET);

        Map<String, String> headers = new LinkedHashMap<String, String>();
        headers.put("X-App-Key", APP_KEY);
        headers.put("X-Timestamp", timestamp);
        headers.put("X-Nonce", nonce);
        headers.put("X-Sign", sign);
        headers.put("Content-Type", "application/json;charset=UTF-8");
        headers.put("Accept", "application/json, text/plain, */*");

        HttpResponse resp = request(method, fullPath, jsonBody, headers);
        if (resp.status != 200)
        {
            throw new IllegalStateException("unexpected status=" + resp.status + ", body=" + resp.body);
        }
        return parseJson(resp.body);
    }

    private String sign(Map<String, String> fields, String appSecret)
    {
        List<Map.Entry<String, String>> entries = new ArrayList<Map.Entry<String, String>>(fields.entrySet());
        entries.sort(Comparator.comparing(Map.Entry::getKey));
        StringBuilder plain = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : entries)
        {
            if (entry.getValue() == null || entry.getValue().trim().isEmpty())
            {
                continue;
            }
            if (!first)
            {
                plain.append('&');
            }
            first = false;
            plain.append(entry.getKey()).append('=').append(entry.getValue());
        }
        plain.append("&appSecret=").append(appSecret);
        return hmacSha256Hex(plain.toString(), appSecret);
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
        catch (Exception ex)
        {
            throw new IllegalStateException("sign failed", ex);
        }
    }

    private JSONObject postForm(String path, Map<String, String> form)
    {
        String payload = encodeQuery(form);
        Map<String, String> headers = new LinkedHashMap<String, String>();
        headers.put("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        headers.put("Accept", "application/json, text/plain, */*");
        HttpResponse response = request("POST", path, payload, headers);
        if (!http200(response))
        {
            throw new IllegalStateException("HTTP " + response.status + " on POST " + path + ", body=" + response.body);
        }
        return parseJson(response.body);
    }

    private JSONObject parseJson(String text)
    {
        try
        {
            return JSON.parseObject(text);
        }
        catch (Exception ex)
        {
            throw new IllegalStateException("invalid json: " + text, ex);
        }
    }

    private boolean code0(JSONObject json)
    {
        return json != null && Integer.valueOf(0).equals(json.getInteger("code"));
    }

    private boolean contains(String text, String part)
    {
        return text != null && text.contains(part);
    }

    private HttpResponse get(String path)
    {
        Map<String, String> headers = new LinkedHashMap<String, String>();
        headers.put("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        return request("GET", path, null, headers);
    }

    private HttpResponse request(String method, String path, String body, Map<String, String> headers)
    {
        HttpURLConnection conn = null;
        try
        {
            URL url = new URL(BASE_URL + path);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(30000);
            conn.setInstanceFollowRedirects(true);

            if (headers != null)
            {
                for (Map.Entry<String, String> e : headers.entrySet())
                {
                    conn.setRequestProperty(e.getKey(), e.getValue());
                }
            }

            if (body != null)
            {
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Length", String.valueOf(bytes.length));
                try (OutputStream os = conn.getOutputStream())
                {
                    os.write(bytes);
                }
            }

            int code = conn.getResponseCode();
            InputStream input = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
            String text = readAll(input);
            return new HttpResponse(code, text);
        }
        catch (Exception ex)
        {
            throw new IllegalStateException("HTTP request failed: " + method + " " + path, ex);
        }
        finally
        {
            if (conn != null)
            {
                conn.disconnect();
            }
        }
    }

    private boolean http200(HttpResponse response)
    {
        return response != null && response.status == 200;
    }

    private String readAll(InputStream input) throws Exception
    {
        if (input == null)
        {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8)))
        {
            String line;
            while ((line = reader.readLine()) != null)
            {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    private Map<String, String> mapOf(String... kv)
    {
        if (kv == null || kv.length == 0)
        {
            return new LinkedHashMap<String, String>();
        }
        if (kv.length % 2 != 0)
        {
            throw new IllegalArgumentException("mapOf requires even args");
        }
        Map<String, String> map = new LinkedHashMap<String, String>();
        for (int i = 0; i < kv.length; i += 2)
        {
            map.put(kv[i], kv[i + 1]);
        }
        return map;
    }

    private String encodeQuery(Map<String, String> params)
    {
        if (params == null || params.isEmpty())
        {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet())
        {
            if (!first)
            {
                sb.append('&');
            }
            first = false;
            sb.append(urlEncode(entry.getKey())).append('=').append(urlEncode(entry.getValue()));
        }
        return sb.toString();
    }

    private String urlEncode(String text)
    {
        try
        {
            return URLEncoder.encode(text == null ? "" : text, "UTF-8");
        }
        catch (Exception ex)
        {
            throw new IllegalStateException("url encode failed", ex);
        }
    }

    private static class HttpResponse
    {
        private final int status;
        private final String body;

        private HttpResponse(int status, String body)
        {
            this.status = status;
            this.body = body;
        }
    }

    private static class SuiteResult
    {
        private final String name;
        private int totalCases;
        private int passedCases;
        private final List<String> failedCases = new ArrayList<String>();

        private SuiteResult(String name)
        {
            this.name = name;
        }

        private void record(boolean pass, String caseName, String detail)
        {
            totalCases++;
            if (pass)
            {
                passedCases++;
            }
            else
            {
                failedCases.add(caseName + " | " + detail);
            }
        }

        private String render()
        {
            StringBuilder sb = new StringBuilder();
            sb.append(name).append('\n');
            sb.append("total=").append(totalCases)
                    .append(", passed=").append(passedCases)
                    .append(", failed=").append(failedCases.size())
                    .append('\n');
            if (!failedCases.isEmpty())
            {
                sb.append("failed cases:").append('\n');
                for (String failed : failedCases)
                {
                    sb.append("- ").append(failed).append('\n');
                }
            }
            return sb.toString();
        }
    }
}
