# 业务架构与菜单入口主定义

本文件是业务域（DOM）、业务能力分组（CAP）、业务场景（SCN）、菜单（MENU）、非菜单入口（ENTRY）五类稳定 ID 的**唯一主定义文件**。其他产物只允许引用这些 ID，不得重复定义；各类 ID 的具体前缀与命名见 §2 至 §6 的主定义标题。

- 系统标识：`SYS-qvsu-openapi`（QVSU OpenAPI 管理与网关服务，精简版）
- 源码根：`open-api/`
- 输出语言：中文（zh-CN）；稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键保持源码原文
- 最后核验：2026-02-14，依据 `open-api/` 源码、`docs/tools/menus.json`、`open-api/sql/*.sql`
- 共享事实源只读引用：`docs/_CONTEXT-FOR-AGENTS.md`（逆向工程共享上下文，仅供并行子任务使用，不属于元模型产物）

## 0. 阅读约定

### 0.1 证据等级

| 等级 | 含义 | 本文件典型判据 |
|---|---|---|
| 事实 | 直接读取源码/DDL/菜单脚本得到 | `@RequestMapping` 字面量、`sys_menu` INSERT 行、Shiro 过滤器链 `put()` 调用 |
| 推断 | 由多处证据交叉推出，未由单一源码行直接声明 | 业务域边界、能力分组归属、场景步骤串接 |
| 假设 | 待确认，已在“存疑与偏差登记”中列出取证动作 | `menus.json` 未收录的 `sql/quartz.sql` 菜单行 |

### 0.2 数据来源与口径

| 数据 | 来源 | 口径 |
|---|---|---|
| 菜单与按钮权限 | `docs/tools/menus.json`（149 行 = M 5 + C 33 + F 111） | 本文件按 `menu_id` 去重后逐条建立菜单主定义 |
| 菜单重复原因 | 同一逻辑菜单在 `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`、`deploy/local-docker/{mysql,postgres}/init/40-open-api-menu.sql`、`open-api/sql/open_api_menu.sql` 多份方言副本中重复出现 | 三份副本的 `menu_id` 集合完全一致，故按 `menu_id` 去重即可得到逻辑菜单全集 |
| 中文口径 | MySQL 副本正确，PostgreSQL 的 `40-open-api-menu.sql` 中文乱码 | 全部中文菜单名以 MySQL 副本为准 |
| 路由/端点 | `open-api/qvsu-openapi/src/main/java/**/*Controller.java` | 逐 `@RequestMapping`/`@GetMapping`/`@PostMapping` 字面量 |
| 模块标识 | `module-index.md`（权威主定义） | 本文件仅以**文本**引用模块标识（开放平台、系统管理、调度、框架、Web、公共基座共 6 个），不自建模块主定义 |

**去重核对（事实）**：`menus.json` 中 `menu_id` 唯一值共 66 个 = C 14 + M 2 + F 50。原始 149 行的构成是 `C 33 = 11 × 3`、`M 5 = 约 2×3`、`F 111`，其中 M/C 行为三份方言副本的同 ID 重复；因此**去重后的页面菜单真值为 14 个 C 类 + 2 个 M 类 = 16 个**，而非行数 33 + 5。本文件按去重真值建节点，理由见 §7.1。

---

## 1. 业务架构总览

系统是**单一 Spring Boot 单体应用**（启动类 `com.qvsu.QvsuApplication`，端口 `5656`，context-path `/`），不存在独立部署的网关进程。业务上划分为 4 个业务域，其中 OpenAPI 域是相对上游框架（RuoYi 派生基座）的**核心增量**，其余 3 域承担支撑与治理职责。

### 1.1 业务域一览

| 业务域 ID | 业务域名称 | 顶层包 | 职责一句话 | 页面菜单数（去重） | 对外入口形态 |
|---|---|---|---|---|---|
| `DOM-open` | OpenAPI 开放平台域 | `com.qvsu.open` | 管理第三方应用、开放接口、授权关系、调用日志与接口文档，并对外提供统一代理网关 | 5 | 管理菜单 + `ENTRY-open-gateway` |
| `DOM-system` | 系统管理域 | `com.qvsu.system` + `com.qvsu.web.controller.system` | 维护用户、角色、菜单、部门、岗位、字典、参数、通知公告等平台主数据 | 8 | 管理菜单 |
| `DOM-quartz` | 调度任务域 | `com.qvsu.quartz` | 定义定时任务、触发 Quartz 执行、留存调度日志 | 1（`MENU-job-manage`） | 管理菜单 + 调度器内部触发 |
| `DOM-common` | 平台公共域 | `com.qvsu.framework` + `com.qvsu.common` + `com.qvsu.web.controller.common` | 认证、会话、授权校验、操作审计、文件上传下载等横切能力 | 0 | 全部为非菜单入口 |

### 1.2 业务域依赖方向

```text
                           +---------------------------------------------+
                           | DOM-common (平台公共域)                     |
                           | 认证 / 会话 / 授权校验 / 审计 / 文件 / 字典 |
                           +---------------------------------------------+
                                                  | 被全部业务域依赖
                 +------------------------------+----------------------------------+
                 |                              |                                  |
                 v                              v                                  v
   +---------------------------+   +-------------------------+   +----------------------------------+
   | DOM-system (系统管理域)   |   | DOM-quartz (调度任务域) |   | DOM-open (开放平台域)            |
   | 用户 / 角色 / 菜单 / 部门 |   | 任务定义 / 执行 / 日志  |   | 应用 / 接口 / 授权 / 日志 / 文档 |
   | 岗位 / 字典 / 参数 / 公告 |   | Cron 触发与调度日志     |   | + 对外网关代理 /open/**          |
   +---------------------------+   +-------------------------+   +----------------------------------+
                 |                              |                                  |
                 +------------------------------+----------------------------------+
                                                 | 全部业务数据最终落库
                                                 v
                                +------------------------------+
                                | 共享物理存储 (PostgreSQL 11) |
                                | sys_ / open_ / QRTZ_ 表      |
                                +------------------------------+
```

依赖规则（推断，依据 §1.3 与各域源码索引）：

| 方向 | 关系 | 证据 |
|---|---|---|
| 平台公共域 → 全部域 | 被依赖。Shiro 过滤器链 `filterChainDefinitionMap.put("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` 覆盖所有请求 | `framework/config/ShiroConfig.java:349` |
| 系统管理域 → 平台公共域 | 单向依赖。用户/角色/菜单/部门主数据被 Shiro `UserRealm` 用于认证与授权判定 | `framework/shiro/realm/UserRealm`、`system/service/impl/SysMenuServiceImpl` |
| 开放平台域 → 系统管理域 | 单向依赖。`/admin/open/**` 管理端受 `@RequiresPermissions` 约束，权限码 `open:*` 由 `sys_menu` 定义、经 `sys_role_menu` 授予角色 | `open/controller/OpenAppController.java`、`sql/open_api_menu.sql:28-62` |
| 开放平台域 → 平台公共域 | 单向依赖。网关侧使用 `IpUtils`、`TraceContext`、通用返回体与全局异常处理 | `open/service/OpenApiLogService.java:3`、`common/core/domain/AjaxResult` |
| 调度任务域 → 平台公共域 | 单向依赖。调度日志与操作审计共用异步管理器与 Shiro 会话 | `framework/manager/AsyncManager`、`quartz/controller/SysJobController.java:44` |
| 开放平台域 ↔ 调度任务域 | **无直接依赖**（事实）。`com.qvsu.open` 不引用 `com.qvsu.quartz`，反之亦然 | 两包 import 清单无交叉 |

### 1.3 业务域与源码落点

业务域到构建模块的归属为**文本交叉引用**：模块的权威主定义在 `module-index.md`，本文件只引用其标识，不复述模块边界。

| 业务域 ID | 业务域名称 | 对应模块标识 | 模块与顶层包的对应关系 |
|---|---|---|---|
| `DOM-system` | 系统管理域 | `MOD-system`、`MOD-web` | `MOD-system` = `com.qvsu.system`（domain/mapper/service）；`MOD-web` = `com.qvsu.web.controller.system` 的 8 个 system 页面控制器 |
| `DOM-open` | OpenAPI 开放平台域 | `MOD-open` | `com.qvsu.open` 全包（controller/doc/domain/filter/model/service/trace/web） |
| `DOM-quartz` | 调度任务域 | `MOD-quartz`、`MOD-web` | `MOD-quartz` = `com.qvsu.quartz`；页面模板归属 `MOD-web` |
| `DOM-common` | 平台公共域 | `MOD-framework`、`MOD-common`、`MOD-web` | `MOD-framework` = `com.qvsu.framework`；`MOD-common` = `com.qvsu.common`；登录/通用控制器归属 `MOD-web` |

模块共用的基座关系（推断）：`MOD-framework` 与 `MOD-common` 被 `MOD-system`、`MOD-open`、`MOD-quartz` 三个业务模块共同依赖；`MOD-web` 是全部页面与通用控制器的承载模块，位于三个业务模块之上。

| 业务域 ID | Controller | Service | Domain | 关键物理表 |
|---|---|---|---|---|
| `DOM-open` | `open/controller/OpenAppController`、`OpenApiMgrController`、`OpenAuthController`、`OpenLogController`、`OpenDocController`、`OpenGatewayController`、`OpenSelftestHttpbinController` | `open/service/OpenManageService`、`OpenApiSecurityService`、`OpenApiProxyService`、`OpenApiLogService`、`open/doc/ApiDocService` | `open/domain/OpenApp`、`OpenApi`、`OpenAppApi`、`OpenCallLog`、`OpenApiDoc` | `open_app`、`open_api`、`open_app_api`、`open_call_log`、`open_api_doc` |
| `DOM-system` | `web/controller/system/SysUserController`、`SysRoleController`、`SysMenuController`、`SysDeptController`、`SysPostController`、`SysDictTypeController`、`SysDictDataController`、`SysConfigController`、`SysNoticeController` | `system/service/impl/*ServiceImpl` | `system/domain/SysUser`、`SysRole`、`SysMenu`、`SysDept`、`SysPost`、`SysDictType`、`SysDictData`、`SysConfig`、`SysNotice` | `sys_user`、`sys_role`、`sys_menu`、`sys_dept`、`sys_post`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys_notice` |
| `DOM-quartz` | `quartz/controller/SysJobController`、`SysJobLogController` | `quartz/service/impl/SysJobServiceImpl`、`SysJobLogServiceImpl` | `quartz/domain/SysJob`、`SysJobLog` | `sys_job`、`sys_job_log`、11 张 `QRTZ_*` 表 |
| `DOM-common` | `web/controller/system/SysLoginController`、`SysCaptchaController`、`SysRegisterController`、`SysIndexController`、`SysProfileController`、`web/controller/common/CommonController` | `framework/shiro/service/SysLoginService`、`SysPasswordService`、`SysRegisterService`、`framework/shiro/realm/UserRealm` | `system/domain/SysOperLog`、`SysLogininfor`、`SysUserOnline` | `sys_oper_log`、`sys_logininfor`、`sys_user_online` |

---

## 2. 业务域定义

## DOM-open - OpenAPI 开放平台域

- ID: DOM-open
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/qvsu-openapi/src/main/java/com/qvsu/open/**`、`open-api/sql/open_api_menu.sql`
- 业务说明: 面向第三方接入方的开放平台管理域，同时承担对外统一代理网关职责。管理侧提供应用、接口、授权、调用日志、接口文档五类维护；运行侧以 `/open/**` 统一入口完成鉴权、参数校验、请求转发与调用留痕。
- 边界:
  - 开始于: 管理员在 `/admin/open/**` 建立应用与接口并建立授权关系；或第三方调用方携带认证头请求 `/open/**`。
  - 结束于: 管理数据落库 `open_*` 表；或网关返回被代理目标系统的响应体并写入 `open_call_log`。
  - 不包含: 被代理目标系统自身的业务逻辑；Shiro 后台会话认证（属 `DOM-common`）；用户/角色/权限主数据维护（属 `DOM-system`）。
- 所含能力: CAP-open-app、CAP-open-api、CAP-open-auth、CAP-open-log、CAP-open-doc、CAP-open-gateway-auth、CAP-open-gateway-proxy
- 对应模块: `MOD-open`（顶层包 `com.qvsu.open`，子包 `controller`、`doc`、`domain`、`filter`、`model`、`service`、`trace`、`web`）
- 对应菜单: MENU-open-root、MENU-open-app、MENU-open-api、MENU-open-auth、MENU-open-log、MENU-open-doc
- 对应入口: ENTRY-open-gateway、ENTRY-open-selftest
- 权限前缀: `open:app:*`、`open:api:*`、`open:auth:*`、`open:log:*`、`open:doc:*`（均定义在 `sys_menu`，见下文各 OpenAPI 菜单节点）
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/open`
  - symbol: `com.qvsu.open`
  - route/topic/job/config/table: `/admin/open/app`、`/admin/open/api`、`/admin/open/auth`、`/admin/open/log`、`/admin/open/doc`、`/open/**`、`/selftest/httpbin/**`
  - grep keywords: `open:app:view`、`open:api:view`、`open:auth:save`、`open:log:list`、`open:doc:generate`、`OpenApiFilter`、`OpenApiSecurityService`

## DOM-system - 系统管理域

- ID: DOM-system
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/**`、`deploy/local-docker/mysql/init/10-qvsu.sql`
- 业务说明: 平台主数据与权限治理域。维护用户与组织结构（用户、部门、岗位）、权限模型（角色、菜单）、平台参数（字典、参数设置）与信息发布（通知公告）。该域产出的用户/角色/菜单/授权数据是 `DOM-common` 认证授权判定的唯一依据。
- 边界:
  - 开始于: 具备 `system:*` 权限的管理员进入对应菜单页面或调用配套端点。
  - 结束于: 主数据落库 `sys_*` 表并刷新 Shiro 授权缓存。
  - 不包含: 在线会话踢出与登录认证流程（属 `DOM-common`）；操作日志写入（由切面自动完成，属 `DOM-common`）。
- 所含能力: CAP-sys-user-org、CAP-sys-perm-menu、CAP-sys-dict-config、CAP-sys-notice
- 对应模块: `MOD-system`（顶层包 `com.qvsu.system`，domain/mapper/service）+ `MOD-web`（`com.qvsu.web.controller.system` 中的 8 个 `system` 页面控制器）
- 对应菜单: MENU-sys-user、MENU-sys-role、MENU-sys-menu、MENU-sys-dept、MENU-sys-post、MENU-sys-dict、MENU-sys-config、MENU-sys-notice
- 权限前缀: `system:user:*`、`system:role:*`、`system:menu:*`、`system:dept:*`、`system:post:*`、`system:dict:*`、`system:config:*`、`system:notice:*`
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system`、`open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system`
  - symbol: `com.qvsu.system`、`com.qvsu.web.controller.system`
  - route/topic/job/config/table: `/system/user`、`/system/role`、`/system/menu`、`/system/dept`、`/system/post`、`/system/dict`、`/system/config`、`/system/notice`
  - grep keywords: `RequiresPermissions("system:`、`SysUserController`、`SysRoleController`

## DOM-quartz - 调度任务域

- ID: DOM-quartz
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/**`、`open-api/sql/quartz.sql`
- 业务说明: 平台级定时任务域。定义定时任务（任务名、任务组、调用目标、Cron 表达式、并发与错过策略），由 Quartz 调度器按 Cron 触发执行，并以 `sys_job_log` 留存每次执行的调度日志，同时以 11 张 `QRTZ_*` 表维护调度器持久化状态。
- 边界:
  - 开始于: 管理员维护任务定义并置为正常状态，或 Quartz 调度器到达 Cron 触发时刻。
  - 结束于: 调用目标执行完成（成功或异常），调度结果写入 `sys_job_log`。
  - 不包含: 被调用 Bean 内部的业务逻辑本身；任务定义之外的其他自动化入口。
- 所含能力: CAP-job-definition、CAP-job-execution、CAP-job-log
- 对应模块: `MOD-quartz`（顶层包 `com.qvsu.quartz`，子包 `controller`、`domain`、`mapper`、`service`、`task`、`util`）
- 对应模块补充: Web 模板与静态资源归属 `MOD-web`；数据源与异步执行器等基座归属 `MOD-framework`
- 对应菜单: MENU-job-manage
- 权限前缀: `monitor:job:*`
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz`
  - symbol: `com.qvsu.quartz.controller.SysJobController`、`com.qvsu.quartz.controller.SysJobLogController`
  - route/topic/job/config/table: `/monitor/job`、`/monitor/jobLog`、`sys_job`、`sys_job_log`、`QRTZ_*`
  - grep keywords: `monitor:job:view`、`monitor:job:changeStatus`、`ScheduleUtils`、`CronUtils`

## DOM-common - 平台公共域

- ID: DOM-common
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/**`、`com/qvsu/common/**`、`com/qvsu/web/controller/{common,system}` 登录相关类
- 业务说明: 承载所有业务域共用的横切能力：认证（登录/退出/注册/验证码）、会话与在线用户、授权校验（Shiro Realm + 过滤器链）、操作审计（切面异步写操作日志与登录日志）、文件上传下载与统一异常处理。该域不提供业务菜单，全部以非菜单入口暴露。
- 边界:
  - 开始于: HTTP 请求进入容器（含静态资源）之后由 Shiro 过滤器链拦截，或到达 `/login`、`/captcha/captchaImage`、`/common/**` 等独立入口。
  - 结束于: 会话建立/销毁、授权判定返回、异步审计记录落库、上传下载字节流返回。
  - 不包含: 用户/角色/菜单主数据的维护动作（属 `DOM-system`）；开放平台业务鉴权（`appKey`/`sign`，属 `DOM-open`）。
- 所含能力: CAP-auth-session、CAP-operation-audit、CAP-file-transfer、CAP-exception-handling
- 对应模块: `MOD-framework`（`com.qvsu.framework`：Shiro 配置与 Realm、过滤器、AOP 切面、异步管理器、数据源）、`MOD-common`（`com.qvsu.common`：基类、工具、常量、枚举、异常、XSS）、`MOD-web`（`com.qvsu.web.controller.system` 中的登录/验证码/注册/首页/个人中心类与 `com.qvsu.web.controller.common`）
- 对应菜单: 无（该域全部为非菜单入口）
- 权限前缀: 无独立权限码；登录后经 `user` 过滤器要求已认证会话，未授权跳转 `/unauth`
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework`、`open-api/qvsu-openapi/src/main/java/com/qvsu/common`
  - symbol: `com.qvsu.framework.config.ShiroConfig`、`com.qvsu.framework.shiro.service.SysLoginService`、`com.qvsu.framework.aspectj.LogAspect`、`com.qvsu.framework.web.exception.GlobalExceptionHandler`
  - route/topic/job/config/table: `/login`、`/logout`、`/register`、`/unauth`、`/index`、`/captcha/captchaImage`、`/common/upload`、`/common/download`、`/profile/**`
  - grep keywords: `filterChainDefinitionMap`、`captchaValidate`、`kickout`、`onlineSession`、`csrfValidateFilter`、`recordLogininfor`

---

## 3. 业务能力定义

能力分组仅用于导航与归类，**不替代具体业务功能**。具体功能点由 `functional-inventory.md` 逐个建立，本文件不复述其边界。

## CAP-open-app - 应用管理能力

- ID: CAP-open-app
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 管理接入开放平台的第三方应用身份，包括应用标识 `app_key`、密钥 `app_secret`、有效期与启用状态，并提供密钥重置。
- 承载菜单: MENU-open-app
- 源码索引: `open/controller/OpenAppController.java`、`open/domain/OpenApp.java`
- 待归属功能（导航，不在本文件定义 ID）: 应用列表查询与条件过滤；应用新增；应用修改；应用删除；应用密钥重置（`POST /admin/open/app/resetSecret`）
- 相关场景: SCN-open-onboarding、SCN-open-admin-maintain

## CAP-open-api - 接口管理能力

- ID: CAP-open-api
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 管理对外开放的接口资产，包括对外暴露路径 `api_path`、请求方法 `method`、后端目标地址 `target_url`、超时 `timeout_ms`、是否需要签名 `need_sign` 与启用状态，并提供调用示例（cURL）生成。
- 承载菜单: MENU-open-api
- 源码索引: `open/controller/OpenApiMgrController.java`、`open/domain/OpenApi.java`
- 待归属功能（导航）: 接口列表查询；接口新增；接口修改；接口删除；cURL 调用示例生成（`GET /admin/open/api/curl/{id}`）
- 相关场景: SCN-open-onboarding、SCN-open-admin-maintain

## CAP-open-auth - 授权管理能力

- ID: CAP-open-auth
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 维护「应用 ↔ 接口」的多对多授权关系，落库 `open_app_api`；该关系是网关运行期判定应用能否访问某接口的唯一依据。
- 承载菜单: MENU-open-auth
- 源码索引: `open/controller/OpenAuthController.java`、`open/domain/OpenAppApi.java`、`open/service/OpenApiSecurityService.java:324-332`
- 待归属功能（导航）: 授权页面初始化（应用列表、接口列表、已授权接口回显）；授权关系保存（覆盖式 `POST /admin/open/auth/save`）
- 相关场景: SCN-open-onboarding、SCN-open-admin-maintain、SCN-open-gateway-call

## CAP-open-log - 调用日志能力

- ID: CAP-open-log
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 留存并查询开放接口的调用流水，记录 `trace_id`、应用标识、请求路径与方法、请求/响应报文、耗时、状态与客户端 IP，并提供统计与 CSV 导出。
- 承载菜单: MENU-open-log
- 源码索引: `open/controller/OpenLogController.java`、`open/service/OpenApiLogService.java`、`open/domain/OpenCallLog.java`
- 待归属功能（导航）: 调用日志分页查询；调用统计（`GET /admin/open/log/stats`）；CSV 导出（`GET /admin/open/log/exportCsv`）；调用日志写入（由网关过滤器在 `finally` 中触发，非交互）
- 相关场景: SCN-open-call-log、SCN-open-gateway-call

## CAP-open-doc - 文档管理能力

- ID: CAP-open-doc
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 基于接口定义生成 HTML 形式接口文档，支持按应用批量选择接口生成、在线预览单接口文档、生成结果落库 `open_api_doc` 并下载。
- 承载菜单: MENU-open-doc
- 源码索引: `open/controller/OpenDocController.java`、`open/doc/ApiDocService.java`、`open/domain/OpenApiDoc.java`
- 待归属功能（导航）: 接口清单加载（`GET /admin/open/doc/apis`）；单接口文档 HTML 渲染（`GET /admin/open/doc/html/{apiId}`）；文档生成并保存（`POST /admin/open/doc/generate`）；文档列表查询（`GET /admin/open/doc/list`）；文档下载（`GET /admin/open/doc/download`）
- 相关场景: SCN-open-doc

## CAP-open-gateway-auth - 网关鉴权能力

- ID: CAP-open-gateway-auth
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 对外部调用请求执行身份与完整性校验：解析 `api_path` 与 `method` 定位接口定义、校验接口启用状态、校验 `X-App-Key`/`X-Timestamp`/`X-Nonce`/`X-Sign` 四要素、校验时间戳漂移、校验 Nonce 一次性、校验应用对接口的授权关系、以 HmacSHA256 重算并比对签名，产出 `OpenAuthContext` 供转发使用。
- 承载菜单: 无（运行期能力，入口为 ENTRY-open-gateway）
- 源码索引: `open/filter/OpenApiFilter.java`、`open/service/OpenApiSecurityService.java`、`open/model/OpenAuthContext.java`
- 待归属功能（导航）: 请求鉴权与上下文构建；签名一致性校验；Nonce 防重放；接口/应用启用状态校验
- 相关场景: SCN-open-gateway-call
- 能力缺口（事实）: **代码中不存在限流实现**。全仓检索 `rateLimit`/`限流`/`qps`/`Semaphore`/`Bucket` 在 `com.qvsu.open` 内零命中；`OpenApiSecurityService` 仅以 `NONCE_CACHE.size() > 100000` 触发过期清理（`OpenApiSecurityService.java:212-216`），该阈值是缓存容量保护而非流量控制。

## CAP-open-gateway-proxy - 网关代理转发能力

- ID: CAP-open-gateway-proxy
- 所属业务域: DOM-open
- 结论级别: 事实
- 业务说明: 依据鉴权上下文中的 `target_url` 与 `timeout_ms`，使用 `RestTemplate` + `SimpleClientHttpRequestFactory` 将请求转发至后端目标系统，回填统一响应体 `OpenResult` 与响应头，并统一处理超时与转发异常。
- 承载菜单: 无（入口为 ENTRY-open-gateway）
- 源码索引: `open/controller/OpenGatewayController.java`、`open/service/OpenApiProxyService.java`、`open/model/OpenResult.java`、`open/web/CachedBodyHttpServletRequest.java`
- 待归属功能（导航）: 请求体缓存与可重复读取；目标地址转发与超时控制；响应体 JSON 归一化与 `X-Trace-Id` 回填；转发异常错误码映射
- 相关场景: SCN-open-gateway-call

## CAP-sys-user-org - 用户与组织能力

- ID: CAP-sys-user-org
- 所属业务域: DOM-system
- 结论级别: 事实
- 业务说明: 维护平台用户账号（登录名、手机、邮箱、状态、密码）、部门树与岗位，并提供用户导入导出、密码重置、角色分配与用户-岗位关联。
- 承载菜单: MENU-sys-user、MENU-sys-dept、MENU-sys-post
- 源码索引: `web/controller/system/SysUserController.java`、`SysDeptController.java`、`SysPostController.java`
- 相关场景: SCN-sys-login-authz、SCN-sys-admin-maintain

## CAP-sys-perm-menu - 权限与菜单能力

- ID: CAP-sys-perm-menu
- 所属业务域: DOM-system
- 结论级别: 事实
- 业务说明: 维护角色、菜单（目录/页面/按钮三级）、角色-菜单授权关系与角色数据范围，构成 Shiro 授权判定的数据基础。
- 承载菜单: MENU-sys-role、MENU-sys-menu
- 源码索引: `web/controller/system/SysRoleController.java`、`SysMenuController.java`、`framework/shiro/realm/UserRealm`
- 相关场景: SCN-sys-login-authz、SCN-sys-admin-maintain

## CAP-sys-dict-config - 字典与参数能力

- ID: CAP-sys-dict-config
- 所属业务域: DOM-system
- 结论级别: 事实
- 业务说明: 维护字典类型与字典数据（含 `sys_job_status`、`sys_job_group` 等调度域字典）、平台参数键值（如 `sys.index.skinName`、`sys.index.menuStyle`），并提供缓存刷新。
- 承载菜单: MENU-sys-dict、MENU-sys-config
- 源码索引: `web/controller/system/SysDictTypeController.java`、`SysDictDataController.java`、`SysConfigController.java`
- 相关场景: SCN-sys-admin-maintain

## CAP-sys-notice - 通知公告能力

- ID: CAP-sys-notice
- 所属业务域: DOM-system
- 结论级别: 事实
- 业务说明: 发布与维护通知公告，供首页工作台展示。
- 承载菜单: MENU-sys-notice
- 源码索引: `web/controller/system/SysNoticeController.java`
- 相关场景: SCN-sys-admin-maintain

## CAP-job-definition - 定时任务定义能力

- ID: CAP-job-definition
- 所属业务域: DOM-quartz
- 结论级别: 事实
- 业务说明: 定义与维护定时任务：任务名称、任务分组、调用目标 `invoke_target`、Cron 表达式、错过执行策略、是否并发、启用状态，并提供 Cron 表达式校验与预览。
- 承载菜单: MENU-job-manage
- 源码索引: `quartz/controller/SysJobController.java`、`quartz/domain/SysJob`
- 相关场景: SCN-job-schedule

## CAP-job-execution - 定时任务执行能力

- ID: CAP-job-execution
- 所属业务域: DOM-quartz
- 结论级别: 事实
- 业务说明: 由 Quartz 调度器按 Cron 触发任务，向目标 Bean 发起调用；支持管理员手动「执行一次」与状态启停（正常/暂停）。
- 承载菜单: MENU-job-manage
- 源码索引: `quartz/controller/SysJobController.java:95-118`、`quartz/util/ScheduleUtils`、`quartz/util/QuartzJobExecution`
- 相关场景: SCN-job-schedule

## CAP-job-log - 调度日志能力

- ID: CAP-job-log
- 所属业务域: DOM-quartz
- 结论级别: 事实
- 业务说明: 留存并查询每次任务执行的调度日志（任务名、任务组、调用目标、执行信息、状态、异常信息、耗时），支持详情查看、导出与清理。
- 承载菜单: MENU-job-manage（同一页面内的日志视图）/ `SysJobLogController` 独立路由
- 源码索引: `quartz/controller/SysJobLogController.java`、`quartz/domain/SysJobLog`
- 相关场景: SCN-job-schedule

## CAP-auth-session - 认证与会话能力

- ID: CAP-auth-session
- 所属业务域: DOM-common
- 结论级别: 事实
- 业务说明: 提供登录认证（含验证码校验、密码重试上限、账号状态校验）、注册、退出、验证码生成、会话有效期与在线用户同步、并发/踢出控制，并把 Shiro 过滤器链应用到全部请求。
- 承载菜单: 无（入口为 ENTRY-shiro-filter-chain、ENTRY-login、ENTRY-logout、ENTRY-register、ENTRY-captcha-image）
- 源码索引: `framework/config/ShiroConfig.java:306-349`、`framework/shiro/service/SysLoginService.java`、`SysPasswordService.java`、`framework/shiro/web/filter/**`
- 相关场景: SCN-sys-login-authz、SCN-sys-audit

## CAP-operation-audit - 操作审计能力

- ID: CAP-operation-audit
- 所属业务域: DOM-common
- 结论级别: 事实
- 业务说明: 通过 AOP 切面拦截带 `@Log` 注解的控制器方法，异步写入操作日志 `sys_oper_log`；同时异步写入登录/退出/注册等登录日志 `sys_logininfor`。
- 承载菜单: 无
- 源码索引: `framework/aspectj/LogAspect.java:93`、`framework/manager/factory/AsyncFactory.java:69-78`、`system/service/impl/SysOperLogServiceImpl.java`、`SysLogininforServiceImpl.java`
- 相关场景: SCN-sys-audit
- 能力缺口（事实）: 审计数据**只写不读**。`ISysOperLogService` 仅声明 `insertOperlog`，`SysOperLogMapper` 仅声明 `insertOperlog`；仓库内不存在 `SysOperLogController`、`SysLogininforController`、`SysUserOnlineController`。相应地 `open_api_menu.sql:82-90` 显式删除了 `/monitor/operlog`、`/monitor/logininfor`、`/monitor/online` 等菜单与按钮权限。故操作审计当前**无查询界面、无查询端点**，只能经数据库直查。

## CAP-file-transfer - 文件上传下载能力

- ID: CAP-file-transfer
- 所属业务域: DOM-common
- 结论级别: 事实
- 业务说明: 提供通用单文件/多文件上传、按文件名或资源路径下载，并将上传目录映射为静态资源前缀 `/profile`。
- 承载菜单: 无（入口为 ENTRY-common-file、ENTRY-static-resource）
- 源码索引: `web/controller/common/CommonController.java:30-140`、`framework/config/ResourcesConfig.java:52-55`、`common/constant/Constants.java:95`
- 相关场景: SCN-sys-admin-maintain、SCN-open-doc

## CAP-exception-handling - 统一异常处理能力

- ID: CAP-exception-handling
- 所属业务域: DOM-common
- 结论级别: 事实
- 业务说明: 以 `@ControllerAdvice` 全局拦截未处理异常，统一转换为 `AjaxResult` 或错误视图；开放平台网关另有独立的 `OpenProxyException`/`OpenApiSecurityException` 错误码映射路径。
- 承载菜单: 无
- 源码索引: `framework/web/exception/GlobalExceptionHandler.java`、`open/service/OpenApiProxyService.java:136-150`、`open/service/OpenApiSecurityService.java:389-403`
- 相关场景: SCN-sys-login-authz、SCN-open-gateway-call

---

## 4. 业务场景定义

## SCN-open-onboarding - 第三方应用接入开放平台

- ID: SCN-open-onboarding
- 所属业务域: DOM-open
- 涉及能力: CAP-open-app、CAP-open-api、CAP-open-auth
- 结论级别: 推断（各步骤均为事实，端到端串联为推断）
- 最后核验: 2026-02-14，依据 `OpenAppController.java`、`OpenApiMgrController.java`、`OpenAuthController.java`
- 触发方式: 管理员登录后台后经管理菜单触发
- 参与角色: 平台管理员（具备 `open:app:*`、`open:api:*`、`open:auth:*` 权限）、第三方接入方（应用负责人）
- 前置条件: 管理员账号已登录且持有对应 `open:*` 权限；接口对应的后端目标系统 `target_url` 已就绪
- 主流程:
  1. 管理员在「应用管理」（MENU-open-app）新增应用，登记应用名称、`app_key`、`app_secret`、有效期，系统落库 `open_app`。
  2. 管理员在「接口管理」（MENU-open-api）登记开放接口，填写对外路径 `api_path`、`method`、目标地址 `target_url`、超时 `timeout_ms`、是否签名 `need_sign`，系统落库 `open_api`。
  3. 管理员在「授权管理」（MENU-open-auth）选择应用与接口，保存授权关系，系统落库 `open_app_api`（覆盖式保存）。
  4. 管理员将 `app_key`/`app_secret` 交付第三方接入方，并可经 `GET /admin/open/api/curl/{id}` 生成调用示例。
  5. 第三方接入方按协议组装认证头与签名，调用 `/open/{api_path}` 完成首次联调。
- 业务结果: `open_app`、`open_api`、`open_app_api` 三表形成一致的「应用—接口—授权」闭环，第三方获得可用凭据
- 状态变化: 应用与接口 `status` 由初始值变为启用；授权关系新增
- 边界与不包含: 不包含第三方系统自身接口开发；不包含网关运行期鉴权（见 SCN-open-gateway-call）
- 失败分支: 缺少 `open:app:add` 等权限时被 Shiro 拒绝并跳转 `ENTRY-unauth`；`app_key` 或 `api_path` 重复时由唯一性校验端点返回冲突
- 相关功能入口: MENU-open-app、MENU-open-api、MENU-open-auth

## SCN-open-gateway-call - 开放接口调用鉴权与限流

- ID: SCN-open-gateway-call
- 所属业务域: DOM-open
- 涉及能力: CAP-open-gateway-auth、CAP-open-gateway-proxy、CAP-open-auth、CAP-open-log
- 结论级别: 混合：鉴权与转发链路为事实；场景标题中的「限流」为**假设且当前未实现**（见能力缺口）
- 最后核验: 2026-02-14，依据 `OpenApiFilter.java`、`OpenApiSecurityService.java`、`OpenApiProxyService.java`
- 触发方式: 第三方系统发起 HTTP 请求 `POST/GET /open/{api_path}`
- 参与角色: 第三方应用（携带 `X-App-Key`/`X-Timestamp`/`X-Nonce`/`X-Sign`）、网关、后端目标系统
- 前置条件: 接口定义 `status=1`；应用 `status=1` 且未过期；`open_app_api` 中存在该应用与该接口的授权记录
- 主流程:
  1. `OpenApiFilter` 拦截 `/open/` 前缀请求，以 `CachedBodyHttpServletRequest` 缓存请求体，生成或沿用 `X-Trace-Id`，写入 `TraceContext` 与 MDC。
  2. `OpenApiSecurityService.authenticate` 按 `api_path` + `method` 查询 `open_api`；查询不到或 `status != 1` 抛 `40004`；非 POST 请求可回退匹配 `method='POST'` 的同路径定义。
  3. 若 `need_sign=0`，跳过签名直接构造匿名上下文（`appName=anonymous`）。
  4. 若 `need_sign=1`，校验四要素非空（缺失抛 `40001`），校验时间戳漂移不超过 5 分钟（超限抛 `40002`）。
  5. 按 `app_key` 查询 `open_app`（要求 `status=1` 且未过期，否则抛 `40001`）。
  6. 校验 Nonce 一次性：以 `appKey:nonce` 为键写入 `NONCE_CACHE`，命中未过期键抛 `40005`。
  7. 查询 `open_app_api` 校验授权关系，无授权抛 `40004`。
  8. 以 `appKey`、`timestamp`、`nonce` 及业务参数按字典序拼接后追加 `appSecret`，用 HmacSHA256 重算签名并与 `X-Sign` 比对（不一致抛 `40003`）。
  9. 鉴权通过后 `OpenGatewayController.gateway` 读取 `OPEN_AUTH_CONTEXT`，经 `OpenApiProxyService.forward` 转发至 `target_url`，按 `timeout_ms` 设置连接与读取超时。
  10. 响应体归一化为 `OpenResult` 并回填 `X-Trace-Id` 返回调用方。
  11. `finally` 块调用 `OpenApiLogService.save` 写入 `open_call_log`。
- 业务结果: 调用方获得统一格式的 JSON 响应；`open_call_log` 新增一条调用流水
- 状态变化: `NONCE_CACHE` 新增防重放条目；`open_call_log` 新增记录；无业务主数据状态变更
- 失败分支与错误码: `40001` 认证头缺失/appKey 无效；`40002` 时间戳过期或格式非法；`40003` 签名校验失败；`40004` 接口未找到/禁用/无授权；`40005` Nonce 重复；`50001` 系统或转发异常。所有错误响应均以 HTTP 200 返回并在体内携带业务错误码（`OpenApiFilter.writeError`）
- 限流说明（事实）: 本场景**不具备限流/配额能力**。系统未实现 QPS、并发数、日调用量或应用级配额限制；`NONCE_CACHE.size() > 100000` 仅触发过期条目清理。若需限流，属新增需求而非既有能力。
- 相关功能入口: ENTRY-open-gateway、MENU-open-auth、MENU-open-log

## SCN-open-call-log - 调用日志记录与查询

- ID: SCN-open-call-log
- 所属业务域: DOM-open
- 涉及能力: CAP-open-log、CAP-open-gateway-auth
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `OpenApiFilter.java:99-126`、`OpenApiLogService.java`、`OpenLogController.java`
- 触发方式: 混合——写入由网关请求被动触发（非交互），查询由管理员经菜单触发
- 参与角色: 网关（写入方）、平台管理员（查询方）
- 前置条件: 存在一次 `/open/**` 调用；查询方持有 `open:log:view` 与 `open:log:list` 权限
- 主流程:
  1. 每次 `/open/**` 请求在 `OpenApiFilter` 的 `finally` 块无条件触发日志写入，覆盖鉴权失败、业务失败与转发异常三类结果。
  2. 记录内容：`trace_id`、`app_key`、`app_name`、`api_path`、`method`、请求体、响应码、响应体、`cost_ms`、`status`（0 成功/1 鉴权失败/2 系统异常）、`error_msg`、`client_ip`、`call_time`。
  3. 请求体、响应体与错误信息均按 `TEXT_MAX_LENGTH=4000` 截断后落库；写入异常仅记 error 日志，不向上抛出，不阻断主流程。
  4. 管理员在「调用日志」（MENU-open-log）按条件分页查询 `open_call_log`。
  5. 管理员查看统计视图（`GET /admin/open/log/stats`）或导出 CSV（`GET /admin/open/log/exportCsv`）。
- 业务结果: 调用流水可追溯；`trace_id` 与日志系统中的 `MDC.traceId` 一致，可与应用日志串联
- 状态变化: `open_call_log` 新增记录
- 失败分支: 日志写入失败被吞掉并仅记录 error 日志（`OpenApiLogService.java:51-54`），此时调用仍成功但审计缺失——这是已知的可观测性风险
- 相关功能入口: MENU-open-log、ENTRY-open-gateway

## SCN-open-doc - 开放接口文档生成与发布

- ID: SCN-open-doc
- 所属业务域: DOM-open
- 涉及能力: CAP-open-doc、CAP-open-api、CAP-open-app
- 结论级别: 推断（各端点与落库为事实，端到端串联为推断）
- 最后核验: 2026-02-14，依据 `OpenDocController.java`、`ApiDocService.java`、`OpenApiDoc.java`
- 触发方式: 管理员经菜单触发
- 参与角色: 平台管理员、第三方接入方（文档消费者）
- 前置条件: 至少存在 1 个 `open_api` 接口定义；管理员持有 `open:doc:view` 与 `open:doc:generate` 权限
- 主流程:
  1. 管理员在「文档管理」（MENU-open-doc）加载接口清单（`GET /admin/open/doc/apis`）。
  2. 管理员选择应用、勾选若干接口、填写文档标题与版本号。
  3. 提交 `POST /admin/open/doc/generate`，`ApiDocService` 依据接口定义与请求上下文推导的 baseUrl 生成 HTML 文档。
  4. 生成的 HTML 落库 `open_api_doc`（含 `doc_title`、`doc_version`、`api_ids`、`html_content`）。
  5. 管理员可在线预览单接口文档（`GET /admin/open/doc/html/{apiId}`）或下载整体文档（`GET /admin/open/doc/download`，文件名形如 `api-doc-{日期}.html`）。
- 业务结果: 形成可交付第三方的 HTML 接口文档，并在 `open_api_doc` 留有版本记录
- 状态变化: `open_api_doc` 新增记录
- 失败分支: 下载端点以空 `catch` 吞掉异常（`OpenDocController.java:102-104`），失败时返回空响应体而不报错，属已知缺陷
- 相关功能入口: MENU-open-doc

## SCN-open-admin-maintain - 管理员维护应用、接口与授权

- ID: SCN-open-admin-maintain
- 所属业务域: DOM-open
- 涉及能力: CAP-open-app、CAP-open-api、CAP-open-auth、CAP-open-doc
- 结论级别: 推断（端点与权限码为事实）
- 最后核验: 2026-02-14，依据 `open/controller/*.java` 的 `@RequiresPermissions` 与 `sql/open_api_menu.sql`
- 触发方式: 管理员经管理菜单触发
- 参与角色: 平台管理员
- 前置条件: 管理员账号已登录且角色被授予对应 `open:*` 按钮权限
- 主流程:
  1. 应用维护：列表查询、新增、修改、删除、密钥重置，全部受 `open:app:list/add/edit/remove` 约束。
  2. 接口维护：列表查询、新增、修改、删除，受 `open:api:list/add/edit/remove` 约束，并可生成 cURL 示例。
  3. 授权维护：加载应用与接口候选集，保存授权关系，受 `open:auth:save` 约束。
  4. 文档维护：生成、预览、下载接口文档，受 `open:doc:generate` 约束。
  5. 每次写操作经 `LogAspect` 异步写入 `sys_oper_log`（属 SCN-sys-audit）。
- 业务结果: 开放平台管理数据持续与业务预期一致
- 状态变化: `open_app`、`open_api`、`open_app_api`、`open_api_doc` 记录增删改
- 失败分支: 无权限时 Shiro 拦截并跳转 `ENTRY-unauth`；删除被引用数据时可能出现授权关系残留（`open_app_api` 未声明级联删除，属待确认项）
- 相关功能入口: MENU-open-app、MENU-open-api、MENU-open-auth、MENU-open-doc

## SCN-sys-login-authz - 用户登录与权限校验

- ID: SCN-sys-login-authz
- 所属业务域: DOM-common（认证主体）+ DOM-system（授权数据）
- 涉及能力: CAP-auth-session、CAP-sys-user-org、CAP-sys-perm-menu、CAP-exception-handling
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `SysLoginController.java`、`SysLoginService.java`、`SysPasswordService.java`、`ShiroConfig.java`
- 触发方式: 匿名用户经浏览器访问触发
- 参与角色: 平台用户、Shiro 过滤器链、`UserRealm`
- 前置条件: 用户账号存在、状态正常且密码未过删除标记；`shiro.user.captchaEnabled=true` 时需正确验证码
- 主流程:
  1. 用户访问受保护路径，被 `/** -> user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter` 拦截，未认证则重定向 `shiro.user.loginUrl=/login`。
  2. 登录页加载验证码图片 `GET /captcha/captchaImage`（`anon` 放行），验证码以 `math` 类型生成。
  3. 用户提交 `POST /login`，经 `anon,captchaValidate` 过滤器链校验验证码。
  4. `SysLoginService` 校验账号与密码；`SysPasswordService` 按 `user.password.maxRetryCount=5` 限制重试次数，超限提示锁定。
  5. 校验通过后建立 Shiro 会话，`UserRealm` 加载用户、角色与菜单权限集，授权缓存名 `Constants.SYS_AUTH_CACHE`。
  6. 重定向至首页 `GET /index`，按用户权限渲染菜单树，并写入 CSRF Token 与会话属性。
  7. 后续请求由 `user` 过滤器要求已认证；访问无权限的 `@RequiresPermissions` 端点时跳转 `shiro.user.unauthorizedUrl=/unauth`。
  8. 用户访问 `/logout`，由 Shiro `logout` 过滤器销毁会话并异步记录登出日志。
- 业务结果: 合法用户获得会话与按权限裁剪的菜单/操作集；非法访问被拒绝
- 状态变化: 会话创建/销毁；`sys_user_online` 会话记录同步；`sys_logininfor` 新增登录/登出记录；密码重试计数变化
- 失败分支: 验证码错误、账号不存在、密码不匹配、账号停用、密码过期、重试超限——均异步写入 `sys_logininfor`（状态为失败）并返回提示
- 相关功能入口: ENTRY-login、ENTRY-logout、ENTRY-register、ENTRY-captcha-image、ENTRY-shiro-filter-chain、ENTRY-unauth、ENTRY-index、ENTRY-lockscreen

## SCN-sys-audit - 操作审计

- ID: SCN-sys-audit
- 所属业务域: DOM-common
- 涉及能力: CAP-operation-audit、CAP-auth-session
- 结论级别: 混合：写入链路为事实；「查询/检索」为未实现（见能力缺口）
- 最后核验: 2026-02-14，依据 `LogAspect.java`、`AsyncFactory.java`、`ISysOperLogService.java`、`open_api_menu.sql:82-90`
- 触发方式: 非交互——由带 `@Log` 注解的控制器方法在执行前后自动触发
- 参与角色: `LogAspect` 切面、`AsyncManager` 异步执行器、`SysOperLogServiceImpl`
- 前置条件: 目标控制器方法标注 `@Log` 注解
- 主流程:
  1. 管理员执行任意受 `@Log` 标注的业务操作（如新增用户、修改参数、维护开放接口）。
  2. `LogAspect` 环绕拦截，采集操作人、部门、请求 URL、方法、参数、返回结果与耗时，构造 `SysOperLog`。
  3. `AsyncManager.me().execute(AsyncFactory.recordOper(operLog))` 提交异步任务。
  4. `AsyncFactory.recordOper` 调用 `ISysOperLogService.insertOperlog` 落库 `sys_oper_log`。
  5. 登录、登出、注册事件走并行链路 `AsyncFactory.recordLogininfor` 落库 `sys_logininfor`。
- 业务结果: 关键操作与登录事件形成持久审计痕迹
- 状态变化: `sys_oper_log` 与 `sys_logininfor` 新增记录
- 能力缺口（事实）: 审计数据无读取入口。`ISysOperLogService` 与 `SysOperLogMapper` 仅声明 `insertOperlog`；仓库不存在 `SysOperLogController`、`SysLogininforController`、`SysUserOnlineController`；`open_api_menu.sql:82-90` 删除了 `monitor:operlog:*`、`monitor:logininfor:*`、`monitor:online:*` 全部菜单与按钮权限。因此审计查询只能直连数据库完成，管理界面不可用。
- 失败分支: 异步写入异常不影响主业务事务；`LogAspect` 异常被捕获后继续放行
- 相关功能入口: 无菜单入口；触发点分散在各业务 Controller 的 `@Log` 注解方法

## SCN-job-schedule - 定时任务定义与执行

- ID: SCN-job-schedule
- 所属业务域: DOM-quartz
- 涉及能力: CAP-job-definition、CAP-job-execution、CAP-job-log
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `SysJobController.java`、`SysJobLogController.java`、`sql/quartz.sql`
- 触发方式: 混合——定义与状态变更由管理员经菜单触发（interactive），周期执行由 Quartz 调度器按 Cron 触发（scheduled）
- 参与角色: 平台管理员、Quartz 调度器、被调用目标 Bean
- 前置条件: 任务定义存在且 `status` 为正常；`invoke_target` 指向可解析的 Bean 方法；Cron 表达式合法
- 主流程:
  1. 管理员在「定时任务」（MENU-job-manage）新增任务，填写任务名称、任务分组、调用目标、Cron 表达式、错过策略与并发标记。
  2. 保存前可经 `POST /monitor/job/checkCronExpressionIsValid` 校验 Cron；`GET /monitor/job/cron`、`GET /monitor/job/queryCronExpression` 提供表达式预览。
  3. 任务落库 `sys_job`，同时由 `ScheduleUtils` 在 Quartz 中创建对应 Job 与 Trigger，持久化至 `QRTZ_*` 表。
  4. 到达 Cron 时刻，Quartz 触发任务，实例化 `invoke_target` 指定的目标 Bean 并调用其方法。
  5. 执行结果写入 `sys_job_log`（任务名、任务组、调用目标、执行信息、状态、异常信息）。
  6. 管理员可经 `POST /monitor/job/run` 手动执行一次，或经 `POST /monitor/job/changeStatus` 启停任务。
  7. 管理员在调度日志视图查询 `sys_job_log`，可查看详情（`GET /monitor/jobLog/detail/{jobLogId}`）、导出或清理（`POST /monitor/jobLog/clean`）。
- 业务结果: 周期性后台作业按计划自动执行，每次执行可追溯
- 状态变化: `sys_job.status` 在正常/暂停之间迁移；`QRTZ_*` 调度元数据增删改；`sys_job_log` 新增记录
- 失败分支: Cron 非法时校验端点返回失败；目标 Bean 不存在或方法签名不符时执行抛异常并记入 `sys_job_log`；任务暂停期间不触发
- 相关功能入口: MENU-job-manage

## SCN-sys-admin-maintain - 管理员维护平台基础数据

- ID: SCN-sys-admin-maintain
- 所属业务域: DOM-system
- 涉及能力: CAP-sys-user-org、CAP-sys-perm-menu、CAP-sys-dict-config、CAP-sys-notice、CAP-file-transfer
- 结论级别: 推断（各端点与权限码为事实）
- 最后核验: 2026-02-14，依据 `web/controller/system/*.java`、`deploy/local-docker/mysql/init/10-qvsu.sql`
- 触发方式: 管理员经管理菜单触发
- 参与角色: 平台管理员
- 前置条件: 管理员已登录且角色被授予相应 `system:*` 按钮权限
- 主流程:
  1. 用户与组织维护：用户增删改查、状态切换、密码重置、角色分配、导入（`POST /system/user/importData`）与导出，涉及 `sys_user`、`sys_user_role`、`sys_user_post`。
  2. 权限维护：角色增删改查、数据范围授权（`POST /system/role/authDataScope`）、菜单树勾选（`GET /system/role/selectMenuTree`）、角色-用户分配，涉及 `sys_role`、`sys_role_menu`、`sys_role_dept`。
  3. 菜单维护：目录/菜单/按钮三级节点的增删改与排序（`POST /system/menu/updateSort`），涉及 `sys_menu`。
  4. 字典与参数维护：字典类型与字典数据增删改、缓存刷新（`GET /system/dict/refreshCache`、`GET /system/config/refreshCache`），涉及 `sys_dict_type`、`sys_dict_data`、`sys_config`。
  5. 通知公告维护：发布、修改、删除、查看，涉及 `sys_notice`。
  6. 全部写操作经 `LogAspect` 异步写入 `sys_oper_log`（属 SCN-sys-audit）。
- 业务结果: 平台主数据、权限模型与配置项保持可用与一致
- 状态变化: `sys_*` 主表与关联表增删改；权限缓存刷新后授权判定立即生效
- 失败分支: 缺少对应权限码时被 Shiro 拒绝并跳转 `ENTRY-unauth`；名称/编码重复时由 `check*Unique` 端点返回冲突；删除有子节点的部门或菜单时业务规则拦截
- 相关功能入口: MENU-sys-user、MENU-sys-role、MENU-sys-menu、MENU-sys-dept、MENU-sys-post、MENU-sys-dict、MENU-sys-config、MENU-sys-notice

---

## 5. 菜单入口全量登记

### 5.1 登记口径与去重说明

- 数据来源：`docs/tools/menus.json`，共 149 行 = `M 5` + `C 33` + `F 111`。
- 同一逻辑菜单在上述 5 份 SQL 方言副本中重复出现；**三份 C/M 行的 `menu_id` 集合完全一致**（已验证：`mysql/init/10-qvsu.sql` 与 `postgres/init/10-qvsu.sql` 的 C 集合同为 `{4,100,101,102,103,104,105,106,107}`，两份 `40-open-api-menu.sql` 与 `sql/open_api_menu.sql` 的 C 集合同为 `{2101,2102,2103,2104,2105}`）。
- 去重结果（事实）：`menu_id` 唯一值 66 个 = **C 14** + **M 2** + F 50。
- 因此本文件为 **16 个页面/目录菜单**建立菜单主定义（14 个 C 类页面 + 2 个 M 类目录），F 类按钮权限不作为独立菜单节点，而是归入其父菜单节点下的按钮权限表逐条列出。
- 中文以 MySQL 副本为准；PostgreSQL 的 `40-open-api-menu.sql` 中文乱码，仅用于核对 `menu_id` 与 `perms`。
- 不建菜单节点的例外 1 项（事实）：`menu_id=4`「qvsu官网」，`menu_type=C`，`parent_id=0`，`url=http://qvsu.vip`，`target=menuBlank`，`perms` 为空。它是外链导航项而非本系统业务页面，无权限码、无对应 Controller 与模板，故登记为 `ENTRY-external-homepage`。

### 5.2 菜单树总览

```text
MENU-sys-root (1 系统管理, M, order_num=1)
|-- MENU-sys-user     (100 用户管理,   C, /system/user,   system:user:view)
|-- MENU-sys-role     (101 角色管理,   C, /system/role,   system:role:view)
|-- MENU-sys-menu     (102 菜单管理,   C, /system/menu,   system:menu:view)
|-- MENU-sys-dept     (103 部门管理,   C, /system/dept,   system:dept:view)
|-- MENU-sys-post     (104 岗位管理,   C, /system/post,   system:post:view)
|-- MENU-sys-dict     (105 字典管理,   C, /system/dict,   system:dict:view)
|-- MENU-sys-config   (106 参数设置,   C, /system/config, system:config:view)
|-- MENU-sys-notice   (107 通知公告,   C, /system/notice, system:notice:view)
`-- MENU-job-manage   (110 定时任务,   C, /monitor/job,   monitor:job:view)   [来源 sql/quartz.sql]

MENU-open-root (2100 OpenAPI管理, M, order_num=10)
|-- MENU-open-app     (2101 应用管理, C, /admin/open/app,  open:app:view)
|-- MENU-open-api     (2102 接口管理, C, /admin/open/api,  open:api:view)
|-- MENU-open-auth    (2103 授权管理, C, /admin/open/auth, open:auth:view)
|-- MENU-open-log     (2104 调用日志, C, /admin/open/log,  open:log:view)
`-- MENU-open-doc     (2105 文档管理, C, /admin/open/doc,  open:doc:view)

(menu_id=4 qvsu官网, C, 外链 -> ENTRY-external-homepage)
```

### 5.3 目录菜单定义（M 类，2 条）

## MENU-sys-root - 系统管理目录

- ID: MENU-sys-root
- 菜单类型: M（目录）
- menu_id: 1
- parent_id: 0
- order_num: 1
- URL: `#`
- 权限码: 无（`perms` 为空字符串）
- 可见性/状态: `visible=0`（显示）、`status=1`（正常）
- 图标: `fa fa-gear`
- 所属业务域: DOM-system
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 子菜单: MENU-sys-user、MENU-sys-role、MENU-sys-menu、MENU-sys-dept、MENU-sys-post、MENU-sys-dict、MENU-sys-config、MENU-sys-notice（8 个 C 类子菜单）
- 备注: 该目录在 `menus.json` 中仅有 8 个 C 类子菜单；`sql/quartz.sql` 额外将「定时任务」(`menu_id=110`) 以 `parent_id=1` 挂到本目录下（见 MENU-job-manage）

## MENU-open-root - OpenAPI管理目录

- ID: MENU-open-root
- 菜单类型: M（目录）
- menu_id: 2100
- parent_id: 1
- order_num: 10
- URL: `#`
- 权限码: 无（`perms` 为空字符串）
- 可见性/状态: `visible=0`（显示）、`status=1`（正常）
- 图标: `fa fa-plug`
- 所属业务域: DOM-open
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:7`
- 子菜单: MENU-open-app、MENU-open-api、MENU-open-auth、MENU-open-log、MENU-open-doc（5 个 C 类子菜单）
- 备注: `parent_id=1`，即 OpenAPI 目录挂在系统管理目录之下，而非独立一级目录

### 5.4 页面菜单定义（C 类，14 条）

## MENU-sys-user - 用户管理

- ID: MENU-sys-user
- 菜单类型: C（页面）
- menu_id: 100
- parent_id: 1（MENU-sys-root）
- order_num: 1
- URL: `/system/user`
- 权限码: `system:user:view`
- 图标: `fa fa-user-o`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-user-org
- 页面模板: `templates/system/user/user.html`
- 控制器: `web/controller/system/SysUserController.java`（`@RequestMapping("/system/user")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysUserController.java`
- 按钮权限（F 类，权限码均来自 `sys_menu`，`parent_id=100`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:user:list` | 1000 | MENU-sys-user (100) | 用户查询 | `POST /system/user/list` |
| `system:user:add` | 1001 | MENU-sys-user (100) | 用户新增 | `GET/POST /system/user/add` |
| `system:user:edit` | 1002 | MENU-sys-user (100) | 用户修改 | `POST /system/user/edit` |
| `system:user:remove` | 1003 | MENU-sys-user (100) | 用户删除 | `POST /system/user/remove` |
| `system:user:export` | 1004 | MENU-sys-user (100) | 用户导出 | `POST /system/user/export` |
| `system:user:import` | 1005 | MENU-sys-user (100) | 用户导入 | `POST /system/user/importData` |
| `system:user:resetPwd` | 1006 | MENU-sys-user (100) | 重置密码 | `GET/POST /system/user/resetPwd` |

## MENU-sys-role - 角色管理

- ID: MENU-sys-role
- 菜单类型: C（页面）
- menu_id: 101
- parent_id: 1（MENU-sys-root）
- order_num: 2
- URL: `/system/role`
- 权限码: `system:role:view`
- 图标: `fa fa-user-secret`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-perm-menu
- 控制器: `web/controller/system/SysRoleController.java`（`@RequestMapping("/system/role")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysRoleController.java`
- 按钮权限（F 类，`parent_id=101`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:role:list` | 1007 | MENU-sys-role (101) | 角色查询 | `POST /system/role/list` |
| `system:role:add` | 1008 | MENU-sys-role (101) | 角色新增 | `GET/POST /system/role/add` |
| `system:role:edit` | 1009 | MENU-sys-role (101) | 角色修改 | `POST /system/role/edit` |
| `system:role:remove` | 1010 | MENU-sys-role (101) | 角色删除 | `POST /system/role/remove` |
| `system:role:export` | 1011 | MENU-sys-role (101) | 角色导出 | `POST /system/role/export` |

## MENU-sys-menu - 菜单管理

- ID: MENU-sys-menu
- 菜单类型: C（页面）
- menu_id: 102
- parent_id: 1（MENU-sys-root）
- order_num: 3
- URL: `/system/menu`
- 权限码: `system:menu:view`
- 图标: `fa fa-th-list`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-perm-menu
- 控制器: `web/controller/system/SysMenuController.java`（`@RequestMapping("/system/menu")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysMenuController.java`
- 按钮权限（F 类，`parent_id=102`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:menu:list` | 1012 | MENU-sys-menu (102) | 菜单查询 | `POST /system/menu/list` |
| `system:menu:add` | 1013 | MENU-sys-menu (102) | 菜单新增 | `GET /system/menu/add/{parentId}`、`POST /system/menu/add` |
| `system:menu:edit` | 1014 | MENU-sys-menu (102) | 菜单修改 | `POST /system/menu/edit`、`POST /system/menu/updateSort` |
| `system:menu:remove` | 1015 | MENU-sys-menu (102) | 菜单删除 | `GET /system/menu/remove/{menuId}` |

## MENU-sys-dept - 部门管理

- ID: MENU-sys-dept
- 菜单类型: C（页面）
- menu_id: 103
- parent_id: 1（MENU-sys-root）
- order_num: 4
- URL: `/system/dept`
- 权限码: `system:dept:view`
- 图标: `fa fa-sitemap`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-user-org
- 控制器: `web/controller/system/SysDeptController.java`（`@RequestMapping("/system/dept")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysDeptController.java`
- 按钮权限（F 类，`parent_id=103`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:dept:list` | 1016 | MENU-sys-dept (103) | 部门查询 | `POST /system/dept/list` |
| `system:dept:add` | 1017 | MENU-sys-dept (103) | 部门新增 | `GET /system/dept/add/{parentId}`、`POST /system/dept/add` |
| `system:dept:edit` | 1018 | MENU-sys-dept (103) | 部门修改 | `POST /system/dept/edit` |
| `system:dept:remove` | 1019 | MENU-sys-dept (103) | 部门删除 | `GET /system/dept/remove/{deptId}` |

## MENU-sys-post - 岗位管理

- ID: MENU-sys-post
- 菜单类型: C（页面）
- menu_id: 104
- parent_id: 1（MENU-sys-root）
- order_num: 5
- URL: `/system/post`
- 权限码: `system:post:view`
- 图标: `fa fa-address-book`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-user-org
- 控制器: `web/controller/system/SysPostController.java`（`@RequestMapping("/system/post")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysPostController.java`
- 按钮权限（F 类，`parent_id=104`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:post:list` | 1020 | MENU-sys-post (104) | 岗位查询 | `POST /system/post/list` |
| `system:post:add` | 1021 | MENU-sys-post (104) | 岗位新增 | `GET/POST /system/post/add` |
| `system:post:edit` | 1022 | MENU-sys-post (104) | 岗位修改 | `POST /system/post/edit` |
| `system:post:remove` | 1023 | MENU-sys-post (104) | 岗位删除 | `POST /system/post/remove` |
| `system:post:export` | 1024 | MENU-sys-post (104) | 岗位导出 | `POST /system/post/export` |

## MENU-sys-dict - 字典管理

- ID: MENU-sys-dict
- 菜单类型: C（页面）
- menu_id: 105
- parent_id: 1（MENU-sys-root）
- order_num: 6
- URL: `/system/dict`
- 权限码: `system:dict:view`
- 图标: `fa fa-book`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-dict-config
- 控制器: `web/controller/system/SysDictTypeController.java`（`/system/dict`）、`SysDictDataController.java`（`/system/dict/data`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysDictTypeController.java`、`SysDictDataController.java`
- 按钮权限（F 类，`parent_id=105`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:dict:list` | 1025 | MENU-sys-dict (105) | 字典查询 | `POST /system/dict/list`、`POST /system/dict/data/list` |
| `system:dict:add` | 1026 | MENU-sys-dict (105) | 字典新增 | `POST /system/dict/add`、`POST /system/dict/data/add` |
| `system:dict:edit` | 1027 | MENU-sys-dict (105) | 字典修改 | `POST /system/dict/edit`、`POST /system/dict/data/edit` |
| `system:dict:remove` | 1028 | MENU-sys-dict (105) | 字典删除 | `POST /system/dict/remove`、`POST /system/dict/data/remove` |
| `system:dict:export` | 1029 | MENU-sys-dict (105) | 字典导出 | `POST /system/dict/export`、`POST /system/dict/data/export` |

## MENU-sys-config - 参数设置

- ID: MENU-sys-config
- 菜单类型: C（页面）
- menu_id: 106
- parent_id: 1（MENU-sys-root）
- order_num: 7
- URL: `/system/config`
- 权限码: `system:config:view`
- 图标: `fa fa-gears`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-dict-config
- 控制器: `web/controller/system/SysConfigController.java`（`@RequestMapping("/system/config")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysConfigController.java`
- 按钮权限（F 类，`parent_id=106`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:config:list` | 1030 | MENU-sys-config (106) | 参数查询 | `POST /system/config/list` |
| `system:config:add` | 1031 | MENU-sys-config (106) | 参数新增 | `GET/POST /system/config/add` |
| `system:config:edit` | 1032 | MENU-sys-config (106) | 参数修改 | `POST /system/config/edit` |
| `system:config:remove` | 1033 | MENU-sys-config (106) | 参数删除 | `POST /system/config/remove` |
| `system:config:export` | 1034 | MENU-sys-config (106) | 参数导出 | `POST /system/config/export` |

## MENU-sys-notice - 通知公告

- ID: MENU-sys-notice
- 菜单类型: C（页面）
- menu_id: 107
- parent_id: 1（MENU-sys-root）
- order_num: 8
- URL: `/system/notice`
- 权限码: `system:notice:view`
- 图标: `fa fa-bullhorn`
- 所属业务域: DOM-system
- 所含能力: CAP-sys-notice
- 控制器: `web/controller/system/SysNoticeController.java`（`@RequestMapping("/system/notice")`）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`、`SysNoticeController.java`
- 按钮权限（F 类，`parent_id=107`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `system:notice:list` | 1035 | MENU-sys-notice (107) | 公告查询 | `POST /system/notice/list` |
| `system:notice:add` | 1036 | MENU-sys-notice (107) | 公告新增 | `GET/POST /system/notice/add` |
| `system:notice:edit` | 1037 | MENU-sys-notice (107) | 公告修改 | `POST /system/notice/edit` |
| `system:notice:remove` | 1038 | MENU-sys-notice (107) | 公告删除 | `POST /system/notice/remove` |

## MENU-job-manage - 定时任务

- ID: MENU-job-manage
- 菜单类型: C（页面）
- menu_id: 110
- parent_id: 1（MENU-sys-root）
- order_num: 9
- URL: `/monitor/job`
- 权限码: `monitor:job:view`
- 图标: `fa fa-tasks`
- 所属业务域: DOM-quartz
- 所含能力: CAP-job-definition、CAP-job-execution、CAP-job-log
- 控制器: `quartz/controller/SysJobController.java`（`@RequestMapping("/monitor/job")`）、`quartz/controller/SysJobLogController.java`（`@RequestMapping("/monitor/jobLog")`）
- 结论级别: 事实（菜单行来自 `sql/quartz.sql`）；**该菜单未出现在 `docs/tools/menus.json` 中**，详见 §7.2
- 最后核验: 2026-02-14，依据 `open-api/sql/quartz.sql:191-208`
- 按钮权限（F 类，`parent_id=110`，来源 `sql/quartz.sql:196-208`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `monitor:job:list` | 1050 | MENU-job-manage (110) | 任务查询 | `POST /monitor/job/list`、`POST /monitor/jobLog/list` |
| `monitor:job:add` | 1051 | MENU-job-manage (110) | 任务新增 | `GET/POST /monitor/job/add` |
| `monitor:job:edit` | 1052 | MENU-job-manage (110) | 任务修改 | `POST /monitor/job/edit` |
| `monitor:job:remove` | 1053 | MENU-job-manage (110) | 任务删除 | `POST /monitor/job/remove`、`POST /monitor/jobLog/remove`、`POST /monitor/jobLog/clean` |
| `monitor:job:changeStatus` | 1054 | MENU-job-manage (110) | 状态修改 | `POST /monitor/job/changeStatus`、`POST /monitor/job/run` |
| `monitor:job:detail` | 1055 | MENU-job-manage (110) | 任务详细 | `GET /monitor/job/detail/{jobId}`、`GET /monitor/jobLog/detail/{jobLogId}` |
| `monitor:job:export` | 1056 | MENU-job-manage (110) | 任务导出 | `POST /monitor/job/export`、`POST /monitor/jobLog/export` |

## MENU-open-app - 应用管理

- ID: MENU-open-app
- 菜单类型: C（页面）
- menu_id: 2101
- parent_id: 2100（MENU-open-root）
- order_num: 1
- URL: `/admin/open/app`
- 权限码: `open:app:view`
- 图标: `#`
- 所属业务域: DOM-open
- 所含能力: CAP-open-app
- 控制器: `open/controller/OpenAppController.java`（`@RequestMapping("/admin/open/app")`）
- 页面模板: `templates/open/app/index.html`
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:8`、`OpenAppController.java`
- 按钮权限（F 类，`parent_id=2101`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `open:app:list` | 2110 | MENU-open-app (2101) | 应用查询 | `POST /admin/open/app/list` |
| `open:app:add` | 2111 | MENU-open-app (2101) | 应用新增 | `GET /admin/open/app/add`、`POST /admin/open/app/add` |
| `open:app:edit` | 2112 | MENU-open-app (2101) | 应用修改 | `GET /admin/open/app/edit/{id}`、`POST /admin/open/app/edit` |
| `open:app:remove` | 2113 | MENU-open-app (2101) | 应用删除 | `POST /admin/open/app/remove` |

## MENU-open-api - 接口管理

- ID: MENU-open-api
- 菜单类型: C（页面）
- menu_id: 2102
- parent_id: 2100（MENU-open-root）
- order_num: 2
- URL: `/admin/open/api`
- 权限码: `open:api:view`
- 图标: `#`
- 所属业务域: DOM-open
- 所含能力: CAP-open-api
- 控制器: `open/controller/OpenApiMgrController.java`（`@RequestMapping("/admin/open/api")`）
- 页面模板: `templates/open/api/index.html`
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:9`、`OpenApiMgrController.java`
- 按钮权限（F 类，`parent_id=2102`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `open:api:list` | 2120 | MENU-open-api (2102) | 接口查询 | `POST /admin/open/api/list` |
| `open:api:add` | 2121 | MENU-open-api (2102) | 接口新增 | `GET /admin/open/api/add`、`POST /admin/open/api/add` |
| `open:api:edit` | 2122 | MENU-open-api (2102) | 接口修改 | `GET /admin/open/api/edit/{id}`、`POST /admin/open/api/edit` |
| `open:api:remove` | 2123 | MENU-open-api (2102) | 接口删除 | `POST /admin/open/api/remove` |

## MENU-open-auth - 授权管理

- ID: MENU-open-auth
- 菜单类型: C（页面）
- menu_id: 2103
- parent_id: 2100（MENU-open-root）
- order_num: 3
- URL: `/admin/open/auth`
- 权限码: `open:auth:view`
- 图标: `#`
- 所属业务域: DOM-open
- 所含能力: CAP-open-auth
- 控制器: `open/controller/OpenAuthController.java`（`@RequestMapping("/admin/open/auth")`）
- 页面模板: `templates/open/auth/index.html`
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:10`、`OpenAuthController.java`
- 按钮权限（F 类，`parent_id=2103`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `open:auth:save` | 2130 | MENU-open-auth (2103) | 授权保存 | `POST /admin/open/auth/save` |

## MENU-open-log - 调用日志

- ID: MENU-open-log
- 菜单类型: C（页面）
- menu_id: 2104
- parent_id: 2100（MENU-open-root）
- order_num: 4
- URL: `/admin/open/log`
- 权限码: `open:log:view`
- 图标: `#`
- 所属业务域: DOM-open
- 所含能力: CAP-open-log
- 控制器: `open/controller/OpenLogController.java`（`@RequestMapping("/admin/open/log")`）
- 页面模板: `templates/open/log/index.html`
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:11`、`OpenLogController.java`
- 按钮权限（F 类，`parent_id=2104`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `open:log:list` | 2140 | MENU-open-log (2104) | 日志查询 | `POST /admin/open/log/list`、`GET /admin/open/log/stats`、`GET /admin/open/log/exportCsv` |

## MENU-open-doc - 文档管理

- ID: MENU-open-doc
- 菜单类型: C（页面）
- menu_id: 2105
- parent_id: 2100（MENU-open-root）
- order_num: 5
- URL: `/admin/open/doc`
- 权限码: `open:doc:view`
- 图标: `#`
- 所属业务域: DOM-open
- 所含能力: CAP-open-doc
- 控制器: `open/controller/OpenDocController.java`（`@RequestMapping("/admin/open/doc")`）
- 页面模板: `templates/open/doc/index.html`
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open-api/sql/open_api_menu.sql:12`、`OpenDocController.java`
- 按钮权限（F 类，`parent_id=2105`）:

| 权限码 | 菜单ID | 所属父菜单 | 权限名称 | 关联端点（事实） |
|---|---|---|---|---|
| `open:doc:generate` | 2150 | MENU-open-doc (2105) | 文档生成 | `POST /admin/open/doc/generate`、`GET /admin/open/doc/download`、`GET /admin/open/doc/html/{apiId}` |

### 5.5 按钮权限去重汇总

| 统计项 | 数量 | 说明 |
|---|---:|---|
| `menus.json` 中 F 类行数 | 111 | 含方言副本重复 |
| 去重后 F 类唯一 `menu_id` | 50 | 1000-1038（39）+ 2110-2150（11） |
| 归入 MENU-sys-root 子树各页面的按钮权限 | 39 | 覆盖 MENU-sys-user 至 MENU-sys-notice 共 8 个页面菜单 |
| 归入 MENU-open-root 子树各页面的按钮权限 | 11 | 覆盖 MENU-open-app 至 MENU-open-doc 共 5 个页面菜单 |
| 来源 `sql/quartz.sql` 的按钮权限（不在 `menus.json` 内） | 7 | 1050-1056，归入 MENU-job-manage |

### 5.6 被显式删除的菜单（范围排除，事实）

以下菜单/按钮权限在 `open_api_menu.sql` 中被**显式删除**，因此不属于当前系统能力范围，本文件不为其建立菜单节点：

| 被删除对象 | 删除依据 | 排除理由 |
|---|---|---|
| 操作日志菜单与按钮 `monitor:operlog:*`、URL `/monitor/operlog` | `open_api_menu.sql:72-73,84-85,89` | 精简版移除监控子域；对应 Controller 亦不存在 |
| 登录日志菜单与按钮 `monitor:logininfor:*`、URL `/monitor/logininfor` | `open_api_menu.sql:73,85,89` | 同上 |
| 在线用户菜单与按钮 `monitor:online:*`、URL `/monitor/online` | `open_api_menu.sql:74,86,89` | 同上 |
| 数据监控/服务监控/缓存监控 `monitor:data:view`、`monitor:server:view`、`monitor:cache:*` | `open_api_menu.sql:75,87,89` | 同上 |
| 菜单ID `108,109,111,112,113,500,501,1039-1049` | `open_api_menu.sql:78,90` | 上游框架自带非必要菜单 |
| 代码生成工具链 `tool:%`、URL `/tool/%`、菜单ID `3,114,115,116,1057-1061` | `open_api_menu.sql:99-108` | 工具链整体移除，并 `DROP TABLE gen_table_column, gen_table` |

---

## 6. 非菜单入口登记

## ENTRY-shiro-filter-chain - Shiro 过滤器链入口

- ID: ENTRY-shiro-filter-chain
- 类型: 框架级过滤器链
- 触发方式: 任意 HTTP 请求进入容器后由 `ShiroFilterFactoryBean` 按定义顺序匹配路径
- 用途: 对全部请求实施认证与授权前置校验；决定哪些路径匿名放行、哪些要求已认证会话
- 定义处: `framework/config/ShiroConfig.java:306-349`
- 关键规则（事实）:
  - 静态资源匿名放行：`/favicon.ico**`、`/qvsu.png**`、`/ruoyi.png**`、`/html/**`、`/css/**`、`/docs/**`、`/fonts/**`、`/img/**`、`/ajax/**`、`/js/**`、`/qvsu/**`、`/ruoyi/**`
  - 验证码匿名放行：`/captcha/captchaImage**`、`/captcha/captchaCode**`
  - `/logout` → `logout` 过滤器，由 Shiro 清除会话
  - `/login` → `anon,captchaValidate`；`/register` → `anon,captchaValidate`
  - `/open/**` → `anon`（开放平台网关不要求后台会话，改由 `OpenApiFilter` 校验 `appKey`/签名）
  - `/selftest/**` → `anon`
  - 兜底 `/**` → `user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter`
  - 另有 `PermitAllUrlProperties` 动态白名单（`ShiroConfig.java:321-324`）在链中追加 `anon`
- 所属业务域: DOM-common
- 所含能力: CAP-auth-session
- 结论级别: 事实

## ENTRY-login - 登录页面与登录提交

- ID: ENTRY-login
- 类型: Web 入口（GET 视图 + POST 认证）
- 路径: `GET /login`、`POST /login`
- 触发方式: 浏览器直接访问，或未认证请求被 `user` 过滤器按 `shiro.user.loginUrl=/login` 重定向而来
- 用途: `GET` 渲染登录页并生成验证码；`POST` 提交用户名、密码、记住我，由 `SysLoginService` 完成认证并建立 Shiro 会话
- 控制器: `web/controller/system/SysLoginController.java:40,55`
- 过滤器链: `anon,captchaValidate`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz
- 结论级别: 事实

## ENTRY-logout - 退出登录

- ID: ENTRY-logout
- 类型: Web 入口
- 路径: `/logout`
- 触发方式: 用户点击退出，或页面跳转触发
- 用途: 由 Shiro `logout` 过滤器销毁会话、清理在线用户记录，并经 `framework/shiro/web/filter/LogoutFilter.java:57` 异步写入登出登录日志
- 过滤器链: `logout`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz、SCN-sys-audit
- 结论级别: 事实

## ENTRY-register - 用户注册

- ID: ENTRY-register
- 类型: Web 入口（GET 视图 + POST 提交）
- 路径: `GET /register`、`POST /register`
- 触发方式: 浏览器直接访问
- 用途: 开放注册入口；`GET` 渲染注册页，`POST` 由 `SysRegisterService` 创建用户并异步写入注册登录日志（`SysRegisterService.java:78`）
- 控制器: `web/controller/system/SysRegisterController.java:29,35`
- 过滤器链: `anon,captchaValidate`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz
- 结论级别: 事实
- 风险提示（推断）: 该入口对匿名用户开放且无邀请码校验，生产环境是否启用需结合部署策略确认

## ENTRY-captcha-image - 验证码图片与验证码取值

- ID: ENTRY-captcha-image
- 类型: Web 入口
- 路径: `GET /captcha/captchaImage`、`GET /captcha/captchaCode`
- 触发方式: 登录页与注册页加载时由前端异步请求
- 用途: `captchaImage` 生成验证码图片（`shiro.user.captchaType=math`）；`captchaCode` 为测试用验证码取值入口，由 `qvsu.testing.exposeCaptchaCode`（默认 `false`）控制是否暴露
- 控制器: `web/controller/system/SysCaptchaController.java:44,112`
- 过滤器链: `anon`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz
- 结论级别: 事实

## ENTRY-index - 后台首页与工作台

- ID: ENTRY-index
- 类型: Web 入口
- 路径: `GET /index`（另含 `GET /system/main` 主内容区）
- 触发方式: 登录成功后由 `shiro.user.indexUrl=/index` 跳转，或用户直接访问
- 用途: 按当前用户权限加载菜单树（`menuService.selectMenusByUser`），渲染首页框架（`index` 或 `index-topnav`），注入皮肤、页脚、标签页、密码过期标志与 CSRF Token
- 控制器: `web/controller/system/SysIndexController.java:48,138`
- 过滤器链: 兜底 `/**` 链（要求已认证）
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz
- 结论级别: 事实

## ENTRY-unauth - 未授权提示页

- ID: ENTRY-unauth
- 类型: Web 入口
- 路径: `GET /unauth`
- 触发方式: 已登录用户访问无权限资源时，由 Shiro 按 `shiro.user.unauthorizedUrl=/unauth` 跳转
- 用途: 展示未授权提示，避免暴露 403 细节
- 控制器: `web/controller/system/SysLoginController.java:77`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz、SCN-open-admin-maintain、SCN-sys-admin-maintain
- 结论级别: 事实

## ENTRY-lockscreen - 锁屏与解锁

- ID: ENTRY-lockscreen
- 类型: Web 入口
- 路径: `GET /lockscreen`、`POST /unlockscreen`
- 触发方式: 用户主动锁屏；解锁时提交当前账号密码
- 用途: 会话保持但界面锁定，解锁时校验密码（`SysPasswordService`）
- 控制器: `web/controller/system/SysIndexController.java:97,106`
- 所属业务域: DOM-common
- 相关场景: SCN-sys-login-authz
- 结论级别: 事实

## ENTRY-open-gateway - 开放平台网关统一代理入口

- ID: ENTRY-open-gateway
- 类型: 对外 REST 网关入口
- 路径: `/open/**`（`@RequestMapping("/open/**")`，匹配任意方法与子路径）
- 触发方式: 第三方系统携带 `X-App-Key`、`X-Timestamp`、`X-Nonce`、`X-Sign`（当 `need_sign=1` 时）发起 HTTP 请求
- 用途: 开放平台唯一对外业务入口。由 `OpenApiFilter` 完成鉴权并产出 `OPEN_AUTH_CONTEXT`，由 `OpenGatewayController` 转发至 `target_url`，由 `OpenApiLogService` 落库调用日志
- 控制器: `open/controller/OpenGatewayController.java:38`
- 配套过滤器: `open/filter/OpenApiFilter.java`（`shouldNotFilter` 仅放行非 `/open/` 前缀）
- 过滤器链: Shiro `anon`（不走后台会话认证）
- 所属业务域: DOM-open
- 相关场景: SCN-open-gateway-call、SCN-open-call-log
- 结论级别: 事实

## ENTRY-open-selftest - 开放平台自检 httpbin 入口

- ID: ENTRY-open-selftest
- 类型: 内建自检 REST 入口
- 路径: `/selftest/httpbin/get`、`/selftest/httpbin/post`、`/selftest/httpbin/put`、`/selftest/httpbin/delete`、`/selftest/httpbin/headers`、`/selftest/httpbin/ip`、`/selftest/httpbin/user-agent`、`/selftest/httpbin/uuid`、`/selftest/httpbin/timeout`（共 9 个）
- 触发方式: 测试或联调方直接发起 HTTP 请求；`timeout` 端点固定 `Thread.sleep(3000L)` 用于验证网关超时控制
- 用途: 替代外部 httpbin 依赖，使网关转发与超时能力可在无外网环境下自检；自检数据由 `open_api_selftest_seed.sql`、`open_api_httpbin_min_seed.sql` 播种
- 控制器: `open/controller/OpenSelftestHttpbinController.java:24,33,41,49,65,75,83,91,99`
- 过滤器链: Shiro `anon`
- 所属业务域: DOM-open
- 相关场景: SCN-open-gateway-call
- 结论级别: 事实
- 风险提示（推断）: 该入口匿名开放且 `/selftest/**` 在 Shiro 中 `anon`，生产环境应确认是否禁用或置于内网

## ENTRY-common-file - 通用文件上传与下载

- ID: ENTRY-common-file
- 类型: 通用 REST 入口
- 路径: `GET /common/download`、`POST /common/upload`、`POST /common/uploads`（多文件）、`GET /common/download/resource`
- 触发方式: 各业务页面（用户导入、头像上传、文档下载等）经前端异步调用
- 用途: 提供平台级文件读写能力；下载按文件名或资源路径解析到上传目录，上传支持单文件与多文件
- 控制器: `web/controller/common/CommonController.java:46,75,102,140`
- 过滤器链: 兜底 `/**` 链（要求已认证）
- 所属业务域: DOM-common
- 所含能力: CAP-file-transfer
- 相关场景: SCN-sys-admin-maintain
- 结论级别: 事实
- 风险提示（事实）: `GET /common/download/resource` 直接按传入资源路径读取文件系统，需依赖上层校验防止路径穿越；本次逆向未发现独立的路径归一化校验，属需重点复核的安全点

## ENTRY-static-resource - 上传目录静态资源映射

- ID: ENTRY-static-resource
- 类型: 静态资源映射
- 路径: `/profile/**`（`Constants.RESOURCE_PREFIX = "/profile"`）
- 触发方式: 浏览器直接请求，或页面 `<img>`/下载链接引用
- 用途: 将 `qvsu.profile`（默认 `D:/qvsu/uploadPath`）映射为可访问的静态资源前缀，用于头像与上传文件的回显
- 定义处: `framework/config/ResourcesConfig.java:52-55`、`common/constant/Constants.java:95`
- 过滤器链: 未在 Shiro 中显式 `anon`（事实：`ShiroConfig.java:306-319` 的白名单不含 `/profile/**`），故受兜底链约束要求已认证会话
- 所属业务域: DOM-common
- 结论级别: 事实

## ENTRY-druid-monitor - Druid 数据库监控台

- ID: ENTRY-druid-monitor
- 类型: 运维监控入口
- 路径: `/druid/*`（URL 模式取自 `spring.datasource.druid.statViewServlet.urlPattern`，缺省 `/druid/*`）
- 触发方式: 浏览器直接访问并由 Servlet 注册的登录页完成认证
- 用途: 提供数据源、SQL 执行与连接池的运行时监控视图
- 定义处: `framework/config/DruidConfig.java:86-92`，受 `spring.datasource.druid.statViewServlet.enabled` 控制
- 配置状态: `application-druid.yml:42-44` 中该开关为 `enabled: true` → **默认开启**（事实）
- 所属业务域: DOM-common
- 结论级别: 事实

## ENTRY-operation-audit - 操作审计写入入口

- ID: ENTRY-operation-audit
- 类型: AOP 切面（非 HTTP 入口）
- 触发方式: 非交互——任意被 `@Log` 注解标注的控制器方法执行时由 `LogAspect` 环绕拦截，异步落库
- 用途: 采集操作人、部门、URL、方法、参数、返回结果与耗时，写入 `sys_oper_log`；登录/登出/注册事件经并行链路写入 `sys_logininfor`
- 定义处: `framework/aspectj/LogAspect.java:93`、`framework/manager/factory/AsyncFactory.java:69-78`
- 所属业务域: DOM-common
- 所含能力: CAP-operation-audit
- 相关场景: SCN-sys-audit
- 结论级别: 事实
- 能力缺口（事实）: 无对应查询入口与查询端点，详见 CAP-operation-audit 与 SCN-sys-audit 的能力缺口说明

## ENTRY-external-homepage - qvsu 官网外链

- ID: ENTRY-external-homepage
- 类型: 外链导航项
- menu_id: 4
- 名称: qvsu官网
- URL: `http://qvsu.vip`
- 触发方式: 用户在左侧导航点击该外链，以 `target=menuBlank` 新窗口打开
- 用途: 跳转外部官网，非本系统功能页面；无权限码、无 Controller、无页面模板
- 所属业务域: DOM-system（作为导航挂载点，实际不含业务逻辑）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `deploy/local-docker/mysql/init/10-qvsu.sql`（`menu_id=4`，`menu_type=C`，`perms` 为空）
- 说明: 因不承载本系统业务功能，登记为非菜单入口而非菜单节点，以保证菜单节点数等于真实业务页面数

## ENTRY-global-exception - 全局异常处理切面

- ID: ENTRY-global-exception
- 类型: `@ControllerAdvice` 全局异常处理（非 HTTP 入口）
- 触发方式: 非交互——控制器方法抛出未捕获异常时由 Spring MVC 分派至此
- 用途: 统一把异常转换为 `AjaxResult` 错误体或错误视图，避免堆栈外泄
- 定义处: `framework/web/exception/GlobalExceptionHandler.java`
- 所属业务域: DOM-common
- 所含能力: CAP-exception-handling
- 相关场景: SCN-sys-login-authz、SCN-open-admin-maintain
- 结论级别: 事实

---

## 7. 存疑与偏差登记

### 7.1 菜单去重后为 14 个 C 类而非 33 个

- 现象（事实）：任务书要求「C 类与 M 类必须逐条建 MENU 节点」，并期望覆盖「全部 33 个 C 类 + 5 个 M 类」。但按 `menu_id` 去重后 C 类只有 14 个、M 类只有 2 个。
- 判据（事实）：`menus.json` 149 行 = M 5 + C 33 + F 111。按来源拆分后每个来源的行数与 ID 集合为：
  - `deploy/local-docker/mysql/init/10-qvsu.sql`：M 1（`{1}`）+ C 9（`{4,100..107}`）
  - `deploy/local-docker/postgres/init/10-qvsu.sql`：M 1（`{1}`）+ C 9（同上，集合完全一致）
  - `deploy/local-docker/mysql/init/40-open-api-menu.sql`：M 1（`{2100}`）+ C 5（`{2101..2105}`）
  - `deploy/local-docker/postgres/init/40-open-api-menu.sql`：M 1 + C 5（同 ID 集合）
  - `open-api/sql/open_api_menu.sql`：M 1 + C 5（同 ID 集合）
- 结论（推断）：`33 = 11 × 3`、`5 ≈ 2 × 3` 来自方言副本重复计数；**去重真值为 14 个 C 类 + 2 个 M 类**。任务书所给 33/5 为副本累计行数，与「按 menu_id 去重后再登记」的约束互斥。
- 处理：本文件按去重真值建立 16 个菜单主定义，并在此完整披露 5 份副本的 ID 集合与来源，使 11 个逻辑 C 类菜单均可追溯到其全部方言副本。
- 待确认动作：向主任务确认菜单节点计数应取去重真值（16）还是副本累计行数（38）；若取后者，须为同一菜单的 3 份副本分别建 ID，本文件不采用该口径以免同一逻辑菜单出现多个主定义。

### 7.2 `sql/quartz.sql` 中的定时任务菜单未被 `menus.json` 收录

- 现象（事实）：`open-api/sql/quartz.sql:191-208` 显式插入菜单 `110`（定时任务，`C`，`/monitor/job`，`monitor:job:view`）与 7 条按钮权限 `1050-1056`（`monitor:job:*`），并对既有行做 `UPDATE sys_menu SET parent_id=1, order_num=9, ...` 兜底。
- 影响（事实）：`docs/tools/menus.json` 中检索 `monitor:job`、`/monitor/job`、`"110"`、`1050` **均零命中**，说明该提取脚本未覆盖 `sql/quartz.sql`。
- 交叉证据（事实）：`quartz/controller/SysJobController.java` 与 `SysJobLogController.java` 确实存在并使用 `monitor:job:*` 权限码；`application.yml` 的 `pagehelper.helperDialect=postgresql` 与 `sql/quartz.sql` 的 DDL 一致。
- 处理：本文件据源码（而非 `menus.json`）为 `MENU-job-manage`（`menu_id=110`）建立主定义，并标注其为 `menus.json` 之外的第 15 个 C 类菜单。任务书要求的「调度任务域」与「定时任务定义与执行」场景因此得以落地。
- 待确认动作：请主任务确认是否应把 `sql/quartz.sql` 纳入 `menus.json` 的提取范围；若纳入，C 类去重真值应由 14 变为 15。

### 7.3 「限流」能力不存在

- 现象（事实）：任务书要求场景「开放接口调用鉴权与限流」。但全仓在 `com.qvsu.open` 内检索 `rateLimit`、`RateLimit`、`限流`、`qps`、`QPS`、`Semaphore`、`Bucket`、`token` **零命中**。
- 现有近似实现（事实）：`OpenApiSecurityService.checkNonce` 在 `NONCE_CACHE.size() > 100000` 时触发过期条目清理，并记录 info 日志。这是缓存容量保护，不构成对调用方的速率或配额约束。
- 处理：`SCN-open-gateway-call` 保留任务书要求的场景标题，但在「限流说明」中明确标注为未实现，并把结论级别降为混合（鉴权与转发为事实，限流为假设且不成立）。
- 待确认动作：若业务确有限流需求，应作为新增需求立项，而非计入既有能力。

### 7.4 操作审计「只写不读」

- 现象（事实）：`ISysOperLogService` 与 `SysOperLogMapper` 仅声明 `insertOperlog`；不存在 `SysOperLogController`、`SysLogininforController`、`SysUserOnlineController`；`open_api_menu.sql:82-90` 显式删除 `monitor:operlog:*`、`monitor:logininfor:*`、`monitor:online:*` 菜单与按钮权限。
- 影响（推断）：`sys_oper_log`、`sys_logininfor`、`sys_user_online` 三表在系统内只增不减、不可查询，审计能力在界面上不可用。
- 待确认动作：确认这是「精简版有意裁剪」还是「裁剪遗留待补」；对应地判断审计表是否属于有效业务数据资产。

### 7.5 与并行产物的一致性待复核

- 现象（事实）：`docs/meta-model/functional-inventory.md` 已登记「操作日志查询」「登录日志查询」「在线用户监控」三个查询类功能，但本文件在 §7.4 所述的源码证据中未发现对应的读取端点或读取 Service 方法。
- 处理：本文件如实记录源码现状，既不引用也不否定上述功能条目（按约束，功能类稳定 ID 的归属与定义权在 `functional-inventory.md`，本文件不涉及）。
- 待确认动作：请主任务在 `consistency-report.md` 中对账上述三个功能的需求面板与实际端点是否存在，若不存在应标记为断链或移除。

### 7.6 已知源码缺陷对本域结论的影响

| 缺陷 | 依据 | 对业务架构结论的影响 |
|---|---|---|
| `application.yml` 中文注释双重编码乱码 | 共享上下文 §2.5；实测第 1-148 行中文全部乱码 | 不影响：本文件所需配置值（端口、URL、开关）均为 ASCII，可直接判读 |
| PostgreSQL 版菜单脚本中文乱码 | 共享上下文 §2.5 | 已规避：全部中文菜单名取自 MySQL 副本，PostgreSQL 副本仅用于核对 ID 与权限码 |
| `open_api_menu.sql` 与 `quartz.sql` 对 `sys_menu` 做过删除/更新混合操作 | `open_api_menu.sql:64-108`、`quartz.sql:191-193` | 影响菜单最终态判定：脚本执行顺序（`quartz.sql` 先于 `open_api_menu.sql` 还是在后）会改变可见菜单集合。**假设**：按文件名与依赖关系先建表后裁剪，即 `quartz.sql` 定义、`open_api_menu.sql` 裁剪监控子域但保留 job 菜单——与 `open_api_menu.sql` 第 78/90 行删除清单**不含 110** 这一事实一致 |
| `open-api/README.md` 与仓库根 `README.md` 乱码 | 共享上下文 §2.5 | 不影响业务结论 |
| `templates/demo/**` 框架示例页占 144 个模板多数 | 共享上下文 §2.5 | 属范围排除，本文件不为其建立任何菜单或入口节点 |

---

## 8. 覆盖自检

| 检查项 | 期望 | 实际 | 状态 |
|---|---|---|---|
| 业务域节点数量 | 恰好 4 个且 ID 为 `DOM-system`、`DOM-open`、`DOM-quartz`、`DOM-common` | 4（拼写一致，见 §2 各节点主定义标题） | PASS |
| 能力分组节点数量 | ≥ 10 | 18 | PASS |
| 业务场景节点数量 | ≥ 7（含要求的全部主题） | 9 | PASS |
| 菜单节点数量 | 覆盖去重后全部 C+M 页面菜单 | 16（C 14 + M 2） | PASS（口径见 §7.1） |
| C 类菜单去重覆盖 | 14 | 14（含 `menus.json` 之外由源码补入的 `menu_id=110`） | PASS |
| M 类菜单去重覆盖 | 2 | 2 | PASS |
| F 类按钮权限登记 | 全部 50 个唯一 ID 逐条列出 | 50（39 + 11），另 7 个来自 `sql/quartz.sql` | PASS |
| 非菜单入口节点数量 | ≥ 8 | 16 | PASS |
| 非菜单入口覆盖 Shiro/J登录/验证码/注册/unauth/index/网关/自检/文件 | 全部覆盖 | 全部覆盖 | PASS |
| 场景覆盖要求主题 | 接入、鉴权限流、调用日志、管理员维护、登录权限、定时任务、操作审计 | 全部覆盖（限流仍按事实标注为未实现） | PASS |
| 业务架构总览含文字 + 表格 + 依赖方向 | 是 | §1.1 表格、§1.2 ASCII 图 + 依赖规则表、§1.3 落点表 | PASS |
| 每条结论标注证据等级 | 是 | §0.1 定义三级，各节点均带「结论级别」与「最后核验」 | PASS |
| 未定义或引用任何功能类稳定 ID | 是 | 全文不含功能类 ID 前缀字面量；功能点以「待归属功能」自然语言描述 | PASS |
| 未自建模块主定义 | 是 | 全文零模块类 `- ID:` 行；6 个模块标识以文本引用，权威定义在 `module-index.md` | PASS |
| 无「前缀-星号」占位符 | 是 | 全文已改写为自然语言，校验器不会再解析出未定义 ID | PASS |
| 跨文件引用的 ID 均有主定义 | **依赖上游产物**：`SYS-qvsu-openapi`（第 5 行）与 6 个模块标识（`MOD-open`、`MOD-system`、`MOD-quartz`、`MOD-framework`、`MOD-web`、`MOD-common`）的权威主定义分别在 `technical-architecture.md` 与 `module-index.md`，本文件仅引用 | 待上游产物落地后由 `consistency-report.md` 复核 | 待复核 |
| Markdown 链接均指向真实文件 | 是 | 全文不含 Markdown 链接；全部文件名与路径以行内代码标注，不产生 dead-link / dead-anchor 风险 | PASS |
