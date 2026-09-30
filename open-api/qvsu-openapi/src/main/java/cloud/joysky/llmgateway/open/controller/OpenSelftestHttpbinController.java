package cloud.joysky.llmgateway.open.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Local self-test endpoints to avoid external network dependency in integration tests.
 */
@RestController
public class OpenSelftestHttpbinController
{
    @GetMapping("/selftest/httpbin/get")
    public Map<String, Object> get(HttpServletRequest request)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("args", request.getParameterMap().entrySet().stream()
                .collect(LinkedHashMap::new, (m, e) -> m.put(e.getKey(), e.getValue() != null && e.getValue().length > 0 ? e.getValue()[0] : null), Map::putAll));
        return result;
    }

    @PostMapping("/selftest/httpbin/post")
    public Map<String, Object> post(@RequestBody(required = false) String body)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("json", parseBody(body));
        return result;
    }

    @PutMapping("/selftest/httpbin/put")
    public Map<String, Object> put(@RequestBody(required = false) String body)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("json", parseBody(body));
        return result;
    }

    @DeleteMapping("/selftest/httpbin/delete")
    public Map<String, Object> delete(HttpServletRequest request)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        try
        {
            String body = StreamUtils.copyToString(request.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);
            result.put("json", parseBody(body));
            return result;
        }
        catch (Exception ex)
        {
            throw new IllegalStateException("read request body failed", ex);
        }
    }

    @GetMapping("/selftest/httpbin/headers")
    public Map<String, Object> headers(@RequestHeader Map<String, String> headers)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        Map<String, Object> responseHeaders = new LinkedHashMap<String, Object>();
        responseHeaders.put("X-Trace-Id", headers.getOrDefault("x-trace-id", ""));
        result.put("headers", responseHeaders);
        return result;
    }

    @GetMapping("/selftest/httpbin/ip")
    public Map<String, Object> ip(HttpServletRequest request)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("origin", request.getRemoteAddr());
        return result;
    }

    @GetMapping("/selftest/httpbin/user-agent")
    public Map<String, Object> userAgent(HttpServletRequest request)
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("user-agent", request.getHeader("User-Agent"));
        return result;
    }

    @GetMapping("/selftest/httpbin/uuid")
    public Map<String, Object> uuid()
    {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("uuid", UUID.randomUUID().toString());
        return result;
    }

    @GetMapping("/selftest/httpbin/timeout")
    public Map<String, Object> timeout() throws InterruptedException
    {
        Thread.sleep(3000L);
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("status", "ok");
        return result;
    }

    private Object parseBody(String body)
    {
        if (body == null || body.trim().isEmpty())
        {
            return new JSONObject();
        }
        try
        {
            return JSON.parseObject(body);
        }
        catch (Exception ex)
        {
            return body;
        }
    }
}
