package com.qvsu.openapi;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.http.Cookie;
import javax.sql.DataSource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
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
public class QuartzManagementIntegrationTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DataSource dataSource;

    @Test
    public void shouldManageAndRunQuartzJob() throws Exception
    {
        ensureQuartzDataFromPgInitScript();

        Map<String, Cookie> cookieJar = loginByAutoCaptcha();

        MvcResult indexResult = mockMvc.perform(get("/index").cookie(allCookies(cookieJar)))
                .andExpect(status().isOk())
                .andReturn();
        String indexHtml = indexResult.getResponse().getContentAsString();
        Assertions.assertTrue(indexHtml.contains("/monitor/job"),
                "index should contain monitor job menu");
        mockMvc.perform(get("/monitor/job").cookie(allCookies(cookieJar)))
                .andExpect(status().isOk());

        long suffix = System.currentTimeMillis();
        String jobName = "自动化测试任务-" + suffix;

        MvcResult addResult = mockMvc.perform(post("/monitor/job/add")
                        .cookie(allCookies(cookieJar))
                        .param("jobName", jobName)
                        .param("jobGroup", "DEFAULT")
                        .param("invokeTarget", "qvsuTask.qvsuNoParams")
                        .param("cronExpression", "0/30 * * * * ?")
                        .param("misfirePolicy", "3")
                        .param("concurrent", "1")
                        .param("remark", "integration test"))
                .andExpect(status().isOk())
                .andReturn();
        JSONObject addJson = JSON.parseObject(addResult.getResponse().getContentAsString());
        Assertions.assertEquals(Integer.valueOf(0), addJson.getInteger("code"),
                "add job should succeed: " + addJson.toJSONString());

        MvcResult listResult = mockMvc.perform(post("/monitor/job/list")
                        .cookie(allCookies(cookieJar))
                        .param("jobName", jobName))
                .andExpect(status().isOk())
                .andReturn();
        JSONObject listJson = JSON.parseObject(listResult.getResponse().getContentAsString());
        JSONArray rows = listJson.getJSONArray("rows");
        Assertions.assertTrue(rows != null && !rows.isEmpty(), "job list should contain the new job");
        Long jobId = rows.getJSONObject(0).getLong("jobId");

        MvcResult runResult = mockMvc.perform(post("/monitor/job/run")
                        .cookie(allCookies(cookieJar))
                        .param("jobId", String.valueOf(jobId)))
                .andExpect(status().isOk())
                .andReturn();
        JSONObject runJson = JSON.parseObject(runResult.getResponse().getContentAsString());
        Assertions.assertEquals(Integer.valueOf(0), runJson.getInteger("code"),
                "run once should succeed: " + runJson.toJSONString());

        boolean logFound = false;
        for (int i = 0; i < 10; i++)
        {
            Thread.sleep(500L);
            MvcResult logResult = mockMvc.perform(post("/monitor/jobLog/list")
                            .cookie(allCookies(cookieJar))
                            .param("jobName", jobName))
                    .andExpect(status().isOk())
                    .andReturn();
            JSONObject logJson = JSON.parseObject(logResult.getResponse().getContentAsString());
            JSONArray logRows = logJson.getJSONArray("rows");
            if (logRows != null && !logRows.isEmpty())
            {
                JSONObject first = logRows.getJSONObject(0);
                Assertions.assertEquals("0", first.getString("status"),
                        "job execute status should be success: " + first.toJSONString());
                logFound = true;
                break;
            }
        }
        Assertions.assertTrue(logFound, "job log should be generated after run");
    }

    private void ensureQuartzDataFromPgInitScript() throws Exception
    {
        Path scriptPath = resolveQuartzInitScriptPath();
        try (java.sql.Connection connection = dataSource.getConnection())
        {
            ScriptUtils.executeSqlScript(connection, new FileSystemResource(scriptPath));
        }
    }

    private Path resolveQuartzInitScriptPath()
    {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path[] candidates = new Path[] {
                cwd.resolve("../deploy/local-docker/postgres/init/35-quartz.sql").normalize(),
                cwd.resolve("deploy/local-docker/postgres/init/35-quartz.sql").normalize(),
                cwd.resolve("../open-api/deploy/local-docker/postgres/init/35-quartz.sql").normalize()
        };
        for (Path candidate : candidates)
        {
            if (Files.exists(candidate))
            {
                return candidate;
            }
        }
        throw new IllegalStateException("Cannot find PostgreSQL quartz init script under deploy/local-docker/postgres/init/35-quartz.sql");
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
        Assertions.assertTrue(captchaCode != null && !captchaCode.trim().isEmpty(),
                "captcha code should not be empty");

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
        Assertions.assertEquals(Integer.valueOf(0), loginJson.getInteger("code"),
                "login should succeed: " + loginJson.toJSONString());
        return cookieJar;
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
