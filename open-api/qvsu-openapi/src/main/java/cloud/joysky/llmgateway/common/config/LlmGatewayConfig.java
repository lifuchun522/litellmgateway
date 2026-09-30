package cloud.joysky.llmgateway.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 全局配置类
 *
 * <p>第 02 境换骨：配置前缀从 {@code qvsu} 改为 {@code llmgateway}。
 * 兼容期（一个月）同时接受旧前缀 {@code qvsu}：新前缀优先，旧前缀生效时打废弃警告。</p>
 *
 * @author lifuchun
 */
@Component
@ConfigurationProperties(prefix = "llmgateway")
public class LlmGatewayConfig
{
    private static final Logger log = LoggerFactory.getLogger(LlmGatewayConfig.class);

    /** 旧前缀（兼容期用，一个月后删除；删除项见 docs/design/ch02-*.md 技术债清单） */
    public static final String LEGACY_PREFIX = "qvsu";

    /** 项目名称 */
    private static String name;

    /** 版本 */
    private static String version;

    /** 版权年份 */
    private static String copyrightYear;

    /** 实例演示开关 */
    private static boolean demoEnabled;

    /** 上传路径 */
    private static String profile;

    /** 获取地址开关 */
    private static boolean addressEnabled;

    public static String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        LlmGatewayConfig.name = name;
    }

    public static String getVersion()
    {
        return version;
    }

    public void setVersion(String version)
    {
        LlmGatewayConfig.version = version;
    }

    public static String getCopyrightYear()
    {
        return copyrightYear;
    }

    public void setCopyrightYear(String copyrightYear)
    {
        LlmGatewayConfig.copyrightYear = copyrightYear;
    }

    public static boolean isDemoEnabled()
    {
        return demoEnabled;
    }

    public void setDemoEnabled(boolean demoEnabled)
    {
        LlmGatewayConfig.demoEnabled = demoEnabled;
    }

    public static String getProfile()
    {
        return profile;
    }

    public void setProfile(String profile)
    {
        LlmGatewayConfig.profile = profile;
    }

    public static boolean isAddressEnabled()
    {
        return addressEnabled;
    }

    public void setAddressEnabled(boolean addressEnabled)
    {
        LlmGatewayConfig.addressEnabled = addressEnabled;
    }

    /**
     * 旧前缀兼容入口：由 {@link LegacyPrefixCompat} 在检测到旧前缀生效时调用。
     *
     * <p>只做两件事：把值搬过来、打一条废弃警告。不做任何字段语义转换——
     * 换骨境严禁顺带改行为。</p>
     */
    public static void applyLegacy(java.util.Map<String, String> legacyValues)
    {
        if (legacyValues == null || legacyValues.isEmpty())
        {
            return;
        }
        String keys = String.join(", ", legacyValues.keySet());
        log.warn("[换骨兼容] 检测到旧配置前缀 {}:（{} 项）。请改用 llmgateway:，旧前缀将于一个月后移除。",
                LEGACY_PREFIX, keys);
        if (legacyValues.containsKey("name"))
        {
            name = legacyValues.get("name");
        }
        if (legacyValues.containsKey("version"))
        {
            version = legacyValues.get("version");
        }
        if (legacyValues.containsKey("copyrightYear"))
        {
            copyrightYear = legacyValues.get("copyrightYear");
        }
        if (legacyValues.containsKey("demoEnabled"))
        {
            demoEnabled = Boolean.parseBoolean(legacyValues.get("demoEnabled"));
        }
        if (legacyValues.containsKey("profile"))
        {
            profile = legacyValues.get("profile");
        }
        if (legacyValues.containsKey("addressEnabled"))
        {
            addressEnabled = Boolean.parseBoolean(legacyValues.get("addressEnabled"));
        }
    }

    /**
     * 复位所有静态字段。仅供测试使用。
     */
    static void resetForTest()
    {
        name = null;
        version = null;
        copyrightYear = null;
        demoEnabled = false;
        profile = null;
        addressEnabled = false;
    }

    /**
     * 获取导入上传路径
     */
    public static String getImportPath()
    {
        return getProfile() + "/import";
    }

    /**
     * 获取头像上传路径
     */
    public static String getAvatarPath()
    {
        return getProfile() + "/avatar";
    }

    /**
     * 获取下载路径
     */
    public static String getDownloadPath()
    {
        return getProfile() + "/download/";
    }

    /**
     * 获取上传路径
     */
    public static String getUploadPath()
    {
        return getProfile() + "/upload";
    }
}
