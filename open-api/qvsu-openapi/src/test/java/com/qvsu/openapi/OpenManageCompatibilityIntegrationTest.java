package com.qvsu.openapi;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.http.Cookie;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.druid.webStatFilter.enabled=false",
        "spring.datasource.druid.statViewServlet.enabled=false",
        "qvsu.testing.exposeCaptchaCode=true"
})
public class OpenManageCompatibilityIntegrationTest
{
    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldWorkForOpenManageWithIdSchema() throws Exception
    {
        Map<String, Cookie> cookieJar = loginByAutoCaptcha();

        // Core pages should be reachable
        mockMvc.perform(get("/admin/open/app").cookie(allCookies(cookieJar))).andExpect(status().isOk());
        mockMvc.perform(get("/admin/open/api").cookie(allCookies(cookieJar))).andExpect(status().isOk());
        mockMvc.perform(get("/admin/open/auth").cookie(allCookies(cookieJar))).andExpect(status().isOk());
        mockMvc.perform(get("/admin/open/log").cookie(allCookies(cookieJar))).andExpect(status().isOk());
        mockMvc.perform(get("/admin/open/doc").cookie(allCookies(cookieJar))).andExpect(status().isOk());

        long suffix = System.currentTimeMillis();
        String appName = "管理兼容测试应用-" + suffix;
        String apiName = "管理兼容测试接口-" + suffix;
        String apiPath = "/open/selftest/manage/" + suffix;

        // add app
        JSONObject addAppJson = postAndParse(cookieJar, "/admin/open/app/add", mapOf(
                "appName", appName,
                "contact", "tester",
                "status", "1",
                "remark", "compat test"));
        assertCode0(addAppJson, "add app");

        // add api
        JSONObject addApiJson = postAndParse(cookieJar, "/admin/open/api/add", mapOf(
                "apiName", apiName,
                "apiPath", apiPath,
                "method", "GET",
                "targetUrl", "https://httpbin.org/get",
                "timeoutMs", "5000",
                "status", "1",
                "needSign", "1",
                "description", "compat test"));
        assertCode0(addApiJson, "add api");

        // list app/api and fetch ids
        Long appId = firstRowId(postAndParse(cookieJar, "/admin/open/app/list", mapOf("appName", appName)), "app list");
        Long apiId = firstRowId(postAndParse(cookieJar, "/admin/open/api/list", mapOf("apiPath", apiPath)), "api list");

        Assertions.assertNotNull(appId, "appId should not be null");
        Assertions.assertNotNull(apiId, "apiId should not be null");

        // auth management
        JSONObject saveAuth = postAndParse(cookieJar, "/admin/open/auth/save", mapOf("appId", String.valueOf(appId), "apiIds", String.valueOf(apiId)));
        assertCode0(saveAuth, "auth save");

        JSONObject apps = getAndParse(cookieJar, "/admin/open/auth/apps");
        JSONObject apis = getAndParse(cookieJar, "/admin/open/auth/apis");
        JSONObject apiIds = getAndParse(cookieJar, "/admin/open/auth/apiIds?appId=" + appId);
        assertCode0(apps, "auth apps");
        assertCode0(apis, "auth apis");
        assertCode0(apiIds, "auth apiIds");

        // log/doc management queries should not throw sql errors
        JSONObject logList = postAndParse(cookieJar, "/admin/open/log/list", mapOf());
        JSONObject stats = getAndParse(cookieJar, "/admin/open/log/stats");
        JSONObject docApis = getAndParse(cookieJar, "/admin/open/doc/apis");
        JSONObject docList = getAndParse(cookieJar, "/admin/open/doc/list");

        Assertions.assertTrue(logList.containsKey("rows"), "log list should contain rows field");
        Assertions.assertTrue(logList.containsKey("total"), "log list should contain total field");
        assertCode0(stats, "log stats");
        assertCode0(docApis, "doc apis");
        assertCode0(docList, "doc list");

        JSONObject generate = postAndParse(cookieJar, "/admin/open/doc/generate", mapOf(
                "appId", String.valueOf(appId),
                "apiIds", String.valueOf(apiId),
                "docTitle", "兼容测试文档",
                "docVersion", "v1"));
        assertCode0(generate, "doc generate");
    }

    private Map<String, Cookie> loginByAutoCaptcha() throws Exception
    {
        Map<String, Cookie> cookieJar = new LinkedHashMap<String, Cookie>();

        MvcResult captchaResult = mockMvc.perform(get("/captcha/captchaImage").param("type", "char"))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, captchaResult.getResponse().getCookies());

        MvcResult codeResult = mockMvc.perform(get("/captcha/captchaCode").cookie(allCookies(cookieJar)))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, codeResult.getResponse().getCookies());

        JSONObject codeJson = JSON.parseObject(codeResult.getResponse().getContentAsString());
        String captchaCode = codeJson.getString("data");
        if (captchaCode == null || captchaCode.trim().isEmpty())
        {
            captchaCode = codeJson.getString("msg");
        }
        Assertions.assertTrue(captchaCode != null && !captchaCode.trim().isEmpty(), "captcha code should not be empty");

        MvcResult loginResult = mockMvc.perform(post("/login")
                        .cookie(allCookies(cookieJar))
                        .param("username", System.getProperty("openapi.test.username", "admin"))
                        .param("password", System.getProperty("openapi.test.password", "admin123"))
                        .param("rememberMe", "false")
                        .param("validateCode", captchaCode))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, loginResult.getResponse().getCookies());

        JSONObject loginJson = JSON.parseObject(loginResult.getResponse().getContentAsString());
        Assertions.assertEquals(Integer.valueOf(0), loginJson.getInteger("code"), "login should succeed");
        return cookieJar;
    }

    private JSONObject getAndParse(Map<String, Cookie> cookieJar, String path) throws Exception
    {
        MvcResult result = mockMvc.perform(get(path).cookie(allCookies(cookieJar)))
                .andExpect(status().isOk())
                .andReturn();
        return JSON.parseObject(result.getResponse().getContentAsString());
    }

    private JSONObject postAndParse(Map<String, Cookie> cookieJar, String path, Map<String, String> params) throws Exception
    {
        org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder = post(path).cookie(allCookies(cookieJar));
        for (Map.Entry<String, String> entry : params.entrySet())
        {
            builder.param(entry.getKey(), entry.getValue());
        }
        MvcResult result = mockMvc.perform(builder)
                .andExpect(status().isOk())
                .andReturn();
        return JSON.parseObject(result.getResponse().getContentAsString());
    }

    private Long firstRowId(JSONObject tableJson, String scene)
    {
        JSONArray rows = tableJson.getJSONArray("rows");
        Assertions.assertTrue(rows != null && !rows.isEmpty(), scene + " should return rows");
        JSONObject first = rows.getJSONObject(0);
        Long id = first.getLong("id");
        if (id == null)
        {
            id = first.getLong("sId");
        }
        return id;
    }

    private void assertCode0(JSONObject json, String scene)
    {
        Assertions.assertEquals(Integer.valueOf(0), json.getInteger("code"), scene + " should return code=0, actual=" + json.toJSONString());
    }

    private Map<String, String> mapOf(String... kv)
    {
        Map<String, String> map = new LinkedHashMap<String, String>();
        if (kv == null)
        {
            return map;
        }
        for (int i = 0; i + 1 < kv.length; i += 2)
        {
            map.put(kv[i], kv[i + 1]);
        }
        return map;
    }

    private static void mergeCookies(Map<String, Cookie> cookieJar, Cookie[] cookies)
    {
        if (cookies == null)
        {
            return;
        }
        for (Cookie cookie : cookies)
        {
            cookieJar.put(cookie.getName(), cookie);
        }
    }

    private static Cookie[] allCookies(Map<String, Cookie> cookieJar)
    {
        return cookieJar.values().toArray(new Cookie[0]);
    }
}
