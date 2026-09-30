# 缺口清单与风险清单（第 01 境）

> 这两张表**刻意分开**：
> **缺口**＝必须补的能力，按能力域归类，每条给出建议承接章节；
> **风险**＝可能出问题的地方，按严重度排序，每条给出**可直接判定的触发条件**。
> 混在一起就无法判断优先级——「没有协议入口」要排期做，「从库连接超时 2 秒」只是要盯。
> 两份清单都不含「我猜」：每条都指向仓库内证据或本境实测。

---

## 第一部分：缺口清单（Gap）

### G1 协议与契约域 → 第 04 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G1.1 | 完全不存在 `/v1/chat/completions`、`/v1/models`、`/v1/embeddings` | `src/main/java` 全量检索 `/v1`、`chat/completions`、`embeddings` 零命中；运行时 `/v1/models` 与 `/nosuchpath123` 表现相同（均 302 → `/login`） | 致命 |
| G1.2 | 不存在统一 DTO（`ChatCompletionRequest`/`Message`/`Tool`/`Usage`/`Choice`/`Error`/`StreamingChunk`） | 全仓无此类；`OpenResult` 是通用响应包裹，不是协议对象 | 致命 |
| G1.3 | 不支持 SSE 流式（无 `text/event-stream` 生产者，无 `[DONE]` 结束符语义） | 全仓检索 `text/event-stream`、`SseEmitter`、`Flux` 零命中 | 致命 |
| G1.4 | 错误语义与协议冲突：全部以 HTTP 200 承载业务码 | 本境实测 40001/40003/40004 均 HTTP 200；代码见 `OpenApiFilter.java:148-157` | 高 |
| G1.5 | 无错误码到 HTTP 状态码的映射表 | 代码里 code 是裸整数常量（40001…50002），无枚举、无表 | 高 |

### G2 模型与上游接入域 → 第 03（本体）/ 06（Provider）/ 08（部署归一）境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G2.1 | 没有模型语义：`open_api` 只有「路径 → target_url」 | `open_api` 表 17 个字段无 model/provider/deployment 任何一列 | 致命 |
| G2.2 | 没有 Provider（上游供应商）抽象与适配器 | 全仓无 `ProviderAdapter` 或等价 SPI；`OpenApiProxyService` 直接 `RestTemplate.exchange` 到 `target_url` | 致命 |
| G2.3 | API Key 无加密存储：`app_secret` 明文 | `open_app.app_secret` 列类型 `varchar(128)`，实测值即明文（`sk_selftest_demo_...`）；无 AES-GCM 痕迹 | 高 |
| G2.4 | 无连接测试、无模型清单同步、无启停开关 | `open_app` 只有 `status`/`expire_time`；无「Test Connection」接口 | 中 |
| G2.5 | 历史遗留的 `open_api.method` 兼容逻辑（非 POST 时回退查 POST）会让同一路径的语义不确定 | `OpenApiSecurityService.java:299-318` | 中 |

### G3 路由与可靠性域 → 第 07 / 09 / 10 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G3.1 | 一个 api_path 只对应一个 target_url（无候选、无权重、无优先级） | `open_api.api_path` 上有 UNIQUE 约束 | 高 |
| G3.2 | 无路由策略（PRIORITY/WEIGHTED/RANDOM/LEAST_LATENCY）与 explain 记录 | 全仓无相关枚举与表 | 高 |
| G3.3 | 无重试/退避 | `OpenApiProxyService.forward` 单次 `exchange`，异常直接抛 `OpenProxyException` | 高 |
| G3.4 | 无 Fallback（同逻辑模型切备份上游） | 同上，无候选概念 | 高 |
| G3.5 | 无熔断/健康摘除（失败的 target_url 会被反复打到） | 全仓无 CircuitBreaker；`OpenApiMgrController` 无健康状态字段 | 高 |
| G3.6 | 无调用留痕结构（一次请求只落一条 `open_call_log`，没有按尝试粒度的记录） | `open_call_log` 无 attempt/deployment 列 | 中 |

### G4 权限与配额域 → 第 11 / 12 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G4.1 | 没有 Project（权限与成本聚合边界） | 表里只有 `open_app`，无 project 概念 | 高 |
| G4.2 | 没有 VirtualKey 概念：`app_key` 只做签名身份，不能「发一个 key 给业务方自助用」 | `open_app` 无 prefix/hash/expire/额度/模型 ACL 列；`app_key` 是唯一约束的明文值 | 高 |
| G4.3 | 无模型 ACL（哪个 key 能用哪些模型） | 只有 `open_app_api`（哪个应用能调哪个路径） | 高 |
| G4.4 | 无限流（RPM/TPM） | 全仓无 RateLimit；无 Bucket4j/Redis 计数 | 高 |
| G4.5 | 无预算（Daily/Monthly）与硬门禁 | 全仓无 budget | 高 |
| G4.6 | 429 契约缺失：既不返回 429，也没有 `Retry-After` | 见 G1.4 | 高 |

### G5 配置与持久化域 → 第 13 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G5.1 | 配置改动即时生效但无版本、无发布语义 | `open_api`/`open_app` 是普通 CRUD，`update_time` 一改即生效 | 中 |
| G5.2 | 无 Draft/Published 与回滚 | 表里无 version/status 双态 | 中 |
| G5.3 | 无 DB 迁移工具（无 Flyway/Liquibase） | `pom.xml` 无相关依赖；schema 靠 `deploy/**/init/*.sql` 手工执行 | 高 |
| G5.4 | 无配置快照与缓存原子替换（热路径每次都查库） | `OpenApiSecurityService` 每次请求 `jdbcTemplate.query` 查 `open_api`/`open_app` | 中 |

### G6 计量与成本域 → 第 14 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G6.1 | 无 Token 计量（请求/响应都只存原始文本） | `open_call_log.req_body/resp_body` 是 text，无 token 列 | 高 |
| G6.2 | 无价格与成本（Deployment 价格、priceVersion 都不存在） | 无相关列/表 | 高 |
| G6.3 | 无用量日聚合与报表 | 无聚合表、无报表接口 | 中 |
| G6.4 | 无 TTFT/延迟分位统计（只有 `cost_ms` 总耗时） | `open_call_log.cost_ms` | 中 |

### G7 控制台与可观测域 → 第 15 / 16 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G7.1 | 无 LLM 相关管理页面（菜单里只有 app/api/auth/log/doc 五个） | 实测 `sys_menu` 2100-2105 | 高 |
| G7.2 | 无 Playground | 全仓无 | 中 |
| G7.3 | 无指标端点（未引入 actuator/micrometer/prometheus） | `pom.xml` 无；`/actuator/health` 实测 302（不存在） | 高 |
| G7.4 | 日志是自由文本，没有结构化字段（pipeline stage / route decision / attempt） | `logback.xml` 的 pattern 里只有 `traceId` | 中 |
| G7.5 | 无健康看板（Provider/Deployment 状态无可视化） | 同 G7.1 | 中 |

### G8 部署与运维域 → 第 18 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G8.1 | 容器化路径**当前不可用** | 本境实测 `docker compose up -d --build` 失败：`deploy/local-docker/Dockerfile:14` 的 `apt-get update` 命中已下线 Debian 源（`archive.ubuntu.com/.../resolute` 404） | 高 |
| G8.2 | 无 K8s 清单（Deployment/Service/Ingress/探针/HPA/PDB） | 全仓无 yaml 清单 | 高 |
| G8.3 | 单副本假设：nonce 去重与 Shiro 会话都在进程内 | `OpenApiSecurityService.NONCE_CACHE` 是 `static ConcurrentHashMap`（`:39`） | 高 |
| G8.4 | 无优雅下线（SSE 长连接场景无处理） | 无 `server.shutdown=graceful`，无 `ShutdownManager` 之外的停止逻辑 | 中 |
| G8.5 | 缺少统一的应用日志落盘位置 | `logback.xml` 使用相对路径 | 低 |

### G9 安全域 → 第 04 / 11 / 18 境

| # | 缺口 | 证据 | 严重度 |
|---|---|---|---|
| G9.1 | Druid 监控台账号口令写在 yml（`postgres`/`123456`） | `application-druid.yml` 的 `statViewServlet.login-username/password` | 高 |
| G9.2 | Shiro `rememberMe.cipherKey` 配置项存在但需人工固定（否则重启后 Cookie 解密失败） | `application.yml:116` `cipherKey:` 为空 | 中 |
| G9.3 | 跨域未开放（浏览器直连网关会被 CORS 拦） | `ResourcesConfig` 只注册资源处理器与 `RepeatSubmitInterceptor`（`:52-66`），无 `addCorsMappings` | 中 |
| G9.4 | 请求体/响应体明文入库（`open_call_log.req_body/resp_body` 含完整内容，可能含用户隐私） | 表结构实测 | 中 |

---

## 第二部分：风险清单（Risk）

| # | 严重度 | 风险 | 触发条件（可直接判定） | 后果 | 缓解 |
|---|---|---|---|---|---|
| R1 | 高 | 数据源硬编码且指向既有库 | 执行 `java -jar target/qvsu-openapi.jar` 于一台没有 `localhost:5432/jd_openapi` 的机器 | 启动即失败（Druid init error → shiroFilterFactoryBean 连锁失败） | 把 URL/账号/口令改为环境变量注入（第 02 境换骨时一并处理） |
| R2 | 高 | 容器化路径失效 | 执行 `cd open-api/deploy/local-docker && docker compose up -d --build` | 镜像构建在第 14 行失败，无法产出容器 | 第 18 境重写 Dockerfile（换可用基础镜像、预装时区） |
| R3 | 高 | 契约冲突（HTTP 200 + 业务码） | 用官方 OpenAI SDK（任意语言）指向网关 | SDK 把 200 当成功，解析到 `{code,msg}` 后报结构错误 | 第 04 境建立错误码 → HTTP 状态码映射，并把 `OpenResult` 限定在管理面 |
| R4 | 高 | 多副本下签名去重失效 | 多实例部署 + 同一 nonce 打到不同实例 | 重放保护失效（安全风险） | 第 18 境把 nonce 计数迁 Redis |
| R5 | 高 | `app_secret` 明文 | `select app_secret from open_app` | 库被读即全部凭据泄露 | 第 06 境 AES-GCM 加密，页面与日志永不回显 |
| R6 | 中 | 双 SQL 方言漂移 | 只改 MySQL 脚本或只改 PostgreSQL 脚本后另一侧初始化 | 换方言部署时表结构不一致 | 第 13 境引入 Flyway 作为唯一 schema 真源 |
| R7 | 中 | 启动期强依赖数据库 | 数据库不可达时启动 | 探活/健康检查也起不来，无法区分「未就绪」与「挂了」 | 第 16/18 境把健康检查与数据源解耦 |
| R8 | 中 | 热路径无缓存，每次请求查库两次 | 压测 `GET /open/selftest/httpbin/get` | P95 被 DB 往返拖累 | 第 13 境 RuntimeConfigSnapshot + Caffeine |
| R9 | 中 | 敏感信息入库明文 | 调一次带业务数据的接口后查 `open_call_log.req_body` | 隐私数据长期留存 | 第 17 境日志脱敏 / 字段裁剪 |
| R10 | 中 | 第三方源码许可待核 | 素材红线：「发现依赖许可禁止商用或依赖带传染性协议」即触发 | 法律风险 | 本境只提交自己写的脚本与文档；`open-api/` 是既有基线，不再扩散；许可结论挂「待法务确认」 |
| R11 | 低 | Druid 监控台暴露 | 访问 `/druid/index.html` | 运行状态与 SQL 被未授权者看到 | 第 02 境关闭或加白名单 |
| R12 | 低 | Shiro rememberMe `cipherKey` 未固定 | 重启后携带旧 rememberMe Cookie 访问 | Cookie 解密失败，偶发登录态异常 | 第 02 境把 cipherKey 固定为配置项 |
| R13 | 低 | 前端品牌与项目名耦合 | 全仓检索 `qvsu` / `聚搭` | 对外呈现仍像别人的产品 | 第 02 境改名 + 残留扫描脚本 |
| R14 | 中 | **网关自环**：`open_api` 的 8 条 selftest 记录 `target_url` 指向 `http://127.0.0.1:5656/...`，而应用 `server.port` 默认就是 5656 | 在默认端口上调用 `/open/selftest/httpbin/get` | 请求从网关打进网关自己，形成自环；压测或误配下会放大自身负载 | 第 01 境已如实登记；第 04 境确立对外契约时应把 selftest 记录改为指向独立 mock 上游 |

---

## 第三部分：本境未验证项（记账，不装作已完成）

- `mvn test` 未跑：4 个集成测试类依赖 5433 端口的 PostgreSQL 测试库与验证码绕过开关。留给第 02 境的回归口径。
- Shiro 登录流程、在线会话、定时任务触发三条链路未做运行时验证。
- 复用矩阵的证据抽检由本境执行（10 行逐行 read 核对），**没有第二个人**独立复核——单人作业无法满足规格里「另一人独立复核」的字面要求，如实记账。
