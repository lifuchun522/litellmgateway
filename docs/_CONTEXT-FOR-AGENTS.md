# 逆向工程共享上下文（所有并行子任务必读）

本文件由主任务维护，是并行子任务之间共享事实的唯一入口。**只读，不要修改本文件。**

## 0. 任务与产物约定

- 项目：`D:\src\github\litellmgateway`，被逆向的代码在 `open-api/`（从 `open-api.zip` 解压所得，Spring Boot + MyBatis + Shiro）。
- 使用的技能：`reverse-new`（即 codebase-reverse，全量架构与功能基线模式 B0–B9）。
- **输出语言：中文（zh-CN）**。稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键保持源码原文。
- 逆向产物目录：`D:\src\github\litellmgateway\docs\meta-model\`
- 所有产物的结构规范见技能目录：
  `C:\Users\Carter.li\.agents\skills\codebase-reverse\references\output-contract.md`（**必读**）
  `C:\Users\Carter.li\.agents\skills\codebase-reverse\references\workflow.md`
  `C:\Users\Carter.li\.agents\skills\codebase-reverse\references\exhaustive-discovery.md`
- 已验证脚本：`C:\Users\Carter.li\.agents\skills\codebase-reverse\scripts\validate_meta_model.ps1`

## 1. 机器可读提取数据（权威事实源，务必先读）

| 文件 | 内容 |
|---|---|
| `docs/tools/assets.json` | 409 个在范围内的源码文件清单、184 条路由 token、168 个配置键、55 个权限码、86 个 DDL 块、144 条 Mapper 语句 |
| `docs/tools/semantics.json` | 34 张唯一物理表（含 865 个字段）、184 个 Controller 端点（105 个带 `@RequiresPermissions`）、144 个视图模板 |
| `docs/tools/menus.json` | 149 行菜单数据（含 33 个 C 类页面菜单、111 个 F 类按钮权限、5 个 M 类目录） |

读取方式（Windows PowerShell 5.1 下必须用 UTF-8 显式读取，`Get-Content -Raw` 会把 UTF-8 当 ANSI 读坏中文）：

```powershell
$raw = [System.IO.File]::ReadAllText('D:\src\github\litellmgateway\docs\tools\assets.json', [System.Text.Encoding]::UTF8)
$j = $raw | ConvertFrom-Json
```

## 2. 系统事实（已核实）

- **系统标识**：`SYS-qvsu-openapi`，QVSU OpenAPI 管理与网关服务（精简版），版本 `1.0`。
- **架构类型**：单体 Spring Boot 应用（可打 war/jar），服务端渲染 Thymeleaf + 前端 Ajax/jQuery/Bootstrap，SQLite 无；数据库为 **PostgreSQL 11**（同时提供 MySQL 方言脚本）。
- **技术栈**：Spring Boot 2.x、MyBatis + PageHelper、Apache Shiro（认证/授权/在线会话/验证码/CSRF/XSS 过滤器）、Druid 连接池、Quartz 定时任务、Thymeleaf、Logback、Ehcache（Shiro 缓存）。
- **启动类**：`com.qvsu.QvsuApplication`（另有 `QvsuServletInitializer` 支持 war 部署）。
- **服务端口**：`server.port=5656`（注意：不是 8080）；`server.servlet.context-path=/`。
- **数据库连接**：`spring.datasource.druid.master.url` 默认 `jdbc:postgresql://localhost:5432/jd_openapi?currentSchema=public&stringtype=unspecified`，用户 `postgres`。
- **默认账号**：`admin/admin123`（见 `open-api/README.md`）。
- **Docker**：`deploy/local-docker`（openapi-app + postgres:11，`docker compose up -d --build`，访问 `http://localhost/login`）；`deploy/dev-docker`（拉取阿里云镜像）。

### 2.1 顶层包与模块归属（`com.qvsu`）

| 包 | 职责 |
|---|---|
| `com.qvsu.common` | 通用基座：注解、常量、核心基类（`BaseController`/`BaseEntity`/`AjaxResult`）、分页 `TableDataInfo`、枚举、异常体系、工具类、XSS |
| `com.qvsu.framework` | 框架层：Shiro 配置与 Realm、在线会话、过滤器（captcha/csrf/kickout/online/sync）、AOP 日志、数据源、拦截器、管理器 |
| `com.qvsu.system` | 系统管理域：用户/角色/菜单/部门/岗位/字典/参数/通知公告/操作日志/登录日志 |
| `com.qvsu.quartz` | 调度域：定时任务定义、执行日志、Quartz 工具 |
| `com.qvsu.open` | **OpenAPI 业务域**（本项目核心增量）：网关、应用、接口、授权、调用日志、文档、自检 httpbin |
| `com.qvsu.web.controller` | Web 入口：登录/注册/验证码/首页/个人中心/通用上传下载 |
| `com.qvsu.framework.web.exception.GlobalExceptionHandler` | 全局异常处理（带 `@ControllerAdvice`） |

### 2.2 OpenAPI 业务域（核心，来自菜单与 Controller）

菜单目录 `2100 OpenAPI管理` 下 5 个页面：

| 菜单ID | 菜单名 | URL | 权限码 |
|---|---|---|---|
| 2101 | 应用管理 | `/admin/open/app` | `open:app:view` |
| 2102 | 接口管理 | `/admin/open/api` | `open:api:view` |
| 2103 | 授权管理 | `/admin/open/auth` | `open:auth:view` |
| 2104 | 调用日志 | `/admin/open/log` | `open:log:view` |
| 2105 | 文档管理 | `/admin/open/doc` | `open:doc:view` |

核心 Controller（`com.qvsu.open.controller`）：`OpenApiMgrController`(7)、`OpenAppController`(7)、`OpenAuthController`(4)、`OpenDocController`(5)、`OpenGatewayController`、`OpenLogController`(3)、`OpenSelftestHttpbinController`(9)。

`com.qvsu.open` 子包：`controller`、`doc`、`domain`、`filter`、`model`、`service`、`trace`、`web`。其中 `filter`+`trace` 是网关侧的请求拦截与调用链追踪。

### 2.3 系统管理域菜单

`100 用户管理 /system/user`、`101 角色管理 /system/role`、`102 菜单管理 /system/menu`、`103 部门管理 /system/dept`、`104 岗位管理 /system/post`、`105 字典管理 /system/dict`、`106 参数设置 /system/config`、`107 通知公告 /system/notice`。

### 2.4 数据库

- 34 张唯一物理表（DDL 在 3 个方言副本中出现，共 86 个 `CREATE TABLE` 块）：
  - `open_*` 业务表 5 张：`open_app`(14 列)、`open_api`(17)、`open_app_api`(9)、`open_call_log`(22)、`open_api_doc`(12)
  - `sys_*` / `gen_*` 平台表 38 个块（用户、角色、菜单、部门、岗位、字典、参数、通知、操作日志、登录日志、在线用户、用户角色/岗位关联、角色菜单/部门关联等）
  - Quartz 11 张 `QRTZ_*` 表（`QRTZ_JOB_DETAILS`、`QRTZ_TRIGGERS`、`QRTZ_CRON_TRIGGERS` 等）
- SQL 脚本：`open-api/sql/*.sql`（`open_api.sql`、`open_api_compat_upgrade.sql`、`open_api_menu.sql`、`open_api_selftest_seed.sql`、`open_api_httpbin_min_seed.sql`、`open_call_log_headers_upgrade.sql`、`quartz.sql`）以及 `deploy/local-docker/{mysql,postgres}/init/*.sql`。

### 2.5 智能体需要知道的已发现缺陷（写文档时必须如实记录，不要掩盖）

1. `open-api/qvsu-openapi/src/main/resources/application.yml` 的中文注释是**双重编码乱码**（UTF-8 BOM 后跟 GBK 字节被按 Latin-1 再编码），原始 zip 内即是如此。代码类文件（Java/XML/Mapper）的中文正常，说明只有该 YAML 受损。
2. `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文菜单名同样乱码（MySQL 副本正常）。
3. `open-api/README.md` 自身也是乱码（`杞婚噺绾lm缃戝叧` 形式，位于仓库根 `README.md`）。
4. 前端存在大量 RuoYi 自带 `templates/demo/**` 示例页（144 个模板中占多数），属于框架示例而非业务功能，必须作为**范围排除**登记并说明理由。
5. `open-api/code-app-example` 不存在；`open-api` 内的 `deploy/dev-docker` 指向外部阿里云镜像，不可复现构建。

## 3. 校验器硬性规则（不遵守会导致 FAIL）

验证脚本：`validate_meta_model.ps1 -MetaModelPath docs/meta-model -SourcePath open-api`

1. **必存在 25 个文件**（缺一个即 ERROR）：`meta-index.md`、`PROGRESS.md`、`source-asset-inventory.md`、`source-coverage-report.md`、`technical-architecture.md`、`technical-component-index.md`、`business-architecture.md`、`module-index.md`、`functional-inventory.md`、`business-function-requirements.md`、`non-menu-function-index.md`、`function-chain-index.md`、`domain-model.md`、`interface-index.md`、`database-inventory.md`、`database-model.md`、`database-schema.md`、`database-relations.md`、`database-access-matrix.md`、`data-ownership.md`、`common-capability-index.md`、`flow-index.md`、`config-index.md`、`change-hotspots.md`、`consistency-report.md`
2. **主定义位置固定**：`- ID: XXX-*` 只能出现在指定文件里，否则 `definition-in-wrong-file` ERROR：
   - `SYS-*`→`technical-architecture.md`；`MOD-*`/`SVC-*`→`module-index.md`；`DOM-*`/`CAP-*`/`SCN-*`/`MENU-*`/`ENTRY-*`→`business-architecture.md`；`FUNC-*`→`functional-inventory.md`；`OBJ-*`/`RULE-*`→`domain-model.md`；`API-*`/`EVENT-*`/`JOB-*`→`interface-index.md`；`COMP-*`/`TCAP-*`→`technical-component-index.md`；`COMMON-*`/`CAPI-*`→`common-capability-index.md`；`TBL-*`/`STORE-*`/`TOPIC-*`→`database-model.md`；`CFG-*`→`config-index.md`；`Q-*`→`PROGRESS.md`
   - **同一 ID 只能有一处主定义**，否则 `duplicate-definition` ERROR。其他文件只能引用该 ID。
   - 任何出现的 ID 都必须有主定义，否则 `undefined-id` ERROR。**因此不要引用你无法确认会被别人定义出来的 ID。**
3. **Markdown 链接必须有效**：`[文字](路径)` 指向的目标文件必须存在，`#锚点` 必须能在目标文件中找到对应标题；否则 `dead-link` / `dead-anchor` ERROR。跨文件引用请用相对路径 `./xxx.md`。
4. **FUNC 三处必须齐备且一一对应**：`functional-inventory.md`、`business-function-requirements.md`、`function-chain-index.md` 三者的 `## FUNC-xxx` 标题集合必须完全一致。
   - 需求面板每个 FUNC 段落必须含 12 个字段（行首 `- 字段名: 值`）：`Business Goal`、`Actors`、`Trigger Entries`、`Preconditions`、`Main Steps`、`Business Rules`、`Outputs And Results`、`State Changes`、`Failure Outcomes`、`Manual Intervention`、`Permission And Data Scope`、`Implementation Chain`
   - 实现链每个 FUNC 段落必须含 8 个三级标题：`### Requirement Link`、`### Identity And Entry`、`### Implementation Chain`、`### Object Roles`、`### Technical And Common Dependencies`、`### Physical Data Operations`、`### Rules And State`、`### Closure`
   - 标记为 `non-interactive` 或 `hybrid` 的 FUNC 还必须出现在 `non-menu-function-index.md`，且正文含 trigger type 关键词（scheduled/event-consumer/webhook-callback/api-only/batch-file/startup-lifecycle/polling/cdc-data-change/retry-compensation/cli-ops）和 `JOB-`/`EVENT-`/`API-`/`ENTRY-` 引用。
5. **TBL 主定义与字段表分离**：`database-model.md` 每个 `## TBL-xxx` 与 `database-schema.md` 必须一一对应；`database-schema.md` 每节必须含字段表，表头第一列为 `| Physical Column |`（或 `| 物理字段 |`）。
6. **源码资产登记**：`open-api/` 下所有符合扩展名的文件必须出现在 `source-asset-inventory.md` 中；所有 Controller 路由字面量、`@XxlJob/@Scheduled/@KafkaListener/@RabbitListener/@JmsListener` 的触发器名、以及所有 `CREATE TABLE/VIEW` 对象名，都必须作为**独立表格单元格**出现（形如 `| /system/user |`）。这部分由主任务统一生成，子任务**不要**修改 `source-asset-inventory.md`。

## 4. 排版要求

- 全部中文标题与正文；代码/路径/ID 保持原文。
- 表格用标准 Markdown；每张表带表头。
- 不要写“主要”“核心若干”“接口组”这类模糊表述（技能明令禁止）。
- 每条关键结论给出源码路径证据，并标注证据等级：`事实`（直接读源码）/ `推断`（由多处证据推出）/ `假设`（待确认）。
