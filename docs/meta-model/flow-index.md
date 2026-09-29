# 端到端流程索引

本文件为 `SYS-qvsu-openapi`（QVSU OpenAPI 管理与网关服务，精简版，版本 1.0）的端到端流程索引。

- 本文档不是任何稳定 ID 前缀的主定义文件：`SYS-*` 主定义在 [技术架构](./technical-architecture.md)，`API-*` / `JOB-*` 主定义在 [接口索引](./interface-index.md)，`TBL-*` 主定义在 [数据库模型](./database-model.md)，`CFG-*` 主定义在 [配置索引](./config-index.md)，业务功能 `FUNC-*` 主定义在 [功能清单](./functional-inventory.md)。本文只引用上述文件中的 ID 文本与物理名。
- 流程编号使用 `FLOW-*` 命名，`FLOW-*` 不属于稳定 ID 前缀集合，仅为本文件内部的章节标签。
- 数据库操作列使用 R（SELECT）/ C（INSERT）/ U（UPDATE）/ D（DELETE）。
- 证据等级口径：`事实` = 直接读源码；`推断` = 由多处证据推出；`假设` = 待确认。
- 端口与服务事实：`server.port=5656`、`server.servlet.context-path=/`（证据等级：事实，`open-api/qvsu-openapi/src/main/resources/application.yml`）。
- 登录默认账号 `admin/admin123`（证据等级：事实，`open-api/README.md`；该 README 原文为乱码，账号信息来自共享上下文 `_CONTEXT-FOR-AGENTS.md` 与 `open-api/sql/` 初始化脚本）。

## 流程总览

| 流程编号 | 流程名称 | 触发方式 | 主要参与者 | 主要物理表 | 关键入口类 |
|---|---|---|---|---|---|
| FLOW-OPEN-GATEWAY | 第三方应用调用开放平台接口 | 外部 HTTP 请求 `/open/**` | 第三方应用、网关 | `open_app`、`open_api`、`open_app_api`、`open_call_log` | `OpenGatewayController`、`OpenApiFilter` |
| FLOW-ADMIN-LOGIN | 管理员登录 | 浏览器 `GET /login` + `POST /login` | 管理员、Shiro | `sys_user`、`sys_logininfor`、`sys_user_online` | `SysLoginController`、`UserRealm` |
| FLOW-RBAC-AUTHZ | 用户/角色/菜单授权 | 后台管理操作 | 管理员 | `sys_user`、`sys_role`、`sys_menu`、`sys_user_role`、`sys_role_menu`、`sys_role_dept` | `SysRoleController`、`UserRealm`、`DataScopeAspect` |
| FLOW-APP-ONBOARD | 应用接入与授权 | 后台管理操作 | 管理员、第三方应用 | `open_app`、`open_api`、`open_app_api` | `OpenAppController`、`OpenAuthController` |
| FLOW-INTERFACE-DEFINE | 接口定义维护与文档 | 后台管理操作 | 管理员 | `open_api`、`open_api_doc`、`open_app_api` | `OpenApiMgrController`、`OpenDocController` |
| FLOW-CALLLOG-QUERY | 调用日志查询与导出 | 后台页面 + 网关写入 | 管理员、网关 | `open_call_log` | `OpenLogController`、`OpenApiLogService` |
| FLOW-QUARTZ-JOB | 定时任务调度 | 启动加载 + Cron 触发 + 手工触发 | 管理员、Quartz | `sys_job`、`sys_job_log`、`QRTZ_*` | `SysJobController`、`ScheduleUtils`、`AbstractQuartzJob` |
| FLOW-SELFTEST | 开放平台自检闭环 | 外部 HTTP 请求 `/open/selftest/**` | 自检脚本/集成测试 | `open_app`、`open_api`、`open_app_api`、`open_call_log` | `OpenSelftestHttpbinController` |
| FLOW-OPER-AUDIT | 操作审计 | 被 `@Log` 注解的 Controller 方法调用 | 管理员 | `sys_oper_log` | `LogAspect`、`AsyncFactory` |
| FLOW-FILE-IO | 文件上传下载 | 页面 AJAX + 浏览器下载 | 管理员 | 无数据库表（文件系统） | `CommonController` |

---

## FLOW-OPEN-GATEWAY — 第三方应用调用开放平台接口的完整链路

### 触发方式

第三方应用以 HTTP 请求访问 `http://<host>:5656/open/{自定义路径}`。路径映射关系存储在物理表 `open_api` 的 `api_path` 列中；`OpenApiSecurityService.loadApiInfo` 用请求 URI 精确匹配 `api_path`（证据等级：事实，`open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java:261`）。

### 参与者/角色

| 角色 | 说明 | 证据等级 |
|---|---|---|
| 第三方应用（调用方） | 持 `appKey` / `appSecret`，按 HMAC-SHA256 规则签名 | 事实 |
| 开放平台网关 | `OpenApiFilter`（鉴权与日志）+ `OpenGatewayController`（转发编排） | 事实 |
| 被代理的真实业务系统 | `open_api.target_url` 指向的下游 HTTP 服务 | 事实 |
| 平台管理员 | 预先维护 `open_app`、`open_api`、`open_app_api` | 事实 |

### 参与的关键类与方法

| 步骤 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 1 | `OpenApiFilter` | `shouldNotFilter` / `doFilterInternal` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java` |
| 2 | `CachedBodyHttpServletRequest` | 构造与 `getBodyAsString` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/web/CachedBodyHttpServletRequest.java` |
| 3 | `TraceContext` | `set` / `get` / `clear` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/trace/TraceContext.java` |
| 4 | `OpenApiSecurityService` | `authenticate` / `loadApiInfo` / `loadAppInfo` / `checkNonce` / `hasPermission` / `verifySignature` / `hmacSha256Hex` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java` |
| 5 | `OpenAuthContext` | setter/getter（`appKey`、`appName`、`apiPath`、`method`、`targetUrl`、`timeoutMs`） | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/model/OpenAuthContext.java` |
| 6 | `OpenGatewayController` | `gateway` / `parseProxyBody` / `buildHeadersJson` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenGatewayController.java` |
| 7 | `OpenApiProxyService` | `forward` / `buildForwardUrl` / `copyHeaders` / `isSkipHeader` / `buildFactory` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiProxyService.java` |
| 8 | `OpenApiLogService` | `save` / `cut` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiLogService.java` |
| 9 | `OpenResult` | `ok` / `fail` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/model/OpenResult.java` |

### 链路步骤（事实）

1. **Servlet 容器过滤链（Spring Boot 自动注册的 `@Component` Filter）。** `OpenApiFilter` 继承 `OncePerRequestFilter` 并标注 `@Component`，由 Spring Boot 自动注册为 Servlet Filter；`shouldNotFilter` 判定 `!request.getRequestURI().startsWith("/open/")` 时直接放行（证据等级：事实，`OpenApiFilter.java:42-45`）。
2. **请求体缓存。** 使用 `CachedBodyHttpServletRequest` 包装请求，使请求体可被鉴权签名与转发各读一次（证据等级：事实，`OpenApiFilter.java:51`）。
3. **traceId 生成。** 优先取请求头 `X-Trace-Id`，为空时用 `UUID.randomUUID()` 生成；同时写入 `TraceContext`（ThreadLocal）与 SLF4J `MDC`，并回写响应头 `X-Trace-Id`（证据等级：事实，`OpenApiFilter.java:53-70`）。注意：调用方可自带 `X-Trace-Id`，服务端不做格式校验（证据等级：事实）。
4. **鉴权（`OpenApiSecurityService.authenticate`）。** 顺序为：
   - `normalizePath` 去掉末尾 `/`；`loadApiInfo(apiPath, method)` 查 `open_api`。
   - 先无条件按 `api_path` 查一次用于区分「路径不存在」与「已禁用」（`OpenApiSecurityService.java:266-279`）；不存在抛 `40004 api path not found`，`status != 1` 抛 `40004 api status disabled`。
   - 再按 `api_path + method + status=1` 精确查询；若未命中且请求方法非 `POST`，回退查询该路径下 `method='POST'` 的记录（**POST 兼容匹配**）（证据等级：事实，`OpenApiSecurityService.java:299-318`）。
   - 若 `need_sign = 0`，**跳过全部签名与身份校验**，构造 `appName = "anonymous"` 的上下文直接放行（证据等级：事实，`OpenApiSecurityService.java:61-72`）。
   - `need_sign = 1` 时要求请求头 `X-App-Key`、`X-Timestamp`、`X-Nonce`、`X-Sign` 全部非空，否则 `40001 missing auth headers`。
   - 时间戳容差 `ALLOW_TIME_DRIFT_MS = 5 分钟`，超差抛 `40002 timestamp expired`；`X-Timestamp` 非数字抛 `40002 timestamp format invalid`。
   - `loadAppInfo(appKey)` 查 `open_app`（条件 `app_key=? and status=1 and (expire_time is null or expire_time > now())`），查不到抛 `40001 appKey invalid or disabled`。
   - `checkNonce(appKey, nonce, now)`：基于进程内 `ConcurrentHashMap` 做一次性校验，`NONCE_EXPIRE_MS = 5 分钟`；重复抛 `40005 nonce already used`；缓存超过 100000 条时整体清理过期项。
   - `hasPermission(appInfo.id, apiInfo.id)` 查 `open_app_api` 计数，为 0 抛 `40004 api permission denied`。
   - `verifySignature`：收集 `appKey`、`timestamp`、`nonce` 与全部业务参数（Query 参数 + `Content-Type` 含 `application/json` 时的 JSON 顶层字段，剔除 `appKey/timestamp/nonce/sign/appSecret`），按 key 升序以 `k=v&k=v` 拼接后追加 `&appSecret=<secret>`，用 `appSecret` 做 HmacSHA256 取十六进制；与 `X-Sign` 忽略大小写比较，不等抛 `40003 signature verify failed`。
5. **上下文传递。** 鉴权成功后写入请求属性 `OPEN_AUTH_CONTEXT`（证据等级：事实，`OpenApiFilter.java:81`），随后 `filterChain.doFilter` 进入 Spring MVC。同一过滤器内还写入 `OPEN_TRACE_ID`。
6. **网关 Controller 转发。** `OpenGatewayController.gateway` 以 `@RequestMapping("/open/**")` 接收全部方法；先取 `OPEN_AUTH_CONTEXT` 属性，缺失时返回 `40001 鉴权上下文丢失` 并把 `OPEN_RESPONSE_BODY` / `OPEN_RESPONSE_CODE` 写回请求属性（证据等级：事实，`OpenGatewayController.java:38-54`）。
7. **下游调用。** `OpenApiProxyService.forward` 用 `SimpleClientHttpRequestFactory` 构造临时 `RestTemplate`，连接与读取超时均取 `context.timeoutMs`（缺省 5000ms）；`copyHeaders` 复制除 `host`、`content-length`、`x-app-key`、`x-timestamp`、`x-nonce`、`x-sign` 之外的请求头，并注入 `X-Trace-Id`；`buildForwardUrl` 把原始 query string 拼到 `target_url` 后（`target_url` 已含 `?` 时用 `&`）。使用调用方原始 HTTP 方法（证据等级：事实，`OpenApiProxyService.java:30-123`）。
8. **响应包装。** 下游响应体先尝试 `JSON.parse`，成功则作为结构化 `data`，失败则作为纯文本；统一包成 `OpenResult.ok(data)` 以 HTTP 200 返回，`Content-Type: application/json`，并带 `X-Trace-Id` 响应头（证据等级：事实，`OpenGatewayController.java:64-76`）。
9. **调用日志写入。** 无论成功、鉴权失败还是转发异常，`OpenApiFilter` 的 `finally` 块都会调用 `OpenApiLogService.save`，把 `traceId`、`appKey`、`appName`、`api_path`（取 `request.getRequestURI()`）、`method`、`req_body`（截断 4000 字符）、`resp_code`、`resp_body`（截断 4000）、`cost_ms`、`status`、`error_msg`（截断 4000）、`client_ip`、`call_time` 写入 `open_call_log`（证据等级：事实，`OpenApiFilter.java:99-126`、`OpenApiLogService.java:29-55`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 语句/条件 | 出处 | 证据等级 |
|---|---|---|---|---|
| `open_api` | R | `select s_id, api_path, method, status from open_api where api_path=?` | `OpenApiSecurityService.java:266` | 事实 |
| `open_api` | R | `select s_id, target_url, timeout_ms, need_sign from open_api where api_path=? and method=? and status=1 limit 1` | `OpenApiSecurityService.java:282` | 事实 |
| `open_api` | R | 同上但 `method='POST'`（兼容回退） | `OpenApiSecurityService.java:303` | 事实 |
| `open_app` | R | `select s_id, app_name, app_secret from open_app where app_key=? and status=1 and (expire_time is null or expire_time > now()) limit 1` | `OpenApiSecurityService.java:243` | 事实 |
| `open_app_api` | R | `select count(1) from open_app_api where app_id=? and api_id=?` | `OpenApiSecurityService.java:327` | 事实 |
| `open_call_log` | C | `insert into open_call_log(trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time) values(?,?,?,?,?,?,?,?,?,?,?,?,?)` | `OpenApiLogService.java:35` | 事实 |

### 成功分支与失败分支

**成功分支**：`status = 0`，HTTP 响应恒为 200，响应体形如 `{"code":0,"msg":...,"data":<下游响应>}`；`open_call_log.status = 0`。**注意：`resp_code` 记录的是 `OPEN_RESPONSE_CODE` 请求属性，`OpenGatewayController` 一律写 200，因此无法从该列还原下游真实 HTTP 状态码**（证据等级：推断，依据 `OpenGatewayController.java:68/83/94` 与 `OpenApiLogService.java:42`）。

**失败分支（错误码取自源码常量）**：

| 错误码 | 触发条件 | 抛出点 | 日志 `status` |
|---|---|---|---|
| 40001 | 缺认证头 / appKey 无效或禁用 / 鉴权上下文丢失 | `OpenApiSecurityService.java:82,97`；`OpenGatewayController.java:49` | 1 / 1 / 0 |
| 40002 | 时间戳超差或格式非法 | `OpenApiSecurityService.java:90,206` | 1 |
| 40003 | 签名不匹配 | `OpenApiSecurityService.java:142` | 1 |
| 40004 | API 路径不存在 / API 已禁用 / 应用无接口授权 | `OpenApiSecurityService.java:271,278,105` | 1 |
| 40005 | nonce 重复使用 | `OpenApiSecurityService.java:223` | 1 |
| 50001 | 请求方法不受支持 / 后端服务调用失败 / 转发异常 | `OpenApiProxyService.java:38,64,69`；`OpenGatewayController.java:92` | 2 |
| 50002 | 下游请求超时（`SocketTimeoutException` 或消息含 `timed out`） | `OpenApiProxyService.java:61` | 2 |

鉴权失败的响应由 `OpenApiFilter.writeError` 直接写出，HTTP 状态码被强制设为 200，`Content-Type: application/json;charset=UTF-8`（证据等级：事实，`OpenApiFilter.java:148-157`）。

### 幂等与事务边界

- **幂等**：网关层无幂等键。唯一性约束来自 `checkNonce` 的 `appKey:nonce` 一次性校验，其状态存于 JVM 堆内 `ConcurrentHashMap`，**多实例部署或重启后不共享，会退化为非幂等**（证据等级：事实，`OpenApiSecurityService.java:39,210-225`）。`open_call_log` 无唯一约束，`trace_id` 仅建普通索引 `idx_trace_id`，重复 traceId 会产生多行日志（证据等级：事实，`open-api/sql/open_api.sql:83`）。
- **事务边界**：`OpenApiFilter.doFilterInternal` 与 `OpenGatewayController.gateway` 均未标注事务。鉴权阶段的 3 次 SELECT 与日志的 1 次 INSERT 各自独立提交；日志 INSERT 外层 `try/catch` 吞掉异常仅打日志（证据等级：事实，`OpenApiLogService.java:51-54`）。`OpenApiSecurityService` 与 `OpenApiLogService` 使用 `JdbcTemplate` 直连数据源，不经过 MyBatis，也不参与 MyBatis/PageHelper 上下文。
- **异常吞噬**：日志写入失败不会影响主链路返回，但会静默丢失可观测性数据（证据等级：事实）。

### 证据等级

链路步骤 1–9 全为 `事实`；"多实例下 nonce 失效"与"`resp_code` 无法还原下游状态码"为 `推断`。

---

## FLOW-ADMIN-LOGIN — 管理员登录流程

### 触发方式

浏览器访问 `http://<host>:5656/login`（`server.servlet.context-path=/`），表单 POST 到同一路径。

### 参与者/角色

管理员（`sys_user`）、Shiro 安全框架、Ehcache 授权缓存、`sys_logininfor` 审计。

### 参与的关键类与方法

| 步骤 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 1 | `SysCaptchaController` | `getKaptchaImage`（`/captcha/captchaImage`）、`captchaCode`（`/captcha/captchaCode`） | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` |
| 2 | `CaptchaValidateFilter` | `onPreHandle` / `isAccessAllowed` / `validateResponse` / `onAccessDenied` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/captcha/CaptchaValidateFilter.java` |
| 3 | `SysLoginController` | `login`（GET）/ `ajaxLogin`（POST）/ `unauth` | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` |
| 4 | `UserRealm` | `doGetAuthenticationInfo` / `doGetAuthorizationInfo` / `clearCachedAuthorizationInfo` / `clearAllCachedAuthorizationInfo` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java` |
| 5 | `SysLoginService` | `login` / `setRolePermission` / `recordLoginInfo` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java` |
| 6 | `SysPasswordService` | `validate` / `matches` / `encryptPassword` / `clearLoginRecordCache` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysPasswordService.java` |
| 7 | `OnlineWebSessionManager` / `OnlineSessionDAO` / `OnlineSessionFactory` | 会话创建与持久化 | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/`、`.../shiro/session/` |
| 8 | `SpringSessionValidationScheduler` | 会话有效性轮询 | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/SpringSessionValidationScheduler.java` |
| 9 | `KickoutSessionFilter` | `isAccessAllowed`（多端登录限制） | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java` |
| 10 | `SysIndexController` | `index` / `contentMainClass` / `initPasswordIsModify` / `passwordIsExpiration` | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| 11 | `ConfigService` | `getKey`（模板用）、`SysConfigServiceImpl.selectConfigByKey` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/ConfigService.java` |

### 链路步骤

1. **GET /login。** `SysLoginController.login` 判定 `ServletUtils.isAjaxRequest`，Ajax 请求直接返回 `{"code":"1","msg":"未登录或登录超时。请重新登录"}`；否则向 `ModelMap` 放 `isRemembered`（`shiro.rememberMe.enabled`，当前 `true`）与 `isAllowRegister`（读 `sys_config` 的 `sys.account.registerUser`），渲染 `login` 模板（证据等级：事实，`SysLoginController.java:40-53`）。
2. **验证码获取。** 登录页引用 `/captcha/captchaImage`；两个验证码路径在 Shiro 过滤链中被显式设为 `anon`（证据等级：事实，`ShiroConfig.java:318-319`）。验证码类型由 `shiro.user.captchaType=math` 决定（证据等级：事实，`application.yml:105`）。
3. **POST /login 的验证码校验。** Shiro 过滤链把 `/login` 定义为 `anon,captchaValidate`（证据等级：事实，`ShiroConfig.java:329`）。`CaptchaValidateFilter.isAccessAllowed` 在 `captchaEnabled == false` 或请求方法非 `post` 时直接放行，否则调用 `validateResponse`：从 Session 取 kaptcha 值，**读取后立即 `removeAttribute`**（验证码一次性），与参数 `validateCode` 忽略大小写比较；不通过时 `onAccessDenied` 只设置请求属性 `CURRENT_CAPTCHA = CAPTCHA_ERROR` 并返回 `true`（不阻断），把拒绝判定延后到 Service 层（证据等级：事实，`CaptchaValidateFilter.java:47-78`）。
4. **Realm 认证。** `SysLoginController.ajaxLogin` 构造 `UsernamePasswordToken(username, password, rememberMe)` 并调用 `subject.login(token)`，触发 `UserRealm.doGetAuthenticationInfo`，其中委派 `SysLoginService.login`（证据等级：事实，`SysLoginController.java:55-75`、`UserRealm.java:86-133`）。
5. **业务校验（`SysLoginService.login` 顺序，事实）。**
   - 验证码错误（请求属性判定）→ 记登录失败日志 + `CaptchaException`。
   - 用户名或密码为空 → `UserNotExistsException`。
   - 密码长度不在 `UserConstants.PASSWORD_MIN_LENGTH` ~ `PASSWORD_MAX_LENGTH` → `UserPasswordNotMatchException`。
   - 用户名长度越界 → `UserPasswordNotMatchException`。
   - IP 黑名单：读 `sys_config` 键 `sys.login.blackIPList`，`IpUtils.isMatchedIp` 命中 → `BlackListException`。
   - `userService.selectUserByLoginName(username)` 查 `sys_user`；为空 → `UserNotExistsException`。
   - `del_flag` 等于 `UserStatus.DELETED` → `UserDeleteException`；`status` 等于 `UserStatus.DISABLE` → `UserBlockedException`。
   - `passwordService.validate(user, password)`。
   - 全部通过 → 记登录成功日志、`setRolePermission(user)`、`recordLoginInfo(userId)`。
6. **密码校验与重试计数。** `SysPasswordService.validate` 从 Ehcache 的 `ShiroConstants.LOGIN_RECORD_CACHE` 取 `AtomicInteger`，先 `incrementAndGet`，超过 `user.password.maxRetryCount`（当前 `5`）抛 `UserPasswordRetryLimitExceedException`；密码不符抛 `UserPasswordNotMatchException` 并回写计数；成功则 `clearLoginRecordCache`。密码算法为 `new Md5Hash(loginName + password + salt).toHex()`（证据等级：事实，`SysPasswordService.java:42-84`）。
7. **异常到 Shiro 异常的映射。** `UserRealm` 把上述自定义异常统一翻译为 Shiro 标准异常：`CaptchaException→AuthenticationException`、`UserNotExistsException→UnknownAccountException`、`UserPasswordNotMatchException→IncorrectCredentialsException`、`UserPasswordRetryLimitExceedException→ExcessiveAttemptsException`、`UserBlockedException`/`RoleBlockedException→LockedAccountException`（证据等级：事实，`UserRealm.java:102-130`）。
8. **会话创建与持久化。** `ShiroConfig.sessionManager()` 返回 `OnlineWebSessionManager`：`globalSessionTimeout = expireTime * 60 * 1000`（配置 `shiro.session.expireTime=30`，即 30 分钟）、关闭 URL 重写、设置 `OnlineSessionDAO` 与 `OnlineSessionFactory`、启用 `SpringSessionValidationScheduler` 定时校验；`shiro.session.validationInterval=10`（分钟）（证据等级：事实，`ShiroConfig.java:228-249`）。会话变更通过 `AsyncManager` 异步同步到 `sys_user_online`（证据等级：事实，`AsyncFactory.java:38-61`）。
9. **多端登录限制。** 过滤链 `/**` 段包含 `kickout`；`KickoutSessionFilter` 的 `maxSession` 取 `shiro.session.maxSession`（当前 `-1` 表示不限制），`kickoutAfter=false` 表示后者登录踢出前者，被踢后重定向 `/login?kickout=1`（证据等级：事实，`ShiroConfig.java:421-433`）。
10. **菜单与权限加载。** 登录成功后浏览器跳转 `/index`，`SysIndexController.index` 先 `clearPage()` 清除分页参数，再 `menuService.selectMenusByUser(user)` 取菜单树，并从 `sys_config` 读取 `sys.index.sideTheme`、`sys.index.skinName`、`sys.index.footer`、`sys.index.tagsView`、`sys.index.menuStyle` 等展示配置；根据 `nav-style` Cookie 决定渲染 `index` 或 `index-topnav`；同时写入 Session 属性 `CSRF_TOKEN`（证据等级：事实，`SysIndexController.java:48-94`）。
11. **菜单查询条件。** `SysMenuMapper.selectMenusByUserId` 仅返回 `menu_type in ('M','C')` 且 `m.visible='0'` 且 `ro.status='0'` 的菜单，`selectPermsByUserId` 另要求 `m.visible='0'` 且 `r.status='0'`（证据等级：事实，`open-api/qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml:32-72`）。
12. **首页与强制改密提示。** `/system/main` 渲染 `main`；`initPasswordIsModify`（`sys.account.initPasswordModify=1` 且 `pwd_update_date` 为空）与 `passwordIsExpiration`（`sys.account.passwordValidateDays`）决定是否提示（证据等级：事实，`SysIndexController.java:138-185`）。
13. **授权数据装载。** 首次需要授权判定时触发 `UserRealm.doGetAuthorizationInfo`：管理员（`user.isAdmin()`）直接获得角色 `admin` 与权限串 `*:*:*`；非管理员取 `roleService.selectRoleKeys(userId)` 与 `menuService.selectPermsByUserId(userId)`（证据等级：事实，`UserRealm.java:56-81`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `sys_user` | R | `selectUserByLoginName` 取用户、salt、password、status、del_flag | 事实 |
| `sys_user` | U | `updateLoginInfo`：更新登录 IP 与登录时间（`SysUserMapper.xml:178` 附近） | 事实 |
| `sys_config` | R | `selectConfigByKey`：`sys.login.blackIPList`、`sys.index.*`、`sys.account.*` | 事实 |
| `sys_menu` | R | `selectMenusByUserId` / `selectPermsByUserId` | 事实 |
| `sys_role` | R | `selectRoleKeys` / 角色状态 | 事实 |
| `sys_logininfor` | C | `AsyncManager` 异步插入登录日志（`SysLogininforMapper.xml:21`） | 事实 |
| `sys_user_online` | C/U | 会话同步写入在线用户表（`SysUserOnlineMapper.xml`） | 事实 |

### 成功分支与失败分支

- **成功**：`POST /login` 返回 `AjaxResult.success()`（`code=0`）；浏览器随后请求 `/index`，页面含 `/admin/open/*` 菜单链接（该断言在 `open-api/qvsu-openapi/src/test/java/com/qvsu/openapi/OpenApiManagementIntegrationTest.java:93` 与 `QuartzManagementIntegrationTest.java:54` 中出现）。
- **失败**：`SysLoginController.ajaxLogin` 捕获 `AuthenticationException`，返回 `error(msg)`，消息优先取 `e.getMessage()`，为空则用兜底文案 `用户或密码错误`。**注意：这里把 Realm 抛出的业务异常消息（含"验证码错误""密码错误次数超限"等）直接回显给前端**（证据等级：事实，`SysLoginController.java:66-74`）。
- **未认证访问受保护页面**：Shiro 跳转 `shiro.user.loginUrl=/login`；Ajax 请求由 `SysLoginController.login` 返回 `code=1` 的 JSON。
- **授权失败**：跳转 `shiro.user.unauthorizedUrl=/unauth` 或返回 `error/unauth` 视图（证据等级：事实，`GlobalExceptionHandler.java:36-49`）。

### 幂等与事务边界

- 登录本身不幂等：每次成功登录会追加一条 `sys_logininfor`，并刷新 `sys_user` 的登录时间与 IP。
- `SysLoginService.login` 与 `SysPasswordService.validate` 均未标注事务：`sys_user` 的 `updateLoginInfo` 与 `sys_logininfor` 的插入（异步）各自独立提交，登录日志可能因异步线程失败而缺失（证据等级：事实，`AsyncFactory.java:92-135`）。
- 重试计数存于 Ehcache，**进程重启即清零**，且多实例下不共享（证据等级：推断，依据 `SysPasswordService.java:29-40` 使用 `CacheManager`，`ehcache/ehcache-shiro.xml` 为本地缓存）。

### 证据等级

步骤 1–13 为 `事实`；重试计数多实例不共享为 `推断`。

---

## FLOW-RBAC-AUTHZ — 用户/角色/菜单授权流程

### 触发方式

后台管理页面操作：`/system/user`（用户管理）、`/system/role`（角色管理）、`/system/menu`（菜单管理）；以及所有带 `@RequiresPermissions` 的端点访问。

### 参与者/角色

管理员（配置方）、Shiro `Subject`（判定方）、`sys_user` / `sys_role` / `sys_menu` / 关联表（存储方）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 用户-角色绑定 | `SysUserController` | `authRole` / `insertAuthRole` | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| 角色-菜单绑定 | `SysRoleController` | `selectMenuTree` / `menuTreeData` / `editSave` | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| 角色-数据范围 | `SysRoleController` | `authDataScope` / `authDataScopeSave` | 同上 |
| 授权数据装载 | `UserRealm` | `doGetAuthorizationInfo` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java` |
| 权限集合查询 | `SysMenuServiceImpl` | `selectPermsByUserId` / `selectPermsByRoleId` / `selectMenusByUser` / `selectMenuTree` | `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysMenuServiceImpl.java` |
| 注解式校验 | `PermissionsAspect` | `doBefore` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/PermissionsAspect.java` |
| 数据范围过滤 | `DataScopeAspect` | `doBefore` / `handleDataScope` / `dataScopeFilter` / `clearDataScope` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/DataScopeAspect.java` |
| 模板权限标签 | `PermissionService` | `hasPermi` / `lacksPermi` / `hasAnyPermi` / `hasRole` / `isPermitted` / `hasAnyPermissions` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/PermissionService.java` |
| 权限失败提示 | `PermissionUtils` | `getMsg` | `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/security/PermissionUtils.java` |

### 链路步骤

1. **用户 → 角色。** `sys_user_role`（2 列）承载用户与角色的多对多关联；`SysUserController.insertAuthRole` 在 `/system/user/authRole/insertAuthRole` 提交（证据等级：事实，`open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`）。
2. **角色 → 菜单/权限。** `sys_role_menu`（2 列）承载角色与菜单的多对多关联；菜单行 `sys_menu.perms` 存权限码、`sys_menu.url` 存路由地址、`sys_menu.menu_type` 取 `M`（目录）/`C`（页面）/`F`（按钮）。`sys_menu` 共 16 列（证据等级：事实，`docs/tools/semantics.json`）。
3. **角色 → 数据范围。** `sys_role.data_scope` 取值为 1（全部）、2（自定义）、3（本部门）、4（本部门及以下）、5（仅本人）；自定义范围另用 `sys_role_dept` 存部门集合（证据等级：事实，`DataScopeAspect.java:31-51`）。
4. **授权数据装载。** `UserRealm.doGetAuthorizationInfo` 中：`user.isAdmin()` 为真则直接 `addRole("admin")` 与 `addStringPermission("*:*:*")`；否则 `info.setRoles(roleService.selectRoleKeys(userId))` 与 `info.setStringPermissions(menuService.selectPermsByUserId(userId))`（证据等级：事实，`UserRealm.java:56-81`）。
5. **`@RequiresPermissions` 校验。** 由 `ShiroConfig.authorizationAttributeSourceAdvisor` 注册 Shiro 注解通知器；注解方法调用前进入 `PermissionsAspect.doBefore`。校验不通过抛 `AuthorizationException`，由 `GlobalExceptionHandler.handleAuthorizationException` 分流：Ajax 请求返回 `AjaxResult.error(PermissionUtils.getMsg(...))`，非 Ajax 返回 `ModelAndView("error/unauth")`（证据等级：事实，`ShiroConfig.java:447-454`、`GlobalExceptionHandler.java:36-49`）。
6. **模板级权限控制。** 页面用 Thymeleaf Shiro 方言（`ShiroDialect`，`ShiroConfig.java:438-442`）与 `PermissionService` 的 `hasPermi` / `hasAnyPermi` 等方法决定按钮显隐。
7. **数据范围。** 数据过滤仅在 7 处使用 `@DataScope` 注解，全部位于系统域：`SysUserServiceImpl`（`deptAlias="d"`, `userAlias="u"`，3 处）、`SysRoleServiceImpl`（`deptAlias="d"`，1 处）、`SysDeptServiceImpl`（`deptAlias="d"`，3 处）（证据等级：事实，全库 grep `@DataScope`）。`DataScopeAspect.doBefore` 先 `clearDataScope` 清空 `params.dataScope` 防注入，再 `dataScopeFilter` 拼接 SQL 片段写入 `BaseEntity.params.get("dataScope")`，由 MyBatis 动态 SQL 拼接（证据等级：事实，`DataScopeAspect.java:58-181`）。
8. **数据范围拼接细节。** 多角色取并集（`OR` 连接）；若某角色 `data_scope=1`，清空已有条件并 `break`（最大范围优先）；若角色都不含所需权限字符，`conditions` 为空，则强制拼 `dept_id = 0` 使其查不到数据（证据等级：事实，`DataScopeAspect.java:112-157`）。
9. **权限缓存。** `UserRealm` 的授权缓存名为 `Constants.SYS_AUTH_CACHE`，由 Ehcache 管理；角色/菜单变更后需通过 `clearCachedAuthorizationInfo(Object)` 或 `clearAllCachedAuthorizationInfo()` 清理，否则权限判定沿用旧值（证据等级：事实，`ShiroConfig.java:196-203`、`UserRealm.java:138-157`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `sys_user` | R/U | 用户查询与状态/密码更新 | 事实 |
| `sys_role` | R/C/U/D | 角色定义与 `data_scope` | 事实 |
| `sys_menu` | R/C/U/D | 菜单与权限码定义；`deleteMenuById` 同时删 `menu_id = ? or parent_id = ?` | 事实 |
| `sys_user_role` | R/C/D | 用户-角色绑定 | 事实 |
| `sys_role_menu` | R/C/D | 角色-菜单绑定 | 事实 |
| `sys_role_dept` | R/C/D | 自定义数据范围的部门集合 | 事实 |
| `sys_dept` | R | `ancestors` 用于部门及以下范围（`find_in_set`） | 事实 |
| `sys_user_post` | R/C/D | 用户-岗位绑定 | 事实 |

### 成功分支与失败分支

- **成功**：`toAjax(...)` 返回 `AjaxResult`，前端表格刷新；菜单变更后需刷新缓存或重新登录才能生效（证据等级：推断，依据 `UserRealm` 的 Ehcache 授权缓存）。
- **失败**：无权限 → `AuthorizationException` → Ajax 返回 `code=500` 的 JSON 或跳 `error/unauth`；越权访问数据 → `DataScopeAspect` 拼出 `dept_id = 0` 条件返回空集（证据等级：事实）。
- **已知缺口**：`open-api/qvsu-openapi/src/main/java/com/qvsu/open/` 包下的 7 个 Controller **没有任何 `@RequiresPermissions`**（证据等级：事实，全目录 grep `RequiresPermissions` 无匹配），其页面级权限码 `open:app:view` 等只出现在菜单 SQL（`open-api/sql/open_api_menu.sql:8-26`）中，且不在 `docs/tools/assets.json` 的 `PermissionCodes`（55 个，全部为 `system:*` / `monitor:job:*`）内。参见 [变更热点与风险](./change-hotspots.md)。

### 幂等与事务边界

- `SysRoleServiceImpl`、`SysUserServiceImpl` 的角色/用户角色/角色菜单写入方法使用 `@Transactional`（证据等级：事实，`SysUserServiceImpl`、`SysRoleServiceImpl` 源码）。
- `SysMenuServiceImpl.updateMenuSort(String[], String[])` 标注 `@Transactional`（证据等级：事实）。
- 逻辑删除：`SysMenuMapper` 的 `deleteMenuById` 是**物理删除**（`delete from sys_menu where menu_id = ? or parent_id = ?`），而 `sys_user` / `sys_role` 使用 `del_flag` 逻辑删除。语义不统一（证据等级：事实，`SysMenuMapper.xml:118`）。

### 证据等级

步骤 1–9 为 `事实`；"权限变更需刷缓存"为 `推断`。

---

## FLOW-APP-ONBOARD — 应用接入与授权流程

### 触发方式

后台页面 `/admin/open/app`（应用管理）与 `/admin/open/auth`（授权管理）。

### 参与者/角色

平台管理员（配置方）、第三方应用（消费方）、网关（校验方）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 应用列表/新增/修改/删除 | `OpenAppController` | `app` / `list` / `add` / `addSave` / `edit` / `editSave` / `remove` / `resetSecret` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| 授权页与保存 | `OpenAuthController` | `page` / `apps` / `apis` / `apiIds` / `save` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| 数据访问 | `OpenManageService` | `selectAppList` / `selectAppById` / `selectAppByAppKey` / `selectUsableAppByApiId` / `insertApp` / `updateApp` / `deleteAppByIds` / `resetSecret` / `listAppOptions` / `listApiOptions` / `listAuthorizedApiIds` / `saveAppAuth` / `genAppKey` / `genAppSecret` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenManageService.java` |
| 鉴权消费 | `OpenApiSecurityService` | `loadAppInfo` / `hasPermission` / `verifySignature` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java` |
| 页面模板 | Thymeleaf | `open/app/{index,add,edit}.html`、`open/auth/index.html` | `open-api/qvsu-openapi/src/main/resources/templates/open/` |

### 链路步骤

1. **应用注册（`open_app`）。** `POST /admin/open/app/add` → `OpenManageService.insertApp`：若未提供 `appKey` 则 `genAppKey()` 生成 `ak_ + UUID(去横线)前 16 位`；若未提供 `appSecret` 则 `genAppSecret()` 生成 `sk_ + UUID(去横线)`；`status` 缺省 1；`create_time` / `update_time` 用数据库 `now()`（证据等级：事实，`OpenManageService.java:101-112,390-398`）。
2. **密钥管理。** `POST /admin/open/app/resetSecret` → `resetSecret(appId)` 生成新 secret 并 `update`；`update` 影响行数为 0 时抛 `RuntimeException("app not found")`，由 `GlobalExceptionHandler.handleRuntimeException` 转成 `AjaxResult.error`（证据等级：事实，`OpenManageService.java:136-147`）。
3. **密钥可见性。** `selectAppList` / `selectAppById` 的 SELECT 列表**包含 `app_secret`**，页面直接展示明文密钥（证据等级：事实，`OpenManageService.java:41-43,70-71`）。
4. **接口绑定（`open_app_api`）。** `GET /admin/open/auth/apps`、`/apis` 分别取 `open_app`、`open_api` 的下拉选项（均限定 `status=1`）；`GET /admin/open/auth/apiIds?appId=` 取已授权接口 ID 列表；`POST /admin/open/auth/save` → `saveAppAuth(appId, apiIds)`：**先 `delete from open_app_api where app_id=?` 再批量 `insert ... on conflict (app_id, api_id) do update set update_time=now()`**，`apiIds` 用 `distinct()` 去重（证据等级：事实，`OpenManageService.java:243-279`）。
5. **可调用接口集合。** 运行期由 `OpenApiSecurityService.hasPermission(appId, apiId)` 查 `select count(1) from open_app_api where app_id=? and api_id=?` 决定，命中即为"已授权"（证据等级：事实，`OpenApiSecurityService.java:324-332`）。
6. **有效期控制。** 应用侧条件为 `status=1 and (expire_time is null or expire_time > now())`；接口侧条件为 `status=1`（证据等级：事实，`OpenApiSecurityService.java:243,282`）。
7. **级联清理。** `deleteAppByIds(ids)` 先 `delete from open_app_api where app_id in (...)` 再 `delete from open_app where s_id in (...)`；`deleteApiByIds(ids)` 同理先删 `open_app_api` 再删 `open_api`（证据等级：事实，`OpenManageService.java:122-134,227-239`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `open_app` | C | `insert into open_app(app_name, app_key, app_secret, contact, status, expire_time, remark, create_time, update_time)` | 事实 |
| `open_app` | R | 列表/详情/下拉/鉴权查询；`s_created_time`、`s_updated_time` 由 `create_time`、`update_time` 别名映射 | 事实 |
| `open_app` | U | `updateApp`（不含 `app_key`、`app_secret`）、`resetSecret` | 事实 |
| `open_app` | D | `delete from open_app where s_id in (...)` | 事实 |
| `open_app_api` | C | 批量 `insert ... on conflict (app_id, api_id) do update` | 事实 |
| `open_app_api` | R | `listAuthorizedApiIds`、`hasPermission` 计数 | 事实 |
| `open_app_api` | D | `saveAppAuth` 先全删该应用授权；`deleteAppByIds` / `deleteApiByIds` 级联删除 | 事实 |
| `open_api` | R | 下拉选项与鉴权查询 | 事实 |
| `open_call_log` | R | `selectUsableAppByApiId` 之外无关联；日志表写入见 FLOW-OPEN-GATEWAY | 事实 |

### 成功分支与失败分支

- **成功**：`toAjax(rows)` 返回 `code=0`；`saveAppAuth` 返回 `success()`。
- **失败**：应用不存在 → `RuntimeException("app not found")` → `AjaxResult.error`；`appKey` 唯一约束冲突（DDL 中 `app_key VARCHAR(64) NOT NULL UNIQUE`）会由数据库抛异常并透传消息给前端（证据等级：推断，依据 `open-api/sql/open_api.sql:13` 与 `GlobalExceptionHandler.handleException` 的 `e.getMessage()` 回显）。
- **注意**：`saveAppAuth` 未校验 `appId` 是否存在于 `open_app`，也未校验 `apiIds` 是否存在于 `open_api`；`open_app_api` 表无外键约束（证据等级：事实，`open-api/sql/open_api.sql:47-58` 无 `FOREIGN KEY`）。

### 幂等与事务边界

- `insertApp`、`deleteAppByIds`、`saveAppAuth` 标注 `@Transactional`（证据等级：事实，`OpenManageService.java:101,122,258`）。
- `updateApp`、`resetSecret`、`insertApi` 之外的 `updateApi` **未标注** `@Transactional`（证据等级：事实，逐个方法确认）。
- `open_app_api` 上的唯一约束 `uk_app_api (app_id, api_id)`（MySQL 脚本；PostgreSQL 脚本对应 `PRIMARY KEY`/唯一索引，见 [数据库模型](./database-model.md)）使 `saveAppAuth` 的批量插入具备幂等性（证据等级：事实，`open-api/sql/open_api.sql:57`）。
- 删除-再插入模式使授权保存不是"差量更新"，并发下两个管理员同时保存会互相覆盖授权结果（证据等级：推断，依据 `saveAppAuth` 先 `delete` 后 `insert` 且无版本号/乐观锁）。

### 证据等级

步骤 1–7 为 `事实`；并发覆盖与唯一约束失败路径为 `推断`。

---

## FLOW-INTERFACE-DEFINE — 接口定义维护与文档流程

### 触发方式

后台页面 `/admin/open/api`（接口管理）与 `/admin/open/doc`（文档管理）。

### 参与者/角色

平台管理员（定义方）、下游业务系统（被代理方）、第三方应用（文档消费方）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 接口定义 CRUD | `OpenApiMgrController` | `api` / `list` / `curl` / `add` / `addSave` / `edit` / `editSave` / `remove` / `resolveBaseUrl` / `isDefaultPort` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| 文档生成与下载 | `OpenDocController` | `page` / `apis` / `html` / `list` / `generate` / `download` / `resolveBaseUrl` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| 文档渲染 | `ApiDocService` | `generateHtml(Long, List<Long>)` / `generateHtml(Long, List<Long>, String)` / `generateApiHtml` / `buildCurlExample` / `apiSection` / `esc` / `escapeSingleQuote` / `escapeDoubleQuote` / `normalizeBaseUrl` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/doc/ApiDocService.java` |
| 数据访问 | `OpenManageService` | `selectApiList` / `selectApiById` / `selectApiByPath` / `insertApi` / `updateApi` / `deleteApiByIds` / `selectDocList` / `saveDoc` / `selectApisByIds` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenManageService.java` |
| 运行期消费 | `OpenApiSecurityService` | `loadApiInfo` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java` |

### 链路步骤

1. **接口新增（`open_api`）。** `POST /admin/open/api/add` → `insertApi`：`method` 缺省 `POST`，`timeout_ms` 缺省 5000，`status` 缺省 1，`need_sign` 缺省 1；`create_time` 用 `now()`（证据等级：事实，`OpenManageService.java:199-216`）。
2. **接口修改。** `POST /admin/open/api/edit` → `updateApi` 可改 `api_path` 与 `method`，但 `updateApi` 只写 `update_time` 之外的列不变——该方法 SQL 中**未更新 `update_time`**（与 `updateApp` 不一致）（证据等级：事实，`OpenManageService.java:218-225` 对比 `114-120`）。
3. **接口删除。** `POST /admin/open/api/remove` → `deleteApiByIds`：先删 `open_app_api` 中引用该 `api_id` 的授权，再删 `open_api`（证据等级：事实，`OpenManageService.java:227-239`）。
4. **cURL 示例。** `GET /admin/open/api/curl/{id}` → `selectApiById` + `apiDocService.buildCurlExample(api, baseUrl)`；`baseUrl` 由 `resolveBaseUrl` 从 `X-Forwarded-Proto` / `X-Forwarded-Host` / `X-Forwarded-Port` 或 `request.getScheme()/getServerName()/getServerPort()` 拼装（证据等级：事实，`OpenApiMgrController.java:56-67,109-124`）。
5. **单接口 HTML 文档。** `GET /admin/open/doc/html/{apiId}`（`produces = TEXT_HTML_VALUE`）→ `ApiDocService.generateApiHtml(apiId, baseUrl)`，接口不存在时返回内嵌"接口不存在"的 HTML 页（证据等级：事实，`OpenDocController.java:53-58`、`ApiDocService.java:72-86`）。
6. **文档生成与落库。** `POST /admin/open/doc/generate` 接收 `appId` / `apiIds` / `docTitle` / `docVersion`；`Convert.toLongArray(apiIds)` 解析逗号分隔 ID；`generateHtml` 生成整篇 HTML；随后 `saveDoc` 写入 `open_api_doc`（`app_id`、`doc_title`、`doc_version`、`api_ids` 原样存字符串、`html_content` 存全文）；返回体直接把 HTML 内容回给前端（证据等级：事实，`OpenDocController.java:68-85`、`OpenManageService.java:368-373`）。
7. **文档下载。** `GET /admin/open/doc/download` 现场重新生成 HTML，以 `Content-Disposition: attachment; filename="api-doc-<日期>.html"` 输出；**整个方法体包在 `try/catch(Exception ignored) {}` 中，异常被完全吞掉**（证据等级：事实，`OpenDocController.java:87-105`）。
8. **文档列表。** `GET /admin/open/doc/list` → `selectDocList()` 查 `open_api_doc` 全表（无分页、无筛选条件）（证据等级：事实，`OpenManageService.java:361-366`）。
9. **与应用/授权的关联。** `open_api_doc.app_id` 指向 `open_app.s_id`（逻辑外键，DDL 无 `FOREIGN KEY`）；`open_api_doc.api_ids` 是逗号分隔的 `open_api.s_id` 字符串，运行期通过 `selectApisByIds(List<Long>)` 还原为对象（证据等级：事实，`open-api/sql/open_api.sql:88-101`、`OpenManageService.java:375-386`）。
10. **与网关的关联。** `open_api.api_path` 是网关的匹配键，`open_api.target_url` 是转发目标，`open_api.need_sign` 决定是否强制签名——修改这三列会直接影响运行期鉴权与转发（证据等级：事实，`OpenApiSecurityService.java:261-322`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `open_api` | C | `insert into open_api(...)`，共 11 列 | 事实 |
| `open_api` | R | 列表/详情/下拉/按路径查询/按 ID 集合查询 | 事实 |
| `open_api` | U | `update_api set api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example` | 事实 |
| `open_api` | D | `delete from open_api where s_id in (...)` | 事实 |
| `open_app_api` | D | 删除接口时级联删授权 | 事实 |
| `open_api_doc` | C | `insert into open_api_doc(app_id, doc_title, doc_version, api_ids, html_content, create_time)` | 事实 |
| `open_api_doc` | R | `selectDocList` 全表查询 | 事实 |
| `open_app` | R | 文档生成时按 `appId` 关联（逻辑外键） | 事实 |

### 成功分支与失败分支

- **成功**：`toAjax(rows)`；文档生成返回 `AjaxResult.success(html)`。
- **失败**：接口不存在 → `AjaxResult.error("接口不存在")`；`apiIds` 为空 → `Convert.toLongArray` 得空数组，生成空文档（不报错）；`open_api_doc` 插入失败会抛出并由 `GlobalExceptionHandler` 返回 `AjaxResult.error(e.getMessage())`。
- **注入面**：`selectApisByIds` 用字符串拼接构造 `where s_id in (<拼接>)`；`deleteApiByIds` / `deleteAppByIds` 同样拼接 `in (<拼接>)`。拼接内容来自 `Convert.toLongArray`，非法输入会先抛转换异常，因此实际不可注入（证据等级：推断，依据 `OpenManageService.java:126-133,236-238,381-384`）。

### 幂等与事务边界

- `insertApi`、`deleteApiByIds` 标注 `@Transactional`；`updateApi`、`saveDoc`、`selectApisByIds` 未标注（证据等级：事实）。
- `open_api.api_path` 唯一约束为 `UNIQUE`（仅 `api_path` 单列），而鉴权逻辑允许同一 `api_path` 下存在多条不同 `method` 的记录；`loadApiInfo` 用 `limit 1` 取第一条，因此**同一 `api_path` 配置多条相同 `method` 时只有一条生效**（证据等级：推断，依据 `open-api/sql/open_api.sql:30` 的 `api_path ... UNIQUE` 与 `OpenApiSecurityService.java:282` 的 `limit 1`）。**若 DDL 的 `UNIQUE` 确实建立，则无法插入第二条同路径记录，两种读法需以实际执行脚本为准**（证据等级：假设）。
- 文档生成是"每次点击生成一条新记录"，`open_api_doc` 无唯一约束也无更新入口（无 `updateDoc`），会持续累积重复文档（证据等级：事实，`OpenManageService.java:368-373` 只有 insert）。

### 证据等级

步骤 1–10 为 `事实`；`api_path` 唯一性与多方法共存的冲突为 `推断`/`假设`；SQL 注入不可达为 `推断`。

---

## FLOW-CALLLOG-QUERY — 调用日志查询流程

### 触发方式

- **写入侧**：网关请求结束时由 `OpenApiFilter` 自动写入（见 FLOW-OPEN-GATEWAY 第 9 步）。
- **读取侧**：后台页面 `/admin/open/log`。

### 参与者/角色

网关（写入方）、平台管理员（查询/导出方）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 页面 | `OpenLogController` | `logPage` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` |
| 列表与筛选 | `OpenLogController` | `list(OpenCallLog)` + `startPage()` | 同上 |
| 统计 | `OpenLogController` | `stats` | 同上 |
| 导出 | `OpenLogController` | `exportCsv` / `csv` | 同上 |
| 查询实现 | `OpenManageService` | `selectLogList` / `insertCallLog` / `queryLogStatsToday` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenManageService.java` |
| 写入实现 | `OpenApiLogService` | `save` / `cut` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiLogService.java` |
| 页面模板 | Thymeleaf | `open/log/index.html`（`var prefix = ctx + "admin/open/log"`） | `open-api/qvsu-openapi/src/main/resources/templates/open/log/index.html` |

### 链路步骤

1. **写入。** 网关 `finally` 块调用 `OpenApiLogService.save`，13 列 INSERT（`req_headers`、`resp_headers` 两列**不写**）；`req_body`、`resp_body`、`error_msg` 截断到 4000 字符；`call_time` 用 `new java.util.Date()`（证据等级：事实，`OpenApiLogService.java:34-48,57-64`）。响应头数据被 `OpenGatewayController` 写入请求属性 `OPEN_RESPONSE_HEADERS`，但 `OpenApiLogService.save` **没有读取该属性**，因此 `resp_headers` 列始终为 `NULL`（证据等级：事实，`OpenGatewayController.java:52,69,84` 与 `OpenApiLogService.java:34-48` 对比）。
2. **列表查询。** `POST /admin/open/log/list`：先 `startPage()`（PageHelper，`pagehelper.helperDialect=postgresql`），再 `selectLogList(query)`；返回 `TableDataInfo`（证据等级：事实，`OpenLogController.java:42-49`）。
3. **筛选条件。** `selectLogList` 动态拼接：`trace_id = ?`（精确）、`app_key = ?`（精确）、`api_path like '%' || ? || '%'`（模糊）、`status = ?`、`call_time >= ?`（`params.beginTime`）、`call_time <= ?`（`params.endTime`）；最后 `order by s_id desc`（证据等级：事实，`OpenManageService.java:283-328`）。
4. **详情。** 无独立详情端点，详情通过列表行内展开或 `trace_id` 精确筛选实现（证据等级：推断，依据 `OpenLogController` 只有 `logPage`/`list`/`stats`/`exportCsv` 四个映射）。
5. **统计。** `GET /admin/open/log/stats` → `queryLogStatsToday`：单条 SQL 取今日 `totalCalls`、`successCalls`（`status=0`）、`avgCost`（`round(avg(cost_ms)::numeric,2)`），再查今日按 `app_name` 分组的 Top 5；`successRate` 在 Java 侧计算后格式化为两位小数字符串（证据等级：事实，`OpenManageService.java:339-357`）。
6. **导出 CSV。** `GET /admin/open/log/exportCsv`：构造 `OpenCallLog` 查询对象（`traceId`、`appKey`、`apiPath`、`status`、`params.beginTime/endTime`）后**直接调用 `selectLogList`，未调用 `startPage()`，即全量导出**；写 UTF-8 BOM（`\uFEFF`）与表头 `traceId,appKey,appName,apiPath,method,respCode,costMs,status,errorMsg,clientIp,callTime,reqBody,respBody`；每列用 `csv()` 做双引号包裹并把 `"` 转义为 `""`、`\r`/`\n` 替换为空格（证据等级：事实，`OpenLogController.java:58-126`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `open_call_log` | C | 网关每请求 1 行；13 列 | 事实 |
| `open_call_log` | R | 列表（分页）、统计、Top5 分组、CSV 全量导出 | 事实 |
| `open_call_log` | U | 无更新入口 | 事实 |
| `open_call_log` | D | 无删除入口；仅有 `sql/open_call_log_headers_upgrade.sql` 的 DDL 变更 | 事实 |

`open_call_log` 共 22 列（证据等级：事实，`docs/tools/semantics.json`）：`s_id`、`trace_id`、`app_key`、`app_name`、`api_path`、`method`、`req_headers`、`req_body`、`resp_code`、`resp_headers`、`resp_body`、`cost_ms`、`status`、`error_msg`、`client_ip`、`call_time`、`create_time`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time`。索引：`idx_trace_id`、`idx_app_key`、`idx_call_time`（证据等级：事实，`open-api/sql/open_api.sql:83-85`）。

### 成功分支与失败分支

- **成功**：`TableDataInfo` 返回 `total` + `rows`；前端表格渲染。
- **写入失败**：`OpenApiLogService.save` 捕获全部异常仅打 `error` 日志，接口调用不受影响但日志缺失（证据等级：事实，`OpenApiLogService.java:51-54`）。
- **导出失败**：`exportCsv` 捕获异常仅打日志，浏览器可能收到空体或部分内容（证据等级：事实，`OpenLogController.java:112-115`）。
- **统计异常**：`queryLogStatsToday` 使用 PostgreSQL 专有语法 `call_time::date` 与 `round(...::numeric, 2)`，**MySQL 下会直接报语法错误**（证据等级：事实，`OpenManageService.java:344-345,354`）。
- **Excel 注入**：CSV 用双引号包裹但**未对以 `=`、`+`、`-`、`@` 开头的单元格做前缀转义**，`req_body`/`resp_body` 来自外部请求，导出文件在 Excel 中打开存在公式注入风险（证据等级：推断，依据 `OpenLogController.csv` 的实现）。

### 幂等与事务边界

- 写入侧无唯一约束、无去重，重放同一请求会追加多行（幂等由 `nonce` 在鉴权层承担，见 FLOW-OPEN-GATEWAY）。
- `selectLogList` 与 `queryLogStatsToday` 均为只读，无事务需求。
- 分页与导出的行为不一致：列表分页，导出全量，同一次筛选的两种结果集大小不同（证据等级：事实）。

### 证据等级

步骤 1–6 为 `事实`；CSV 公式注入为 `推断`；"详情靠 traceId 精确筛选"为 `推断`。

---

## FLOW-QUARTZ-JOB — 定时任务流程

### 触发方式

1. **启动加载**：`SysJobServiceImpl.init()` 标注 `@PostConstruct` 语义（`init()`），遍历 `sys_job` 全表创建 Quartz 调度。
2. **Cron 触发**：Quartz 按 `sys_job.cron_expression` 触发。
3. **手工触发**：后台页面 `/monitor/job` 的"立即执行一次" → `POST /monitor/job/run`。

### 参与者/角色

管理员（定义/启停）、Quartz `Scheduler`（调度）、`QvsuTask` / `HttpTask`（执行体）、`sys_job_log`（审计）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 任务定义 CRUD | `SysJobController` | `job` / `list` / `export` / `remove` / `detail` / `changeStatus` / `run` / `add` / `addSave` / `edit` / `editSave` / `checkCronExpressionIsValid` / `cron` / `queryCronExpression` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| 任务日志 | `SysJobLogController` | `detail` / `list` / `export` / `remove` / `clean` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| 调度服务 | `SysJobServiceImpl` | `init` / `pauseJob` / `resumeJob` / `deleteJobByIds` / `changeStatus` / `run` / `addJob` / `updateJob` / `updateSchedulerJob` / `checkCronExpressionIsValid` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobServiceImpl.java` |
| 调度工具 | `ScheduleUtils` | `createScheduleJob` / `getQuartzJobClass` / `getJobKey` / `whiteList` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/ScheduleUtils.java` |
| 抽象执行 | `AbstractQuartzJob` | `execute` / `before` / `after` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/AbstractQuartzJob.java` |
| 并发策略 | `QuartzJobExecution` / `QuartzDisallowConcurrentExecution` | `doExecute` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/` |
| 调用分发 | `JobInvokeUtil` | `invokeMethod` / `invokeHttp` / `invokeBean` / `parseHeaders` / `getMethodParams` / `isValidClassName` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/JobInvokeUtil.java` |
| Bean 任务 | `QvsuTask` | `qvsuNoParams` / `qvsuParams` / `qvsuMultipleParams` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/QvsuTask.java` |
| HTTP 任务 | `HttpTask` | `get` / `doGet` / `post` / `doPost` / `put` / `doPut` / `delete` / `doDelete` / `patch` / `doPatch` / `request` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/HttpTask.java` |
| Cron 工具 | `CronUtils` | `isValid` / `getNextExecution` / `getCronTriggerImpl` | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/CronUtils.java` |
| 调度配置 | `ScheduleConfig` | SchedulerFactoryBean | `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/config/ScheduleConfig.java` |
| SQL 映射 | `SysJobMapper.xml` / `SysJobLogMapper.xml` | `selectJobAll` / `insertJob` / `updateJob` / `insertJobLog` / `cleanJobLog` | `open-api/qvsu-openapi/src/main/resources/mapper/quartz/` |

### 链路步骤

1. **任务定义（`sys_job`，20 列）。** 列包含 `job_id`、`job_name`、`job_group`、`job_type`、`invoke_target`、`request_url`、`request_method`、`request_headers`、`request_body`、`content_type`、`timeout`、`cron_expression`、`misfire_policy`、`concurrent`、`status`、`create_by`、`create_time`、`update_by`、`update_time`、`remark`（证据等级：事实，`docs/tools/semantics.json`）。
2. **新增/修改校验。** `addSave` / `editSave` 用 `@Validated`，并在进入服务前用 `CronUtils.isValid(cronExpression)` 校验（`SysJobController.java:137,202`）。
3. **调度创建。** `SysJobServiceImpl.addJob` → `ScheduleUtils.createScheduleJob(scheduler, job)`：`getQuartzJobClass(isConcurrent)` 在 `QuartzJobExecution` 与 `QuartzDisallowConcurrentExecution` 之间选择（后者带 `@DisallowConcurrentExecution`）；`CronScheduleBuilder.cronSchedule(job.getCronExpression())`；`CronUtils.getNextExecution` 为空表示永不再触发，则创建后直接 `scheduler.pauseJob`（证据等级：事实，`ScheduleUtils.java:38,60-96`）。
4. **启动加载。** `SysJobServiceImpl.init()` 读取全部 `sys_job` 并逐个 `createScheduleJob`，把 `TaskException` 记日志而不中断启动（证据等级：事实，`SysJobServiceImpl.java:40-46`）。
5. **执行。** `AbstractQuartzJob.execute` 从 `context.getMergedJobDataMap().get(ScheduleConstants.TASK_PROPERTIES)` 拷贝出 `SysJob`，`before` 记录开始时间到 `ThreadLocal`，`doExecute` 委派 `JobInvokeUtil.invokeMethod(sysJob)`，`after` 统一写日志（证据等级：事实，`AbstractQuartzJob.java:32-113`）。
6. **任务类型分派。** `JobInvokeUtil.invokeMethod` 判断 `SysJob.JOB_TYPE_HTTP.equals(jobType)`：是则 `invokeHttp`（用 `SpringUtils.getBean(RestTemplate.class)` 发 HTTP，`request_headers` 按 JSON 解析，`request_body` 作为请求体，`content_type` 缺省 `application/json`）；否则 `invokeBean`（`getBeanName` / `getMethodName` / `getMethodParams` 解析 `invokeTarget` 字符串，如 `qvsuTask.qvsuNoParams`；`isValidClassName` 以点号数量 > 1 判定为全类名，走 `Class.forName(...).getDeclaredConstructor().newInstance()` 反射实例化）（证据等级：事实，`JobInvokeUtil.java:34-118,174-177`）。
7. **执行日志（`sys_job_log`，8 列）。** `after` 构造 `SysJobLog`：对 HTTP 任务把 `invokeTarget` 记为 `requestMethod + " " + requestUrl`；`jobMessage` 记录 `"<jobName> 总共耗时：<runMs>毫秒"`；异常时 `status = Constants.FAIL` 且 `exception_info` 截断 2000 字符，正常 `status = Constants.SUCCESS`；通过 `SpringUtils.getBean(ISysJobLogService.class).addJobLog(...)` 写入，写入失败仅打日志（证据等级：事实，`AbstractQuartzJob.java:72-113`、`SysJobLogMapper.xml:76`）。
8. **暂停/恢复。** `POST /monitor/job/changeStatus` → `changeStatus` 根据 `status` 调用 `pauseJob` 或 `resumeJob`；两者都标注 `@Transactional(rollbackFor = Exception.class)`，内部调用 `scheduler.pauseJob` / `scheduler.resumeJob` 并更新 `sys_job.status`（证据等级：事实，`SysJobServiceImpl.java:80-168`）。
9. **立即执行。** `POST /monitor/job/run` → `SysJobServiceImpl.run(job)`：直接以 `scheduler.triggerJob` 方式触发一次（不再等待 Cron），返回布尔值给 `SysJobController.run` 转成 `AjaxResult`（证据等级：事实，`SysJobServiceImpl.java:179-180`、`SysJobController.java:112`）。
10. **删除。** `POST /monitor/job/remove` → `deleteJobByIds` 标注 `@Transactional(rollbackFor = Exception.class)`，先 `scheduler.deleteJob` 再从 `sys_job` 删除（证据等级：事实，`SysJobServiceImpl.java:140-141`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `sys_job` | R | `selectJobAll`（启动加载）、列表查询、详情 | 事实 |
| `sys_job` | C | `insertJob`（`SysJobMapper.xml:137` 附近，含 `now()`） | 事实 |
| `sys_job` | U | `updateJob`（`SysJobMapper.xml:94` 附近，含 `update_time = now()`） | 事实 |
| `sys_job` | D | 删除任务 | 事实 |
| `sys_job_log` | R | 日志列表/详情/导出 | 事实 |
| `sys_job_log` | C | `insert into sys_job_log(...) values(..., now())` | 事实 |
| `sys_job_log` | D | `remove` 与 `cleanJobLog`（清空） | 事实 |
| `QRTZ_*`（11 张） | R/C/U/D | Quartz 自带表：`QRTZ_JOB_DETAILS`、`QRTZ_TRIGGERS`、`QRTZ_CRON_TRIGGERS`、`QRTZ_SIMPLE_TRIGGERS`、`QRTZ_BLOB_TRIGGERS`、`QRTZ_CALENDARS`、`QRTZ_PAUSED_TRIGGER_GRPS`、`QRTZ_FIRED_TRIGGERS`、`QRTZ_SCHEDULER_STATE`、`QRTZ_LOCKS`、`QRTZ_SIMPROP_TRIGGERS` | 事实 |

### 成功分支与失败分支

- **成功**：`after` 以 `status=SUCCESS` 写 `sys_job_log`；`changeStatus` / `run` 返回 `AjaxResult.success`。
- **失败**：`AbstractQuartzJob.execute` 捕获 `Exception`，`after(context, sysJob, e)` 写 `status=FAIL` 与 `exception_info`；`doExecute` 抛出的异常不会再向上传播（证据等级：事实，`AbstractQuartzJob.java:48-52`）。
- **Cron 非法**：`CronUtils.isValid` 返回 false 时新增/修改被拒绝（证据等级：事实）。
- **任务目标非法**：`JobInvokeUtil.invokeBean` 对不存在的 Bean 名抛 `NoSuchBeanDefinitionException`，对不存在的全类名抛 `ClassNotFoundException`，均被 `execute` 捕获并落库为失败（证据等级：事实）。
- **反射面**：`invokeTarget` 允许以全限定类名 + 方法名任意反射实例化并调用（`isValidClassName` 只判断点号数量），**只要能把记录写进 `sys_job` 即可触发任意类加载**；`/monitor/job` 端点带 `@RequiresPermissions("monitor:job:add")`，但 `checkCronExpressionIsValid`、`cron`、`queryCronExpression` 三个端点不带权限码（证据等级：事实，`SysJobController.java:249-272`）。

### 幂等与事务边界

- `pauseJob`、`resumeJob`、`changeStatus`、`deleteJobByIds`、`run`、`addJob`、`updateJob`、`updateSchedulerJob` 均标注 `@Transactional(rollbackFor = Exception.class)`（证据等级：事实，`SysJobServiceImpl.java` 逐方法确认）。
- **数据库事务与 Quartz Scheduler 状态不在同一事务域**：`scheduler.pauseJob` / `resumeJob` / `deleteJob` 直接操作 `QRTZ_*` 表，若外围事务回滚，Scheduler 侧变更可能已生效（证据等级：推断，依据方法内先操作 Scheduler 再写 `sys_job`，且 Scheduler 使用独立事务）。
- 任务执行本身不幂等：`misfirePolicy` 决定错失触发的补偿策略（`ScheduleConstants.MISFIRE_DEFAULT` 为 `SysJob` 字段默认值），需按业务语义配置（证据等级：事实，`SysJob.java:80`）。
- `concurrent='0'` 时由 `QuartzDisallowConcurrentExecution` 阻止同任务并发执行；`concurrent='1'` 时允许并发（证据等级：事实，`ScheduleUtils.java:38`）。

### 证据等级

步骤 1–10 为 `事实`；事务与 Scheduler 状态不一致为 `推断`。

---

## FLOW-SELFTEST — 开放平台自检闭环

### 触发方式

1. **外部 HTTP 请求**：`/open/selftest/**` 走完整网关链路。
2. **集成测试**：`OpenApiManagementIntegrationTest.shouldProxyHttpbinCategories` 以真实 HTTP 调用自检。
3. **种子数据**：执行 `open-api/sql/open_api_selftest_seed.sql` 或 `open-api/sql/open_api_httpbin_min_seed.sql`。

### 参与者/角色

本地自检桩（`OpenSelftestHttpbinController`）、网关链路、种子数据脚本、JUnit 集成测试。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 本地自检桩 | `OpenSelftestHttpbinController` | `get` / `post` / `put` / `delete` / `headers` / `ip` / `userAgent` / `uuid` / `timeout` / `parseBody` | `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| 自检种子 | SQL | `open-api/sql/open_api_selftest_seed.sql` | `open-api/sql/open_api_selftest_seed.sql` |
| 最小回归种子 | SQL | `open-api/sql/open_api_httpbin_min_seed.sql` | `open-api/sql/open_api_httpbin_min_seed.sql` |
| 集成测试 | JUnit | `OpenApiManagementIntegrationTest.runProxySuite` / `callOpenApi` / `sign` / `hmacSha256Hex` | `open-api/qvsu-openapi/src/test/java/com/qvsu/openapi/OpenApiManagementIntegrationTest.java` |
| 自动验证码测试 | JUnit | `AutoCaptchaLoginIntegrationTest` | `open-api/qvsu-openapi/src/test/java/com/qvsu/openapi/AutoCaptchaLoginIntegrationTest.java` |

### 自检桩端点

| 方法 | 路径 | 返回内容 |
|---|---|---|
| GET | `/selftest/httpbin/get` | `args`：`request.getParameterMap()` 转 Map |
| POST | `/selftest/httpbin/post` | `json`：请求体解析结果 |
| PUT | `/selftest/httpbin/put` | `json`：请求体解析结果 |
| DELETE | `/selftest/httpbin/delete` | `json`：手动读 `request.getInputStream()` 后解析 |
| GET | `/selftest/httpbin/headers` | `headers.X-Trace-Id`：来自请求头 `x-trace-id` |
| GET | `/selftest/httpbin/ip` | `origin`：`request.getRemoteAddr()` |
| GET | `/selftest/httpbin/user-agent` | `user-agent` 请求头 |
| GET | `/selftest/httpbin/uuid` | 随机 UUID |
| GET | `/selftest/httpbin/timeout` | `Thread.sleep(3000L)` 后返回 `{"status":"ok"}` |

（证据等级：事实，`OpenSelftestHttpbinController.java:24-106`）

### 链路步骤

1. **自检桩免认证。** Shiro 过滤链显式把 `/selftest/**` 设为 `anon`（证据等级：事实，`ShiroConfig.java:334`）；`OpenApiFilter.shouldNotFilter` 只拦截 `/open/` 前缀，因此 `/selftest/**` 不触发网关鉴权（证据等级：事实，`OpenApiFilter.java:42-45`）。
2. **种子应用。** `open_api_selftest_seed.sql` 先删除后插入固定主键数据：应用 `s_id=90001`，`app_key='ak_selftest_demo'`，`app_secret='sk_selftest_demo_1234567890abcdef'`，`status=1`，`expire_time=NULL`（证据等级：事实，`open-api/sql/open_api_selftest_seed.sql:5-10`）。
3. **种子接口（5 条）。**
   - `90001 /open/selftest/success` GET → `http://127.0.0.1:80/common/captchaImage`（成功链路，转发到本机匿名接口）。
   - `90002 /open/selftest/timeout` GET → `http://10.255.255.1:81/timeout`，`timeout_ms=1500`（用于触发超时错误码 50002）。
   - `90003 /open/selftest/httpbin/get` GET → `https://httpbin.org/get`，`timeout_ms=6000`。
   - `90004 /open/selftest/httpbin/post` POST → `https://httpbin.org/post`，`timeout_ms=6000`。
   - `90005 /open/selftest/httpbin/headers` GET → `https://httpbin.org/headers`，`timeout_ms=6000`。
4. **授权集合。** 仅授权 `90001`、`90003`、`90004`、`90005`，**故意不授权 `90002`**，用于验证无权限错误码 40004（证据等级：事实，`open-api/sql/open_api_selftest_seed.sql:37-42` 的注释与插入行）。
5. **闭合回路。** 自检时，外部请求 `/open/selftest/httpbin/get?demo=1&category=get` 经 `OpenApiFilter` 鉴权 → `OpenGatewayController` 转发到 `target_url` → 若 `target_url` 指向本机 `/selftest/httpbin/*` 则形成"自己调自己"的闭环，`/selftest/**` 因 `anon` 而无需签名，`X-Trace-Id` 由网关注入并在桩的 `headers` 端点回显（证据等级：事实，`OpenApiProxyService.java:43`、`OpenSelftestHttpbinController.java:65-73`）。
6. **测试断言。** `OpenApiManagementIntegrationTest.runProxySuite` 覆盖 8 个分类：GET 参数回显、POST JSON 回显、PUT JSON 回显、DELETE JSON 回显、headers 含 `X-Trace-Id`、ip 含 `origin`、user-agent、uuid，以及 timeout 分类断言 `code == 50002`（证据等级：事实，`OpenApiManagementIntegrationTest.java:102-210`）。
7. **测试前置条件。** 该测试以 `System.getProperty("openapi.test.baseUrl", "http://localhost:5656")` 为基址，需要一个已启动且已灌入种子数据的实例；`shouldLoginAndSeeOpenApiMenusWhenCaptchaProvided` 通过 `Assumptions.assumeTrue` 在未提供 `openapi.test.captchaCode` 时跳过（证据等级：事实，`OpenApiManagementIntegrationTest.java:35-62`）。
8. **测试数据库端口差异。** 测试配置 `open-api/qvsu-openapi/src/test/resources/application-druid.yml` 指向 `jdbc:postgresql://localhost:5433/jd_openapi`，与主配置的 `5432` 不同；`QuartzManagementIntegrationTest` 还会从 `deploy/local-docker/postgres/init` 脚本装载 Quartz 数据并断言 `spring.datasource.druid.master.url` 等测试属性（证据等级：事实，`open-api/qvsu-openapi/src/test/resources/application-druid.yml:7`、`QuartzManagementIntegrationTest.java:30-34,119`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `open_app` | D/C | 种子脚本先删 `s_id=90001` 再插入（幂等初始化） | 事实 |
| `open_api` | D/C | 先删 `s_id in (90001..90005)` 再插入 | 事实 |
| `open_app_api` | D/C | 先删 `app_id=90001` 的授权再插入 4 条 | 事实 |
| `open_app`/`open_api`/`open_app_api`/`open_call_log` | R/C | 自检调用经网关产生上述 SELECT 与 `open_call_log` INSERT | 事实 |

### 成功分支与失败分支

- **成功**：`code=0`，`data` 为下游响应对象；对应 `open_call_log.status=0`。
- **超时**：`/open/selftest/timeout` 目标不可达且 `timeout_ms=1500`，返回 `code=50002`；`open_call_log.status=2`。
- **无授权**：调用 `90002` 虽未授权，但超时链路的失败可能先于权限判定或后于权限判定——按代码顺序 `hasPermission` 在 `verifySignature` 之前、且都在 `loadApiInfo` 之后，因此**未授权应用调用 `90002` 会先得到 40004 而非 50002**（证据等级：推断，依据 `OpenApiSecurityService.java:100-108` 的调用顺序）。
- **外部依赖**：`90003`–`90005` 的目标为公网 `httpbin.org`，**离线或无法访问外网时自检会以 50001/50002 失败**；`open_api_httpbin_min_seed.sql` 同样指向 `https://httpbin.org/*`，并**不**使用本地 `/selftest/httpbin/*` 作为目标（证据等级：事实，`open-api/sql/open_api_httpbin_min_seed.sql:19-24`）。这构成"自检脚本本意是避免外部网络依赖，但种子数据仍指向公网"的缺口（证据等级：推断）。

### 幂等与事务边界

- 种子脚本可重复执行（先 `DELETE` 后 `INSERT`，`open_api_selftest_seed.sql` 开头注释声明"幂等"）；`open_api_httpbin_min_seed.sql` 对 `open_app` 使用 `ON DUPLICATE KEY UPDATE`，对 `open_app_api` 使用 `ON DUPLICATE KEY UPDATE`——**`ON DUPLICATE KEY UPDATE` 是 MySQL 语法，PostgreSQL 不支持**（证据等级：事实，`open-api/sql/open_api_httpbin_min_seed.sql:10-15,31`）。
- 无事务封装：脚本以独立语句执行，中途失败会留下不一致状态（例如应用已更新但接口未插入）（证据等级：推断）。

### 证据等级

自检桩端点表与步骤 1–8 为 `事实`；步骤 8 的失败顺序、离线失败、脚本幂等结论为 `推断`。

---

## FLOW-OPER-AUDIT — 操作审计流程

### 触发方式

任意标注 `@Log(title=..., businessType=...)` 的 Controller 方法被调用。已确认使用该注解的位置包括：`OpenAppController`（`Open应用` INSERT/UPDATE/DELETE）、`OpenApiMgrController`（`Open接口` INSERT/UPDATE/DELETE）；`@Log` 注解定义在 `open-api/qvsu-openapi/src/main/java/com/qvsu/common/annotation/Log.java`（证据等级：事实）。

### 参与者/角色

被审计的管理员（`ShiroUtils.getSysUser()`）、`LogAspect`（采集方）、`AsyncFactory`（异步落库）、`sys_oper_log`（存储）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 切面 | `LogAspect` | `doBefore` / `doAfterReturning` / `doAfterThrowing` / `handleLog` / `getControllerMethodDescription` / `setRequestValue` / `excludePropertyPreFilter` / `argsArrayToString` / `isFilterObject` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/LogAspect.java` |
| 异步工厂 | `AsyncFactory` | `recordOper` / `recordLogininfor` / `syncSessionToDb` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/factory/AsyncFactory.java` |
| 异步管理器 | `AsyncManager` | `me` / `execute` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/AsyncManager.java` |
| 日志领域对象 | `SysOperLog` | setter/getter | `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysOperLog.java` |
| SQL 映射 | `SysOperLogMapper.xml` | `insertOperlog` / `selectOperLogList` / `cleanOperLog` | `open-api/qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` |

### 链路步骤

1. **进入切面。** `@Before(value = "@annotation(controllerLog)")` 把 `System.currentTimeMillis()` 存入 `ThreadLocal`（`NamedThreadLocal<Long>("Cost Time")`）（证据等级：事实，`LogAspect.java:56-60`）。
2. **返回后/异常时统一处理。** `@AfterReturning` 与 `@AfterThrowing` 都调用 `handleLog`；成功时 `jsonResult` 非空，失败时 `e` 非空（证据等级：事实，`LogAspect.java:67-83`）。
3. **组装 `SysOperLog`。** 取当前用户（`ShiroUtils.getSysUser()`）、IP（`ShiroUtils.getIp()`）、`oper_url`（请求 URI 截断 255）、`oper_name`、`dept_name`、`method`（`目标类名.方法名()`）、`request_method`；异常时 `status = BusinessStatus.FAIL` 且 `error_msg` 截断 2000；`cost_time` 为 `当前时间 - ThreadLocal 开始时间`（证据等级：事实，`LogAspect.java:85-124`）。
4. **参数采集。** `isSaveRequestData()` 为真时：优先取 `request.getParameterMap()` 序列化为 JSON（应用 `PropertyPreFilters` 排除 `password`、`oldPassword`、`newPassword`、`confirmPassword` 与注解声明的 `excludeParamNames`）；参数表为空时回退到 `joinPoint.getArgs()` 拼接，跳过 `MultipartFile`、`HttpServletRequest`、`HttpServletResponse`、`BindingResult` 以及元素为 `MultipartFile` 的集合/Map；最终截断 2000 字符（证据等级：事实，`LogAspect.java:155-264`）。
5. **响应采集。** `isSaveResponseData()` 为真且 `jsonResult` 非空时，写入 `json_result` 截断 2000（证据等级：事实，`LogAspect.java:161-164`）。
6. **异步落库。** `AsyncManager.me().execute(AsyncFactory.recordOper(operLog))`：`recordOper` 返回 `TimerTask`，在异步线程内先用 `AddressUtils.getRealAddressByIP` 补 `oper_location`，再 `SpringUtils.getBean(ISysOperLogService.class).insertOperlog(operLog)`（证据等级：事实，`AsyncFactory.java:69-81`）。
7. **异常吞噬。** 整个 `handleLog` 包在 `try/catch(Exception exp)` 中，异常仅 `log.error` 并 `printStackTrace()`，**不影响业务方法返回**（证据等级：事实，`LogAspect.java:127-136`）。
8. **ThreadLocal 清理。** `finally` 中 `TIME_THREADLOCAL.remove()`，避免线程池串号（证据等级：事实，`LogAspect.java:133-136`）。

### 涉及的物理表与 R/C/U/D

| 物理表 | 操作 | 说明 | 证据等级 |
|---|---|---|---|
| `sys_oper_log` | C | `insert into sys_oper_log(..., cost_time, now())`（17 列） | 事实 |
| `sys_oper_log` | R | 后台操作日志查询（本仓库已移除 `monitor/operlog` 菜单，见 `open-api/sql/open_api_menu.sql:64-90`） | 事实 |
| `sys_logininfor` | C | 同一 `AsyncFactory` 也负责登录日志（见 FLOW-ADMIN-LOGIN） | 事实 |
| `sys_user_online` | C/U | 同一 `AsyncFactory` 也负责在线会话同步 | 事实 |

### 成功分支与失败分支

- **成功**：`sys_oper_log` 新增一行，`status` 为成功枚举序号。
- **业务方法抛异常**：`@AfterThrowing` 分支写入 `status=失败` 与 `error_msg`。
- **切面自身异常**：仅本地日志，数据库无记录。
- **异步线程异常**：`AsyncManager` 的定时器任务异常不会回传主线程，日志可能静默丢失（证据等级：推断，依据 `AsyncManager`/`AsyncFactory` 使用 `TimerTask` 且无回调）。

### 幂等与事务边界

- 审计写入在独立线程与独立事务中完成，**与业务事务完全解耦**：业务回滚时审计记录仍可能落库（记录的是"曾尝试执行"），业务成功时审计也可能因异步失败而缺失（证据等级：事实，`LogAspect.java:125` + `AsyncFactory.java:69-81`）。
- `ThreadLocal` 只保存开始时间戳；若同一线程嵌套调用多个 `@Log` 方法，内层 `doBefore` 会覆盖外层值，导致外层 `cost_time` 偏小（证据等级：推断，依据 `TIME_THREADLOCAL` 为单值且 `doBefore` 无嵌套保护）。
- 该切面只覆盖标注 `@Log` 的方法：`open` 包中 `OpenLogController`、`OpenAuthController`、`OpenDocController` 的写操作（含授权保存、文档生成）**没有 `@Log`**，因此不产生操作审计（证据等级：事实，逐个 Controller 确认）。

### 证据等级

步骤 1–8 为 `事实`；异步丢失与嵌套覆盖为 `推断`。

---

## FLOW-FILE-IO — 文件上传下载流程

### 触发方式

- 上传：页面 AJAX `POST /common/upload`（单文件）或 `POST /common/uploads`（多文件）。
- 下载：`GET /common/download?fileName=...&delete=...` 与 `GET /common/download/resource?resource=...`。

### 参与者/角色

管理员（操作方）、本地文件系统（存储）、`ServerConfig`（URL 前缀）、`QvsuConfig`（路径配置）。

### 参与的关键类与方法

| 环节 | 类 | 方法 | 文件路径 |
|---|---|---|---|
| 控制器 | `CommonController` | `fileDownload` / `uploadFile` / `uploadFiles` / `resourceDownload` | `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| 上传工具 | `FileUploadUtils` | `upload(String, MultipartFile)` | `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUploadUtils.java` |
| 文件工具 | `FileUtils` | `checkAllowDownload` / `setAttachmentResponseHeader` / `writeBytes` / `deleteFile` / `getName` / `stripPrefix` | `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUtils.java` |
| 路径与 URL 配置 | `QvsuConfig` / `ServerConfig` | `getUploadPath` / `getDownloadPath` / `getProfile` / `getUrl` | `open-api/qvsu-openapi/src/main/java/com/qvsu/common/config/QvsuConfig.java`、`ServerConfig.java` |
| 静态资源映射 | `ResourcesConfig` | `addResourceHandlers` | `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ResourcesConfig.java` |
| 异常类型 | `FileException` 系列 | `FileSizeLimitExceededException` / `FileNameLengthLimitExceededException` / `InvalidExtensionException` / `FileUploadException` | `open-api/qvsu-openapi/src/main/java/com/qvsu/common/exception/file/` |

### 链路步骤

1. **上传路径解析。** `QvsuConfig.getUploadPath()` 基于 `qvsu.profile`（当前 `D:/qvsu/uploadPath`，Windows 风格路径）（证据等级：事实，`application.yml:12`）。
2. **上传落盘。** `FileUploadUtils.upload(filePath, file)` 做文件名与后缀校验并返回 `fileName`；`serverConfig.getUrl() + fileName` 拼成可访问 URL（证据等级：事实，`CommonController.java:82-90`）。
3. **静态资源映射。** `ResourcesConfig.addResourceHandlers` 把 `Constants.RESOURCE_PREFIX + "/**"` 映射到 `file:<QvsuConfig.getProfile()>/`，使上传文件可通过 HTTP 直接访问（证据等级：事实，`ResourcesConfig.java:51-58`）。
4. **多文件上传。** `uploadFiles(List<MultipartFile>)` 循环调用 `FileUploadUtils.upload`，用 `,` 连接各字段返回 `urls`、`fileNames`、`newFileNames`、`originalFilenames`（证据等级：事实，`CommonController.java:99-135`）。
5. **通用下载。** `fileDownload`：先 `FileUtils.checkAllowDownload(fileName)` 校验；下载名改为 `System.currentTimeMillis() + fileName.substring(fileName.indexOf("_") + 1)`（依赖文件名含 `_` 分隔符）；从 `QvsuConfig.getDownloadPath() + fileName` 读字节写入响应；`delete` 为真时下载后删除源文件（证据等级：事实，`CommonController.java:46-70`）。
6. **资源下载。** `resourceDownload`：`checkAllowDownload(resource)` 后，`QvsuConfig.getProfile() + FileUtils.stripPrefix(resource)` 组成本地路径，文件名取路径最后一段（证据等级：事实，`CommonController.java:140-163`）。
7. **上传大小限制。** `spring.servlet.multipart.max-file-size=10MB`、`max-request-size=20MB`（证据等级：事实，`application.yml:68-71`）。
8. **异常处理。** 上传异常被 `catch (Exception e)` 转成 `AjaxResult.error(e.getMessage())`；两个下载方法也各自 `try/catch` 只写日志（证据等级：事实，`CommonController.java:66-69,93-96,131-134,159-162`）。

### 涉及的物理表与 R/C/U/D

无数据库表参与。文件元数据不落库，仅返回 URL 给前端；业务表若需引用则自行存储 URL 字符串（例如 `open_api_doc.html_content` 存 HTML 全文而非文件路径）（证据等级：事实）。

### 成功分支与失败分支

- **成功**：上传返回含 `url`/`fileName`/`newFileName`/`originalFilename` 的 `AjaxResult`；下载设置 `Content-Type: application/octet-stream` 与附件响应头。
- **失败**：文件名非法（`checkAllowDownload` 拒绝）抛异常；单文件上传返回 `AjaxResult.error`；两个下载方法**不向前端返回错误，只写服务端日志**，浏览器收到空响应（证据等级：事实）。
- **下载是 Shiro 保护路径。** `/common/**` 不在 `anon` 白名单内，落入 `/**` 段的 `user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter`，因此需要登录；但**没有任何 `@RequiresPermissions`**（证据等级：事实，`ShiroConfig.java:306-349`、`CommonController` 源码无权限注解）。
- **XSS 过滤不覆盖。** `xss.urlPatterns=/system/*,/tool/*`，`/common/**` 不在其中（证据等级：事实，`application.yml:139`）。

### 幂等与事务边界

- 上传非幂等：同文件重复上传会生成多个物理文件。
- 无事务：文件系统写入与任何数据库写入不在同一事务中；`/common/upload` 本身不写数据库（证据等级：事实）。
- `delete=true` 的下载是"读后删"，重复调用第二次会失败（证据等级：事实，`CommonController.java:61-64`）。
- `QvsuConfig.getUploadPath()` 与 `getDownloadPath()` 的目录关系未在本流程中展开，需结合 [配置索引](./config-index.md) 的 `qvsu.profile` 条目确认（证据等级：假设）。

### 证据等级

步骤 1–8 为 `事实`；上传/下载目录关系为 `假设`。

---

## 流程间的依赖关系

| 前置流程 | 后置流程 | 依赖内容 | 证据等级 |
|---|---|---|---|
| FLOW-ADMIN-LOGIN | FLOW-RBAC-AUTHZ | 登录后才装载角色与权限集合 | 事实 |
| FLOW-RBAC-AUTHZ | FLOW-APP-ONBOARD / FLOW-INTERFACE-DEFINE / FLOW-CALLLOG-QUERY / FLOW-QUARTZ-JOB | 后台管理页面依赖菜单与权限（`open:*` 权限码未在代码侧校验，实际仅由菜单可见性约束） | 事实 |
| FLOW-APP-ONBOARD | FLOW-OPEN-GATEWAY | `open_app` + `open_app_api` 决定鉴权与授权判定结果 | 事实 |
| FLOW-INTERFACE-DEFINE | FLOW-OPEN-GATEWAY | `open_api.api_path` / `target_url` / `need_sign` / `timeout_ms` 决定路由、转发与是否强制签名 | 事实 |
| FLOW-OPEN-GATEWAY | FLOW-CALLLOG-QUERY | 每次网关请求在 `finally` 写入一条 `open_call_log` | 事实 |
| FLOW-SELFTEST | FLOW-OPEN-GATEWAY | 自检请求走完整网关链路，并依赖种子应用/接口/授权 | 事实 |
| FLOW-OPER-AUDIT | FLOW-APP-ONBOARD / FLOW-INTERFACE-DEFINE | 仅带 `@Log` 的写操作产生 `sys_oper_log`；授权保存与文档生成未加 `@Log`，存在审计盲区 | 事实 |
| FLOW-QUARTZ-JOB | FLOW-OPEN-GATEWAY | `HttpTask` / `invokeHttp` 可发起任意外部 HTTP 调用，与网关共用 `RestTemplate` 能力 | 事实 |

## 未覆盖与待确认项

| 项 | 说明 | 证据等级 |
|---|---|---|
| `/open/**` 之外的匿名开放接口 | `/selftest/**`、`/captcha/**`、静态资源均 `anon`；`PermitAllUrlProperties` 扫描 `@Anonymous` 注解，但全库无 `@Anonymous` 使用，故白名单实际为空 | 事实 |
| 注册流程 | `/register` 定义在过滤链 `anon,captchaValidate`，由 `SysRegisterController` 承接；本文未展开（可用性受 `sys.account.registerUser` 配置控制） | 推断 |
| `CsrfValidateFilter` | 过滤链中挂在 `/**` 段，但 `csrf.enabled=false` 使其实际禁用 | 事实 |
| `XssFilter` | `xss.enabled=true`，但 `urlPatterns` 仅 `/system/*,/tool/*`，`/open/**`、`/admin/open/**`、`/selftest/**`、`/common/**` 均不过滤 | 事实 |
| 密码锁定与解锁 | `sys_user` 的密码重试计数存于 Ehcache 而非数据库，重启即失效；`sys_logininfor` 中"解锁"端点对应的菜单已在 `open-api/sql/open_api_menu.sql:64-90` 中被删除 | 事实 |
| `OpenApiFilter` 注册顺序 | `OpenApiFilter` 为 `@Component`，未设置 `@Order` 或 `FilterRegistrationBean`；`XssFilter` 使用 `FilterRegistrationBean.HIGHEST_PRECEDENCE`。两者相对顺序未在源码中显式声明 | 假设 |
| 在线会话表 `sys_user_online` | `OnlineSessionDAO` 与会话同步细节未逐行核对 | 假设 |
