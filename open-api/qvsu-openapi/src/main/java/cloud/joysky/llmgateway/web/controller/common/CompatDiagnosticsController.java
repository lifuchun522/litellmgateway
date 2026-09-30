package cloud.joysky.llmgateway.web.controller.common;

import cloud.joysky.llmgateway.common.annotation.Anonymous;
import cloud.joysky.llmgateway.common.config.LegacyPrefixCompat;
import cloud.joysky.llmgateway.common.config.LlmGatewayConfig;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 换骨兼容诊断端点（换骨期临时件，一个月后与 {@link LegacyPrefixCompat} 一并删除）。
 *
 * <p>用途：把配置前缀的解析结果暴露出来，供自动化验收脚本断言，
 * 而不是靠人去读启动横幅——横幅在配置未解析时会原样打印占位符，容易被误读。</p>
 *
 * <p>标注 {@link Anonymous}：兼容期内允许免登录读取（只读、不含任何密钥），
 * 换骨结束时应与兼容逻辑一起删除。</p>
 */
@Anonymous
@RestController
@RequestMapping("/internal/compat")
public class CompatDiagnosticsController
{
    private final Environment env;

    public CompatDiagnosticsController(Environment env)
    {
        this.env = env;
    }

    @GetMapping("/config-prefix")
    public Map<String, Object> configPrefix()
    {
        Map<String, Object> m = new LinkedHashMap<String, Object>();
        m.put("effectiveName", LlmGatewayConfig.getName());
        m.put("effectiveVersion", LlmGatewayConfig.getVersion());
        m.put("legacyApplied", LegacyPrefixCompat.isLegacyApplied());
        m.put("legacyKeys", LegacyPrefixCompat.getLegacyKeys());
        m.put("newPrefixPresent", env.getProperty("llmgateway.name") != null);
        m.put("legacyPrefixPresent", env.getProperty(LlmGatewayConfig.LEGACY_PREFIX + ".name") != null);
        return m;
    }
}
