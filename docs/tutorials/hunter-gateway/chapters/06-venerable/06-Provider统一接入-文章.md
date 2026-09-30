# 荒天帝炼大模型网关-第6境-尊者境-鲲鹏宝术-Provider统一接入

> 第 06 境 · 尊者境 · 鲲鹏宝术 · Provider统一接入
> 类型：技术文章　来源：素材库 material_id=1362

---

# ProviderAdapter SPI：用一个适配器统一多家 LLM 上游

> 五家上游，一份 Adapter 代码，密钥还不能漏出半字节。

```text
[读者] Java 后端 / LLM 网关开发者，正在把多家模型上游收进一个服务
[痛点] 每接一家上游就复制一份 HTTP 调用，错误码、超时、密钥散落各处
[现在读] 系列走到第 06 境，要把散装调用抽成可插拔的 ProviderAdapter
[读完] 能写出 SPI 与 OpenAICompatibleProviderAdapter，并跑通两家上游
```

```text
[旧方案] 每个上游一个 Service，各自拼 URL、各自解析错误
    |
    v
[新需求] 首批要覆盖 OpenAI、DeepSeek、Qwen、vLLM、Ollama 五类上游
    |
    v
[冲突] 五份重复代码 + 五套密钥处理 + 五套错误码
    |
    v
[后果] 加一家上游改五个文件，密钥明文入库，排障没有统一入口
```

我是老李。前一境刚把 Gateway Pipeline 编排起来，链路中间有一个 invoke 节点，里面写死了一个 OpenAI 的 URL。当时觉得无所谓，反正验证阶段只接一家上游，能把链路跑通就行。

结果这一境刚开始，需求就变了。业务要接 DeepSeek 做成本对比，运维要在内网起 vLLM 和 Ollama 做私有推理。三家的 baseUrl、鉴权头、模型命名全不一样，但 HTTP 形状又几乎一致——都长得像 `/v1/chat/completions`。

Demo 里原来的写法是每个上游一个 Client 类。接第二家的时候我数了一下要复制的东西：URL 拼接、超时、错误码翻译、密钥读取、模型列表，一共五处。复制到第三份，Pipeline 里就会长出一排 if-else。

问题摆在面前：是继续复制第六个 Client 类，还是先停下来抽一层 SPI？

如果先抽 SPI，这一境的交付会被拉长，但后面从路由到计费的十二境都受益；如果继续复制，短期能交付，但 Pipeline 会被条件分支淹没。

要是选错了，加一家上游要改五个文件，密钥明文躺在配置表和日志里——这条链路后面还要叠路由、限流、熔断和计费，改起来只会更贵。

# 01、故事

现场是这样一个系统：`litelmgateway` 的 Demo 已经被逆向过一遍，项目名和包名换过骨，七模型本体澄清过语义，OpenAI 兼容契约也刚刚固化，Gateway Pipeline 能顺序跑完解析、鉴权、调用、回包四段。唯一的短板，就是 Pipeline 里那个 invoke 节点——它只认一家上游。

任务是：把“调哪一家上游”从 Pipeline 代码里剥离出来，做成一个可插拔的 SPI，让新增上游退化成“加一行配置”。

一开始我想得很简单：加一个 `type` 字段，if-else 分派一下不就完了？但仔细看这几家的差异，事情并不在“调哪家”，而在“差异往哪里放”。

差异至少有四类。第一类是地址：有的厂商 baseUrl 自带 `/v1`，有的要求你填裸域名。第二类是错误：鉴权失败有的返 401，有的返 403，有的把错误塞进 200 的 body 里。第三类是流式：SSE 的分帧、结束标记、是否带 `data: ` 前缀，各家写法不统一。第四类是密钥：Demo 里 apiKey 是明文存在配置表里的，一旦进了日志，等于把账号送出去。

真正让我决定先抽 SPI 的，是第 18 境那张验收主链。主链上“Provider → Deployment → LogicalModel → Route”是顺序依赖的：如果 Provider 层还是一个写死的 Client，后面的 Deployment 没法挂，Route 也没得选。这一境欠的债，后面十一境都得还。

所以这一境的目标定得很克制：不碰路由策略，不碰限流预算，只把 Provider 这一层做成标准件，并且用同一个 Adapter 至少跑通两家上游。

> 旧法各写各
> 新需五家通
> 一线抽 SPI
> 万流归一宗

# 02、问题

旧方案失效得很直接。Pipeline 的 invoke 节点里是一段硬编码：URL 是常量，超时是常量，错误处理是 catch 之后打日志再抛 RuntimeException。它在只接一家上游时完全够用，甚至比抽象更省事。

业务影响体现在三个方面。接入周期上，从“改一行 URL”变成“改一周”——因为每接一家都要重新读一遍对方的文档，重新踩一遍流式的坑。成本上，密钥明文入库，安全评审直接卡住。运维上，上游挂了没有统一的健康探测入口，只能等业务报障。

技术表现也同样清晰。错误码是散的：`IOException`、`InterruptedException`、自定义的 `UpstreamException` 混在一起向上冒，Pipeline 拿到异常也没法区分是“上游限流”还是“上游挂了”。配置是散的：`baseUrl` 散在 application.yml，`apiKey` 散在另一张表。测试入口是没有的：新建一个 Provider 之后，唯一能验证它可用的办法是发一次真实的推理请求。

这一境可验证的完成标准，我定成四条：

1. `ProviderAdapter` SPI 落地，包含 `supports`、`invoke`、`stream`、`healthCheck`、`listModels`、`mapError` 六个方法。
2. `OpenAICompatibleProviderAdapter` 优先实现，并且用一个 Adapter 实例同时跑通至少两家不同上游。
3. apiKey 以 AES-GCM 加密存储，接口响应、管理页面、应用日志三处都不出现明文。
4. 管理页面能完成 Provider 的增删改查、测试连接、启停、同步模型。

> 复制第六份
> 债从今日生
> 标准先立住
> 后面少折腾

# 03、原理

这一境只需要一个原理：**兼容是宣称，一致才是事实。**

OpenAI 的 `/v1/chat/completions` 事实上已经成为 LLM 上游的公共方言。DeepSeek、Qwen 的 OpenAI 兼容模式、vLLM 的 OpenAI server、Ollama 的 OpenAI 兼容层，都在往这个形状上靠。但“靠”不等于“一样”。

差异主要落在四个地方：baseUrl 是否自带 `/v1`；错误响应的状态码与 body 结构；流式 SSE 的分帧与结束标记；模型列表接口是否真的实现了。这就决定了 Adapter 的核心工作不是“协议转换”——因为协议本来就一样——而是**协议归一化加边界防守**。

这里有一个反直觉判断：**Provider 适配层的复杂度，不来自协议本身，而来自各家对同一个协议的实现偏差。** 所以 Adapter 里最长的代码不是 invoke，而是 joinUrl 和 mapError。这解释了后面架构里为什么把 URL 归一化和错误映射单独拎出来讲，也解释了为什么第 06 章排查出来的一半问题都不在“协议不支持”。

第二个反直觉判断：**SPI 的 `supports` 方法不是能力声明，而是路由契约。** 很多人会让 `supports` 去 ping 一下上游看看通不通，这是错的。`supports` 只回答一个问题——“这个配置该不该由我来处理”。它必须无副作用、必须快、必须在离线状态下也能给出答案。真实连通性由 `healthCheck` 负责。把这两件事混在一起，就会导致：上游挂了，反而选不出该用哪个 Adapter。

第三个判断关于密钥：**AES-GCM 加密防的不是数据库被拖库，而是防止密钥在页面、日志、异常栈里被顺手带出来。** 真正的高频泄露路径是 `toString()`、错误回显和调试日志，而不是磁盘。理解了这一点，你就知道脱敏函数和加密函数同等重要，缺一个都不算做完。

> 兼容非一致
> 同名不同形
> 差异收一处
> 边界自清明

# 04、架构

```text
[输入] OpenAI 兼容请求 / 模型发现请求
    |
    v
[模块] ProviderAdapterRegistry → OpenAICompatibleProviderAdapter
    |
    v
[数据/状态] ProviderConfig(baseUrl / apiKeyCipher / timeout / proxy / headers / enabled)
    |
    v
[处理] URL 归一化 → 解密 apiKey → HttpClient 调用 → mapError 归一
    |
    v
[输出] 统一 ChatResponse / GatewayException / ModelInfo 列表
```

**边界。** 这一层只负责“把一次调用送到上游，并把结果或错误翻译成网关自己的语言”。它不管选哪家上游（那是路由的事），不管这个 Key 属于哪个项目（那是权限的事），也不管这次调用花了多少钱（那是计费的事）。边界画在这里，Provider 层才能在第 07 境被 Route 复用、在第 14 境被 Usage 复用。

**收益。** 新增一家上游的成本从“改五个文件”降到“加一条记录”。测试连接和模型发现变成平台能力，而不是每家上游各写一次的一次性脚本。错误码统一之后，Pipeline 的异常分支终于能写出 `catch (GatewayException e)` 而不是一串 `instanceof`。

**代价。** 多了一层间接。最直接的代价是 baseUrl 归一化规则需要被仔细维护——因为一旦归一化写错，五家上游会同时出错，而不是只错一家。另一层代价是抽象泄漏：某些上游的独有能力（比如特有的 reasoning 字段、特有的多模态格式）在统一模型里表达不出来，只能先塞进 `extra` 透传。

**适用条件。** 上游数量大于等于两家时，这层抽象立刻回本；只有一家上游且长期不会增加时，直接调用更划算。本系列至少要接五家，所以这层必须做。

> 输入走一路
> 路由认其型
> 状态归一后
> 输出无二名

# 05、实战一次

**环境与依赖。** JDK 17、Spring Boot 3.x、Maven、`jackson-databind`、`spring-boot-starter-web`。本地准备两个上游：一个 DeepSeek API Key，一个本机 Ollama（`ollama serve` 默认监听 11434）。以下为预期结果，未在当前环境实测。

**第一步：定义 SPI。**

```java
package com.litelm.gateway.provider.spi;

import java.util.List;

public interface ProviderAdapter {

    String type();

    boolean supports(ProviderConfig config);

    ChatResponse invoke(ProviderConfig config, ChatRequest request);

    void stream(ProviderConfig config, ChatRequest request, StreamCallback callback);

    HealthResult healthCheck(ProviderConfig config);

    List<ModelInfo> listModels(ProviderConfig config);

    GatewayException mapError(ProviderConfig config, Throwable cause);
}
```

**第二步：配置对象。** 注意 `toString()` 是脱敏的，这一行不是装饰，是防线。

```java
package com.litelm.gateway.provider.spi;

import java.util.Map;

public record ProviderConfig(
        Long id,
        String name,
        String type,
        String baseUrl,
        String apiKeyCipher,
        int timeoutMs,
        String proxy,
        Map<String, String> headers,
        boolean enabled
) {
    @Override
    public String toString() {
        return "ProviderConfig{id=" + id + ", name='" + name + "', type='" + type
                + "', baseUrl='" + baseUrl + "', apiKeyCipher='***'", timeoutMs=" + timeoutMs
                + ", enabled=" + enabled + '}';
    }
}
```

**第三步：AES-GCM 加解密与脱敏。**

```java
package com.litelm.gateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class ApiKeyCipher {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecretKey secretKey;
    private final SecureRandom random = new SecureRandom();

    public ApiKeyCipher(@Value("${gateway.crypto.master-key}") String masterKeyBase64) {
        byte[] keyBytes = Base64.getDecoder().decode(masterKeyBase64);
        if (keyBytes.length != 32) {
            throw new IllegalStateException("gateway.crypto.master-key 必须是 32 字节的 Base64 编码");
        }
        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + cipherText.length)
                    .put(iv).put(cipherText).array();
            return Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("apiKey 加密失败", e);
        }
    }

    public String decrypt(String payload) {
        try {
            byte[] raw = Base64.getDecoder().decode(payload);
            ByteBuffer buffer = ByteBuffer.wrap(raw);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("apiKey 解密失败", e);
        }
    }

    public static String mask(String apiKey) {
        if (apiKey == null || apiKey.length() < 8) {
            return "****";
        }
        return apiKey.substring(0, 3) + "****" + apiKey.substring(apiKey.length() - 4);
    }
}
```

**第四步：OpenAI 兼容适配器。** 核心在 `joinUrl` 与 `mapError`。

```java
package com.litelm.gateway.provider.openai;

public class OpenAICompatibleProviderAdapter implements ProviderAdapter {

    public static final String TYPE = "openai-compatible";

    private final HttpClient httpClient;
    private final ObjectMapper mapper;
    private final ApiKeyCipher cipher;

    public OpenAICompatibleProviderAdapter(ApiKeyCipher cipher,
                                           ObjectMapper mapper,
                                           HttpClient httpClient) {
        this.cipher = cipher;
        this.mapper = mapper;
        this.httpClient = httpClient;
    }

    @Override
    public String type() {
        return TYPE;
    }

    @Override
    public boolean supports(ProviderConfig config) {
        return TYPE.equalsIgnoreCase(config.type());
    }

    @Override
    public ChatResponse invoke(ProviderConfig config, ChatRequest request) {
        HttpRequest httpRequest = requestBuilder(config, "/v1/chat/completions")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(writeJson(request)))
                .build();
        try {
            HttpResponse<String> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 400) {
                throw mapError(config,
                        new UpstreamHttpException(response.statusCode(), response.body()));
            }
            return mapper.readValue(response.body(), ChatResponse.class);
        } catch (IOException e) {
            throw mapError(config, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw mapError(config, e);
        }
    }

    @Override
    public void stream(ProviderConfig config, ChatRequest request, StreamCallback callback) {
        HttpRequest httpRequest = requestBuilder(config, "/v1/chat/completions")
                .header("Content-Type", "application/json")
                .header("Accept", "text/event-stream")
                .POST(HttpRequest.BodyPublishers.ofString(writeJson(request.withStream(true))))
                .build();
        try {
            HttpResponse<Stream<String>> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofLines());
            if (response.statusCode() >= 400) {
                callback.onError(mapError(config,
                        new UpstreamHttpException(response.statusCode(), "stream rejected")));
                return;
            }
            response.body()
                    .map(String::trim)
                    .filter(line -> line.startsWith("data:"))
                    .map(line -> line.substring(5).trim())
                    .takeWhile(payload -> !"[DONE]".equals(payload))
                    .forEach(payload -> callback.onChunk(readChunk(payload)));
            callback.onComplete();
        } catch (IOException e) {
            callback.onError(mapError(config, e));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            callback.onError(mapError(config, e));
        }
    }

    @Override
    public HealthResult healthCheck(ProviderConfig config) {
        try {
            HttpRequest httpRequest = requestBuilder(config, "/v1/models").GET().build();
            HttpResponse<String> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            return response.statusCode() < 400
                    ? HealthResult.up(response.statusCode())
                    : HealthResult.down(response.statusCode(),
                            ApiKeyCipher.mask(response.body()));
        } catch (IOException | InterruptedException e) {
            return HealthResult.down(-1, e.getClass().getSimpleName());
        }
    }

    @Override
    public List<ModelInfo> listModels(ProviderConfig config) {
        HttpRequest httpRequest = requestBuilder(config, "/v1/models").GET().build();
        try {
            HttpResponse<String> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 400) {
                throw mapError(config,
                        new UpstreamHttpException(response.statusCode(), response.body()));
            }
            JsonNode root = mapper.readTree(response.body());
            List<ModelInfo> models = new ArrayList<>();
            for (JsonNode node : root.path("data")) {
                models.add(new ModelInfo(node.path("id").asText(), config.name()));
            }
            return models;
        } catch (IOException e) {
            throw mapError(config, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw mapError(config, e);
        }
    }

    @Override
    public GatewayException mapError(ProviderConfig config, Throwable cause) {
        if (cause instanceof UpstreamHttpException http) {
            GatewayErrorCode code = switch (http.status()) {
                case 401, 403 -> GatewayErrorCode.UPSTREAM_AUTH_FAILED;
                case 404 -> GatewayErrorCode.UPSTREAM_NOT_FOUND;
                case 429 -> GatewayErrorCode.UPSTREAM_RATE_LIMITED;
                default -> http.status() >= 500
                        ? GatewayErrorCode.UPSTREAM_UNAVAILABLE
                        : GatewayErrorCode.UPSTREAM_BAD_REQUEST;
            };
            return new GatewayException(code, config.name(),
                    "upstream " + http.status() + ": " + ApiKeyCipher.mask(http.body()));
        }
        if (cause instanceof java.net.http.HttpTimeoutException) {
            return new GatewayException(GatewayErrorCode.UPSTREAM_TIMEOUT, config.name(),
                    "upstream timeout after " + config.timeoutMs() + "ms");
        }
        if (cause instanceof IOException) {
            return new GatewayException(GatewayErrorCode.UPSTREAM_UNREACHABLE, config.name(),
                    cause.getClass().getSimpleName());
        }
        return new GatewayException(GatewayErrorCode.INTERNAL_ERROR, config.name(),
                cause.getClass().getSimpleName());
    }

    private HttpRequest.Builder requestBuilder(ProviderConfig config, String path) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(joinUrl(config.baseUrl(), path)))
                .timeout(Duration.ofMillis(config.timeoutMs()))
                .header("Authorization", "Bearer " + cipher.decrypt(config.apiKeyCipher()));
        config.headers().forEach(builder::header);
        return builder;
    }

    static String joinUrl(String baseUrl, String path) {
        String base = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
        if (base.endsWith("/v1") && path.startsWith("/v1/")) {
            return base + path.substring(3);
        }
        return base + (path.startsWith("/") ? path : "/" + path);
    }
}
```

**第五步：数据表。**

```sql
CREATE TABLE gateway_provider (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(64)  NOT NULL UNIQUE,
    type            VARCHAR(64)  NOT NULL,
    base_url        VARCHAR(255) NOT NULL,
    api_key_cipher  VARCHAR(512) NULL,
    timeout_ms      INT          NOT NULL DEFAULT 30000,
    proxy           VARCHAR(255) NULL,
    headers_json    TEXT         NULL,
    enabled         TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME     NOT NULL
);

CREATE TABLE gateway_provider_model (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id  BIGINT       NOT NULL,
    model_id     VARCHAR(128) NOT NULL,
    synced_at    DATETIME     NOT NULL,
    UNIQUE KEY uk_provider_model (provider_id, model_id)
);
```

**第六步：管理接口。**

```text
POST   /admin/providers                   新增（apiKey 只进不出）
GET    /admin/providers                   列表（apiKeyCipher 返回掩码）
PUT    /admin/providers/{id}              修改
PATCH  /admin/providers/{id}/enabled      启停
POST   /admin/providers/{id}/test         测试连接
POST   /admin/providers/{id}/sync-models  同步模型
```

**第七步：启动与验证。** 先用两家上游各建一条记录。

```bash
curl -X POST http://localhost:8080/admin/providers \
  -H 'Content-Type: application/json' \
  -d '{"name":"deepseek","type":"openai-compatible","baseUrl":"https://api.deepseek.com/v1","apiKey":"sk-xxxxxxxx","timeoutMs":30000,"enabled":true}'

curl -X POST http://localhost:8080/admin/providers \
  -H 'Content-Type: application/json' \
  -d '{"name":"local-ollama","type":"openai-compatible","baseUrl":"http://127.0.0.1:11434/v1","apiKey":"ollama","timeoutMs":120000,"enabled":true}'

curl -X POST http://localhost:8080/admin/providers/1/test
curl -X POST http://localhost:8080/admin/providers/2/sync-models
```

示例输出（未在当前环境实测，以下为预期结果）：

```json
{"provider":"deepseek","status":"UP","httpStatus":200,"models":["deepseek-chat","deepseek-reasoner"]}
{"provider":"local-ollama","status":"UP","httpStatus":200,"models":["qwen2.5:7b","llama3.1:8b"]}
```

同一个 `OpenAICompatibleProviderAdapter` 实例处理了这两次请求，代码里没有出现任何针对某一家上游的 if 分支。这就是本境要的最小闭环。

> 一纸接口立
> 两行配置接
> 先跑最小集
> 再谈多上游

# 06、排查

**诊断链一：同一 Adapter，DeepSeek 通，Ollama 报 404。**

现象：DeepSeek 的 provider 测试返回 UP，本地 Ollama 的 provider 测试返回 404，body 是 `404 page not found`。

怀疑：Ollama 版本太老，OpenAI 兼容层还没提供。

检查：绕开网关，直接对上游发请求。

```bash
curl -sS http://127.0.0.1:11434/v1/models
```

结果返回 200，模型列表正常。

证据：把应用日志里的实际请求 URL 打出来，看到的是 `http://127.0.0.1:11434/v1/v1/chat/completions`。

根因：`baseUrl` 已经被用户填成带 `/v1` 的形式，Adapter 又拼了一次 `/v1/chat/completions`，路径重复。

**错误尝试：** 我先去升级了 Ollama 的版本，重启了三次服务。这个尝试是错的，因为同一个 curl 用同样的路径直连上游就是 200，说明服务端完全没问题，问题在客户端拼 URL，不在上游版本。升级上游只会把时间浪费在无关变量上。

修复：`joinUrl` 判断 `base` 是否已以 `/v1` 结尾，是则把 path 的 `/v1` 前缀去掉再拼。

**诊断链二：流式调用等 8 秒后一次性吐出全部内容。**

现象：`stream` 接口返回正常，但前端迟迟没有第一个 token，直到上游生成结束才一次性刷出全文。

怀疑：上游不支持 SSE，只是把整包返回模拟成流式。

检查：用 `curl -N` 直接打上游。

```bash
curl -N -X POST http://127.0.0.1:11434/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen2.5:7b","stream":true,"messages":[{"role":"user","content":"写一句话"}]}'
```

结果：每生成一小段就有一行 `data:` 输出，中间有明显的间隔。

证据：上游确实是逐块推送的，而网关侧只在最后拿到了一次完整结果。

根因：流式分支用了 `HttpResponse.BodyHandlers.ofString()`，它会阻塞到整个响应体结束才返回，天然把流式压成了同步。

**错误尝试：** 我先调大了 `timeoutMs`，又换了一家上游试。这个尝试是错的，因为超时只影响“等多久放弃”，不影响“是否分块交付”；把 body handler 换掉，问题才会消失。

修复：改用 `HttpResponse.BodyHandlers.ofLines()`，按行消费，过滤 `data:` 前缀，遇到 `[DONE]` 终止。

**诊断链三：日志里出现了明文 Key。**

现象：异常栈里出现了 `sk-` 开头的完整字符串。

怀疑：加密没生效，数据库里存的是明文。

检查：直接查库看 `api_key_cipher` 字段，以及翻 `mapError` 里拼接的消息内容。

证据：库里存的是 Base64 密文，长度正确；但错误消息直接把上游返回的 body 整段拼了进去，而上游在鉴权失败时会把请求头回显一部分。

根因：加密做对了，脱敏没做。错误消息没有经过 `mask`。

修复：所有对外暴露的错误消息统一走 `ApiKeyCipher.mask`；`ProviderConfig.toString()` 固定返回 `'***'`。

> 报错非上游
> 先看拼的链
> 缓冲非不通
> 证据在日志

# 07、优化

V2 严格基于第 06 章的三条证据来改，不做任何没有证据支撑的重构。

**修改一：URL 归一化。** 根因是路径重复拼接。修改点是 `joinUrl`，增加 `/v1` 去重判断。原因：不同上游对 baseUrl 的约定不同，用户填什么都应该能用。新行为：`https://api.deepseek.com/v1` 与 `http://127.0.0.1:11434/v1` 都能拼出正确路径。验证方式是对两个 baseUrl 各写一条断言，断言结果等于期望 URL——这是纯函数，可以离线验证，不依赖上游。

**修改二：流式消费改为按行。** 根因是 body handler 选错。修改点是 `stream` 方法，改用 `ofLines()` 并引

---

## 摘要

用一个 ProviderAdapter SPI 统一 OpenAI、DeepSeek、Ollama 等上游：URL 归一化、AES-GCM 密钥加密、连通性测试

## 标签

`深圳同盟` `腾讯云架构师技术同盟` `LLM网关` `ProviderAdapter` `OpenAI兼容` `Java` `密钥加密`
