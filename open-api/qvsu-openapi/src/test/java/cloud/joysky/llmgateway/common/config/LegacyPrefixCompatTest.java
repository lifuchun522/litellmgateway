package cloud.joysky.llmgateway.common.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

/**
 * 换骨期配置前缀兼容的行为断言。
 *
 * <p>直接对 {@link LegacyPrefixCompat#resolve} 做断言，不启动 Spring 上下文。原因：
 * 第 01 境的 4 个集成测试都依赖 5433 端口的 PostgreSQL，CI 跑不动；
 * 换骨期新写的逻辑必须能离线验证，否则「兼容通过」就只能靠人在本机点一下。</p>
 *
 * <p>用 {@link MockEnvironment} 而不是 {@code ApplicationContextRunner}：{@link LlmGatewayConfig}
 * 的字段是静态的（基线既有设计），多个最小上下文之间会串值，断言会退化成对上下文创建顺序的断言。</p>
 */
class LegacyPrefixCompatTest
{
    @BeforeEach
    void resetStaticState()
    {
        LegacyPrefixCompat.resetForTest();
        LlmGatewayConfig.resetForTest();
    }

    private static MockEnvironment env(Map<String, String> kv)
    {
        MockEnvironment e = new MockEnvironment();
        for (Map.Entry<String, String> en : kv.entrySet())
        {
            e.setProperty(en.getKey(), en.getValue());
        }
        return e;
    }

    @Test
    @DisplayName("只有旧前缀 qvsu: 时，值被搬到有效配置并标记兼容生效")
    void legacyPrefixOnly_shouldApplyAndFlag()
    {
        Map<String, String> kv = new LinkedHashMap<String, String>();
        kv.put("qvsu.name", "旧前缀兼容验证");
        kv.put("qvsu.version", "legacy-1.0.0");
        kv.put("qvsu.profile", "./data/uploadPath");
        kv.put("qvsu.demoEnabled", "true");

        boolean applied = LegacyPrefixCompat.resolve(env(kv));

        assertTrue(applied, "只有旧前缀时应走兼容分支");
        assertTrue(LegacyPrefixCompat.isLegacyApplied(), "应标记兼容生效");
        assertEquals("旧前缀兼容验证", LlmGatewayConfig.getName());
        assertEquals("legacy-1.0.0", LlmGatewayConfig.getVersion());
        assertEquals("./data/uploadPath", LlmGatewayConfig.getProfile());
        assertTrue(LlmGatewayConfig.isDemoEnabled());
        assertTrue(LegacyPrefixCompat.getLegacyKeys().contains("name"), "应记录生效的键名");
    }

    @Test
    @DisplayName("新旧前缀同时存在时，新前缀优先，旧前缀整段不生效")
    void bothPrefixes_newWins()
    {
        Map<String, String> kv = new LinkedHashMap<String, String>();
        kv.put("qvsu.name", "旧前缀的名字");
        kv.put("qvsu.version", "legacy-9.9.9");
        kv.put("llmgateway.name", "新前缀的名字");

        boolean applied = LegacyPrefixCompat.resolve(env(kv));

        assertFalse(applied, "新前缀存在时不应走兼容分支");
        assertFalse(LegacyPrefixCompat.isLegacyApplied());
        // 关键：旧前缀的值一个都不许搬过来
        assertNull(LlmGatewayConfig.getName());
        assertNull(LlmGatewayConfig.getVersion());
        assertEquals(LlmGatewayConfig.LEGACY_PREFIX, LegacyPrefixCompat.getLegacyKeys());
    }

    @Test
    @DisplayName("完全没有旧前缀时，不做任何改动也不抛异常")
    void noLegacyPrefix_noSideEffect()
    {
        boolean applied = LegacyPrefixCompat.resolve(env(new LinkedHashMap<String, String>()));

        assertFalse(applied);
        assertFalse(LegacyPrefixCompat.isLegacyApplied());
        assertNull(LlmGatewayConfig.getName());
    }

    @Test
    @DisplayName("未知的旧前缀键被忽略，不影响已识别的键")
    void unknownKeys_areIgnored()
    {
        Map<String, String> kv = new LinkedHashMap<String, String>();
        kv.put("qvsu.name", "只有名字");
        kv.put("qvsu.notARealKey", "ignored");

        LegacyPrefixCompat.resolve(env(kv));

        assertEquals("只有名字", LlmGatewayConfig.getName());
        assertNull(LlmGatewayConfig.getVersion());
    }

    @Test
    @DisplayName("兼容标记可复位：两次判定互不污染")
    void reset_shouldClearFlag()
    {
        LegacyPrefixCompat.resetForTest();
        assertFalse(LegacyPrefixCompat.isLegacyApplied());
        assertEquals("", LegacyPrefixCompat.getLegacyKeys());
    }
}
