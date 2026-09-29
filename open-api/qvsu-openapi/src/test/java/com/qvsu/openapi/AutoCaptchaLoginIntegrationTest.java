package com.qvsu.openapi;

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

/**
 * Auto fetch captcha from session, then login.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.druid.webStatFilter.enabled=false",
        "spring.datasource.druid.statViewServlet.enabled=false",
        "qvsu.testing.exposeCaptchaCode=true"
})
public class AutoCaptchaLoginIntegrationTest
{
    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldFetchCaptchaAndLogin() throws Exception
    {
        Map<String, Cookie> cookieJar = new LinkedHashMap<>();
        MvcResult captchaResult = mockMvc.perform(get("/captcha/captchaImage").param("type", "char"))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, captchaResult.getResponse().getCookies());

        String imageResponse = captchaResult.getResponse().getContentAsString();
        Assertions.assertTrue(imageResponse != null, "captcha image response should exist");

        MvcResult codeResult = mockMvc.perform(get("/captcha/captchaCode").cookie(allCookies(cookieJar)))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, codeResult.getResponse().getCookies());
        String codeBody = codeResult.getResponse().getContentAsString();
        Assertions.assertTrue(codeBody.contains("\"code\":0"), "captcha code api should succeed, actual=" + codeBody);
        com.alibaba.fastjson.JSONObject codeJson = com.alibaba.fastjson.JSON.parseObject(codeBody);
        String captchaCode = codeJson.getString("data");
        if (captchaCode == null || captchaCode.trim().isEmpty())
        {
            captchaCode = codeJson.getString("msg");
        }
        Assertions.assertTrue(captchaCode != null && !captchaCode.trim().isEmpty(),
                "captcha code should not be empty, actual=" + codeBody);

        MvcResult loginResult = mockMvc.perform(post("/login")
                        .cookie(allCookies(cookieJar))
                        .param("username", System.getProperty("openapi.test.username", "admin"))
                        .param("password", System.getProperty("openapi.test.password", "admin123"))
                        .param("rememberMe", "false")
                        .param("validateCode", captchaCode))
                .andExpect(status().isOk())
                .andReturn();
        mergeCookies(cookieJar, loginResult.getResponse().getCookies());

        String loginBody = loginResult.getResponse().getContentAsString();
        Assertions.assertTrue(loginBody.contains("\"code\":0"),
                "login should succeed, actual=" + loginBody);

        MvcResult indexResult = mockMvc.perform(get("/index").cookie(allCookies(cookieJar)))
                .andExpect(status().isOk())
                .andReturn();
        String indexHtml = indexResult.getResponse().getContentAsString();
        Assertions.assertTrue(indexHtml.contains("/admin/open/app"),
                "index page should contain openapi menu, actual html length=" + indexHtml.length());
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
