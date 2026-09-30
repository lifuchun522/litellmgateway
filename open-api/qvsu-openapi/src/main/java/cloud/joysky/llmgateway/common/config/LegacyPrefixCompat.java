package cloud.joysky.llmgateway.common.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * 旧配置前缀兼容（换骨期临时件，一个月后删除）。
 *
 * <p>规则（与第 02 境的口径一致）：</p>
 * <ol>
 *   <li><b>新前缀优先</b>：若 {@code llmgateway.name} 存在，旧前缀 {@code qvsu:} 整段忽略。</li>
 *   <li>新前缀缺失时，把 {@code qvsu.*} 的值搬到 {@link LlmGatewayConfig}，并在日志与健康检查里打废弃警告。</li>
 *   <li>不做任何字段语义转换——换骨境严禁顺带改行为。</li>
 * </ol>
 *
 * <p>实现方式：实现 {@link ApplicationContextAware}，在 {@code setApplicationContext} 里
 * 立刻从 {@link Environment} 读值。这个回调发生在单例实例化之前，晚于 {@code EnvironmentPostProcessor}
 * 与 {@code PropertySource} 装载，因此能拿到最终合并后的配置。</p>
 */
@Component
public class LegacyPrefixCompat implements ApplicationContextAware
{
    /** 新前缀下的字段名（判据：任一存在即认为新前缀已生效） */
    private static final String[] KEYS = {
        "name", "version", "copyrightYear", "demoEnabled", "profile", "addressEnabled", "testing.exposeCaptchaCode"
    };

    /** 兼容是否生效（供健康检查/启动横幅读取） */
    private static volatile boolean legacyApplied = false;

    /** 生效的旧前缀键（供健康检查展示，提示该改哪些键） */
    private static volatile String legacyKeys = "";

    public static boolean isLegacyApplied()
    {
        return legacyApplied;
    }

    public static String getLegacyKeys()
    {
        return legacyKeys;
    }

    /**
     * 清空兼容状态。仅供测试使用——这两个字段是静态的（与 {@link LlmGatewayConfig} 的静态字段
     * 保持一致，属基线既有设计），同一 JVM 内多个测试会互相影响，因此提供显式复位入口。
     */
    static void resetForTest()
    {
        legacyApplied = false;
        legacyKeys = "";
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext)
    {
        resolve(applicationContext.getEnvironment());
    }

    /**
     * 兼容判定的全部逻辑（与 Spring 生命周期解耦，便于直接对 {@link Environment} 做断言）。
     *
     * @return 本次判定是否把旧前缀的值搬到了有效配置
     */
    static boolean resolve(Environment env)
    {
        if (!resolveEnabled(env))
        {
            return false;
        }

        // 逐键读取而不是 binder.bind(mapOf)：旧前缀是一组扁平标量键（qvsu.name 这类），
        // Binder 到 Map 只吃带层级的映射结构，扁平键绑不出来（实测 values 为空）。
        Map<String, String> values = new LinkedHashMap<String, String>();
        for (String key : KEYS)
        {
            String v = env.getProperty(LlmGatewayConfig.LEGACY_PREFIX + "." + key);
            if (v != null)
            {
                values.put(key, v);
            }
        }
        LlmGatewayConfig.applyLegacy(values);
        legacyKeys = String.join(", ", values.keySet());
        legacyApplied = true;
        return true;
    }

    private static boolean resolveEnabled(Environment env)
    {
        if (env.getProperty(LlmGatewayConfig.LEGACY_PREFIX + ".name") == null)
        {
            // 没配旧前缀：不做任何事
            return false;
        }
        if (env.getProperty("llmgateway.name") != null)
        {
            // 新前缀优先：旧前缀整段忽略，只记下「可以删除旧配置了」
            legacyKeys = LlmGatewayConfig.LEGACY_PREFIX;
            return false;
        }
        return true;
    }
}
