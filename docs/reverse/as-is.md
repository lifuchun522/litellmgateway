# As-Is 基线：open-api Demo（`SYS-qvsu-openapi`）

> 本文件只描述**是什么**，不描述**应该是什么**。To-Be 语义由第 03 境的本体建模负责。
> 所有结论都指向仓库内路径；无法给出路径的结论一律标注「未验证」。
> 数据结构固定的九节：运行前置条件 → 模块树 → 启动入口 → 接口清单 → 调用链 → 数据模型 → 页面路由 → 外部依赖 → 复用矩阵 → 缺口清单 → 风险清单。
> 机器产物在 `docs/reverse/scan-output/`；接口人工确认表在 `docs/reverse/endpoints.md`；复用矩阵在 `docs/reverse/reuse-matrix.md`；缺口与风险在 `docs/reverse/gaps-and-risks.md`；冻结记录在 `docs/reverse/baseline.md`。

---

## 一、运行前置条件

> 这一节刻意放在模块树之前。三次典型诊断里有两次的根因是**环境缺失而不是代码缺陷**（数据源连接拒绝、依赖仓库不可达），把环境写清楚比画模块树更能救下一个人。

| 项 | 值 | 证据 |
|---|---|---|
| 基线锚点 | `open-api.zip`，SHA256 `A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05` | `docs/reverse/baseline.md` 第 1 节 |
| 解压后项目根 | `open-api/qvsu-openapi` | `docs/reverse/scan-output/root.txt` |
| 构建语言级别 | `java.version = 1.8`（`maven-compiler-plugin` 3.1） | `open-api/qvsu-openapi/pom.xml:18`、`:110` |
| 实测 JDK | Temurin 11.0.29（编译通过） | `docs/reverse/baseline.md` 第 3.2 节 |
| 构建工具 | Maven 3.9.11 | 同上 |
| Spring Boot | 2.7.18（Spring Framework 5.3.39） | `pom.xml:20`、`:33` |
| 必需外部服务 | PostgreSQL 11，`localhost:5432`，库 `jd_openapi`，用户 `postgres` | `src/main/resources/application-druid.yml` master.url |
| 必需初始化 SQL | `open-api/deploy/local-docker/postgres/init/{00-init,10-qvsu,30-open-api,31-open-api-compat,35-quartz,40-open-api-menu,50-open-api-seed}.sql`（按文件名顺序） | `docs/reverse/scan-output/assets.txt` |
| 备用方言 | MySQL 8 一套等价脚本 `deploy/local-docker/mysql/init/*.sql`、`open-api/sql/*.sql` | 同上 |
| 应用端口 | 5656（`server.port`） | `src/main/resources/application.yml`；本境验证时用 `--server.port=18080` 避免冲突 |
| 生效 profile | 默认只加载 `druid`（`application-druid.yml`） | 启动日志 `The following 1 profile is active: "druid"` |
| 默认账号 | `admin` / `admin123`（`open-api/README.md`） | `open-api/README.md:24` |

**静态资源 640 个文件、模板 144 个、Java 源文件 265 个**（`scan-output/java-file-count.txt`、`template-count.txt`）。

**缺库会怎样**：启动直接失败，日志形态见 `docs/reverse/baseline.md` 第 5 节（Druid 初始化异常 → `masterDataSource` 创建失败 → `shiroFilterFactoryBean` 连锁失败）。**这是环境问题，不是代码缺陷。**

---

## 二、模块树

单模块 Spring Boot 工程（`packaging=jar`，`finalName=qvsu-openapi`），根包 `com.qvsu`，包分布见 `scan-output/packages.txt`（`com.qvsu.common.utils` 17 个类最多）。

| 层 | 包 | 类数（主/测试） | 职责一句话 |
|---|---|---|---|
| 启动与框架 | `com.qvsu`（根包）+ `com.qvsu.framework` | 27 / 46 | 启动类、Shiro 安全、动态数据源、MyBatis、拦截器、全局异常 |
| 通用基座 | `com.qvsu.common` | 33 / 113 | 注解、常量、领域基类、工具、XSS、异常体系 |
| 系统管理域 | `com.qvsu.system` | 5 / 50 | 用户/角色/菜单/部门/岗位/字典/参数/公告的 domain-mapper-service |
| 调度域 | `com.qvsu.quartz` | 9 / 19 | Quartz 配置、任务与日志的 CRUD、`HttpTask`/`QvsuTask` |
| OpenAPI 网关 | `com.qvsu.open` | 9 / 22 | **本项目唯一的业务模块**：应用/接口/授权/日志/文档管理 + `/open/**` 代理 |
| Web 入口 | `com.qvsu.web` | 4 / 15 | 15 个 Controller：登录、首页、验证码、各管理面 CRUD 入口 |

> 更细的组件级清单（`COMP-*` / `TCA-*`）见已有的 `docs/meta-model/technical-component-index.md` 与 `docs/meta-model/module-index.md`（12 个模块 ID、`MOD-*`）。

**依赖方向**：`web → open/system/quartz → common`；`framework → common`；`open` 不反向依赖 `web`（`docs/meta-model/module-index.md` 的依赖矩阵）。

---

## 三、启动入口

| 项 | 值 | 证据 |
|---|---|---|
| 启动类 | `com.qvsu.QvsuApplication` | `src/main/java/com/qvsu/QvsuApplication.java` |
| war 部署入口 | `com.qvsu.QvsuServletInitializer` | 同目录 |
| 加载的配置 | `application.yml`（应用/端口/日志/i18n）→ `application-druid.yml`（数据源与连接池）→ `logback.xml` → `banner.txt` | `src/main/resources/` |
| 启用的过滤器 | `OpenApiFilter`（仅 `/open/**`）、`XssFilter` | `com/qvsu/open/filter/OpenApiFilter.java:44`、`com/qvsu/common/xss/XssFilter.java` |
| 自定义 Shiro 过滤链 | `CustomShiroFilterFactoryBean` + `ShiroConfig` | `com/qvsu/framework/shiro/web/CustomShiroFilterFactoryBean.java`、`com/qvsu/framework/config/ShiroConfig.java` |
| 实测启动耗时 | 15.504 秒（18080）、16.343 秒（5656） | `docs/reverse/baseline.md` 第 3.3 节 |

**启动期即强依赖数据库**：`DruidConfig` 的 `masterDataSource` 是 `init-method` 初始化，连不上库就不让容器 refresh 完成。

---

## 四、接口清单

- 机器候选 245 条（`scan-output/endpoints.raw.txt`），逐条人工确认后的清单在 **`docs/reverse/endpoints.md`**（含确认/否决/待验证三态与理由）。
- **协议层唯一入口**：`/open/**` → `OpenGatewayController.gateway`（`OpenGatewayController.java:38-39`），由 `OpenApiFilter` 前置鉴权，是**唯一**绕开登录态的对外入口。
- **管理面**：`/admin/open/{app,api,auth,log,doc}` 五个模块（菜单 ID 2100-2105，见 `sys_menu` 实际数据）；系统管理面 `/system/**`、`/monitor/job/**`。
- **协议缺口**：`/v1/chat/completions`、`/v1/models`、`/v1/embeddings` **全部不存在**（`src/main/java` 全量检索零命中；运行时未登录时返回 Shiro 的 302 兜底，而不是真实路由）。

### 三类接口的实测行为（可作为后续回归的对照）

| 类别 | 样例 | 实测状态 | 响应 |
|---|---|---|---|
| 网关入口（存在） | `GET /open/selftest/httpbin/get`（带签名） | 200 | `{"code":0,"msg":"success","data":{"args":{...}},"traceId":"..."}` |
| 网关入口（不存在） | `GET /open/nope` | 200 | `{"code":40004,"msg":"api path not found: /open/nope"}` |
| 管理面（未登录） | `GET /system/config/list` | 302 → `/login` | — |
| 协议面（不存在） | `GET /v1/models` | 302 → `/login` | 与 `/nosuchpath123` 表现完全相同 |

---

## 五、调用链

### 5.1 网关请求主链（真实可跑通，本境已端到端验证）

```
Client
  │  GET /open/selftest/httpbin/get?demo=1&category=get
  │  X-App-Key / X-Timestamp / X-Nonce / X-Sign
  ▼
OpenApiFilter.doFilterInternal                    com/qvsu/open/filter/OpenApiFilter.java:48
  ├─ 包一层 CachedBodyHttpServletRequest（请求体可重复读）  com/qvsu/open/web/CachedBodyHttpServletRequest.java
  ├─ 生成/透传 traceId → TraceContext + MDC + 响应头 X-Trace-Id   :53-70
  ├─ OpenApiSecurityService.authenticate(request, body)          com/qvsu/open/service/OpenApiSecurityService.java:48
  │    ├─ loadApiInfo(apiPath, method)   查 open_api（先判存在、再判 status）   :261
  │    ├─ 时间戳漂移 > 5min → 40002                                        :87
  │    ├─ loadAppInfo(appKey)            查 open_app（status=1 且未过期）      :239
  │    ├─ checkNonce(appKey, nonce)      进程内 ConcurrentHashMap 去重 → 40005 :210
  │    ├─ hasPermission(appId, apiId)    查 open_app_api → 40004            :324
  │    └─ verifySignature(...)           HMAC-SHA256 → 40003                :121
  ├─ 鉴权失败 → writeError()：HTTP 200 + OpenResult.fail(code,msg)  :148
  └─ 鉴权成功 → 把 OpenAuthContext 放进 request attribute，放行        :81-83
  ▼
OpenGatewayController.gateway                     com/qvsu/open/controller/OpenGatewayController.java:38
  ├─ 取 X-Trace-Id、从 attribute 取 OpenAuthContext（丢失则 40001）     :45-54
  ├─ 读原始 body（byte[]）                                            :61
  ├─ OpenApiProxyService.forward(context, request, body)              :62
  └─ 把结果包成 OpenResult.ok(data)，写 OPEN_RESPONSE_BODY 供日志用     :64-69
  ▼
OpenApiProxyService.forward                       com/qvsu/open/service/OpenApiProxyService.java:30
  ├─ 复制请求头（剔除 host/content-length/x-app-key/x-timestamp/x-nonce/x-sign） :104-114
  ├─ target_url + queryString 拼接                                     :73
  └─ RestTemplate + SimpleClientHttpRequestFactory（超时取 open_api.timeout_ms，默认 5000ms） :41、:116
  ▼
上游 target_url（本境验证时指向 5656 实例的 /selftest/httpbin/get）
  │
  ▼ 反向：上游响应 JSON → OpenResult.ok(data) → 回写 open_call_log
OpenApiFilter finally 块                            :99-126
  └─ OpenApiLogService.save(traceId, ctx, req, resp, reqBody, respCode, respBody, status, errorMsg, cost)
     落地表 open_call_log（含 req_headers/req_body/resp_body/cost_ms/client_ip）
```

真实往返证据（HTTP 200）：

```json
{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"7442b70d-1d86-45ee-ab3b-3f9a9e3fd1e9"}
```

### 5.2 管理面链路

```
浏览器 → Shiro 过滤链（未登录 → 302 /login）
      → Sys*Controller（com.qvsu.web.controller.system）
      → ISys*Service → *Mapper(MyBatis XML) → PostgreSQL
```

### 5.3 调度链路

```
Quartz Scheduler（ScheduleConfig，DB 存储）
  → SysJob（sys_job 表，含 cron/调用目标）
  → JobInvokeUtil 反射调用 HttpTask / QvsuTask
  → 结果写 sys_job_log
```

### 5.4 本境**未验证**的链路

- Shiro 在线会话同步（`SyncOnlineSessionFilter`、`OnlineSessionDAO`）：需要登录态，本境未做登录流程。
- 定时任务实际触发：`sys_job` 有 5 条记录，但本境未等待触发。
- `ApiDocService` 生成 HTML 文档的完整路径：未触发。

---

## 六、数据模型

数据库 `jd_openapi`，**34 张物理表、342 个字段**（`docs/meta-model/database-inventory.md`）。本境实际连库核对，`\dt` 输出 34 张表，与文档一致。

| 分组 | 表数 | 表名 |
|---|---:|---|
| OpenAPI 开放平台业务 | 5 | `open_api`、`open_api_doc`、`open_app`、`open_app_api`、`open_call_log` |
| 系统平台 | 18 | `sys_config`、`sys_dept`、`sys_dict_data`、`sys_dict_type`、`sys_job`、`sys_job_log`、`sys_logininfor`、`sys_menu`、`sys_notice`、`sys_oper_log`、`sys_post`、`sys_role`、`sys_role_dept`、`sys_role_menu`、`sys_user`、`sys_user_online`、`sys_user_post`、`sys_user_role` |
| Quartz 调度存储 | 11 | `QRTZ_*`（11 张） |

### 6.1 后端业务核心 ER（本境实际 `\d` 核对的字段）

```
open_app (s_id PK, app_key UK, app_secret, app_name, contact, status, expire_time, ...)
    │ 1
    │
    │ n
open_app_api (s_id PK, app_id, api_id, UK(app_id, api_id))      ← 授权关系，无外键约束
    │ n
    │
    │ 1
open_api (s_id PK, api_path UK, api_name, method, target_url, timeout_ms, status, need_sign, ...)
    │ 1
    │
    │ n
open_call_log (s_id PK, trace_id, app_key, app_name, api_path, method,
               req_headers, req_body, resp_code, resp_headers, resp_body,
               cost_ms, status, error_msg, client_ip, call_time)
    （按 trace_id/app_key 弱关联，无外键）

open_api_doc (s_id PK, app_id, doc_title, doc_version, api_ids(逗号串), html_content)
```

**关系事实（可核）**：
- 三张表都有 `s_id` 主键 + `s_status`/`s_is_del`/`s_created_time`/`s_updated_time` 四件套（后加的逻辑删除与审计列），与 `create_time`/`update_time` 并存 → **同一语义有两套列**。
- `open_app_api` 有唯一约束 `(app_id, api_id)`，但**没有外键**；权限判定的正确性完全靠应用层。
- 所有 `.sql` 里**没有视图、物化视图、存储过程、触发器**；索引只有内联唯一约束（`docs/meta-model/database-inventory.md` 第 65-72 行）。

---

## 七、页面路由

Thymeleaf 服务端渲染，模板 144 个，其中 `templates/demo/**` 是框架自带的示例页。

| 视图 | 模板 | 入口路径 | 备注 |
|---|---|---|---|
| 登录页 | `templates/login.html` | `GET /login` | 未登录一切跳到这里 |
| 管理首页 | `templates/index.html` / `index-topnav.html` | `GET /index` | 菜单由 `sys_menu` 驱动 |
| 主内容区 | `templates/main.html` | `GET /system/main` | |
| OpenAPI · 应用管理 | `templates/open/app/index.html` | `/admin/open/app` | 菜单 2101 |
| OpenAPI · 接口管理 | `templates/open/api/index.html` | `/admin/open/api` | 菜单 2102 |
| OpenAPI · 授权管理 | `templates/open/auth/index.html` | `/admin/open/auth` | 菜单 2103 |
| OpenAPI · 调用日志 | `templates/open/log/index.html` | `/admin/open/log` | 菜单 2104 |
| OpenAPI · 文档管理 | `templates/open/doc/index.html` | `/admin/open/doc` | 菜单 2105 |
| 错误页 | `templates/error/{404,500,service,unauth}.html` | 容器错误页 | |

**页面路由的真实来源是 `sys_menu` 表**，不是代码：实测 `sys_menu` 共 108 条记录，其中菜单（`menu_type='M'/'C'`）10 条、按钮权限（`'F'`）98 条。本境实测运行时：未登录访问任一页面路径都 302 → `/login`。

---

## 八、外部依赖

| 依赖 | 版本 | 用途 | 风险 |
|---|---|---|---|
| Spring Boot | 2.7.18 | Web/Thymeleaf/AOP/Quartz/Validation | 2.7.x 已停止通用维护 |
| Shiro | 1.13.0 | 认证、授权、会话、记住我 | — |
| Druid | 1.2.27 | 连接池 + 监控页 `/druid/*` | 监控页账号口令写在 yml |
| PageHelper | 1.4.7 | 分页 | — |
| Quartz | 随 Boot | 调度 | — |
| PostgreSQL JDBC | 42.7.5 | 生产驱动 | — |
| fastjson | 1.2.83 | 序列化（`OpenResult`/日志） | 历史漏洞较多，建议第 04 境换成 Jackson |
| POI | 4.1.2 | Excel 导入导出 | — |
| yauaa | 7.32.0 | User-Agent 解析 | — |
| kaptcha | 2.3.3 | 验证码 | — |
| Ehcache | 随 Boot | Shiro 缓存 | 启动时有 diskStore 冲突告警 |

依赖树机器产物：`docs/reverse/scan-output/dependency-tree.txt`。

---

## 九、复用矩阵（摘要）

完整矩阵见 **`docs/reverse/reuse-matrix.md`**（含证据列 `文件:行号` 与生效章节）。摘要：

| 判定 | 含义 | 本工程里的典型对象 |
|---|---|---|
| 直接复用 | 不改就能用 | 框架基座（Shiro 配置、动态数据源、MyBatis 配置、全局异常、分页、XSS、拦截器）、`sys_*` 管理面 |
| 改名复用 | 只换标识与品牌 | 根包/启动类/品牌名/前端资产（第 02 境） |
| 重构复用 | 拆开重塑后复用 | `OpenApiFilter`→鉴权链、`OpenApiProxyService`→Provider 出站层、`OpenResult`→错误契约、`TraceContext`→可观测、`open_*` 表→模型/部署/密钥骨架 |
| 废弃 | 不保留 | `templates/demo/**` 示例页、`main_v1.html`、`index-topnav.html`、`skin.html`、`lock.html`、`SqlUtil`（拼接 SQL） |
| 新增 | 缺口驱动的能力 | `/v1` 兼容层、统一 DTO、可插拔 Pipeline、ProviderAdapter SPI、路由策略、RetryPolicy、熔断、VirtualKey/Project、限流预算、RuntimeConfigSnapshot、Usage/Cost、Playground、Micrometer、K8s 清单 |

**判定纪律**：「废弃」与「新增」同等重要——只列新增不列废弃，等于把重复实现留在仓库里慢慢变成第二套真相。

---

## 十、缺口清单（摘要）

完整清单（按能力域归类 + 建议承接章节）见 **`docs/reverse/gaps-and-risks.md`**。最高优先级三条：

1. **协议入口完全缺失**（`/v1/chat/completions`、`/v1/models`、`/v1/embeddings` 一个都没有）→ 建议第 04 境。这是「这份 Demo 是管理端应用而不是协议网关」的直接证据。
2. **没有模型语义**：`open_api` 只认「路径 → target_url」，不认模型、Provider、部署、Token、成本。要长成 LLM 网关必须先把语义补上 → 建议第 03（本体）+ 06（Provider）+ 08（模型/部署归一）境。
3. **错误语义是「HTTP 200 + 业务码」**：40001/40002/40003/40004/40005/50001/50002 全部用 200 承载。OpenAI SDK 依赖真实 HTTP 状态码（401/403/404/429），这层契约不改，客户端就用不了 → 建议第 04 境。

其余缺口域：凭据与密钥管理、限流与预算、配置持久化与热更新、计量与成本、控制台、可观测、容器化与云原生。（逐条见 `gaps-and-risks.md`）

---

## 十一、风险清单（摘要）

完整清单（按严重度排序 + 触发条件）见 **`docs/reverse/gaps-and-risks.md`**。前三名：

| 严重度 | 风险 | 触发条件 |
|---|---|---|
| 高 | 数据源地址与口令硬编码在 `application-druid.yml`，且默认指向 `localhost:5432` 的既有库 | 换机器/换环境启动 |
| 高 | 本仓库容器化路径不可用：`deploy/local-docker/Dockerfile` 的 `apt-get update` 指向已下线 Debian 源，`docker compose up --build` 直接失败 | 执行 `docker compose up -d --build` |
| 中 | 「HTTP 200 + 业务码」契约与 OpenAI 兼容协议冲突 | 用任意官方 SDK 接入 |

其余风险：跨域未开放、前端品牌与项目名耦合、启动期强依赖数据库导致不可用时无法探活、双 SQL 方言漂移、第三方源码许可待核（素材红线要求「只有文档与复用矩阵进主干」）、敏感字段明文（`app_secret`、Shiro rememberMe `cipherKey` 硬编码）、签名/nonce 状态在进程内存里（多副本部署会失效）、XSS/重复提交拦截器的实际覆盖面未验证。
