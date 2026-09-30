# 荒天帝炼大模型网关-第11境-虚道境-蛄族宝术-VirtualKey控域

> 第 11 境 · 虚道境 · 蛄族宝术 · VirtualKey控域
> 类型：技术文章　来源：素材库 material_id=1368

---

# Project 与 VirtualKey：LLM Gateway 的权限和成本边界

> 没有 Project 和 VirtualKey，网关就管不住权限和成本。

```text
[读者] 正在把 LLM Gateway 从 Demo 推向多团队使用的后端/架构师
[痛点] 只有全局 API Key，无法按项目授权、限额和即时禁用
[现在读] 需要补齐 Project 与 VirtualKey 的权限和成本边界
[读完] 能设计并实现 Bearer → Key → Project → Model ACL 鉴权链
```

```text
[旧方案] 每个开发者直接拿 Provider API Key
    |
    v
[新需求] 多项目、多 Key、按模型授权、按项目计费
    |
    v
[冲突] 没有统一边界，Key 无法即时禁用，模型权限无法收敛
    |
    v
[后果] 越权调用、成本失控、审计无据
```

我是老李，一直在做 Java 后端和网关方向。最近我们在 litellmgateway/open-api.zip Demo 上继续演进，前几章已经把 Provider、Deployment、LogicalModel 和路由骨架搭起来。

现在要面对的是多团队共用：每个项目需要独立凭证，每个 Key 要能按模型授权，还要能按项目聚合成本。

很多团队会先给每个开发者发一个 Provider Key，感觉最快；但一旦要禁用某人、限制某个模型、统计项目用量，就会立刻失控。

冲突问句：全局 Key 还能支撑多项目吗？

选择问句：是把权限放在业务层，还是放在 Gateway？

选错后的后果问句：如果禁用不生效，会付出什么代价？

# 01、故事

一开始，网关只有一个全局 API Key。所有项目、所有开发者、所有模型都共用它。任务是让每个项目拥有独立 VirtualKey，并且能按模型授权、按项目聚合成本。我们很快遇到现场问题：某个项目负责人要求立刻禁用一名离职开发者的 Key，但系统只能改数据库，调用方仍然通过缓存继续访问。更麻烦的是，项目 A 的 Key 被用来调用项目 B 的模型，网关没有检查模型权限，直接放行。于是我们决定把 Project 和 VirtualKey 作为权限与成本的第一道边界。

> 全局一把钥匙
> 看似省去麻烦
> 边界一旦缺失
> 越权和失控同来

# 02、问题

旧方案失效：所有调用共享 Provider Key，无法区分项目，无法按项目计费，也无法按模型授权。业务影响：一个项目的越权调用会污染另一个项目的成本，离职人员 Key 无法即时失效，审计时找不到责任人。技术表现：网关只校验 Bearer 是否存在，不校验 Key 状态、过期、IP、Project 和模型 ACL。可验证的完成标准是：无权模型返回 403，禁用或过期 Key 立即失效，Project 能聚合用量和成本。

> 旧法只管通
> 新需管住界
> 若无即时断
> 越权成常态

# 03、原理

本篇需要的原理只有一个：VirtualKey 是 Project 的子凭证，鉴权链必须从 Bearer 一路短路到 Model ACL。反直觉判断：Key 明文只在创建时展示一次，不是因为系统小气，而是因为数据库只存哈希，系统本身也无法还原明文。这迫使所有权限判断都前移到鉴权链中，而不是等到业务层再补。VirtualKey 的字段包括 prefix、hash、expire、allowedModels、rpm、tpm、budget、ipAllowlist、enabled。prefix 用于展示和快速识别，hash 用于比对，expire 和 enabled 决定生命周期，allowedModels 和 Project 决定权限边界，rpm/tpm/budget 决定成本边界。鉴权链是：Bearer → Key → status/expire/IP → Project → Model ACL。任何一步失败都必须立即拒绝。

> 哈希不可逆
> 明文只一次
> 边界若前移
> 越权难发生

# 04、架构

```text
[输入] Bearer VirtualKey
    |
    v
[模块] AuthFilter + VirtualKeyService + ModelAccessChecker
    |
    v
[数据/状态] virtual_keys / projects / model_permissions
    |
    v
[处理] 校验状态/过期/IP → 解析 Project → 检查模型 ACL
    |
    v
[输出] 放行到 Gateway Pipeline 或返回 401/403
```

边界：AuthFilter 只负责凭证和权限，不负责具体模型调用。收益：权限判断统一，模型调用前就能拒绝越权。代价：每次请求多一次缓存或数据库查询，需要设计缓存失效策略。适用条件：多项目、多 Key、多模型的共享网关。Project 是权限和成本聚合边界，VirtualKey 属于 Project，不能脱离 Project 单独存在。

> 一层接一层
> 链断即拒绝
> 边界若清晰
> 网关自有序

# 05、实战一次

环境：Java 17、Spring Boot 3.x、Spring Data JPA、MySQL 8。未在当前环境实测，以下为预期结果。

依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/llm_gateway
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update
```

核心实现：

```java
@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private boolean enabled;
    // getters and setters
}
```

```java
@Entity
@Table(name = "virtual_keys")
public class VirtualKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String prefix;
    private String keyHash;
    private Instant expireAt;
    private String allowedModels;
    private int rpm;
    private int tpm;
    private BigDecimal budget;
    private String ipAllowlist;
    private boolean enabled;
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    // getters and setters
}
```

```java
@Service
public class VirtualKeyService {
    private final VirtualKeyRepository virtualKeyRepository;
    private final ProjectRepository projectRepository;

    public VirtualKeyService(VirtualKeyRepository virtualKeyRepository,
                             ProjectRepository projectRepository) {
        this.virtualKeyRepository = virtualKeyRepository;
        this.projectRepository = projectRepository;
    }

    public VirtualKey authenticate(String token, String ip) {
        String hash = sha256(token);
        VirtualKey key = virtualKeyRepository.findByKeyHash(hash)
                .orElseThrow(() -> new UnauthorizedException("invalid key"));
        if (!key.isEnabled()) {
            throw new UnauthorizedException("key disabled");
        }
        if (key.getExpireAt() != null && key.getExpireAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("key expired");
        }
        if (!ipAllowed(key.getIpAllowlist(), ip)) {
            throw new UnauthorizedException("ip not allowed");
        }
        Project project = key.getProject();
        if (project == null || !project.isEnabled()) {
            throw new UnauthorizedException("project disabled");
        }
        return key;
    }

    private boolean ipAllowed(String allowlist, String ip) {
        if (allowlist == null || allowlist.isBlank()) {
            return true;
        }
        for (String item : allowlist.split(",")) {
            if (item.trim().equals(ip)) {
                return true;
            }
        }
        return false;
    }

    private String sha256(String input) {
        try {
            return HexFormat.of().formatHex(
                java.security.MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception e) {
            throw new IllegalStateException("sha256 failed", e);
        }
    }
}
```

模型权限检查：
```java
@Component
public class ModelAccessChecker {
    public void check(VirtualKey key, String model) {
        String allowed = key.getAllowedModels();
        if (allowed == null || allowed.isBlank()) {
            throw new ForbiddenException("model not allowed");
        }
        for (String item : allowed.split(",")) {
            if (item.trim().equals(model)) {
                return;
            }
        }
        throw new ForbiddenException("model not allowed");
    }
}
```

过滤器：
```java
@Component
public class AuthFilter extends OncePerRequestFilter {
    private final VirtualKeyService virtualKeyService;
    private final ModelAccessChecker modelAccessChecker;

    public AuthFilter(VirtualKeyService virtualKeyService,
                      ModelAccessChecker modelAccessChecker) {
        this.virtualKeyService = virtualKeyService;
        this.modelAccessChecker = modelAccessChecker;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/v1/chat/completions")) {
            chain.doFilter(request, response);
            return;
        }
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            response.setStatus(401);
            return;
        }
        String token = auth.substring(7);
        String ip = request.getRemoteAddr();
        try {
            VirtualKey key = virtualKeyService.authenticate(token, ip);
            String model = request.getHeader("X-Model");
            modelAccessChecker.check(key, model);
            chain.doFilter(request, response);
        } catch (UnauthorizedException e) {
            response.setStatus(401);
        } catch (ForbiddenException e) {
            response.setStatus(403);
        }
    }
}
```

启动：
```bash
./mvnw spring-boot:run
```

请求：
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer vk_abc123" \
  -H "X-Model: gpt-4o" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

验证：无权模型返回 403，禁用 Key 返回 401，过期 Key 返回 401。

示例输出：
```json
{"error":"model not allowed"}
```

V1 先跑通，但留下缓存一致性和预算扣减问题。

> 先跑通链路
> 再谈优与劣
> 没有第一次
> 优化无根基

# 06、排查

诊断链一：现象是禁用 Key 后仍能调用。怀疑缓存没有失效。检查 Redis 缓存和数据库，发现缓存 key 只有 token hash，没有版本号，TTL 是 5 分钟。证据是日志显示缓存命中，数据库已更新 enabled=false。根因是禁用操作只更新数据库，没有删除缓存。修复是禁用时删除缓存，并把缓存 TTL 降到 30 秒。

诊断链二：现象是无权模型返回 200。怀疑模型 ACL 没检查。检查 AuthFilter 代码，发现只调用了 virtualKeyService.authenticate，没有调用 modelAccessChecker.check。证据是日志中缺少模型权限检查记录。根因是鉴权链缺少 Project → Model ACL。修复是把模型权限检查加入过滤器，并在 VirtualKey 更新时同步失效。

**错误尝试：** 我们曾尝试在 Nginx 层做 IP 白名单，认为这样最快。但网关在负载均衡后拿到的是内网 IP，不是客户端真实 IP，导致白名单完全失效。后来改为在应用层基于 X-Forwarded-For 并做可信代理校验，才正确。

> 缓存不失效
> 禁用成空文
> 链路少一环
> 越权便发生

# 07、优化

根因是缓存失效和鉴权链不完整。修改一：禁用或更新 VirtualKey 时，立即删除对应缓存，并让缓存 key 包含 keyHash 和 updatedAt。修改原因是状态变更必须即时可见。新行为是禁用后下一次请求立即 401。验证方式是修改数据库 enabled=false，然后立即发起请求，预期返回 401。

修改二：在 AuthFilter 中强制调用 ModelAccessChecker，并检查 Project 的 enabled 状态。修改原因是权限边界必须短路在模型调用之前。新行为是无权模型立即 403。验证方式是使用只允许 gpt-3.5 的 Key 请求 gpt-4o，预期返回 403。

修改三：为 Project 和 VirtualKey 增加角色：管理员、运维、项目负责人、开发者、审计员。管理员管理 Project 和 Key，项目负责人管理本项目的 Key 和模型权限，开发者使用 Key，审计员只读用量。修改原因是权限管理本身也需要边界。

> 根因既已明
> 修改不绕路
> 新行为可验
> 优化才落地

# 08、演进

```text
[同一输入]
    |
    +--[V1] 只校验 Bearer 是否存在 / 缓存 TTL 5 分钟 / 越权模型放行
    |
    +--[V2] 统一鉴权链 / 状态变更清缓存 / Project → Model ACL
    |
[Trade-off]
{得到即时失效和模型边界 / 失去低延迟缓存命中 / 适用多项目共享网关}
```

正确性：V2 能保证无权模型 403，禁用/过期 Key 立即失效。稳定性：V2 引入缓存失效，需要处理并发更新。复杂度：V2 增加了 Project 和 Model ACL 检查。成本：V2 每次请求多一次缓存查询或数据库查询。适用范围：多项目、多 Key、多模型的共享网关。遗留问题：RPM/TPM/Budget 尚未实际扣减，审计日志还不完整。

> 旧版图快省
> 新版图边界
> 取舍在场景
> 无绝对优劣

# 09、洞见

## 9.1 Project 是权限边界，也是成本边界

Project 不是简单的分组标签。它同时承担模型权限聚合和用量成本聚合。一旦 VirtualKey 脱离 Project，就无法回答“谁在花谁的钱”。

## 9.2 VirtualKey 明文只展示一次，不是安全姿态而是存储约束

反直觉判断：Key 哈希存储比加密存储更难支持找回，但正是这种不可逆性让“禁用”和“审计”更可靠。系统只存 prefix 和 hash，明文只在创建时返回一次。

## 9.3 鉴权链必须短路在模型调用之前

反直觉判断：把模型权限检查放在业务层看起来更灵活，但会引入多入口不一致；放在网关层反而更简单，因为所有请求都经过同一个 AuthFilter。

## 9.4 禁用/过期不是状态问题，而是缓存一致性问题

即使数据库正确，缓存也可能让禁用延迟生效。工程上必须把状态变更和缓存失效绑定，才能满足“立即失效”的验收。

> 边界非分组
> 哈希非噱头
> 链路须前置
> 缓存要一致

# 10、系统落地

原来有 Provider、Deployment、LogicalModel 和路由，能完成模型调用。本篇新增 Project、VirtualKey、模型权限和角色体系。现在能做：按项目发 Key，按模型授权，禁用/过期即时失效，无权模型 403。还缺：RPM/TPM/Budget 的实际扣减、用量落库、审计日志、管理页面完整交互。下一步演进是第 12 境斩我境，用 RPM/TPM/Budget 做硬约束治理。

> 原来能调用
> 现在能管界
> 还缺硬约束
> 下一步收紧

# 11、小结

```text
Q1 → 为什么全局 Key 顶不住多项目？
Q2 → 鉴权链如何做到即时失效和模型边界？
Q3 → 选错边界会怎样？
状态 → Project + VirtualKey 落地，无权模型 403，禁用/过期 Key 立即失效
```

Q1：全局 Key 无法区分项目，无法按模型授权，成本无法归集。Q2：通过 Bearer → Key → status/expire/IP → Project → Model ACL 的短路鉴权链，并在状态变更时清缓存。Q3：选错边界会导致越权调用、成本失控、审计无据。

> 一问为何需
> 二问如何做
> 三问错如何
> 状态已可验

# 12、作业

## 12.1 理解题：VirtualKey 为什么必须属于 Project？

参考答案：Project 是权限和成本聚合边界。VirtualKey 脱离 Project 后，模型权限和用量成本无法按项目收敛。

## 12.2 实战题：实现一个 AuthFilter，要求禁用 Key 立即返回 401。

参考答案：在 AuthFilter 中调用 VirtualKeyService.authenticate，检查 enabled、expire、IP、Project 和 Model ACL。禁用时删除缓存，确保下一次请求读到数据库状态。

## 12.3 排障题：调用方使用禁用 Key 仍然成功，如何排查？

参考答案：先查数据库 enabled 是否为 false，再查缓存是否命中，最后查逻辑是否清缓存。根因通常是缓存未失效。

## 12.4 架构判断题：模型权限应该放在业务层还是网关层？

参考答案：应放在网关层。网关层能统一短路所有请求，避免多入口不一致；业务层只处理业务逻辑。

> 理解边界义
> 实战验链路
> 排障查缓存
> 架构定统一

# 13、思考

回到核心冲突：没有 Project 和 VirtualKey，网关就管不住权限和成本。可复用的工程判断是：凭证的明文只展示一次，权限的边界必须前移，状态的变更必须让缓存失效。Project 是边界，VirtualKey 是穿越边界的凭证，鉴权链是边界上的关卡。

> 一念辨边界
> 一证定根因
> 一改知取舍
> 一役见真章

---

## 摘要

在 LLM Gateway 中引入 Project 与 VirtualKey，打通 Bearer 到 Model ACL 的鉴权链，实现模型权限 403 与禁用

## 标签

`深圳同盟` `腾讯云架构师技术同盟` `LLM Gateway` `VirtualKey` `权限控制` `Java`
