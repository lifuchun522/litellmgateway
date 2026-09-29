# 公共能力索引（Common Capability Index）

- 产物职责：本文件是 `COMMON-*` 与 `CSI-*` 稳定 ID 的**唯一主定义文件**。其他文件只能引用，不得重复定义。
- 输出语言：中文（zh-CN）；稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键保持源码原文。
- 逆向范围：`open-api/`（Spring Boot 2.x 单体应用 `SYS-qvsu-openapi`，Shiro + MyBatis + Thymeleaf + Quartz + Ehcache）。
- 最后核验：2026-02-14，依据 `open-api/qvsu-openapi/src/main/java/com/qvsu/**`、`open-api/qvsu-openapi/src/main/resources/**`、`open-api/sql/**`、`open-api/deploy/local-docker/**/init/*.sql`。
- 证据等级：`事实`＝直接读源码/配置/DDL；`推断`＝由多处证据推出；`假设`＝待确认。

## 判定口径与总览

判定规则（依据技能 `common-capabilities.md` 第 2 节）：满足「被三个或以上业务模块调用 / 有独立接口或 Starter / 有自己的配置或表或运维责任 / 被业务功能当作横切前置或后置能力」之一即作为公共能力候选。通用工具类不自动等于公共能力。

| COMMON ID | 能力名 | 状态 | 提供者包（所有者） | 结论级别 | 是否有自有表/Topic | 接口形态 |
|---|---|---|---|---|---|---|
| COMMON-authentication | 身份认证与登录会话 | active | `com.qvsu.framework.shiro.*`、`com.qvsu.web.controller.system` | 事实 | 是（`sys_user_online`） | Filter / Realm / REST / Session |
| COMMON-permission | 授权与权限 | active（OpenAPI 域存在未落地缺口） | `com.qvsu.framework.aspectj.PermissionsAspect`、`UserRealm`、`com.qvsu.framework.web.service.PermissionService` | 事实 | 是（`sys_role_menu`、`sys_user_role`、`sys_role_dept`） | Annotation / AOP / Thymeleaf / JS |
| COMMON-tenant-organization | 组织与数据范围 | active | `com.qvsu.system.service.impl.SysDeptServiceImpl`、`SysRoleServiceImpl`、`SysUserServiceImpl`、`com.qvsu.framework.aspectj.DataScopeAspect` | 事实 | 是（`sys_dept`、`sys_post`、`sys_user_post`） | AOP + SQL 拼接 |
| COMMON-session-online | 会话持久化与在线用户 | active（读侧未实现） | `com.qvsu.framework.shiro.session.*`、`com.qvsu.system.service.impl.SysUserOnlineServiceImpl` | 事实 | 是（`sys_user_online`） | SessionDAO / Filter / 异步任务 |
| COMMON-security-guard | 安全防护（XSS/CSRF/密码/同步） | partial | `com.qvsu.common.xss.*`、`com.qvsu.framework.shiro.web.filter.*`、`com.qvsu.common.utils.security` | 事实 | 否 | Servlet Filter / Shiro Filter / 工具类 |
| COMMON-audit | 审计与日志（操作日志/登录日志） | active（读侧未实现） | `com.qvsu.framework.aspectj.LogAspect`、`com.qvsu.framework.manager.factory.AsyncFactory` | 事实 | 是（`sys_oper_log`、`sys_logininfor`） | Annotation + AOP + 异步任务 |
| COMMON-dictionary-config | 字典与参数配置 | active | `com.qvsu.common.utils.DictUtils`、`com.qvsu.framework.web.service.ConfigService`/`DictService`、`com.qvsu.system.service.impl.SysConfigServiceImpl` | 事实 | 是（`sys_dict_type`、`sys_dict_data`、`sys_config`） | Service + Ehcache + Thymeleaf 表达式 |
| COMMON-notice | 通知公告 | active（仅管理端，无推送） | `com.qvsu.web.controller.system.SysNoticeController`、`ISysNoticeService` | 事实 | 是（`sys_notice`） | REST + Thymeleaf |
| COMMON-file | 文件上传下载 | active | `com.qvsu.web.controller.common.CommonController`、`com.qvsu.common.utils.file.*` | 事实 | 否（本地磁盘 `qvsu.profile`） | REST |
| COMMON-import-export | Excel/CSV 导入导出 | active | `com.qvsu.common.utils.poi.ExcelUtil`、`ExcelHandlerAdapter` | 事实 | 否 | 工具类 + REST |
| COMMON-scheduling | 统一任务调度 | active（内存 JobStore） | `com.qvsu.quartz.*` | 事实 | 是（`sys_job`、`sys_job_log`；`QRTZ_*` 11 张表未被使用） | REST + Quartz Job |
| COMMON-cache | 统一缓存（Ehcache） | active | `com.qvsu.framework.config.ShiroConfig.getEhCacheManager`、`com.qvsu.common.utils.CacheUtils` | 事实 | 否 | SDK（Ehcache via Shiro `CacheManager`） |
| COMMON-response-exception | 异常与统一响应 | active | `com.qvsu.framework.web.exception.GlobalExceptionHandler`、`com.qvsu.common.core.domain.AjaxResult`、`com.qvsu.common.core.page.TableDataInfo` | 事实 | 否 | Annotation + DTO |
| COMMON-idempotency-lock | 幂等、防重与重放保护 | partial | `com.qvsu.open.service.OpenApiSecurityService`（OpenAPI 网关侧）；`com.qvsu.framework.interceptor.impl.SameUrlDataInterceptor`（表单侧，未启用） | 事实 | 否（nonce 为 JVM 内 `ConcurrentHashMap`） | REST Header 校验 |

补充说明：项目内**不存在**工作流引擎（技能默认能力族清单（`common-capabilities.md`）中的「工作流引擎」在本项目不适用，故不建立该节点）、**不存在**多租户（本系统无租户维度）、**不存在**短信/邮件/推送通道、**不存在**站内信与已读未读消息中心。逐项「不适用」结论与证据见后文「「不适用」能力及其证据」一节。

---

## COMMON-authentication - 身份认证与登录会话

- ID: COMMON-authentication
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `framework/config/ShiroConfig.java`、`framework/shiro/realm/UserRealm.java`、`framework/shiro/service/SysLoginService.java`、`framework/shiro/service/SysPasswordService.java`、`web/controller/system/SysLoginController.java`、`web/controller/system/SysCaptchaController.java`、`web/controller/system/SysRegisterController.java`
- 业务说明: 面向后台管理端的用户名口令认证。以 Apache Shiro `UsernamePasswordToken` 为唯一令牌载体，`UserRealm` 为唯一 Realm，认证通过后把 `SysUser` 作为 Principal 写入 Shiro Session；会话落库到 `sys_user_online`。验证码、口令重试锁定、记住我、IP 黑名单、账号状态与逻辑删除校验全部内聚在本能力内。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysPasswordService.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/rememberMe/CustomCookieRememberMeManager.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/LogoutFilter.java`
  - symbol: `UserRealm.doGetAuthenticationInfo`、`SysLoginService.login`、`SysPasswordService.validate`、`SysPasswordService.encryptPassword`
  - route/topic/job/config/table: `POST /login`、`GET /login`、`GET /logout`、`GET /register`、`POST /register`、`GET /captcha/captchaImage`、`GET /captcha/captchaCode`、`sys_user_online`、`shiro.user.loginUrl`、`shiro.rememberMe.enabled`、`shiro.cookie.cipherKey`、`shiro.cookie.maxAge`、`user.password.maxRetryCount`、`shiro.user.captchaEnabled`、`shiro.user.captchaType`、`qvsu.testing.exposeCaptchaCode`、`sys.account.registerUser`、`sys.login.blackIPList`
  - grep keywords: `UsernamePasswordToken`、`SecurityUtils.getSubject().login`、`CaptchaValidateFilter`、`loginRecordCache`、`Md5Hash`

### 能力接口

#### CSI-auth-login - 用户登录认证

- ID: CSI-auth-login
- 接口形态: REST `POST /login`（表单参数 `username`、`password`、`rememberMe`）+ Shiro Realm 内部调用
- 提供者: `com.qvsu.web.controller.system.SysLoginController.ajaxLogin(String, String, Boolean)`；认证实现 `com.qvsu.framework.shiro.realm.UserRealm.doGetAuthenticationInfo`
- 输入输出核心语义: 输入登录名/口令/记住我标志；输出 `AjaxResult`（`code=0` 成功，`code=500` + 消息失败，例如「用户或密码错误」）。成功时把 `SysUser` 写入 Shiro Session，并异步写 `sys_user_online` 与 `sys_logininfor`。
- 调用前置条件: 请求方法为 POST（非 POST 时 `CaptchaValidateFilter.isAccessAllowed` 直接放行）、`shiro.user.captchaEnabled=true` 时须带验证码参数 `validateCode`；账号 `del_flag != '2'`、`status != '1'`；IP 不在 `sys.login.blackIPList`（参数键 `sys.login.blackIPList`，读取点 `SysLoginService.login` 第 85 行）。
- 数据、状态或事件副作用: 写 Shiro Session（Principal=`SysUser`）、新增/更新 `sys_user_online` 一条（默认 `OnlineStatus.on_line`）、新增 `sys_logininfor` 一条（成功 `Success` 或失败 `Error`）、`sys_user.login_ip`/`login_date` 更新（`SysLoginService.recordLoginInfo` → `ISysUserService.updateLoginInfo`）。
- 失败、重试、补偿和降级语义: 认证失败按异常类型映射为 `UnknownAccountException`/`IncorrectCredentialsException`/`ExcessiveAttemptsException`/`LockedAccountException`（`UserRealm.doGetAuthenticationInfo` 第 102–130 行）；无重试补偿，忽略失败即抛错。登录失败日志通过 `AsyncManager` 异步落库，异步失败不阻断登录流程。
- 消费功能列表:
  - `SysLoginController.ajaxLogin` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:57`
  - `SysLoginController.login`（渲染登录页并注入 `isRemembered`/`isAllowRegister`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:41`
  - 所有后台页面（Shiro 过滤链 `/** -> user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:349`
  - 前端登录表单 `templates/login.html`（提交 `/login`，`templates/` 下唯一登录入口）

#### CSI-auth-captcha - 图形验证码（math / char）

- ID: CSI-auth-captcha
- 接口形态: REST `GET /captcha/captchaImage?type=math|char`（JPEG 图片流）+ Shiro Filter `captchaValidate` + Kaptcha `Producer`
- 提供者: `com.qvsu.web.controller.system.SysCaptchaController.getKaptchaImage(HttpServletRequest, HttpServletResponse)`；校验方 `com.qvsu.framework.shiro.web.filter.captcha.CaptchaValidateFilter.validateResponse`；Bean 定义 `com.qvsu.framework.config.CaptchaConfig.captchaProducer` / `captchaProducerMath`、`com.qvsu.framework.config.KaptchaTextCreator`
- 输入输出核心语义: 输入 `type`（`math` 走算式，`char` 走字符）；输出验证码 JPEG；答案写入 `HttpSession` 与 Shiro Session 的 `KAPTCHA_SESSION_KEY`（`SysCaptchaController` 第 73 与 77 行）。校验时读取 Shiro Session 并**立即 removeAttribute**，一次性使用。
- 调用前置条件: `/captcha/captchaImage**` 与 `/captcha/captchaCode**` 均为 `anon`（`ShiroConfig.java` 第 318–319 行）。
- 数据、状态或事件副作用: 无数据库写入；仅会话属性副作用。
- 失败、重试、补偿和降级语义: 校验失败时 `CaptchaValidateFilter.onAccessDenied` 置 `ShiroConstants.CURRENT_CAPTCHA = CAPTCHA_ERROR` 并**返回 true 继续流程**，由 `SysLoginService.login` 第 57 行判定并抛 `CaptchaException`，最终由 `UserRealm` 包装为 `AuthenticationException`。`GET` 请求不校验验证码（只校验 POST）。
- 消费功能列表:
  - `SysLoginController.ajaxLogin` → `CaptchaValidateFilter` → `SysLoginService.login:57`
  - `SysRegisterController.ajaxRegister` → `SysRegisterService.register:39`
  - 过滤链注册 `filterChainDefinitionMap.put("/login", "anon,captchaValidate")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:329`
  - 过滤链注册 `filterChainDefinitionMap.put("/register", "anon,captchaValidate")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:331`
  - `SysCaptchaController.captchaCode`（测试后门，受 `qvsu.testing.exposeCaptchaCode` 控制）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java:112`
  - 前端 `templates/login.html`、`templates/register.html`（加载 `/captcha/captchaImage?type=math`）

#### CSI-auth-password-retry - 口令重试次数限制与口令加盐散列

- ID: CSI-auth-password-retry
- 接口形态: 内部 Java API `SysPasswordService.validate(SysUser, String)`、`SysPasswordService.encryptPassword(String, String, String)`、`SysPasswordService.matches(SysUser, String)`
- 提供者: `com.qvsu.framework.shiro.service.SysPasswordService`；缓存名常量 `ShiroConstants.LOGIN_RECORD_CACHE = "loginRecordCache"`
- 输入输出核心语义: 输入 `SysUser` 与明文口令，无返回值；超限抛 `UserPasswordRetryLimitExceedException`，不匹配抛 `UserPasswordNotMatchException`。口令散列算法为 `new Md5Hash(loginName + password + salt).toHex()`（`SysPasswordService.java:83`），盐为 `ShiroUtils.randomSalt()` 生成的 6 位十六进制（3 字节）。
- 调用前置条件: `user.password.maxRetryCount` 必须存在（默认 5，见 `application.yml` 第 43–46 行），否则 `Integer.valueOf` 抛 `NumberFormatException`。
- 数据、状态或事件副作用: 写 Ehcache `loginRecordCache`（`maxEntriesLocalHeap=2000`、`timeToIdleSeconds=600`，即空闲 10 分钟后计数归零，见 `resources/ehcache/ehcache-shiro.xml:25`）；每次失败异步写 `sys_logininfor`（消息键 `user.password.retry.limit.count`）；超限异步写 `sys_logininfor`（消息键 `user.password.retry.limit.exceed`）。
- 失败、重试、补偿和降级语义: 计数**只增不减直至命中一次正确口令**（成功分支调用 `clearLoginRecordCache(loginName)`）；无独立解锁入口，解锁依赖 Ehcache 空闲过期（10 分钟）。**Ehcache 为进程内缓存，集群/多实例部署时计数不共享**（推断，依据 `ehcache-shiro.xml` 使用默认 `diskStore=java.io.tmpdir` 且无 RMI 复制配置）。
- 消费功能列表:
  - `UserRealm.doGetAuthenticationInfo` → `SysLoginService.login:125` → `SysPasswordService.validate`
  - `SysProfileController.resetPwd`（修改个人口令时校验旧口令 `passwordService.matches`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java:82`
  - `SysIndexController.unlockscreen`（锁屏解锁校验口令 `passwordService.matches`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java:115`
  - `SysProfileController.checkPassword`（`GET /system/user/profile/checkPassword`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java:65`
  - `SysRegisterService.register`（注册时 `encryptPassword`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysRegisterService.java:70`
  - `SysUserController.addSave` / `editSave` / `resetPwdSave`（管理员建号/改号/重置口令时 `ShiroUtils.randomSalt()` + `encryptPassword`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java:148`、`:231`、`:235`

#### CSI-auth-remember-me - 记住我

- ID: CSI-auth-remember-me
- 接口形态: Shiro `RememberMeManager` + 自定义 `SimpleCookie("rememberMe")`
- 提供者: `com.qvsu.framework.config.ShiroConfig.rememberMeManager()` 与 `rememberMeCookie()`；`com.qvsu.framework.shiro.rememberMe.CustomCookieRememberMeManager`
- 输入输出核心语义: `shiro.rememberMe.enabled=true` 时向 `DefaultWebSecurityManager` 注入 CookieRememberMeManager，Cookie `maxAge = shiro.cookie.maxAge * 24 * 60 * 60`（配置 30 → 30 天）。Cookie 域/路径/HttpOnly 由 `shiro.cookie.domain`、`shiro.cookie.path`、`shiro.cookie.httpOnly` 决定。
- 调用前置条件: `shiro.rememberMe.enabled=true`（当前 `application.yml:130` 为 `true`）；未配置 `shiro.cookie.cipherKey` 时**每次启动随机生成 AES-128 密钥**（`ShiroConfig.java:413`），导致重启后已签发 Cookie 全部失效。
- 数据、状态或事件副作用: 浏览器 Cookie `rememberMe`；Shiro `Subject.isRemembered()` 为 true。`KickoutSessionFilter.onAccessDenied` 第 64 行把 `subject.isRemembered()` 计入会话数限制判定。
- 失败、重试、补偿和降级语义: 无补偿；Cookie 解密失败按未记住处理。
- 消费功能列表:
  - `SysLoginController.login`（`GET /login` 注入 `isRemembered` 控制复选框显隐）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:49`
  - `SysLoginController.ajaxLogin`（`new UsernamePasswordToken(username, password, rememberMe)`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:59`
  - `KickoutSessionFilter.onAccessDenied`（`subject.isAuthenticated() || subject.isRemembered()` 判定）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java:64`
  - `ShiroConfig.securityManager`（条件注入）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:261`
  - 前端 `templates/login.html`（`th:if="${isRemembered}"` 渲染「记住我」）

#### CSI-auth-logout - 注销与登录日志

- ID: CSI-auth-logout
- 接口形态: Shiro Filter `/logout -> logout`（`com.qvsu.framework.shiro.web.filter.LogoutFilter`）
- 提供者: `com.qvsu.framework.shiro.web.filter.LogoutFilter.preHandle`；注册点 `com.qvsu.framework.config.ShiroConfig.logoutFilter()`
- 输入输出核心语义: 注销时读取当前 `SysUser`，异步记录 `sys_logininfor`（状态常量 `Constants.LOGOUT = "Logout"`，消息键 `user.logout.success`），清空 Ehcache `sys-userCache` 中该登录名的 sessionId 队列，然后 `subject.logout()` 并 302 重定向到 `shiro.user.loginUrl`（`/login`）。
- 调用前置条件: 已登录（`ShiroUtils.getSysUser()` 非空才记日志，否则静默跳过）。
- 数据、状态或事件副作用: 删除 `sys_user_online` 当前会话行（`OnlineSessionDAO.doDelete` → `SysShiroService.deleteSession`）；写 `sys_logininfor`；写 Ehcache `sys-userCache`。
- 失败、重试、补偿和降级语义: `SessionException` 被 catch 后仅 `log.error`，仍继续重定向；无重试。
- 消费功能列表:
  - Shiro 过滤链 `/logout` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:327`
  - `KickoutSessionFilter.onAccessDenied` 第 122 行 `subject.logout()`（被踢出时走同一注销路径，但**不写** `sys_logininfor`，因为绕过 `LogoutFilter`）
  - `OnlineSessionFilter.onAccessDenied` 第 83 行 `subject.logout()`（会话下线强制退出）
  - 前端 TopNav / 侧边栏退出按钮（`templates/index.html`、`templates/index-topnav.html`）

#### CSI-auth-register - 自助注册（可开关）

- ID: CSI-auth-register
- 接口形态: REST `GET /register`（页面）+ `POST /register`（AjaxResult）
- 提供者: `com.qvsu.web.controller.system.SysRegisterController.ajaxRegister(SysUser)`；校验 `com.qvsu.framework.shiro.service.SysRegisterService.register(SysUser)`
- 输入输出核心语义: 受参数键 `sys.account.registerUser` 控制，仅当值为字符串 `"true"` 时允许注册（`SysRegisterController.java:39`）；校验验证码、登录名与口令长度（`UserConstants.PASSWORD_MIN_LENGTH`/`MAX_LENGTH`、`USERNAME_MIN_LENGTH`/`MAX_LENGTH`）、登录名唯一性；成功后写 `sys_user` 并异步写 `sys_logininfor`（`Constants.REGISTER`）。
- 调用前置条件: `sys.account.registerUser = true`；验证码通过；过滤链 `"/register", "anon,captchaValidate"`。
- 数据、状态或事件副作用: 新增 `sys_user`（`ISysUserService.registerUser`）；写 `sys_logininfor`。
- 失败、重试、补偿和降级语义: 返回中文错误消息字符串，不抛异常；无重试。
- 消费功能列表:
  - `SysRegisterController.ajaxRegister` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java:37`
  - `SysRegisterController.register`（页面渲染）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java:30`
  - `SysLoginController.login`（`isAllowRegister` 控制登录页注册链接显隐）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:51`
  - 前端 `templates/register.html`

---

## COMMON-permission - 授权与权限

- ID: COMMON-permission
- 状态: active，但 OpenAPI 管理域存在**权限码未落地**缺口
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `common/annotation/*`、`framework/aspectj/PermissionsAspect.java`、`framework/shiro/realm/UserRealm.java`、`framework/web/service/PermissionService.java`、全部 14 个 `web/controller/system` 与 `quartz/controller`、`open/controller`、`resources/templates/**`、`sql/quartz.sql`、`open-api/sql/open_api_menu.sql`、`docs/tools/semantics.json`（105 个带权限注解的端点）
- 业务说明: 五级授权模型 = 菜单（`sys_menu`）→ 角色（`sys_role`）→ 用户（`sys_user`）→ 部门（`sys_dept`）→ 岗位（`sys_post`）；关联表 `sys_role_menu`、`sys_user_role`、`sys_role_dept`、`sys_user_post`。权限码字符串形如 `<域>:<资源>:<动作>`，动作词固定为 `view/list/add/edit/remove/export/import/resetPwd/changeStatus/detail/save/generate`（`common/constant/PermissionConstants.java` 定义 `add/edit/remove/export/view/list` 六个常量）。后端强制点为 Shiro `AuthorizationAttributeSourceAdvisor` + `@RequiresPermissions`；前端强制点为 Thymeleaf Shiro 方言 `shiro:hasPermission` 与 `@permission.hasPermi('...')`。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/PermissionsAspect.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/PermissionService.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysMenuServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysRoleServiceImpl.java`
  - symbol: `PermissionsAspect.doBefore`、`UserRealm.doGetAuthorizationInfo`、`PermissionService.hasPermi`、`SysMenuServiceImpl.selectPermsByUserId`、`SysRoleServiceImpl.selectRoleKeys`
  - route/topic/job/config/table: `GET /unauth`、`shiro.user.unauthorizedUrl=/unauth`、`sys_menu.perms`、`sys_role_menu`、`sys_user_role`、`sys_role_dept`
  - grep keywords: `@RequiresPermissions`、`shiro:hasPermission`、`@permission.hasPermi`、`ShiroDialect`、`PermissionContextHolder`

### 能力接口

#### CSI-perm-annotation - 方法级操作权限（`@RequiresPermissions`）

- ID: CSI-perm-annotation
- 接口形态: Annotation + AOP（`@RequiresPermissions("码")` → `PermissionsAspect` 写入 `PermissionContextHolder` → Shiro 注解通知器校验）
- 提供者: `org.apache.shiro.authz.annotation.RequiresPermissions` 由 `com.qvsu.framework.config.ShiroConfig.authorizationAttributeSourceAdvisor(securityManager)` 开启；权限数据源 `com.qvsu.framework.shiro.realm.UserRealm.doGetAuthorizationInfo`
- 输入输出核心语义: 管理员（`userId == 1`）直接获得 `*:*:*` 与角色 `admin`，绕过全部权限校验（`UserRealm.java:66-70`，判定函数 `ShiroUtils.isAdmin`）；非管理员取 `roleService.selectRoleKeys(userId)` 与 `menuService.selectPermsByUserId(userId)`。校验失败由 `GlobalExceptionHandler.handleAuthorizationException` 分流：Ajax 返回 `AjaxResult.error`，非 Ajax 渲染 `error/unauth` 视图。
- 调用前置条件: Redis 无；需已认证（过滤链 `/** -> user,...`）且会话有效。授权信息缓存在 Ehcache `sys-authCache`（`UserRealm.setAuthorizationCacheName(Constants.SYS_AUTH_CACHE)`），**改角色/菜单后不会自动失效该缓存**（`UserRealm.clearCachedAuthorizationInfo` 无调用点，详见后文「安全风险与存疑项」R-4）。
- 数据、状态或事件副作用: 无直接写库；`PermissionContextHolder` 为 ThreadLocal，供 `DataScopeAspect` 读取权限码做多角色数据范围匹配。
- 失败、重试、补偿和降级语义: 抛 `AuthorizationException` → 全局异常处理器；无重试与降级开关（除管理员旁路）。**总注释数 110 处，语义化端点 105 个带权限注解 / 184 个端点**（`docs/tools/semantics.json`：`Endpoints` 184 条，其中 `Permission` 非空 105 条）。
- 权限码分布（事实，逐码计数来自源码注解）：

| 权限码 | 注解处数 | 相关 Controller |
|---|---:|---|
| system:user:view | 2 | SysUserController |
| system:user:list | 4 | SysUserController |
| system:user:add | 2 | SysUserController |
| system:user:edit | 5 | SysUserController |
| system:user:remove | 1 | SysUserController |
| system:user:export | 1 | SysUserController |
| system:user:import | 1 | SysUserController |
| system:user:resetPwd | 2 | SysUserController |
| system:role:view | 1 | SysRoleController |
| system:role:list | 4 | SysRoleController |
| system:role:add | 2 | SysRoleController |
| system:role:edit | 9 | SysRoleController |
| system:role:remove | 1 | SysRoleController |
| system:role:export | 1 | SysRoleController |
| system:menu:view | 1 | SysMenuController |
| system:menu:list | 1 | SysMenuController |
| system:menu:add | 2 | SysMenuController |
| system:menu:edit | 2 | SysMenuController |
| system:menu:remove | 1 | SysMenuController |
| system:dept:view | 1 | SysDeptController |
| system:dept:list | 4 | SysDeptController |
| system:dept:add | 2 | SysDeptController |
| system:dept:edit | 2 | SysDeptController |
| system:dept:remove | 1 | SysDeptController |
| system:post:view | 1 | SysPostController |
| system:post:list | 1 | SysPostController |
| system:post:add | 2 | SysPostController |
| system:post:edit | 2 | SysPostController |
| system:post:remove | 1 | SysPostController |
| system:post:export | 1 | SysPostController |
| system:dict:view | 2 | SysDictTypeController、SysDictDataController |
| system:dict:list | 3 | SysDictTypeController、SysDictDataController |
| system:dict:add | 4 | SysDictTypeController、SysDictDataController |
| system:dict:edit | 4 | SysDictTypeController、SysDictDataController |
| system:dict:remove | 4 | SysDictTypeController、SysDictDataController |
| system:dict:export | 2 | SysDictTypeController、SysDictDataController |
| system:config:view | 1 | SysConfigController |
| system:config:list | 1 | SysConfigController |
| system:config:add | 2 | SysConfigController |
| system:config:edit | 2 | SysConfigController |
| system:config:remove | 3 | SysConfigController |
| system:config:export | 1 | SysConfigController |
| system:notice:view | 1 | SysNoticeController |
| system:notice:list | 3 | SysNoticeController |
| system:notice:add | 2 | SysNoticeController |
| system:notice:edit | 2 | SysNoticeController |
| system:notice:remove | 1 | SysNoticeController |
| monitor:job:view | 2 | SysJobController、SysJobLogController |
| monitor:job:list | 2 | SysJobController、SysJobLogController |
| monitor:job:add | 2 | SysJobController |
| monitor:job:edit | 2 | SysJobController |
| monitor:job:remove | 3 | SysJobController、SysJobLogController |
| monitor:job:changeStatus | 2 | SysJobController |
| monitor:job:detail | 2 | SysJobController、SysJobLogController |
| monitor:job:export | 2 | SysJobController、SysJobLogController |

- 消费功能列表（逐调用点，方法名 + 文件路径）:
  - 用户域 18 处：`SysUserController.importTemplate:64`、`SysUserController.list:71`、`SysUserController.export:82`、`SysUserController.importData:93`、`SysUserController.view:104`、`SysUserController.add:116`、`SysUserController.addSave:128`、`SysUserController.edit:158`、`SysUserController.selectDeptTree:173`、`SysUserController.editSave:187`、`SysUserController.resetPwd:214`、`SysUserController.resetPwdSave:223`、`SysUserController.authRole:247`、`SysUserController.insertAuthRole:263`、`SysUserController.remove:276`、`SysUserController.changeStatus:323`、`SysUserController.deptTreeData:336`、`SysUserController.selectDeptTreeByDeptId:350` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - 角色域 18 处：`SysRoleController.list:56`、`SysRoleController.export:67`、`SysRoleController.add:80`、`SysRoleController.addSave:90`、`SysRoleController.selectMenuTree:113`、`SysRoleController.edit:125`、`SysRoleController.deptTreeData:160`、`SysRoleController.remove:177`、`SysRoleController.changeStatus:219`、`SysRoleController.authDataScope:232`、`SysRoleController.authUser:244`、`SysRoleController.selectUser:257`、`SysRoleController.cancelAuthUser:269`、`SysRoleController.allocatedList:281`、`SysRoleController.unallocatedList:292`、`SysRoleController.selectAuthUserAll:305`、`SysRoleController.cancelAuthUserAll:318`、`SysRoleController.editSave`(第 192 行区块) — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - 菜单域 7 处：`SysMenuController.list:47`、`SysMenuController.remove:61`、`SysMenuController.add:81`、`SysMenuController.addSave:104`、`SysMenuController.edit:121`、`SysMenuController.editSave:133`、`SysMenuController.menu:40` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`
  - 部门域 9 处：`SysDeptController.list:45`、`SysDeptController.add:57`、`SysDeptController.addSave:73`、`SysDeptController.edit:89`、`SysDeptController.editSave:107`、`SysDeptController.remove:134`、`SysDeptController.selectDeptTree:167`、`SysDeptController.treeDataExcludeChild:179`、`SysDeptController.dept:38` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`
  - 岗位域 8 处：`SysPostController.list:44`、`SysPostController.export:55`、`SysPostController.remove:65`、`SysPostController.add:77`、`SysPostController.addSave:87`、`SysPostController.edit:108`、`SysPostController.editSave:119`、`SysPostController.post:37` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`
  - 字典域 18 处：`SysDictTypeController.list:46`、`SysDictTypeController.export:56`、`SysDictTypeController.add:70`、`SysDictTypeController.addSave:81`、`SysDictTypeController.edit:97`、`SysDictTypeController.editSave:109`、`SysDictTypeController.remove:123`、`SysDictTypeController.refreshCache:135`、`SysDictTypeController.detail:148`、`SysDictTypeController.type:38` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`；`SysDictDataController.list:45`、`SysDictDataController.export:55`、`SysDictDataController.add:68`、`SysDictDataController.addSave:80`、`SysDictDataController.edit:92`、`SysDictDataController.editSave:104`、`SysDictDataController.remove:114`、`SysDictDataController.data:37` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java`
  - 参数域 9 处：`SysConfigController.list:47`、`SysConfigController.export:58`、`SysConfigController.add:71`、`SysConfigController.addSave:81`、`SysConfigController.edit:98`、`SysConfigController.editSave:109`、`SysConfigController.remove:126`、`SysConfigController.refreshCache:139`、`SysConfigController.config:37` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`
  - 通知公告域 8 处：`SysNoticeController.list:46`、`SysNoticeController.add:59`、`SysNoticeController.addSave:69`、`SysNoticeController.edit:82`、`SysNoticeController.editSave:93`、`SysNoticeController.view:106`、`SysNoticeController.remove:117`、`SysNoticeController.notice:36` — 均位于 `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`
  - 调度域 17 处：`SysJobController.list:51`、`SysJobController.export:62`、`SysJobController.remove:73`、`SysJobController.detail:82`、`SysJobController.changeStatus:95`、`SysJobController.run:109`、`SysJobController.add:121`、`SysJobController.addSave:132`、`SysJobController.edit:185`、`SysJobController.editSave:197`、`SysJobController.job:44` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`；`SysJobLogController.list:55`、`SysJobLogController.export:66`、`SysJobLogController.remove:77`、`SysJobLogController.detail:85`、`SysJobLogController.clean:95`、`SysJobLogController.jobLog:43` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`

#### CSI-perm-anonymous-url - 匿名访问白名单（`@Anonymous`）

- ID: CSI-perm-anonymous-url
- 接口形态: 注解扫描 → Shiro 过滤链动态注入
- 提供者: `com.qvsu.framework.config.properties.PermitAllUrlProperties`（扫描 `com.qvsu.common.annotation.Anonymous`）→ `ShiroConfig.shiroFilterFactoryBean` 第 321–325 行注册为 `anon`
- 输入输出核心语义: 注解标注的 URL 被加入 `filterChainDefinitionMap` 并置为 `anon`，跳过认证与授权。
- 调用前置条件: 启动期扫描，非运行时。
- 数据、状态或事件副作用: 无。
- 失败、重试、补偿和降级语义: 无。
- 消费功能列表: **无消费者**。全量源码扫描（`com/qvsu/**/*.java`）中 `@Anonymous` 注解**零使用**，`common/annotation/Anonymous.java` 仅有定义无引用（证据：对 `com/qvsu` 全包 grep `@Anonymous` 仅命中注解声明文件本身）。因此当前 `permitAllUrl` 集合恒为空，仅靠 `ShiroConfig` 硬编码的 `anon` 列表（第 306–319 行）与 `/open/**`、`/selftest/**`（第 333–334 行）。

#### CSI-perm-role - 角色授权（`@RequiresRoles` / 角色键）

- ID: CSI-perm-role
- 接口形态: Shiro `SimpleAuthorizationInfo.setRoles(Set<String>)` + `PermissionService` 的 `hasRole/isRole/hasAnyRoles`（Thymeleaf/JS 侧）
- 提供者: `com.qvsu.framework.shiro.realm.UserRealm.doGetAuthorizationInfo` 第 73 行 `roleService.selectRoleKeys(user.getUserId())`；数据来源 `SysRoleServiceImpl.selectRoleKeys` → `SysRoleMapper.selectRolesByUserId`（`sys_role.role_key`，逗号可分隔多角色键）
- 输入输出核心语义: 非管理员用户获得其启用角色的 `role_key` 集合；管理员获得硬编码角色 `admin`。
- 调用前置条件: `sys_user_role` 存在关联且 `sys_role.status = '0'`（`SysRoleServiceImpl.selectRoleKeys` 直接取 `role_key`）。
- 数据、状态或事件副作用: 无写库；结果缓存于 Ehcache `sys-authCache`。
- 失败、重试、补偿和降级语义: 无角色时集合为空，`hasRole` 全 false。
- 消费功能列表:
  - `UserRealm.doGetAuthorizationInfo:73` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java`
  - `SysLoginService.setRolePermission:158`（登录时把每个角色的 `selectPermsByRoleId` 灌入 `SysRole.permissions`，供 `DataScopeAspect` 使用）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java`
  - `PermissionService.isRole:176`、`PermissionService.hasRole:69`、`PermissionService.isAnyRoles:198`、`PermissionService.hasAnyRoles:91`、`PermissionService.isLacksRole:187`、`PermissionService.lacksRole:80` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/PermissionService.java`
  - `SysRoleController.list`（角色列表查询显示）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java:56`
  - `SysUserController.authRole:247`、`SysUserController.insertAuthRole:263`（用户-角色分配）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - 前端 `templates/index.html`（`shiro:principal`/`shiro:hasRole` 仅在 `templates/**` 中用于角色判定，无 `@RequiresRoles` 注解消费）
- 说明（事实）: 全量源码扫描中 **`@RequiresRoles` 零使用**（grep `@RequiresRoles` 于 `com/qvsu` 无命中），角色维度仅通过 `shiro:hasRole`/`@permission.hasRole` 在前端与 `DataScopeAspect` 的数据范围角色循环中生效。

#### CSI-perm-menutree - 菜单授权与菜单树

- ID: CSI-perm-menutree
- 接口形态: REST + Service（`sys_role_menu` 绑定）
- 提供者: `com.qvsu.system.service.impl.SysMenuServiceImpl.selectMenusByUser`、`selectMenuAll`、`roleMenuTreeData`、`menuTreeData`、`selectPermsByUserId`；`com.qvsu.system.service.impl.SysRoleServiceImpl.insertRoleMenu`/`deleteRoleMenu`
- 输入输出核心语义: 登录后按用户角色取菜单；管理员取 `selectMenuNormalAll()`，非管理员取 `selectMenusByUserId(userId)`，再经 `filterToOpenApiAndQuartzMenus` **白名单过滤**（仅保留 `menuId=1`（系统管理）、`menuId=2100`（OpenAPI管理）、`parentId=2100`、`menuId=110`/`parentId=110`（定时任务）——`SysMenuServiceImpl.java:39-43、198-223`）。角色授权树通过 `roleMenuTreeData(SysRole, Long)` 生成 Ztree；勾选集合以 `menuId + perms` 拼接匹配（`initZtree` 第 277 行）。
- 调用前置条件: 已认证；`ISysMenuService.selectMenusByUser` 需要非空 `SysUser`。
- 数据、状态或事件副作用: 授权保存时写 `sys_role_menu`；无缓存失效调用（见风险 R-4）。
- 失败、重试、补偿和降级语义: 无；`getChildPerms` 依赖 `parentId=0` 根节点，缺失则返回空菜单。
- 消费功能列表:
  - `SysIndexController.index:56`（`menuService.selectMenusByUser(user)` 注入首页侧边栏）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`
  - `SysMenuController.menuTreeData:184`、`SysMenuController.roleMenuTreeData:196`、`SysMenuController.selectMenuTree:52` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`
  - `SysRoleController.selectMenuTree:113`（角色分配菜单页）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - `SysMenuController.menu:40`（菜单管理页）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java`
  - `SysMenuServiceImpl.selectPermsByUserId` → `UserRealm.doGetAuthorizationInfo:74` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java`
  - `SysMenuServiceImpl.selectPermsByRoleId` → `SysLoginService.setRolePermission:168` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java`
  - 前端 `templates/index.html`、`templates/index-topnav.html`（`th:each="menu : ${menus}"` 渲染导航）

#### CSI-perm-frontend - 前端权限可见性（Thymeleaf / JS）

- ID: CSI-perm-frontend
- 接口形态: Thymeleaf Shiro 方言标签 `shiro:hasPermission` / `shiro:hasRole`；JS 表达式 `[[${@permission.hasPermi('...')}]]` 渲染为 `hidden` 字符串
- 提供者: `org.apache.shiro.spring.boot.autoconfigure` 提供的 `ShiroDialect`（注册于 `ShiroConfig.shiroDialect()`）；JS 侧 `com.qvsu.framework.web.service.PermissionService.hasPermi`
- 输入输出核心语义: 有权限返回空串，无权限返回常量 `hidden`（`PermissionService.NOACCESS = "hidden"`），前端据此隐藏按钮。
- 调用前置条件: 页面必须经 Thymeleaf 渲染且请求已认证。
- 数据、状态或事件副作用: 无。
- 失败、重试、补偿和降级语义: 无（前端隐藏不构成安全边界）。
- 消费功能列表（逐模板文件，共 10 个模板 / 72 处）:
  - `templates/system/user/user.html:65,68,71,74,77,93,94,95`
  - `templates/system/role/role.html:41,44,47,50,62,63`
  - `templates/system/role/authUser.html:30,33,48`
  - `templates/system/menu/menu.html:32,35,53,54,55`
  - `templates/system/dept/dept.html:32,35,49,50,51`
  - `templates/system/post/post.html:35,38,41,44,56,57`
  - `templates/system/dict/type/type.html:41,44,47,50,53,65,66,67`
  - `templates/system/dict/data/data.html:38,41,44,47,63,64`
  - `templates/system/config/config.html:41,44,47,50,53,64,65`
  - `templates/system/notice/notice.html:35,38,41,53,54`
  - `templates/monitor/job/job.html:38,41,44,47,53,65,66,67,68`
  - `templates/monitor/job/jobLog.html:46,49,52,67`
  - （以上路径前缀 `open-api/qvsu-openapi/src/main/resources/`）
  - **`templates/open/**`（app/api/auth/log/doc 5 个页面）零权限标签**：`templates/open/app/index.html:33,34,35,63,64,65`、`templates/open/api/index.html:18,19,20,50,51`、`templates/open/auth/index.html:16,17,18,19`、`templates/open/log/index.html:24,25,26` 均为无条件渲染（事实）。

#### CSI-perm-unauthorized - 未授权跳转与错误分流

- ID: CSI-perm-unauthorized
- 接口形态: Shiro `unauthorizedUrl` + `@RestControllerAdvice` 异常分流
- 提供者: `ShiroConfig.shiroFilterFactoryBean` 第 302 行 `setUnauthorizedUrl(unauthorizedUrl)`；`SysLoginController.unauth`（`GET /unauth` → 视图 `error/unauth`）；`GlobalExceptionHandler.handleAuthorizationException`
- 输入输出核心语义: 配置 `shiro.user.unauthorizedUrl=/unauth`；Ajax 请求返回 `AjaxResult.error(PermissionUtils.getMsg(e.getMessage()))`，普通请求渲染 `error/unauth`。消息文案由 `com.qvsu.common.utils.security.PermissionUtils.getMsg` 从 i18n 资源 `static/i18n/messages` 取。
- 调用前置条件: 已认证但无权限（未认证走 `shiro.user.loginUrl=/login`）。
- 数据、状态或事件副作用: 无。
- 失败、重试、补偿和降级语义: 无。
- 消费功能列表:
  - `SysLoginController.unauth` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java:78`
  - `GlobalExceptionHandler.handleAuthorizationException` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/exception/GlobalExceptionHandler.java:37`
  - `PermissionUtils.getMsg` — `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/security/PermissionUtils.java`
  - `SysLoginController.login:46`（Ajax 未登录返回 `{"code":"1","msg":"未登录或登录超时。请重新登录"}`）

---

## COMMON-tenant-organization - 组织与数据范围

- ID: COMMON-tenant-organization
- 状态: active（无租户维度，仅组织维度）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `system/service/impl/SysDeptServiceImpl.java`、`SysUserServiceImpl.java`、`SysPostServiceImpl.java`、`framework/aspectj/DataScopeAspect.java`、`resources/mapper/system/*.xml`
- 业务说明: 组织维度由「部门树 + 岗位 + 用户-角色-岗位关联」构成。部门为 `sys_dept` 自关联树（`parent_id`/`ancestors`），岗位为 `sys_post`，关联表为 `sys_user_role`、`sys_user_post`、`sys_role_dept`。数据范围（`data_scope`）挂在角色上，取值 1=全部、2=自定义、3=本部门、4=本部门及以下、5=仅本人。**项目无租户字段与租户隔离逻辑**（grep `tenant`/`tenantId` 于 `com/qvsu` 与 `mapper/**` 及 `open-api/sql/**` 零命中）。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDeptServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/DataScopeAspect.java`
  - path: `open-api/qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml`
  - symbol: `SysDeptServiceImpl.selectDeptList`、`SysDeptServiceImpl.selectDeptTree`、`SysDeptServiceImpl.selectDeptTreeExcludeChild`、`SysUserServiceImpl.insertUserRole`、`SysUserServiceImpl.insertUserPost`、`DataScopeAspect.dataScopeFilter`
  - route/topic/job/config/table: `/system/dept/**`、`/system/post/**`、`sys_dept`、`sys_post`、`sys_user_post`、`sys_user_role`、`sys_role_dept`
  - grep keywords: `@DataScope`、`deptAlias`、`userAlias`、`params.dataScope`、`find_in_set`

### 能力接口

#### CSI-org-dept-tree - 部门树

- ID: CSI-org-dept-tree
- 接口形态: REST + Service（Ztree JSON）
- 提供者: `SysDeptController`（`open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java`）→ `SysDeptServiceImpl.selectDeptList/selectDeptTree/selectDeptTreeExcludeChild/roleDeptTreeData`
- 输入输出核心语义: 输入 `SysDept` 查询条件（含 `excludeId`）；输出 `List<Ztree>`；父节点 ID 为 0 时为根。上级部门链以 `ancestors` 逗号串保存（`SysDeptServiceImpl.selectDeptTreeExcludeChild` 第 75 行 `ArrayUtils.contains(StringUtils.split(d.getAncestors(), ","), excludeId + "")`）。
- 调用前置条件: 已认证；`@RequiresPermissions("system:dept:list"|"system:user:list"|"system:role:edit")`。
- 数据、状态或事件副作用: 新增/修改/删除写 `sys_dept`；`roleDeptTreeData` 只读 `sys_role_dept`。
- 失败、重试、补偿和降级语义: 无；`deptMapper.selectDeptList` 内的 `${params.dataScope}` 由 AOP 预置（见 CSI-scope-filter）。
- 消费功能列表:
  - `SysDeptController.list:45`（`POST /system/dept/list`）
  - `SysDeptController.selectDeptTree:167`（`GET /system/dept/selectDeptTree/{deptId}`）
  - `SysDeptController.selectDeptTree:179`（`GET /system/dept/selectDeptTree/{deptId}/{excludeId}`）
  - `SysDeptController.treeDataExcludeChild:179`（`GET /system/dept/treeData/{excludeId}`）
  - `SysDeptController.add:57`、`addSave:73`、`edit:89`、`editSave:107`、`remove:134`
  - `SysUserController.selectDeptTree:173`、`SysUserController.deptTreeData:336`、`SysUserController.selectDeptTreeByDeptId:350` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysRoleController.deptTreeData:160`（角色数据范围选部门）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - `SysRoleController.authDataScope:232`（读取 `roleDeptTreeData`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - 前端 `templates/system/dept/dept.html`、`templates/system/dept/tree.html`、`templates/system/user/deptTree.html`、`templates/system/role/dataScope.html`

#### CSI-org-post - 岗位管理

- ID: CSI-org-post
- 接口形态: REST + Service
- 提供者: `SysPostController`（`open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`）→ `SysPostServiceImpl`
- 输入输出核心语义: 岗位编码 `post_code`、名称、排序、状态；校验唯一性 `checkPostCodeUnique`/`checkPostNameUnique`（**该两个端点无 `@RequiresPermissions`**，仅受 `/** -> user` 认证保护）。
- 调用前置条件: 已认证。
- 数据、状态或事件副作用: 写 `sys_post`；用户-岗位关联写 `sys_user_post`（`SysUserServiceImpl.insertUserPost:361`，删除时 `userPostMapper.deleteUserPostByUserId`）。
- 失败、重试、补偿和降级语义: 岗位被用户引用时 `SysPostServiceImpl` 通过 `countUserPostById` 拒绝删除（推断，依据 `SysPostServiceImpl` 中调用 `userPostMapper.countUserPostById`）。
- 消费功能列表:
  - `SysPostController.list:44`、`export:55`、`remove:65`、`add:77`、`addSave:87`、`edit:108`、`editSave:119`、`post:37`
  - `SysPostController.checkPostCodeUnique`（无权限注解）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`
  - `SysPostController.checkPostNameUnique`（无权限注解）— 同上
  - `SysUserServiceImpl.insertUserPost:361`、`SysUserServiceImpl.deleteUserById:186`、`SysUserServiceImpl.updateUser:263` — `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java`
  - `SysProfileController.profile:56`（`userService.selectUserPostGroup` 展示岗位组）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`
  - 前端 `templates/system/post/post.html`、`templates/system/user/user.html`（岗位下拉）

#### CSI-org-user-role-post-link - 用户-角色-岗位关联

- ID: CSI-org-user-role-post-link
- 接口形态: Service（批量插入/删除关联表）
- 提供者: `SysUserServiceImpl.insertUserRole(Long, Long[])`、`insertUserPost(SysUser)`；`SysRoleServiceImpl.insertAuthUser`/`deleteAuthUser`/`deleteAuthUserInfos`
- 输入输出核心语义: `insertUserRole` 先 `deleteUserRoleByUserId` 再 `batchUserRole`；`insertUserPost` 先删后 `batchUserPost`；均在同一 `@Transactional` 内。
- 调用前置条件: 已认证且具备 `system:user:add|edit` / `system:role:edit`。
- 数据、状态或事件副作用: 写 `sys_user_role`、`sys_user_post`。
- 失败、重试、补偿和降级语义: 事务回滚（`@Transactional`）；无外部重试。
- 消费功能列表:
  - `SysUserController.addSave:128` → `SysUserServiceImpl.insertUser:226,228` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysUserController.editSave:187` → `SysUserServiceImpl.updateUser:257,259,263`
  - `SysUserController.insertAuthRole:263` → `SysUserServiceImpl.insertUserAuth:314,315`
  - `SysUserController.remove:276` → `SysUserServiceImpl.deleteUserById:184,186`
  - `SysRoleController.selectAuthUserAll:305`、`SysRoleController.cancelAuthUser:269`、`SysRoleController.cancelAuthUserAll:318` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - `SysRoleServiceImpl.selectAllocatedUserList`/`selectUnallocatedUserList`（底层 `SysUserServiceImpl.selectAllocatedList`/`selectUnallocatedList`，带数据范围）

#### CSI-scope-filter - 数据范围过滤（`dataScope`）

- ID: CSI-scope-filter
- 接口形态: AOP `@DataScope(deptAlias, userAlias, permission)` → 向 `BaseEntity.params["dataScope"]` 注入 SQL 片段 → MyBatis `${params.dataScope}` 拼接
- 提供者: `com.qvsu.framework.aspectj.DataScopeAspect.doBefore/dataScopeFilter`；`com.qvsu.common.core.context.PermissionContextHolder`
- 输入输出核心语义: 管理员（`user.isAdmin()`）跳过；否则按角色 `data_scope` 生成 `AND (...)` 片段：`DATA_SCOPE_ALL="1"` 直接 break（不过滤）、`DATA_SCOPE_CUSTOM="2"` → `d.dept_id IN (SELECT dept_id FROM sys_role_dept WHERE role_id = ?)`（多个自定义角色用 `role_id in (...)` 合并）、`DATA_SCOPE_DEPT="3"` → `d.dept_id = ?`、`DATA_SCOPE_DEPT_AND_CHILD="4"` → `d.dept_id IN (SELECT dept_id FROM sys_dept WHERE dept_id = ? or find_in_set(?, ancestors))`、`DATA_SCOPE_SELF="5"` → `u.user_id = ?`（无 `userAlias` 时退化为 `d.dept_id = 0`，即查不到任何数据）。角色权限码与当前 `@RequiresPermissions` 不一致时该角色被跳过（`dataScopeFilter` 第 108 行 `StringUtils.containsAny(role.getPermissions(), ...)`）。
- 调用前置条件: 被注解方法的**第一个参数必须是 `BaseEntity` 子类**（`dataScopeFilter` 第 161–166 行强转，否则静默跳过）；`SysRole.permissions` 必须在登录时经 `SysLoginService.setRolePermission` 填充。
- 数据、状态或事件副作用: 修改入参对象的 `params` map；不写库。
- 失败、重试、补偿和降级语义: `clearDataScope` 在拼接前清空 `params.dataScope` 防注入（`DataScopeAspect.java:173-181`）；异常无补偿。
- 消费功能列表（注解点 + 执行的 Mapper 语句）:
  - `SysUserServiceImpl.selectUserList:81` `@DataScope(deptAlias="d", userAlias="u")` → `SysUserMapper.selectUserList`（`SysUserMapper.xml:88` `${params.dataScope}`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java`
  - `SysUserServiceImpl.selectAllocatedList:94` → `SysUserMapper.selectAllocatedList`（`SysUserMapper.xml:105`）
  - `SysUserServiceImpl.selectUnallocatedList:107` → `SysUserMapper.selectUnallocatedList`（`SysUserMapper.xml:123`）
  - `SysRoleServiceImpl.selectRoleList:55` `@DataScope(deptAlias="d")` → `SysRoleMapper.selectRoleList`（`SysRoleMapper.xml:61`）
  - `SysDeptServiceImpl.selectDeptList:40` `@DataScope(deptAlias="d")` → `SysDeptMapper.selectDeptList`（`SysDeptMapper.xml:54`）
  - `SysDeptServiceImpl.selectDeptTree:53` → 同上
  - `SysDeptServiceImpl.selectDeptTreeExcludeChild:68` → 同上
  - 上层 REST 触发点：`SysUserController.list:71`、`SysUserController.export:82`、`SysRoleController.list:56`、`SysRoleController.allocatedList:281`、`SysRoleController.unallocatedList:292`、`SysDeptController.list:45`、`SysDeptController.selectDeptTree:167`、`SysDeptController.treeDataExcludeChild:179`

---

## COMMON-session-online - 会话持久化与在线用户

- ID: COMMON-session-online
- 状态: active（写入与过期清理完整；在线用户查询/强退的 REST 读侧**未实现**）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `framework/shiro/session/*`、`framework/shiro/web/session/*`、`framework/shiro/service/SysShiroService.java`、`framework/shiro/web/filter/{kickout,online,sync}/*`、`system/service/impl/SysUserOnlineServiceImpl.java`、`framework/manager/factory/AsyncFactory.java`
- 业务说明: Shiro 会话持久化到 `sys_user_online`，实现「重启不丢会话、多实例可读会话」；在线状态枚举 `OnlineStatus.on_line`/`off_line`。并发登录控制、踢人、强制下线、会话过期批量清理均建立在该表之上。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionDAO.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/SpringSessionValidationScheduler.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/sync/SyncOnlineSessionFilter.java`
  - symbol: `OnlineSessionDAO.syncToDb`、`OnlineSessionDAO.doReadSession`、`OnlineSessionDAO.doDelete`、`SysShiroService.getSession`、`KickoutSessionFilter.onAccessDenied`、`OnlineWebSessionManager.validateSessions`
  - route/topic/job/config/table: `sys_user_online`、`shiro.session.expireTime`、`shiro.session.validationInterval`、`shiro.session.dbSyncPeriod`、`shiro.session.maxSession`、`shiro.session.kickoutAfter`
  - grep keywords: `OnlineSession`、`syncToDb`、`kickout`、`removeUserCache`、`sys-userCache`

### 能力接口

#### CSI-online-session-db - 会话持久化（DB Session DAO）

- ID: CSI-online-session-db
- 接口形态: Shiro `SessionDAO`（`EnterpriseCacheSessionDAO`）+ Ehcache `shiro-activeSessionCache` 二级缓存
- 提供者: `com.qvsu.framework.shiro.session.OnlineSessionDAO`（Bean 定义 `ShiroConfig.sessionDAO()`）；读取代理 `com.qvsu.framework.shiro.service.SysShiroService.getSession`；工厂 `com.qvsu.framework.shiro.session.OnlineSessionFactory`
- 输入输出核心语义: `doReadSession(sessionId)` → `SysShiroService.getSession` → `ISysUserOnlineService.selectOnlineById` → `SysUserOnlineMapper.selectOnlineById`；`syncToDb(OnlineSession)` 在 `dbSyncPeriod`（分钟）间隔或属性变更时才异步落库（`OnlineSessionDAO.java:67-101`）；`doDelete` 置 `OnlineStatus.off_line` 后删行。
- 调用前置条件: `sys-userCache`/`shiro-activeSessionCache` 必须在 `ehcache/ehcache-shiro.xml` 中定义，否则 `SysUserOnlineServiceImpl.removeUserCache` 与 `CacheUtils.getCache` 抛 `RuntimeException`。
- 数据、状态或事件副作用: 新增/更新/删除 `sys_user_online`；写 Ehcache `shiro-activeSessionCache`（`OnlineSessionDAO` 继承）与 `sys-userCache`。
- 失败、重试、补偿和降级语义: 落库走 `AsyncManager`（`AsyncFactory.syncSessionToDb`）异步线程；异步失败不阻断请求，无重试。`OnlineWebSessionManager.getActiveSessions()` 直接抛 `UnsupportedOperationException`（第 173 行），即**不支持枚举活跃会话**。
- 消费功能列表:
  - `ShiroConfig.sessionManager()`（装配 SessionDAO/SessionFactory/校验调度器）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:229`
  - `SyncOnlineSessionFilter.onPreHandle:30` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/sync/SyncOnlineSessionFilter.java`
  - `OnlineSessionFilter.isAccessAllowed:45`、`OnlineSessionFilter.isAccessAllowed:62` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java`
  - `KickoutSessionFilter.onAccessDenied:105`（读取被踢会话对象）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java`
  - `AsyncFactory.syncSessionToDb:38`（组装 `SysUserOnline` 并 `saveOnline`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/factory/AsyncFactory.java`
  - `SysShiroService.deleteSession:30`、`SysShiroService.getSession:39`、`SysShiroService.createSession:45` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysShiroService.java`
  - `OnlineWebSessionManager.setAttribute:34`、`removeAttribute:68`（标记属性变更触发同步）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java`

#### CSI-online-concurrent-limit - 并发登录控制与踢人

- ID: CSI-online-concurrent-limit
- 接口形态: Shiro Filter `kickout`（`AccessControlFilter.onAccessDenied`，`isAccessAllowed` 恒返回 false 以强制走 `onAccessDenied`）
- 提供者: `com.qvsu.framework.shiro.web.filter.kickout.KickoutSessionFilter`；装配 `ShiroConfig.kickoutSessionFilter()`
- 输入输出核心语义: 以 `loginName` 为 key 在 Ehcache `sys-userCache` 维护 `Deque<sessionId>`；`maxSession = shiro.session.maxSession`（当前 `-1` 表示不限制，`KickoutSessionFilter.java:64` 直接放行）；超限时按 `kickoutAfter` 决定踢新（`removeFirst`）或踢旧（`removeLast`），给被踢会话置属性 `kickout=true`。被踢请求：Ajax 返回 `AjaxResult.error("您已在别处登录，请您修改密码或重新登录")`，非 Ajax 302 到 `kickoutUrl = "/login?kickout=1"`。
- 调用前置条件: `subject.isAuthenticated() || subject.isRemembered()` 且 `maxSession != -1`；要求 Ehcache 缓存名 `sys-userCache` 存在（`ShiroConstants.SYS_USERCACHE`，与 `ehcache-shiro.xml:35` 一致）。
- 数据、状态或事件副作用: 写 Ehcache `sys-userCache`；给 Shiro Session 写属性 `kickout`；被踢时 `subject.logout()` 触发 `sys_user_online` 删行。
- 失败、重试、补偿和降级语义: 取被踢 Session 的异常被 `catch` 后忽略（第 112–115 行）；`onAccessDenied` 整体 `catch` 后按 Ajax 响应返回，即**异常即视为拒绝**。
- 消费功能列表:
  - `ShiroConfig.kickoutSessionFilter:421`（装配 `maxSession`/`kickoutAfter`/`kickoutUrl`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - 过滤链 `("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:349`
  - `SysUserOnlineServiceImpl.removeUserCache:117`（注销/过期时从 `sys-userCache` 队列移除 sessionId）— `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserOnlineServiceImpl.java`
  - `LogoutFilter.preHandle:59`（注销时调用 `removeUserCache`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/LogoutFilter.java`
  - `OnlineWebSessionManager.validateSessions:138`（过期清理时调用 `removeUserCache`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java`
  - 前端 `templates/login.html`（`kickout=1` 时提示将被踢原因，推断依据 `kickoutUrl` 参数）

#### CSI-online-force-offline - 强制下线与会话过期清理

- ID: CSI-online-force-offline
- 接口形态: 内部 Service + 定时调度（`validateSessions`）
- 提供者: `OnlineWebSessionManager.validateSessions`、`SysUserOnlineServiceImpl.forceLogout(String)`、`batchDeleteOnline(List<String>)`
- 输入输出核心语义: 每 `shiro.session.validationInterval`（分钟，当前 10）由 `SpringSessionValidationScheduler` 触发 `sessionManager.validateSessions()`；按 `lastAccessTime <= now - globalSessionTimeout` 查 `selectOnlineByExpired`，逐条 `retrieveSession` 判定失效后批量删库并清 `sys-userCache`。`forceLogout(sessionId)` 仅删 `sys_user_online` 行。
- 调用前置条件: `shiro.session.expireTime`（分钟，当前 30）→ `globalSessionTimeout = expireTime * 60 * 1000`；`timeout < 0` 时跳过（不过期）。
- 数据、状态或事件副作用: 删除 `sys_user_online` 行（批量）；写 Ehcache `sys-userCache`；写日志「invalidation sessions...」。
- 失败、重试、补偿和降级语义: 批量删除异常只 `log.error`（第 148–151 行），不做重试。**`forceLogout` 与 `selectUserOnlineList` 当前无任何 REST 消费者**（全量 grep `forceLogout`、`selectUserOnlineList` 仅命中 `ISysUserOnlineService`、`SysUserOnlineServiceImpl`、`SysUserOnlineMapper`），即「在线用户」菜单与强退按钮**未实现**。
- 消费功能列表:
  - `SpringSessionValidationScheduler.enableSessionValidation:75` → `sessionManager.validateSessions()` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/SpringSessionValidationScheduler.java`
  - `ShiroConfig.sessionManager:241`（注入 `SpringSessionValidationScheduler` 并 `setSessionValidationSchedulerEnabled(true)`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - `OnlineSessionFilter.isAccessAllowed:66`（`OnlineStatus.off_line` 会话强制下线并 `subject.logout()`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java`
  - `OnlineSessionDAO.doDelete:107` → `SysShiroService.deleteSession` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionDAO.java`
  - **未实现**：`GET/POST /monitor/userOnline/**` 路由不存在（`docs/tools/assets.json` 的 `Routes` 中 `monitor` 前缀仅 `/monitor/job*`、`/monitor/jobLog*`）；`templates/monitor/` 下仅有 `job/` 子目录（事实）。

---

## COMMON-security-guard - 安全防护（XSS / CSRF / 同步过滤器 / 口令加密）

- ID: COMMON-security-guard
- 状态: partial（XSS 默认开启但覆盖面窄；CSRF 默认关闭且无前端 Token 头；同步过滤器为会话同步用途而非并发控制）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `common/xss/*`、`common/utils/html/*`、`framework/config/FilterConfig.java`、`framework/shiro/web/filter/csrf/CsrfValidateFilter.java`、`framework/shiro/web/filter/sync/SyncOnlineSessionFilter.java`、`common/utils/security/*`、`resources/application.yml`
- 业务说明: 平台级横向安全防护。XSS 走 Servlet Filter 正则 URL 匹配；CSRF 走 Shiro Filter 比对 Header 与 Session Token；口令走 MD5 加盐散列；另有「同步会话过滤」在同一次请求内把会话同步到 DB。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/xss/XssFilter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/xss/XssHttpServletRequestWrapper.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/FilterConfig.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/csrf/CsrfValidateFilter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/security/Md5Utils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/security/CipherUtils.java`
  - symbol: `XssFilter.doFilter`、`XssHttpServletRequestWrapper.getParameterValues`、`CsrfValidateFilter.isAccessAllowed`、`SysPasswordService.encryptPassword`、`CipherUtils.generateNewKey`
  - route/topic/job/config/table: `xss.enabled`、`xss.excludes`、`xss.urlPatterns`、`csrf.enabled`、`csrf.whites`、`shiro.cookie.cipherKey`
  - grep keywords: `XssFilter`、`EscapeUtil.clean`、`X_CSRF_TOKEN`、`generateToken`

### 能力接口

#### CSI-xss-filter - XSS 过滤

- ID: CSI-xss-filter
- 接口形态: Servlet `Filter`（`FilterRegistrationBean`，`order = HIGHEST_PRECEDENCE`）+ `HttpServletRequestWrapper`
- 提供者: `com.qvsu.common.xss.XssFilter`、`com.qvsu.common.xss.XssHttpServletRequestWrapper`、`com.qvsu.common.utils.html.EscapeUtil.clean`（底层 `HTMLFilter`）；注册 `com.qvsu.framework.config.FilterConfig`（`@ConditionalOnProperty(value="xss.enabled", havingValue="true")`）
- 输入输出核心语义: 仅对 **POST 且 URL 命中 `xss.urlPatterns`** 的请求生效；`handleExcludeURL` 对 `GET`/`DELETE` 一律返回 true（不过滤，`XssFilter.java:62`），并跳过 `xss.excludes` 匹配项。生效时对 `getParameterValues` 的每个值执行 `EscapeUtil.clean(...).trim()`。
- 调用前置条件: `xss.enabled=true`（当前为 true）；URL 在 `xss.urlPatterns=/system/*,/tool/*` 内；方法为 POST；不在 `xss.excludes=/system/notice/*` 内。
- 数据、状态或事件副作用: 无；仅改写请求参数值。
- 失败、重试、补偿和降级语义: 无补偿；`xss.enabled=false` 时 `FilterConfig` 整个 Bean 不注册。
- 覆盖缺口（事实）: `/admin/open/**`、`/common/**`、`/system/user/profile/**`、`/monitor/**`、`/selftest/**`、`/open/**` **均不在 `xss.urlPatterns` 内**，因此这些入口的 POST 参数不做 XSS 清洗；`XssHttpServletRequestWrapper` 只重写 `getParameterValues`，**不处理 JSON Body**（无 `getInputStream` 重写），所以 `@RequestBody`/`application/json` 提交的内容完全绕过 XSS 过滤。
- 消费功能列表:
  - `FilterConfig.xssFilterRegistration:31`（注册 Filter 与 `xssFilter` 名称）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/FilterConfig.java`
  - 覆盖到的写操作入口（POST 且 URL 命中 `/system/*`）：`SysUserController.addSave`、`SysUserController.editSave`、`SysUserController.changeStatus`、`SysUserController.resetPwdSave`、`SysUserController.importData`、`SysUserController.importTemplate`、`SysUserController.list`、`SysUserController.checkLoginNameUnique`、`SysUserController.checkPhoneUnique`、`SysUserController.checkEmailUnique`、`SysRoleController.addSave`、`SysRoleController.editSave`、`SysRoleController.changeStatus`、`SysRoleController.authDataScope`、`SysRoleController.authUser/*`、`SysMenuController.addSave`、`SysMenuController.editSave`、`SysMenuController.updateSort`、`SysMenuController.checkMenuNameUnique`、`SysDeptController.addSave`、`SysDeptController.editSave`、`SysDeptController.checkDeptNameUnique`、`SysPostController.addSave`、`SysPostController.editSave`、`SysPostController.checkPostCodeUnique`、`SysPostController.checkPostNameUnique`、`SysDictTypeController.*`、`SysDictDataController.*`、`SysConfigController.*`、`SysNoticeController.addSave`（被 `excludes` 排除，**不过滤**）、`SysNoticeController.editSave`（同上）
  - 未被覆盖：`OpenAppController.addSave:56`、`OpenAppController.editSave:74`、`OpenAppController.resetSecret:93`、`OpenApiMgrController.addSave:77`、`OpenApiMgrController.editSave:93`、`OpenAuthController.save:60`、`OpenDocController.generate:70`、`CommonController.uploadFile:77`、`CommonController.uploadFiles:104`、`SysLoginController.ajaxLogin:57`、`SysRegisterController.ajaxRegister:37`、`SysProfileController.update:128`、`SysProfileController.updateAvatar:157`、`SysProfileController.resetPwd:79`、`SysJobController.addSave:135`、`SysJobController.editSave:200`

#### CSI-csrf-filter - CSRF 防护

- ID: CSI-csrf-filter
- 接口形态: Shiro `AccessControlFilter`（`csrfValidateFilter`）
- 提供者: `com.qvsu.framework.shiro.web.filter.csrf.CsrfValidateFilter`；Token 生成 `com.qvsu.common.utils.ServletUtils.generateToken`（在 `SysIndexController.index:92` 写入 Session 的 `ShiroConstants.CSRF_TOKEN`）；装配 `ShiroConfig.csrfValidateFilter()`（`setEnabled(csrfEnabled)`、`setCsrfWhites(StringUtils.str2List(csrfWhites, ","))`）
- 输入输出核心语义: 仅校验 **POST**；命中 `csrf.whites`（当前 `/druid`）放行；否则取 Header `X-CSRF-Token` 与 Session 中 `CSRF_TOKEN` 做 `equalsIgnoreCase` 比对；失败渲染 `{"code":"1","msg":"当前请求的安全验证未通过，请刷新页面后重试。"}` 并返回 false。
- 调用前置条件: `csrf.enabled=true`。**当前 `application.yml` 第 144 行为 `csrf.enabled: false`**，即 `ShiroConfig` 第 285 行 `csrfValidateFilter.setEnabled(false)`，过滤器虽在 `/**` 链上（`ShiroConfig.java:349`）但 `isAccessAllowed` 永不放行校验分支（推断：`EnabledFilter` 在 `enabled=false` 时不执行校验；证据为 `ShiroConfig` 显式传入 false，且前端模板中**没有任何 `X-CSRF-Token` 请求头注入代码**，grep `X-CSRF-Token`/`csrfToken` 于 `resources/templates/**` 与 `resources/static/**` 零命中——若开启将使全部 POST 表单失败）。
- 数据、状态或事件副作用: 无；`SysIndexController.index:92` 主动写 Session Token（即使开关为 false 也写）。
- 失败、重试、补偿和降级语义: 失败即拒绝（无重试）；白名单 `csrf.whites` 为静态配置，无运行时接口。
- 消费功能列表:
  - `ShiroConfig.csrfValidateFilter:282`（装配开关与白名单）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - 过滤链 `("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:349`
  - `SysIndexController.index:92`（Token 生成写入 Session）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`
  - 全局影响面：全部 POST 端点（184 个端点中 POST 方法 88 个，见 `docs/tools/semantics.json`）；当前因开关关闭**实际未生效**。
  - 前端：无消费者（`templates/**`、`static/**` 内无 Token 头注入）。

#### CSI-sync-session-filter - 同步会话过滤器

- ID: CSI-sync-session-filter
- 接口形态: Shiro `PathMatchingFilter`（`syncOnlineSession`）
- 提供者: `com.qvsu.framework.shiro.web.filter.sync.SyncOnlineSessionFilter.onPreHandle`；装配 `ShiroConfig.syncOnlineSessionFilter()`
- 输入输出核心语义: 从 request 属性 `online_session` 取 `OnlineSession`；若 `userId != null` 且 `stopTimestamp == null`，调用 `onlineSessionDAO.syncToDb(session)`，保证一次请求最多同步一次会话数据到 DB。
- 调用前置条件: 必须排在 `onlineSession` 过滤器之后（`onlineSession` 负责把 `ONLINE_SESSION` 放进 request，`OnlineSessionFilter.java:49`）；过滤链顺序 `user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter` 满足该前置。
- 数据、状态或事件副作用: 触发 `sys_user_online` 的 UPSERT（经 `AsyncFactory.syncSessionToDb`）。
- 失败、重试、补偿和降级语义: `onPreHandle` 恒返回 true，同步失败不影响请求；无重试。
- 消费功能列表:
  - `ShiroConfig.syncOnlineSessionFilter:369` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - 过滤链 `("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:349`
  - `OnlineSessionFilter.isAccessAllowed:49`（上游放置 `ShiroConstants.ONLINE_SESSION`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java`
  - `OnlineSessionDAO.syncToDb:67`（下游落库）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionDAO.java`

#### CSI-password-crypto - 口令与 Cookie 加解密工具

- ID: CSI-password-crypto
- 接口形态: 静态工具类 + 内部 Service
- 提供者: `com.qvsu.common.utils.security.Md5Utils.hash(String)`、`com.qvsu.common.utils.security.CipherUtils`（`generateNewKey`、AES）、`com.qvsu.framework.shiro.service.SysPasswordService.encryptPassword`
- 输入输出核心语义: 口令散列 `MD5(loginName + password + salt)` 十六进制小写；记住我 Cookie 使用 AES 密钥（`shiro.cookie.cipherKey` 未配置时 `CipherUtils.generateNewKey(128, "AES")` 随机生成）。
- 调用前置条件: 无。
- 数据、状态或事件副作用: 无。
- 失败、重试、补偿和降级语义: `Md5Utils.hash` 失败时**返回入参原文**（`Md5Utils.java:64`），即静默降级为明文——属缺陷（见后文「安全风险与存疑项」R-6）。
- 消费功能列表:
  - `SysPasswordService.encryptPassword:81` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysPasswordService.java`
  - `ShiroConfig.rememberMeManager:413`（`CipherUtils.generateNewKey(128, "AES")`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - `SysUserController.addSave:148`、`SysUserController.resetPwdSave:231`（`ShiroUtils.randomSalt()`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysProfileController.resetPwd:90` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`
  - `SysRegisterService.register:69` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysRegisterService.java`
  - `SysUserServiceImpl.resetUserPwd`（写 `password`/`salt`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java`

---

## COMMON-audit - 审计与日志

- ID: COMMON-audit
- 状态: active（写侧完整；操作日志与登录日志的**查询/导出的 REST 读侧未实现**）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `framework/aspectj/LogAspect.java`、`common/annotation/Log.java`、`framework/manager/factory/AsyncFactory.java`、`system/domain/SysOperLog.java`、`system/domain/SysLogininfor.java`、`system/service/impl/SysOperLogServiceImpl.java`、`system/service/impl/SysLogininforServiceImpl.java`
- 业务说明: 两类审计数据：(1) 操作日志 `sys_oper_log`，由 `@Log` 注解 + `LogAspect` AOP 采集；(2) 登录日志 `sys_logininfor`，由 `AsyncFactory.recordLogininfor` 在各认证分支直接埋点。两者均异步落库。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/LogAspect.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/annotation/Log.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/factory/AsyncFactory.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysOperLogServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysLogininforServiceImpl.java`
  - symbol: `LogAspect.doBefore`、`LogAspect.doAfterReturning`、`LogAspect.doAfterThrowing`、`LogAspect.handleLog`、`AsyncFactory.recordOper`、`AsyncFactory.recordLogininfor`
  - route/topic/job/config/table: `sys_oper_log`、`sys_logininfor`；**无 `/monitor/operlog/**`、`/monitor/logininfor/**` 路由**
  - grep keywords: `@Log(`、`BusinessType`、`OperatorType`、`recordOper`、`recordLogininfor`

### 能力接口

#### CSI-audit-operlog - 操作日志（AOP）

- ID: CSI-audit-operlog
- 接口形态: Annotation `@Log(title, businessType, operatorType, isSaveRequestData, isSaveResponseData, excludeParamNames)` + AOP `@Before/@AfterReturning/@AfterThrowing`
- 提供者: `com.qvsu.framework.aspectj.LogAspect`；持久化 `com.qvsu.system.service.impl.SysOperLogServiceImpl.insertOperlog`；异步执行 `com.qvsu.framework.manager.AsyncManager`
- 输入输出核心语义: 采集 `operName`（登录名）、`deptName`、`operIp`、`operUrl`（截断 255）、`method`（`类名.方法名()`）、`requestMethod`、`operParam`（截断 2000，过滤 `password`/`oldPassword`/`newPassword`/`confirmPassword`）、`jsonResult`（截断 2000）、`status`（`BusinessStatus.SUCCESS=0`/`FAIL=1`）、`errorMsg`（截断 2000）、`costTime`、`operLocation`（`AddressUtils.getRealAddressByIP` 远程查询）。
- 调用前置条件: 方法上必须有 `@Log` 注解（`@annotation(controllerLog)` 切点）；`AsyncManager` 线程池可用。
- 数据、状态或事件副作用: 新增 `sys_oper_log` 一行；写 `sys-user` logger。
- 失败、重试、补偿和降级语义: `handleLog` 整体 try/catch，异常只 `log.error` 并 `printStackTrace`（第 127–132 行），**不阻断业务**；`GET /system/operlog/**` 与导出**不存在**，即日志**只写不可读**（事实：`docs/tools/assets.json` 的 `Routes` 中无任何 `operlog` 前缀；`templates/` 下无 `operlog` 目录）。
- 消费功能列表（`@Log` 注解逐点，共 70 处）:
  - `SysUserController.java:81,92,129,188,224,264,277,322`（导出/导入/新增/修改/重置密码/授权/删除/改状态）
  - `SysRoleController.java:66,91,126,161,178,218,258,270,306`（导出/新增/修改/数据权限/删除/改状态/授权用户）
  - `SysDeptController.java:72,106,133`（新增/修改/删除）
  - `SysPostController.java:54,66,88,120`（导出/删除/新增/修改）
  - `SysMenuController.java:60,103,132`（删除/新增/修改）
  - `SysDictTypeController.java:55,80,108,122,136`（导出/新增/修改/删除/刷新缓存）
  - `SysDictDataController.java:54,79,103,113`（导出/新增/修改/删除）
  - `SysConfigController.java:57,82,110,127,140`（导出/新增/修改/删除/刷新缓存）
  - `SysNoticeController.java:70,94,118`（新增/修改/删除）
  - `SysProfileController.java:76,125,154`（重置密码/个人信息更新/头像更新）
  - `SysJobController.java:61,72,94,108,131,196`（导出/删除/改状态/立即执行/新增/修改）
  - `SysJobLogController.java:65,76,94`（导出/删除/清空）
  - `OpenAppController.java:55,72,82,91`（Open 应用新增/修改/删除/重置密钥）
  - `OpenApiMgrController.java:75,91,100`（Open 接口新增/修改/删除）
  - 路径前缀：`open-api/qvsu-openapi/src/main/java/com/qvsu/`
  - **未覆盖**：`src/main/java/com/qvsu/open/controller/OpenAuthController.java`（授权保存 `save` 无 `@Log`）、`OpenDocController.java`（文档生成 `generate` 无 `@Log`）、`OpenLogController.java`（日志导出无 `@Log`）（事实）

#### CSI-audit-logininfor - 登录日志

- ID: CSI-audit-logininfor
- 接口形态: 内部静态工厂 `AsyncFactory.recordLogininfor(username, status, message, args...)` → `TimerTask` → `SysLogininforServiceImpl.insertLogininfor`
- 提供者: `com.qvsu.framework.manager.factory.AsyncFactory.recordLogininfor`；`com.qvsu.framework.manager.AsyncManager.me().execute(...)`
- 输入输出核心语义: 采集 `loginName`、`ipaddr`（`ShiroUtils.getIp()`，取自 Shiro Session host 截断 128）、`loginLocation`（`AddressUtils`）、`browser`/`os`（`UserAgentUtils`）、`msg`、`status`（`Constants.SUCCESS="0"` / `FAIL="1"`，映射规则：`Success`/`Logout`/`Register` → 成功）。同时以 `LogUtils.getBlock` 拼装写入 `sys-user` logger。
- 调用前置条件: `ServletUtils.getRequest()` 必须可用（`AsyncFactory.java:94` 在**主线程**读取 User-Agent 与 IP，若在无请求上下文调用将 NPE）。
- 数据、状态或事件副作用: 新增 `sys_logininfor` 一行；写 `sys-user` logger。
- 失败、重试、补偿和降级语义: 异步执行，失败不影响主流程；无重试。**查询/导出接口不存在**（无 `/monitor/logininfor/**` 路由与模板）。
- 消费功能列表（逐调用点）:
  - `SysLoginService.login:59`（验证码错误）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java`
  - `SysLoginService.login:65`（用户名或密码为空）
  - `SysLoginService.login:72`（口令长度越界）
  - `SysLoginService.login:80`（用户名长度越界）
  - `SysLoginService.login:88`（IP 黑名单命中）
  - `SysLoginService.login:109`（用户不存在）
  - `SysLoginService.login:115`（用户已删除 `del_flag='2'`）
  - `SysLoginService.login:121`（用户停用）
  - `SysLoginService.login:127`（登录成功）
  - `SysPasswordService.validate:55`（重试超限）
  - `SysPasswordService.validate:61`（口令不匹配，带剩余次数）
  - `LogoutFilter.preHandle:57`（注销成功）
  - `SysRegisterService.register:78`（注册成功）
  - 持久化终点 `AsyncFactory.recordLogininfor:132` → `SysLogininforServiceImpl.insertLogininfor` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/factory/AsyncFactory.java`

#### CSI-audit-async - 异步执行器（审计与在线会话共用）

- ID: CSI-audit-async
- 接口形态: 单例 `AsyncManager`（`ScheduledExecutorService`）+ 静态工厂 `AsyncFactory` + Spring `@PreDestroy` 停机钩子
- 提供者: `com.qvsu.framework.manager.AsyncManager`、`com.qvsu.framework.manager.factory.AsyncFactory`、`com.qvsu.common.config.thread.ThreadPoolConfig`、`com.qvsu.framework.manager.ShutdownManager`
- 输入输出核心语义: `AsyncManager.me().execute(TimerTask)`；工厂产出三类任务：`recordOper`（操作日志）、`recordLogininfor`（登录日志）、`syncSessionToDb`（在线会话落库）。
- 调用前置条件: `ThreadPoolConfig.scheduledExecutorService` Bean 存在。
- 数据、状态或事件副作用: 取决于任务类型（见上）。
- 失败、重试、补偿和降级语义: 任务内异常不向外传播；应用关闭时 `ShutdownManager` 调用 `AsyncManager.me().shutdown()`（`ShutdownManager.java:63`）优雅停机；**无持久化队列，进程崩溃将丢失未落库的日志**（推断）。
- 消费功能列表:
  - `LogAspect.handleLog:125`（`AsyncFactory.recordOper`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/LogAspect.java`
  - `SysLoginService.login:59,65,72,80,88,109,115,121,127`、`SysPasswordService.validate:55,61`、`LogoutFilter.preHandle:57`、`SysRegisterService.register:78`（`AsyncFactory.recordLogininfor`）
  - `OnlineSessionDAO.syncToDb:100`（`AsyncFactory.syncSessionToDb`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionDAO.java`
  - `ShutdownManager:63`（`AsyncManager.me().shutdown()`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/manager/ShutdownManager.java`

---

## COMMON-dictionary-config - 字典与参数配置

- ID: COMMON-dictionary-config
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `common/utils/DictUtils.java`、`system/service/impl/SysDictTypeServiceImpl.java`、`SysDictDataServiceImpl.java`、`SysConfigServiceImpl.java`、`framework/web/service/ConfigService.java`、`DictService.java`、`common/utils/poi/ExcelUtil.java`
- 业务说明: 字典（类型 + 数据）与参数（键值对）两类运行时配置。均以 Ehcache 为一级缓存、数据库为持久层。参数被业务硬编码引用（如 `sys.login.blackIPList`、`sys.account.registerUser`、`sys.index.sideTheme`、`sys.index.skinName`、`sys.index.footer`、`sys.index.tagsView`、`sys.index.menuStyle`、`sys.account.initPasswordModify`、`sys.account.passwordValidateDays`）。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/DictUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDictTypeServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysConfigServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/ConfigService.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/DictService.java`
  - symbol: `DictUtils.getDictCache/setDictCache/removeDictCache/clearDictCache/getDictLabel/getDictValue/getDictLabels`、`SysConfigServiceImpl.selectConfigByKey/resetConfigCache`、`ConfigService.getKey`、`DictService.getType/getLabel`
  - route/topic/job/config/table: `/system/dict/**`、`/system/config/**`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys.index.*`、`sys.account.*`、`sys.login.blackIPList`
  - grep keywords: `DictUtils.`、`CacheUtils.`、`sys-dict`、`sys-config`、`selectConfigByKey`

### 能力接口

#### CSI-dict-lookup - 字典读取与缓存

- ID: CSI-dict-lookup
- 接口形态: Service + Ehcache（`sys-dict`，`Constants.SYS_DICT_CACHE`）+ Thymeleaf Bean 表达式 `${@dict.getType(...)}` / `${@dict.getLabel(...)}`
- 提供者: `com.qvsu.common.utils.DictUtils`（`getDictCache`/`setDictCache`/`removeDictCache`/`clearDictCache`/`getDictLabel`/`getDictValue`/`getDictLabels`）；`com.qvsu.framework.web.service.DictService`；`com.qvsu.system.service.impl.SysDictTypeServiceImpl.selectDictDataByType`（第 79–88 行先查缓存，未命中查库并回填）
- 输入输出核心语义: 输入 `dictType`（如 `sys_normal_disable`、`sys_user_sex`、`sys_yes_no`、`sys_show_hide`、`sys_oper_type`、`sys_common_status`、`sys_job_group`、`sys_job_status`、`sys_notice_status`）→ 输出按 `dict_sort` 升序的 `List<SysDictData>`；`getDictLabel(dictType, dictValue, separator)` 输出标签串。
- 调用前置条件: Ehcache `sys-dict` 已定义（`ehcache-shiro.xml:73`，`eternal=true`）；`CacheUtils.getCache` 在缓存名不存在时抛 `RuntimeException`。
- 数据、状态或事件副作用: 写 Ehcache `sys-dict`；启动时 `SysDictTypeServiceImpl.init()` 预热（`@PostConstruct` → `loadingDictCache`）；字典增删改后 `SysDictDataServiceImpl.insertDictData:74`、`updateDictData:91`、`deleteDictDataByIds:109` 回填/清理缓存。
- 失败、重试、补偿和降级语义: 缓存穿透时回源 DB；`DictUtils.getDictLabel` 未命中返回 `StringUtils.EMPTY`（推断，依据 `DictUtils` 实现）。
- 消费功能列表:
  - `DictUtils.getDictCache:40`、`setDictCache:29`、`removeDictCache:215`、`clearDictCache:223` — `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/DictUtils.java`
  - `SysDictTypeServiceImpl.selectDictDataByType:79`、`resetDictCache:149`、`clearDictCache:159`、`refreshCache:184,205` — `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDictTypeServiceImpl.java`
  - `SysDictDataServiceImpl.insertDictData:74`、`updateDictData:91`、`deleteDictDataByIds:109` — `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDictDataServiceImpl.java`
  - `ExcelUtil.importExcel` 列下拉：`ExcelUtil.java:1105`（`DictUtils.getDictLabels(attr.dictType())`）、`:1109`、`:1401`（`convertByExp` → `DictUtils.getDictLabel`）、`:1414`（`reverseByExp` → `DictUtils.getDictValue`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/poi/ExcelUtil.java`
  - `DictService.getType:32`、`DictService.getLabel:44` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/DictService.java`
  - `SysDictDataController.list:45`（`POST /system/dict/data/list`）、`SysDictDataController.export:55`、`SysDictDataController.add:68`、`addSave:80`、`edit:92`、`editSave:104`、`remove:114`、`SysDictTypeController.list:46`、`export:56`、`add:70`、`addSave:81`、`edit:97`、`editSave:109`、`remove:123`、`refreshCache:135`、`detail:148`、`treeData`、`selectDictTree` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/`
  - 前端字典消费（Thymeleaf/JS）：`templates/system/user/user.html`（性别、状态）、`templates/system/dict/data/data.html`、`templates/system/dict/type/type.html`、`templates/system/notice/notice.html`（`sys_notice_status`）、`templates/system/role/role.html`（`sys_normal_disable`）、`templates/system/config/config.html`（`sys_yes_no`）、`templates/monitor/job/job.html`（`sys_job_group`/`sys_job_status`）

#### CSI-config-lookup - 参数配置读取与缓存

- ID: CSI-config-lookup
- 接口形态: Service + Ehcache（`sys-config`，`Constants.SYS_CONFIG_CACHE`）+ Thymeleaf Bean 表达式 `${@config.getKey('...')}`
- 提供者: `com.qvsu.framework.web.service.ConfigService.getKey(String)`；`com.qvsu.system.service.impl.SysConfigServiceImpl.selectConfigByKey(String)`（第 60–74 行先读 `sys_config:` 前缀缓存，未命中查库回填）
- 输入输出核心语义: 输入参数键 → 输出参数值字符串；未命中返回 `StringUtils.EMPTY`。内置参数（`config_type='Y'`）禁止删除（`SysConfigServiceImpl.deleteConfigByIds:140-143` 抛 `ServiceException`）。
- 调用前置条件: `ConfigService` 以 `@Service("config")` 暴露给 Thymeleaf；Ehcache `sys-config` 已定义（`eternal=true`）。
- 数据、状态或事件副作用: 写 Ehcache `sys-config`；`@PostConstruct init()` 预热全量参数；增删改同步更新缓存；`resetConfigCache` 清空后重载。
- 失败、重试、补偿和降级语义: 回源 DB；无重试。
- 消费功能列表:
  - `ConfigService.getKey:26` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/service/ConfigService.java`
  - `SysConfigServiceImpl.selectConfigByKey:58`、`insertConfig:95`、`updateConfig:112`、`deleteConfigByIds:134`、`loadingConfigCache:153`、`clearConfigCache:166`、`resetConfigCache:175` — `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysConfigServiceImpl.java`
  - `SysLoginService.login:85`（`sys.login.blackIPList`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java`
  - `SysLoginController.login:51`（`sys.account.registerUser`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java`
  - `SysRegisterController.ajaxRegister:39`（`sys.account.registerUser`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java`
  - `SysIndexController.index:59,60,61,62,73`（`sys.index.sideTheme`、`sys.index.skinName`、`sys.index.footer`、`sys.index.tagsView`、`sys.index.menuStyle`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`
  - `SysIndexController.initPasswordIsModify:166`（`sys.account.initPasswordModify`）、`passwordIsExpiration:173`（`sys.account.passwordValidateDays`）— 同上
  - `SysConfigController.list:47`、`export:58`、`add:71`、`addSave:81`、`edit:98`、`editSave:109`、`remove:126`、`refreshCache:139`、`checkConfigKeyUnique` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`
  - 前端 `${@config.getKey('...')}` 消费点：`templates/system/config/config.html`、`templates/index.html`（侧边栏主题）

---

## COMMON-notice - 通知公告

- ID: COMMON-notice
- 状态: active（仅管理端 CRUD + 查看，无推送通道、无已读未读、无收件人解析）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `web/controller/system/SysNoticeController.java`、`system/domain/SysNotice.java`、`system/service/impl/SysNoticeServiceImpl.java`、`resources/templates/system/notice/*`
- 业务说明: 平台公告的发布与查看。`sys_notice` 表字段含公告标题、类型（字典 `sys_notice_status`）、内容（富文本）、状态、创建者。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/domain/SysNotice.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysNoticeServiceImpl.java`
  - symbol: `SysNoticeController.list/add/addSave/edit/editSave/view/remove`、`SysNoticeServiceImpl.selectNoticeList/insertNotice/updateNotice/selectNoticeById/deleteNoticeByIds`
  - route/topic/job/config/table: `GET /system/notice`、`POST /system/notice/list`、`GET /system/notice/add`、`POST /system/notice/add`、`GET /system/notice/edit/{noticeId}`、`POST /system/notice/edit`、`GET /system/notice/view/{noticeId}`、`POST /system/notice/remove`、`sys_notice`
  - grep keywords: `SysNotice`、`system:notice:`

### 能力接口

#### CSI-notice-crud - 公告发布与查看

- ID: CSI-notice-crud
- 接口形态: REST + Thymeleaf 页面（7 个端点）
- 提供者: `com.qvsu.web.controller.system.SysNoticeController`；持久化 `com.qvsu.system.service.impl.SysNoticeServiceImpl`
- 输入输出核心语义: 列表返回 `TableDataInfo`（`startPage()` + `getDataTable(list)`）；新增/修改注入 `createBy`/`updateBy = getLoginName()`；查看返回 `view.html` 渲染。
- 调用前置条件: `@RequiresPermissions("system:notice:view|list|add|edit|remove")`；`GET /system/notice` 页面需 `system:notice:view`。
- 数据、状态或事件副作用: 写 `sys_notice`；写 `sys_oper_log`（新增/修改/删除三处 `@Log`）。
- 失败、重试、补偿和降级语义: `toAjax(rows)` 统一成功/失败；无重试。
- 消费功能列表:
  - `SysNoticeController.notice:36`（页面，`system:notice:view`）
  - `SysNoticeController.list:46`（`POST /system/notice/list`，`system:notice:list`）
  - `SysNoticeController.add:59`、`addSave:69`（`system:notice:add`，`@Log("通知公告", INSERT)`）
  - `SysNoticeController.edit:82`、`editSave:93`（`system:notice:edit`，`@Log("通知公告", UPDATE)`）
  - `SysNoticeController.view:106`（`system:notice:list`）
  - `SysNoticeController.remove:117`（`system:notice:remove`，`@Log("通知公告", DELETE)`）
  - 前端 `open-api/qvsu-openapi/src/main/resources/templates/system/notice/notice.html:35,38,41,53,54`、`add.html`、`edit.html`、`view.html`
  - 菜单条目 `107 通知公告 /system/notice`（`open-api/deploy/local-docker/mysql/init/10-qvsu.sql`、`open-api/deploy/local-docker/postgres/init/10-qvsu.sql`）
- 「不适用」结论（事实）: 系统内**不存在**站内信、短信、邮件、App 推送通道（grep `JavaMailSender`、`SmsService`、`WebSocket`、`PushService` 于 `com/qvsu` 零命中），也**不存在**用户侧公告收件箱（无 `/notice/my**` 之类路由）。公告的作用范围仅限后台管理端。

---

## COMMON-file - 文件上传下载

- ID: COMMON-file
- 状态: active（本地磁盘存储，无对象存储、无附件业务关联表）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `web/controller/common/CommonController.java`、`common/utils/file/*`、`common/config/QvsuConfig.java`、`common/config/ServerConfig.java`、`framework/config/ResourcesConfig.java`
- 业务说明: 统一文件上传（单/多）与下载（临时目录 / 本地资源）能力。存储介质为本地文件系统目录 `qvsu.profile`（默认 `D:/qvsu/uploadPath`），通过 `/profile/**` 静态资源映射对外提供访问。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUploadUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/MimeTypeUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileTypeUtils.java`
  - symbol: `CommonController.uploadFile/uploadFiles/fileDownload/resourceDownload`、`FileUploadUtils.upload`、`FileUtils.checkAllowDownload`、`FileUtils.writeBytes`、`FileUtils.deleteFile`
  - route/topic/job/config/table: `POST /common/upload`、`POST /common/uploads`、`GET /common/download`、`GET /common/download/resource`、`/profile/**`、`qvsu.profile`、`spring.servlet.multipart.max-file-size=10MB`、`spring.servlet.multipart.max-request-size=20MB`
  - grep keywords: `FileUploadUtils.upload`、`FILE_DELIMETER`、`getUploadPath`、`getDownloadPath`、`checkAllowDownload`

### 能力接口

#### CSI-file-upload - 文件上传

- ID: CSI-file-upload
- 接口形态: REST `POST /common/upload`（单文件，`MultipartFile file`）、`POST /common/uploads`（多文件，`List<MultipartFile> files`）
- 提供者: `com.qvsu.web.controller.common.CommonController.uploadFile`、`uploadFiles`；实现 `com.qvsu.common.utils.file.FileUploadUtils.upload(String, MultipartFile, String[], boolean)`
- 输入输出核心语义: 输出 `AjaxResult`，字段 `url`（`serverConfig.getUrl() + fileName`）、`fileName`、`newFileName`、`originalFilename`；多文件版本以 `,` 拼接为 `urls`/`fileNames`/`newFileNames`/`originalFilenames`。文件名默认按 `yyyy/MM/dd` 分目录 + UUID 重命名，默认上限 `50MB`（`FileUploadUtils.DEFAULT_MAX_SIZE`）、文件名长度上限 100。
- 调用前置条件: 已认证（过滤链 `/** -> user,...`，`/common/**` 未列 `anon`）；扩展名须在 `MimeTypeUtils.DEFAULT_ALLOWED_EXTENSION` 内，否则抛 `InvalidExtensionException`；头像额外限 `MimeTypeUtils.IMAGE_EXTENSION` 且启用自定义命名。
- 数据、状态或事件副作用: 落盘 `qvsu.profile` 下；**不写任何数据库表**（无附件关联表）。
- 失败、重试、补偿和降级语义: `CommonController` 捕获全部异常并返回 `AjaxResult.error(e.getMessage())`；`FileSizeLimitExceededException`/`FileNameLengthLimitExceededException`/`InvalidExtensionException` 由 `FileUploadUtils` 抛出；无清理补偿（部分成功即残留文件）。
- 消费功能列表:
  - `CommonController.uploadFile:77`（`POST /common/upload`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java`
  - `CommonController.uploadFiles:104`（`POST /common/uploads`）
  - `SysProfileController.updateAvatar:164`（`FileUploadUtils.upload(QvsuConfig.getAvatarPath(), file, MimeTypeUtils.IMAGE_EXTENSION, true)`，随后删旧头像 `FileUtils.deleteFile`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java`
  - `SysUserController.importData:98`（`MultipartFile file` 读取 `file.getInputStream()` 供 Excel 导入，未走 `FileUploadUtils`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - 前端 `open-api/qvsu-openapi/src/main/resources/templates/system/user/profile/avatar.html`（头像上传）、`templates/system/user/user.html`（导入弹窗）
  - 无权限注解（事实）：`/common/upload`、`/common/uploads` 均无 `@RequiresPermissions`，仅依赖认证。

#### CSI-file-download - 通用下载

- ID: CSI-file-download
- 接口形态: REST `GET /common/download?fileName=&delete=`、`GET /common/download/resource?resource=`
- 提供者: `com.qvsu.web.controller.common.CommonController.fileDownload`、`resourceDownload`；安全校验 `com.qvsu.common.utils.file.FileUtils.checkAllowDownload`
- 输入输出核心语义: `fileDownload` 通过 `QvsuConfig.getDownloadPath() + fileName` 定位临时文件并 `FileUtils.writeBytes` 写响应流；`resourceDownload` 通过 `QvsuConfig.getProfile() + FileUtils.stripPrefix(resource)` 定位本地资源；两者均先做 `checkAllowDownload` 白名单校验，非法文件名抛异常并 `log.error`。
- 调用前置条件: 已认证；文件名/资源路径在白名单内。
- 数据、状态或事件副作用: `delete=true` 时删除源文件（`FileUtils.deleteFile`）；不写库。
- 失败、重试、补偿和降级语义: 异常被捕获后仅记录日志，**返回 HTTP 200 空响应体**（用户无错误提示）。
- 消费功能列表:
  - `CommonController.fileDownload:47`（`GET /common/download`）
  - `CommonController.resourceDownload:141`（`GET /common/download/resource`）
  - 前端通用导出脚本 `open-api/qvsu-openapi/src/main/resources/static/ruoyi/js/ry-ui.js`（`$.table.exportExcel()` 触发下载）
  - `OpenDocController.download:88`（不经 `CommonController`，直接 `response.getWriter().write(html)` 输出 HTML 附件）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`

---

## COMMON-import-export - Excel / CSV 导入导出

- ID: COMMON-import-export
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `common/utils/poi/ExcelUtil.java`、`ExcelHandlerAdapter.java`、`common/annotation/Excel.java`、`Excels.java`、各 Controller 的 `export`/`importData` 方法
- 业务说明: 基于 Apache POI 的注解驱动导入导出。`@Excel` 注解描述列名、类型、日期格式、字典转换、下拉框与校验；`ExcelUtil<T>` 泛型化处理。OpenAPI 调用日志额外使用手写 CSV 导出。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/poi/ExcelUtil.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/poi/ExcelHandlerAdapter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/annotation/Excel.java`
  - symbol: `ExcelUtil.exportExcel(List<T>, String)`、`ExcelUtil.importExcel(InputStream)`、`ExcelUtil.importExcel(InputStream, int)`、`ExcelUtil.init`
  - route/topic/job/config/table: `/system/user/export`、`/system/user/importData`、`/system/user/importTemplate`、`/system/role/export`、`/system/post/export`、`/system/dict/export`、`/system/dict/data/export`、`/system/config/export`、`/monitor/job/export`、`/monitor/jobLog/export`、`/admin/open/log/exportCsv`
  - grep keywords: `ExcelUtil<`、`exportExcel(`、`importExcel(`、`@Excel(`

### 能力接口

#### CSI-excel-export - Excel 导出

- ID: CSI-excel-export
- 接口形态: 工具类 `ExcelUtil<T>.exportExcel(List<T>, String sheetName)` → `AjaxResult`（内部直接写 `HttpServletResponse`）
- 提供者: `com.qvsu.common.utils.poi.ExcelUtil`（构造函数 `ExcelUtil(Class<T> clazz)`）
- 输入输出核心语义: 依据目标类字段上的 `@Excel` 注解生成表头与数据行；支持 `readConverterExp` 字典转换（`SysUser.sex`、`SysOperLog.businessType` 等）、`dateFormat`、`cellType`、`targetAttr` 子对象展开（`@Excels`）。
- 调用前置条件: 需 `HttpServletResponse`（`ServletUtils.getResponse()`）；类必须有 `@Excel` 注解字段。
- 数据、状态或事件副作用: 无数据库写入；响应流输出 xlsx。
- 失败、重试、补偿和降级语义: POI 初始化失败时 `ExcelUtil.init` 抛出并填充错误消息（见 `ExcelUtil` 中 `init` 的 `this.type`/`message` 处理）；无重试。
- 消费功能列表（逐调用点）:
  - `SysUserController.export:88` `new ExcelUtil<SysUser>(SysUser.class).exportExcel(list, "用户数据")` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysRoleController.export:73`（"角色数据"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - `SysPostController.export:61`（"岗位数据"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`
  - `SysDictTypeController.export:63`（"字典类型"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`
  - `SysDictDataController.export:61`（"字典数据"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java`
  - `SysConfigController.export:64`（"参数数据"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`
  - `SysJobController.export:68`（"定时任务"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`
  - `SysJobLogController.export:72`（"调度日志"）— `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`
  - 前端触发点：`templates/system/user/user.html:77`、`templates/system/role/role.html:50`、`templates/system/post/post.html:44`、`templates/system/dict/type/type.html:50`、`templates/system/dict/data/data.html:47`、`templates/system/config/config.html:50`、`templates/monitor/job/job.html:47`、`templates/monitor/job/jobLog.html:52`（均为 `$.table.exportExcel()`）

#### CSI-excel-import - Excel 导入与模板下载

- ID: CSI-excel-import
- 接口形态: REST `POST /system/user/importData`（`MultipartFile file` + `boolean updateSupport`）、`GET /system/user/importTemplate`
- 提供者: `com.qvsu.web.controller.system.SysUserController.importData`、`importTemplate`；实现 `ExcelUtil<SysUser>.importExcel(InputStream)` 与 `ExcelUtil<SysUser>.exportExcel(...)` 生成模板
- 输入输出核心语义: 解析 xlsx 为 `List<SysUser>`，逐行按 `updateSupport` 决定新增或更新，汇总成功/失败条数并以 `AjaxResult` 消息返回（形如「很抱歉，导入失败！共 N 条数据格式不正确」）；模板下载为空行表头文件。
- 调用前置条件: `@RequiresPermissions("system:user:import")`（importData）/ `system:user:view`（importTemplate）；文件内容列须匹配 `SysUser` 的 `@Excel` 定义（`dept_id` 标 `Type.IMPORT`、「部门编号」）。
- 数据、状态或事件副作用: 批量写 `sys_user`、`sys_user_role`、`sys_user_post`（经 `SysUserServiceImpl.insertUser`）；写 `sys_oper_log`（`BusinessType.IMPORT`）。
- 失败、重试、补偿和降级语义: 逐行校验，失败行计数后整体返回错误消息，**无部分回滚语义**（推断，依据 `importData` 中循环调用逐条插入的写法）；无重试。
- 消费功能列表:
  - `SysUserController.importData:93` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysUserController.importTemplate:104` — 同上
  - `SysUserServiceImpl.insertUser`（被 importData 循环调用）— `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java`
  - 前端 `open-api/qvsu-openapi/src/main/resources/templates/system/user/user.html:74`（`$.table.importExcel()`）
  - `ExcelUtil.importExcel` 的字典下拉依赖 `DictUtils.getDictLabels`（`ExcelUtil.java:1105`）→ 见 CSI-dict-lookup

#### CSI-csv-export - 调用日志 CSV 导出

- ID: CSI-csv-export
- 接口形态: REST `GET /admin/open/log/exportCsv`（手写 CSV，非 POI）
- 提供者: `com.qvsu.open.controller.OpenLogController.exportCsv(String traceId, String appKey, String apiPath, Integer status, String beginTime, String endTime, HttpServletResponse)`
- 输入输出核心语义: 组装 `OpenCallLog` 查询对象（`beginTime`/`endTime` 放入 `params`），调用 `OpenManageService.selectLogList`，输出 13 列 UTF-8 BOM CSV（`traceId,appKey,appName,apiPath,method,respCode,costMs,status,errorMsg,clientIp,callTime,reqBody,respBody`），字段以双引号包裹、内部 `"` 转义为 `""`、换行替换为空格。
- 调用前置条件: 已认证（`/admin/**` 需 `user`）；**无 `@RequiresPermissions`**（事实）。
- 数据、状态或事件副作用: 只读 `open_call_log`；不写库；**无 `@Log` 审计**。
- 失败、重试、补偿和降级语义: 全异常捕获后 `log.error`，返回空响应体。
- 消费功能列表:
  - `OpenLogController.exportCsv:58` — `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java`
  - 前端 `open-api/qvsu-openapi/src/main/resources/templates/open/log/index.html:26`（`onclick="exportCsv()"`）
  - `OpenDocController.download:88`（同类 HTML 导出）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java`

---

## COMMON-scheduling - 统一任务调度

- ID: COMMON-scheduling
- 状态: active，但 JobStore 为**内存模式**，`QRTZ_*` 表未被使用
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `quartz/config/ScheduleConfig.java`、`quartz/service/impl/SysJobServiceImpl.java`、`quartz/util/*`、`quartz/task/*`、`quartz/controller/*`、`open-api/sql/quartz.sql`
- 业务说明: 基于 Quartz 的定时任务定义、执行与日志记录。支持两种调度类型：Bean 调用（`invokeTarget` 形如 `qvsuTask.qvsuNoParams()`）与 HTTP 调用（`jobType=2`，含 `requestUrl`/`requestMethod`/`requestHeaders`/`requestBody`/`contentType`/`timeout`）。任务并发控制通过 `QuartzJobExecution`（允许并发）与 `QuartzDisallowConcurrentExecution`（`@DisallowConcurrentExecution`）两个类选择。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobServiceImpl.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/ScheduleUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/AbstractQuartzJob.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/JobInvokeUtil.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/CronUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/HttpTask.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/config/ScheduleConfig.java`
  - symbol: `SysJobServiceImpl.init`、`ScheduleUtils.createScheduleJob`、`AbstractQuartzJob.execute/after`、`JobInvokeUtil.invokeMethod`、`CronUtils.isValid/getNextExecution/getRecentTriggerTime`
  - route/topic/job/config/table: `/monitor/job/**`、`/monitor/jobLog/**`、`sys_job`、`sys_job_log`、`QRTZ_*`（11 张，未被运行时使用）
  - grep keywords: `Scheduler`、`CronScheduleBuilder`、`@DisallowConcurrentExecution`、`JobInvokeUtil`、`JOB_WHITELIST_STR`

### 能力接口

#### CSI-job-definition - 任务定义与调度注册

- ID: CSI-job-definition
- 接口形态: REST（`/monitor/job/**`）+ Quartz `Scheduler` API
- 提供者: `com.qvsu.quartz.controller.SysJobController` → `com.qvsu.quartz.service.impl.SysJobServiceImpl` → `com.qvsu.quartz.util.ScheduleUtils.createScheduleJob`
- 输入输出核心语义: JobKey/TriggerKey 由 `ScheduleConstants.TASK_CLASS_NAME + jobId` 与 `jobGroup` 构成（`ScheduleUtils.getJobKey/getTriggerKey`）；创建时 `CronScheduleBuilder.cronSchedule(job.getCronExpression())` 并按 `misfirePolicy` 应用 `withMisfireHandlingInstruction*`；`status=1` 时 `scheduler.pauseJob`。`invokeTarget` 白名单校验 `ScheduleUtils.whiteList`（仅允许 `Constants.JOB_WHITELIST_STR = {"com.qvsu"}`，并排除 `JOB_ERROR_STR` 中的 `java.net.URL`、`javax.naming.InitialContext`、`org.yaml.snakeyaml`、`org.springframework`、`org.apache`、`com.qvsu.common.utils.file`、`com.qvsu.common.config`、`com.qvsu.generator`）。
- 调用前置条件: `@RequiresPermissions("monitor:job:view|list|add|edit|remove|changeStatus|detail|export")`；应用启动时 `SysJobServiceImpl.init()`（`@PostConstruct`）先 `scheduler.clear()` 再全量重建，即**内存 JobStore，重启后以数据库为准重建**。
- 数据、状态或事件副作用: 写 `sys_job`（新增/修改/暂停/恢复/删除）；`sys_oper_log`（6 处 `@Log("定时任务", ...)`）；**不写 `QRTZ_*` 表**（`ScheduleConfig` 为占位空类，未配置 `SchedulerFactoryBean` + `JobStoreTX`）。
- 失败、重试、补偿和降级语义: `@Transactional(rollbackFor = Exception.class)` 保证 DB 与 Scheduler 的先后顺序（先改库，成功后再操作 Scheduler）；Scheduler 操作异常向上抛导致事务回滚；无自动重试。
- 消费功能列表:
  - `SysJobController.job:44`、`SysJobController.list:51`、`SysJobController.export:62`、`SysJobController.remove:73`、`SysJobController.detail:82`、`SysJobController.changeStatus:95`、`SysJobController.run:109`、`SysJobController.add:121`、`SysJobController.addSave:132`、`SysJobController.edit:185`、`SysJobController.editSave:197`、`SysJobController.checkCronExpressionIsValid`（无权限注解）、`SysJobController.cron`（无权限注解）、`SysJobController.queryCronExpression`（无权限注解）— `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`
  - `SysJobServiceImpl.init:40`、`selectJobList:57`、`selectJobById:69`、`pauseJob:81`、`resumeJob:101`、`deleteJob:121`、`deleteJobByIds:141`、`changeStatus:158`、`run:180`、`insertJob:204`、`updateJob:222`、`updateSchedulerJob:239`、`checkCronExpressionIsValid:259` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobServiceImpl.java`
  - 前端 `templates/monitor/job/job.html`、`templates/monitor/job/add.html`、`templates/monitor/job/edit.html`、`templates/monitor/job/detail.html`、`templates/monitor/job/cron.html`
  - 菜单条目 `110 定时任务 /monitor/job`（`open-api/sql/quartz.sql`、`open-api/deploy/local-docker/mysql/init/35-quartz.sql`、`open-api/deploy/local-docker/postgres/init/35-quartz.sql`）

#### CSI-job-execute - 任务执行与 Bean/HTTP 分发

- ID: CSI-job-execute
- 接口形态: Quartz `Job.execute`（`AbstractQuartzJob` → `QuartzJobExecution` / `QuartzDisallowConcurrentExecution`）→ `JobInvokeUtil.invokeMethod`
- 提供者: `com.qvsu.quartz.util.AbstractQuartzJob`、`QuartzJobExecution`、`QuartzDisallowConcurrentExecution`、`com.qvsu.quartz.util.JobInvokeUtil`；内置任务实现 `com.qvsu.quartz.task.HttpTask`、`com.qvsu.quartz.task.QvsuTask`
- 输入输出核心语义: 参数从 `JobDataMap` 的 `ScheduleConstants.TASK_PROPERTIES` 取出 `SysJob`；按 `jobType` 分流：`JOB_TYPE_HTTP` 走 `invokeHttp`（`RestTemplate.exchange`，URL/方法/头/体/超时来自任务定义），否则 `invokeBean`（`SpringUtils.getBean(beanName)` 反射调用，支持 `'字符串'`、`true/false`、`L` 结尾 long、`D` 结尾 double、其余 int 五类参数解析）。`HttpTask` 暴露 `get/doGet/post/doPost/put/doPut/delete/doDelete/patch/doPatch/request` 供 `invokeTarget` 引用。
- 调用前置条件: Bean 名必须存在于 Spring 容器，或类全名可加载；`invokeTarget` 通过 `ScheduleUtils.whiteList` 白名单校验。
- 数据、状态或事件副作用: 写 `sys_job_log`（`AbstractQuartzJob.after` → `ISysJobLogService.addJobLog`，含 `jobName`/`jobGroup`/`invokeTarget`/`startTime`/`endTime`/`jobMessage`（耗时）/`status`/`exceptionInfo`（截断 2000））。
- 失败、重试、补偿和降级语义: `execute` 捕获所有异常后仍执行 `after` 记录失败日志；**无重试、无补偿**，失败仅落库与 `log.error`。HTTP 任务异常在 `JobInvokeUtil.invokeHttp` 中包装为 `RuntimeException("HTTP请求失败: ...")` 再上抛（`HttpTask` 自身则吞掉异常，两者行为不一致）。
- 消费功能列表:
  - `AbstractQuartzJob.execute:33`、`before:61`、`after:72` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/AbstractQuartzJob.java`
  - `QuartzJobExecution.doExecute`、`QuartzDisallowConcurrentExecution.doExecute` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/`
  - `JobInvokeUtil.invokeMethod:34`、`invokeHttp:54`、`invokeBean:99`、`invokeMethod(Object,String,List):152` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/JobInvokeUtil.java`
  - `HttpTask.get:35`、`doGet:44`、`post:67`、`doPost:76`、`put:103`、`doPut:111`、`delete:134`、`doDelete:142`、`patch:164`、`doPatch:172`、`request:195` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/HttpTask.java`
  - `QvsuTask.qvsuMultipleParams:14`、`qvsuParams:19`、`qvsuNoParams:24` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/QvsuTask.java`
  - `SysJobServiceImpl.run:180`（手动立即执行 `scheduler.triggerJob`）
  - 任务定义数据源：`open-api/sql/quartz.sql` 与 `deploy/local-docker/*/init/35-quartz.sql` 中的 `sys_job` 种子行

#### CSI-job-log - 调度日志

- ID: CSI-job-log
- 接口形态: 表 `sys_job_log` + REST（`/monitor/jobLog/**`）
- 提供者: 写入 `AbstractQuartzJob.after`；读取/清理 `com.qvsu.quartz.controller.SysJobLogController` → `SysJobLogServiceImpl`
- 输入输出核心语义: 列表返回 `TableDataInfo`；`detail/{jobLogId}` 返回详情页；`remove` 删除指定日志；`clean` 清空全部日志；`export` 导出 Excel（`ExcelUtil<SysJobLog>`，sheet 名「调度日志」）。
- 调用前置条件: `@RequiresPermissions("monitor:job:view|list|remove|detail|export")`。
- 数据、状态或事件副作用: `sys_job_log` 增/删；写 `sys_oper_log`（导出/删除/清空三处 `@Log("调度日志", ...)`）。
- 失败、重试、补偿和降级语义: 日志写入失败只 `log.error`（`AbstractQuartzJob.after:109-112`），不影响任务结果。
- 消费功能列表:
  - `SysJobLogController.jobLog:43`、`list:55`、`export:66`、`remove:77`、`detail:85`、`clean:95` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`
  - `AbstractQuartzJob.after:106`（`ISysJobLogService.addJobLog`）
  - `SysJobServiceImpl` 无直接日志写入（日志仅由执行器写）
  - 前端 `templates/monitor/job/jobLog.html:46,49,52,67`
  - 表 `sys_job_log` 同时是 `COMMON-import-export` 的导出源（`SysJobLogController.export:72`）

---

## COMMON-cache - 统一缓存（Ehcache）

- ID: COMMON-cache
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `framework/config/ShiroConfig.java`、`resources/ehcache/ehcache-shiro.xml`、`common/utils/CacheUtils.java`、`common/constant/Constants.java`
- 业务说明: 以 `net.sf.ehcache.CacheManager("qvsu")` 为唯一缓存管理器（通过 Shiro `EhCacheManager` 桥接），支撑 6 个命名缓存：`loginRecordCache`（登录失败计数）、`sys-userCache`（活跃用户会话队列）、`sys-authCache`（授权信息）、`sys-cache`（通用）、`sys-config`（参数）、`sys-dict`（字典）、`shiro-activeSessionCache`（Shiro 会话二级缓存）。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/resources/ehcache/ehcache-shiro.xml`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/CacheUtils.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - symbol: `ShiroConfig.getEhCacheManager`、`CacheUtils.get/put/remove/removeAll/getCache/getCacheNames`
  - route/topic/job/config/table: `classpath:ehcache/ehcache-shiro.xml`、`java.io.tmpdir`（diskStore）
  - grep keywords: `EhCacheManager`、`CacheUtils.`、`getCacheManager`、`SYS_AUTH_CACHE`

### 能力接口

#### CSI-cache-manager - Ehcache 缓存管理器与缓存组

- ID: CSI-cache-manager
- 接口形态: SDK（Shiro `CacheManager` + Ehcache `CacheManager`）
- 提供者: `com.qvsu.framework.config.ShiroConfig.getEhCacheManager()`（要求配置文件以流方式读取以避免文件占用，`getCacheManagerConfigFileInputStream()`）；访问门面 `com.qvsu.common.utils.CacheUtils`
- 输入输出核心语义: `CacheUtils.getCache(cacheName)` 在缓存名未定义时抛 `RuntimeException("当前系统中没有定义“X”这个缓存。")`；`CacheUtils.getCacheNames()` 列出全部缓存名。缓存名常量集中在 `Constants`：`SYS_AUTH_CACHE="sys-authCache"`、`SYS_CONFIG_CACHE="sys-config"`、`SYS_DICT_CACHE="sys-dict"`；`ShiroConstants.SYS_USERCACHE`、`ShiroConstants.LOGIN_RECORD_CACHE` 也在此文件。
- 调用前置条件: `/ehcache/ehcache-shiro.xml` 必须可读且 `name="qvsu"` 与 `CacheManager.getCacheManager("qvsu")` 一致。
- 数据、状态或事件副作用: 内存（及 `sys-cache`/`sys-config`/`sys-dict` 的 `overflowToDisk=true` 磁盘溢出，路径 `java.io.tmpdir`）；不写数据库。
- 失败、重试、补偿和降级语义: **无集群复制**（`ehcache-shiro.xml` 无 `cacheManagerPeerProviderFactory`/`cacheEventListenerFactory`），多实例部署时各缓存互不可见；进程重启导致 `loginRecordCache` 与 `sys-userCache` 内容丢失。
- 消费功能列表:
  - `ShiroConfig.getEhCacheManager:152`、`userRealm:197`、`sessionManager:233`、`securityManager:263`、`kickoutSessionFilter:424` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java`
  - `CacheUtils.get:31,43,78,91`、`put:55,104`、`remove:66,115`、`removeAll:125`、`getCache:178`、`getCacheNames:193` — `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/CacheUtils.java`
  - `SysConfigServiceImpl.selectConfigByKey:60`、`insertConfig:100`、`updateConfig:117,123`、`deleteConfigByIds:145`、`loadingConfigCache:158`、`clearConfigCache:168` — `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysConfigServiceImpl.java`
  - `DictUtils.setDictCache:29`、`getDictCache:40`、`removeDictCache:215`、`clearDictCache:223` — `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/DictUtils.java`
  - `SysPasswordService.init:39`（`cacheManager.getCache(ShiroConstants.LOGIN_RECORD_CACHE)`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysPasswordService.java`
  - `SysUserOnlineServiceImpl.removeUserCache:119`（`ehCacheManager.getCache(ShiroConstants.SYS_USERCACHE)`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserOnlineServiceImpl.java`
  - `UserRealm` 授权缓存（`ShiroConfig.userRealm:197-202` 显式设置 `Constants.SYS_AUTH_CACHE`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java`
  - `KickoutSessionFilter.setCacheManager:171`（`cacheManager.getCache(ShiroConstants.SYS_USERCACHE)`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java`

---

## COMMON-response-exception - 异常与统一响应

- ID: COMMON-response-exception
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `framework/web/exception/GlobalExceptionHandler.java`、`common/core/domain/AjaxResult.java`、`common/core/domain/R.java`、`common/core/page/TableDataInfo.java`、`TableSupport.java`、`PageDomain.java`、`common/core/controller/BaseController.java`、`common/utils/PageUtils.java`
- 业务说明: 三类统一响应体与一个全局异常处理器。管理端 REST 统一用 `AjaxResult`（`code`/`msg`/`data`），列表分页统一用 `TableDataInfo`（`total`/`rows`/`code`/`msg`），OpenAPI 网关单独用 `OpenResult`（`code`/`msg`/`data`/`traceId`）。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/exception/GlobalExceptionHandler.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/domain/AjaxResult.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/page/TableDataInfo.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/page/TableSupport.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/core/controller/BaseController.java`
  - symbol: `GlobalExceptionHandler.handleAuthorizationException/handleHttpRequestMethodNotSupported/handleRuntimeException/handleException/handleServiceException/handleMissingPathVariableException/handleMethodArgumentTypeMismatchException/handleBindException/handleDemoModeException`、`AjaxResult.success/error/warn`、`BaseController.getDataTable/startPage/toAjax`
  - route/topic/job/config/table: `pageNum`、`pageSize`、`orderByColumn`、`isAsc`、`reasonable`；`error/unauth`、`error/service`
  - grep keywords: `@RestControllerAdvice`、`@ExceptionHandler`、`AjaxResult`、`TableDataInfo`、`getDataTable`

### 能力接口

#### CSI-resp-ajaxresult - 统一 JSON 响应

- ID: CSI-resp-ajaxresult
- 接口形态: DTO（继承 `HashMap<String,Object>`）+ 静态工厂
- 提供者: `com.qvsu.common.core.domain.AjaxResult`（`Type.SUCCESS=0`、`Type.WARN=301`、`Type.ERROR=500`）；基类便捷方法 `com.qvsu.common.core.controller.BaseController.success/error/toAjax/redirect`
- 输入输出核心语义: 输出键 `code`（`CODE_TAG`）、`msg`（`MSG_TAG`）、可空 `data`（`DATA_TAG`）；`put(k,v)` 支持链式。
- 调用前置条件: 无。
- 数据、状态或事件副作用: 无。
- 失败、重试、补偿和降级语义: 无。
- 消费功能列表（按 Controller 逐点计数，事实）:
  - `SysLoginController.java`：`ajaxLogin:64`（`success()`）、`:73`（`error(msg)`）、`login:46`（手写 JSON 字符串）
  - `SysCaptchaController.java`：`captchaCode:118`（`AjaxResult.error("forbidden")`）、`:133`（`AjaxResult.success(...)`）
  - `SysIndexController.java`：`unlockscreen:113,118,120`
  - `SysRegisterController.java`：`ajaxRegister:41,44`
  - `SysProfileController.java`：`resetPwd:84,88,95,97`、`update:137,141,146,148`、`updateAvatar:174,177,182`
  - `SysUserController.java`：`importTemplate:104` 区块、`addSave:140` 区块、`editSave:200` 区块、`resetPwdSave:236` 区块、`insertAuthRole:264` 区块、`remove:277` 区块、`changeStatus:324` 区块
  - `SysRoleController.java`：`addSave:92`、`editSave:127`、`changeStatus:220`、`authDataScopeSave:169`、`cancelAuthUser:262`、`selectAuthUserAll:307`、`cancelAuthUserAll:319`、`remove:178`
  - `SysMenuController.java`：`addSave:105`、`editSave:134`、`updateSort`、`checkMenuNameUnique`
  - `SysDeptController.java`：`addSave:74`、`editSave:108`、`remove:135`、`checkDeptNameUnique`
  - `SysPostController.java`：`addSave:88`、`editSave:120`、`remove:66`、`export:62`（ExcelUtil 内部返回 `AjaxResult`）
  - `SysDictTypeController.java`：`addSave:82`、`editSave:110`、`remove:124`、`refreshCache:136`、`checkDictTypeUnique`
  - `SysDictDataController.java`：`addSave:81`、`editSave:105`、`remove:115`
  - `SysConfigController.java`：`addSave:83`、`editSave:111`、`remove:128`、`refreshCache:140`、`checkConfigKeyUnique`
  - `SysNoticeController.java`：`addSave:76`、`editSave:100`、`remove:122`
  - `OpenApiMgrController.java`：`curl:64,66`、`addSave:81`、`editSave:97`、`remove:106`
  - `OpenAppController.java`：`addSave:62`、`editSave:79`、`remove:88`、`resetSecret:98`
  - `OpenAuthController.java`：`apps:40`、`apis:47`、`apiIds:55`、`save:65`
  - `OpenDocController.java`：`apis:50`、`list:65`、`generate:84`
  - `OpenLogController.java`：`stats:55`
  - `SysJobController.java`：`export:69`、`remove:77`、`changeStatus:105`、`run:117`、`addSave:165`、`editSave:243`
  - `SysJobLogController.java`：`export:73`、`remove:83`、`clean:96`
  - `KickoutSessionFilter.java`：`isAjaxResponse:140`（`AjaxResult.error("您已在别处登录...")`）
  - `RepeatSubmitInterceptor.java`：`preHandle:34`（`AjaxResult.error(annotation.message())`）
  - `GlobalExceptionHandler.java`：全部 9 个 handler 返回 `AjaxResult.error(...)`（`handleAuthorizationException:43`、`handleHttpRequestMethodNotSupported:60`、`handleRuntimeException:71`、`handleException:82`、`handleServiceException:94`、`handleMissingPathVariableException:110`、`handleMethodArgumentTypeMismatchException:127`、`handleBindException:138`、`handleDemoModeException:147`）

#### CSI-resp-pagination - 分页响应

- ID: CSI-resp-pagination
- 接口形态: DTO `TableDataInfo` + `PageHelper` ThreadLocal 分页（`PageUtils.startPage()`）
- 提供者: `com.qvsu.common.core.page.TableSupport.getPageDomain/buildPageRequest`、`com.qvsu.common.utils.PageUtils.startPage/clearPage`、`com.qvsu.common.core.controller.BaseController.startPage/startOrderBy/clearPage/getDataTable`
- 输入输出核心语义: 请求参数 `pageNum`（默认 1）、`pageSize`（默认 10）、`orderByColumn`、`isAsc`、`reasonable`；输出 `{total, rows, code:0, msg}`。排序字段经 `SqlUtil.escapeOrderBySql` 白名单转义后交给 `PageHelper.orderBy`。
- 调用前置条件: `PageHelper` 方言配置 `pagehelper.helperDialect=postgresql`；`startPage()` 必须紧邻查询调用（ThreadLocal 生效范围）。
- 数据、状态或事件副作用: 无；ThreadLocal 需在无分页场景显式清理（`SysIndexController.index:52` 调用 `clearPage()` 即为该原因）。
- 失败、重试、补偿和降级语义: ThreadLocal 泄漏风险为已知设计约束；`clearPage()` 为补偿手段。
- 消费功能列表（`startPage(); ... getDataTable(list)` 配对，共 14 处）:
  - `SysUserController.list:76,78` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java`
  - `SysRoleController.list:61,63`、`SysRoleController.allocatedList:249,251`、`SysRoleController.unallocatedList:297,299` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java`
  - `SysPostController.list:49,51` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java`
  - `SysDictTypeController.list:50,52` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java`
  - `SysDictDataController.list:49,51` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java`
  - `SysConfigController.list:52,54` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java`
  - `SysNoticeController.list:51,53` — `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java`
  - `SysJobController.list:56,58` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java`
  - `SysJobLogController.list:60,62` — `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java`
  - `OpenApiMgrController.list:51,53` — `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java`
  - `OpenAppController.list:44,46` — `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`
  - `OpenLogController.list:46,48` — `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java`
  - `SysIndexController.index:52`（`clearPage()` 清理）— `open-api/qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java`

#### CSI-resp-exception - 全局异常处理

- ID: CSI-resp-exception
- 接口形态: `@RestControllerAdvice` + 9 个 `@ExceptionHandler`
- 提供者: `com.qvsu.framework.web.exception.GlobalExceptionHandler`
- 输入输出核心语义: 已处理异常类型与分流：`AuthorizationException`（Ajax → JSON；否则 `error/unauth` 视图）、`HttpRequestMethodNotSupportedException`、`RuntimeException`、`Exception`、`ServiceException`（Ajax → JSON；否则 `error/service` 视图携 `errorMessage`）、`MissingPathVariableException`、`MethodArgumentTypeMismatchException`（回显值经 `EscapeUtil.clean` 转义）、`BindException`（取首条校验消息）、`DemoModeException`（固定文案「演示模式，不允许操作」）。
- 调用前置条件: 请求进入 Spring MVC 且异常未被 Controller 自行捕获。
- 数据、状态或事件副作用: 全部 handler 均 `log.error`；**不回滚事务**（无 `@Transactional` 标注，事务回滚依赖 Service 层异常传播；`handleRuntimeException`/`handleException` 吞掉异常后返回 200 JSON，可能影响上层 `@Transactional` 回滚判定——见风险 R-7）。
- 失败、重试、补偿和降级语义: 无重试；`handleException` 返回 `e.getMessage()`，**存在内部信息外泄风险**（见风险 R-8）。
- 消费功能列表:
  - 全部 184 个 REST 端点（`docs/tools/semantics.json`）的未捕获异常路径
  - `ServiceException` 抛出点：`SysConfigServiceImpl.deleteConfigByIds:142`（内置参数不可删）、`SysMenuServiceImpl.updateMenuSort:388`（排序保存异常）、`SysRoleServiceImpl`/`SysDeptServiceImpl`/`SysPostServiceImpl` 的删除前约束校验
  - `PermissionUtils.getMsg`（i18n 文案）— `open-api/qvsu-openapi/src/main/java/com/qvsu/common/utils/security/PermissionUtils.java`
  - 视图 `open-api/qvsu-openapi/src/main/resources/templates/error/unauth.html`、`templates/error/service.html`

---

## COMMON-idempotency-lock - 幂等、防重与重放保护

- ID: COMMON-idempotency-lock
- 状态: partial（OpenAPI 网关侧已实现签名 + 时间戳 + nonce 防重放；管理端表单防重注解存在但**零启用**；无分布式锁）
- 结论级别: 事实
- 最后核验: 2026-02-14，依据 `open/service/OpenApiSecurityService.java`、`open/filter/OpenApiFilter.java`、`framework/interceptor/RepeatSubmitInterceptor.java`、`framework/interceptor/impl/SameUrlDataInterceptor.java`、`common/annotation/RepeatSubmit.java`
- 业务说明: 两条互不相关的机制：(1) 开放平台网关对每个开放请求做 HMAC-SHA256 签名校验、时间窗校验与 nonce 去重，构成事实上的重放防护；(2) 管理端提供 `@RepeatSubmit` 注解 + `SameUrlDataInterceptor` 的「同 URL 同参数 5 秒内视为重复提交」机制，但**源码中无任何方法使用该注解**，因此实际未生效。
- 源码索引:
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/interceptor/impl/SameUrlDataInterceptor.java`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/common/annotation/RepeatSubmit.java`
  - symbol: `OpenApiSecurityService.authenticate/verifySignature/checkNonce/cleanupNonce/hmacSha256Hex`、`OpenApiFilter.doFilterInternal`、`SameUrlDataInterceptor.isRepeatSubmit`
  - route/topic/job/config/table: HTTP 头 `X-App-Key`、`X-Timestamp`、`X-Nonce`、`X-Sign`、`X-Trace-Id`；`open_app.app_key`、`open_app.app_secret`、`open_app_api`、`open_api.need_sign`
  - grep keywords: `HEADER_NONCE`、`NONCE_CACHE`、`ALLOW_TIME_DRIFT_MS`、`@RepeatSubmit`、`SameUrlDataInterceptor`

### 能力接口

#### CSI-idem-openapi-sign - 开放平台签名与防重放

- ID: CSI-idem-openapi-sign
- 接口形态: REST Header 校验（`OncePerRequestFilter`，仅作用于 `/open/**`）
- 提供者: `com.qvsu.open.service.OpenApiSecurityService.authenticate(HttpServletRequest, String body)`；入口过滤器 `com.qvsu.open.filter.OpenApiFilter.doFilterInternal`
- 输入输出核心语义: 依次执行：① 按 `api_path + method` 查 `open_api`（`status=1`，非匹配方法时回退 POST 兼容）→ 缺失抛 40004；② `need_sign=0` 时跳过全部校验并把 `appName` 置为 `anonymous`；③ 四个头缺一即抛 40001；④ 时间戳与服务器时间差 > `ALLOW_TIME_DRIFT_MS`（5 分钟）抛 40002；⑤ 按 `app_key` 查 `open_app`（`status=1` 且未过期）→ 失败抛 40001；⑥ nonce 去重（key = `appKey + ":" + nonce`，TTL `NONCE_EXPIRE_MS` = 5 分钟）→ 重复抛 40005；⑦ `open_app_api` 授权校验 → 无授权抛 40004；⑧ 签名校验：业务参数（Query + JSON Body 中排除 `appKey`/`timestamp`/`nonce`/`sign`/`appSecret`）与 `appKey`/`timestamp`/`nonce` 合并后按 key 升序拼 `k=v&...`，再追加 `&appSecret=...`，用 `HmacSHA256(plain, appSecret)` 取 hex 与 `X-Sign` 忽略大小写比较 → 不匹配抛 40003。
- 调用前置条件: 请求 URI 以 `/open/` 开头（`OpenApiFilter.shouldNotFilter`）；`ShiroConfig` 中 `/open/**` 为 `anon`，认证完全由本过滤器承担。
- 数据、状态或事件副作用: 只读 `open_api`、`open_app`、`open_app_api`；写 JVM 内 `ConcurrentHashMap NONCE_CACHE`；写 `open_call_log`（`OpenApiLogService.save`，无论成功失败）。
- 失败、重试、补偿和降级语义: 全部失败以 `OpenResult.fail(code, msg)` 返回 **HTTP 200**（`OpenApiFilter.writeError:152` `response.setStatus(200)`），失败码 40001–40005/50001；无重试。`checkNonce` 在缓存超过 100000 条时触发 `cleanupNonce` 全量清扫（`OpenApiSecurityService:212-216`）。
- 已知弱点（事实 + 推断）:
  - nonce 存储为**单 JVM 内存 Map**（`private static final ConcurrentHashMap`），多实例部署时 nonce 不共享，重放防护在集群下失效；进程重启后 nonce 记录全丢（事实）。
  - 签名算法把 `appSecret` 同时作为**被签名内容的一部分**与 HMAC 密钥（`plain = ... + "&appSecret=" + appSecret; HmacSHA256(plain, appSecret)`，第 136–137 行），不构成标准 HMAC 签名语义（事实）。
  - 无请求体大小/频率限制，无 IP 维度限流（事实）。
- 消费功能列表:
  - `OpenApiFilter.doFilterInternal:80`（调用 `authenticate`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java`
  - `OpenGatewayController.gateway:38`（`@RequestMapping("/open/**")` 代理入口，读取 `OPEN_AUTH_CONTEXT`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenGatewayController.java`
  - `ShiroConfig` 中 `/open/**` 置 `anon` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java:333`
  - 管理端密钥来源 `OpenAppController.resetSecret:97` → `OpenManageService.resetSecret`（重置 `open_app.app_secret`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java`
  - 授权关系维护 `OpenAuthController.save:64` → `OpenManageService.saveAppAuth`（写 `open_app_api`）— `open-api/qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java`
  - 调用日志 `OpenApiLogService.save` ← `OpenApiFilter` finally 块 — `open-api/qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiLogService.java`

#### CSI-idem-form-dup - 表单防重提交（未启用）

- ID: CSI-idem-form-dup
- 接口形态: Annotation `@RepeatSubmit(interval=5000, message="不允许重复提交，请稍后再试")` + Spring MVC `HandlerInterceptor`
- 提供者: `com.qvsu.framework.interceptor.RepeatSubmitInterceptor.preHandle`（抽象）；实现 `com.qvsu.framework.interceptor.impl.SameUrlDataInterceptor.isRepeatSubmit`；注册 `com.qvsu.framework.config.ResourcesConfig.addInterceptors:66`（`addPathPatterns("/**")`）
- 输入输出核心语义: 以 `request.getRequestURI()` 为 key，把 `{repeatParams: JSON(parameterMap), repeatTime: now}` 存入 `HttpSession` 属性 `repeatData`；若同 URL 上次参数完全一致且间隔小于 `annotation.interval()`，判定为重复提交并渲染 `AjaxResult.error(message)` 且返回 false 中断请求。
- 调用前置条件: 方法上必须有 `@RepeatSubmit`。**全量源码扫描 `@RepeatSubmit` 零业务使用**：仅命中 `common/annotation/RepeatSubmit.java`（定义）、`framework/interceptor/RepeatSubmitInterceptor.java`（读取注解）、`framework/interceptor/impl/SameUrlDataInterceptor.java`（导入）三处，无任何 Controller 方法标注（事实）。
- 数据、状态或事件副作用: 写 `HttpSession` 属性 `repeatData`；无数据库副作用。
- 失败、重试、补偿和降级语义: 未启用即无行为；若启用，Session 内 Map 每次请求**整体覆盖**（`SameUrlDataInterceptor:54-56` 只保留最后一个 URL 记录），多 Tab 并发场景会互相覆盖，属实现缺陷（推断）。
- 消费功能列表: **无消费者（未实现实际防重）**。相关调用点仅为注册与定义：
  - `ResourcesConfig.addInterceptors:66` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ResourcesConfig.java`
  - `RepeatSubmitInterceptor.preHandle:23` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/interceptor/RepeatSubmitInterceptor.java`
  - `SameUrlDataInterceptor.isRepeatSubmit:29` — `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/interceptor/impl/SameUrlDataInterceptor.java`

#### CSI-idem-lock - 分布式锁

- ID: CSI-idem-lock
- 接口形态: **不适用 / 未实现**
- 提供者: 无
- 输入输出核心语义: 无
- 调用前置条件: 无
- 数据、状态或事件副作用: 无
- 失败、重试、补偿和降级语义: 无
- 消费功能列表: **无**。证据：全量源码扫描 `RedisTemplate`、`Redisson`、`Jedis`、`Lock`、`tryLock`、`setIfAbsent` 于 `com/qvsu` 零命中；`DynamicDataSourceContextHolder`/`@DataSource` 仅用于多数据源切换（`common/annotation/DataSource.java`、`framework/aspectj/DataSourceAspect.java`），与锁无关；应用为单机单体，未引入任何外部锁中间件（事实）。并发控制仅依赖数据库事务（`@Transactional`）与 Quartz 的 `@DisallowConcurrentExecution`。

---

## 功能-公共能力矩阵（依赖类型）

依赖类型定义：`guard`（前置必过）、`orchestration`（参与主流程）、`side-effect`（主结果后触发）、`support`（支撑性）、`optional`（失败不阻断）。

| 能力 | 依赖类型 | 说明 |
|---|---|---|
| COMMON-authentication | guard | 除 `/login`、`/register`、`/captcha/**`、`/open/**`、`/selftest/**` 外全部入口的前置 |
| COMMON-permission | guard | 105 个端点为注解级 guard；OpenAPI 域 5 个页面菜单为前端 guard（后端无对应强制） |
| COMMON-tenant-organization | guard / support | 部门树为组织前置（guard）；岗位为支撑数据（support）；数据范围在 SQL 层生效（guard） |
| COMMON-session-online | guard / side-effect | 会话有效性与踢人是 guard；会话落库为 side-effect |
| COMMON-security-guard | guard | XSS 为 guard（仅限命中 URL 的 POST）；CSRF 当前为 optional（开关关闭）；同步过滤器为 side-effect |
| COMMON-audit | side-effect | 所有 `@Log` 方法与登录分支的旁路写入，失败不阻断 |
| COMMON-dictionary-config | support | 字典与参数为页面渲染与业务判定的支撑数据 |
| COMMON-notice | orchestration（本域内） | 公告自身的 CRUD 主流程；对其他功能无依赖 |
| COMMON-file | support | 头像上传、Excel 导入的支撑；失败不影响其他功能 |
| COMMON-import-export | support / orchestration | 用户导入为编排入口；其余导出为 support |
| COMMON-scheduling | orchestration（本域内） | 任务调度独立主流程；对其他功能无同步依赖 |
| COMMON-cache | support | 全部缓存的运行时支撑，可降级为直查 DB（字典/参数）或丢失（登录计数/会话队列） |
| COMMON-response-exception | orchestration | 所有 REST 响应的统一出口 |
| COMMON-idempotency-lock | guard（仅 `/open/**`） | 开放平台请求的准入校验；管理端表单防重为 optional（未启用） |

---

## 「不适用」能力及其证据

| 技能默认能力族 | 本项目结论 | 证据（文件 + 事实） |
|---|---|---|
| 技能默认族 `common-capabilities.md` 的 workflow（工作流）项 | 不适用（未实现） | 全量扫描 `com/qvsu/**` 无 `Activiti`、`Flowable`、`Camunda`、`ProcessInstance`、`TaskQuery` 等符号；`open-api/sql/*.sql` 与 `deploy/local-docker/*/init/*.sql` 无流程定义/实例/任务/历史表 DDL；无审批相关菜单（`docs/tools/menus.json` 149 行菜单中无审批类条目） |
| 多租户（`tenantId`） | 不适用（未实现） | grep `tenant`、`tenantId`、`tenant_id` 于 `com/qvsu/**`、`resources/mapper/**`、`open-api/sql/**`、`deploy/**/init/*.sql` 零命中；`sys_user`/`sys_dept` 无租户字段 |
| 短信/邮件/推送通道 | 不适用（未实现） | 全量扫描无 `JavaMailSender`、`MailService`、`SmsService`、`AliyunSms`、`WxMpService`、`WebSocketHandler`、`SseEmitter`；`pom.xml` 依赖中无邮件/短信/推送 SDK |
| 站内信与消息中心 | 不适用（未实现） | 无消息表（34 张物理表中无 `*_message*`、`*_msg*`）；无 `/message/**`、`/notice/my**` 路由；`sys_notice` 仅管理端 CRUD（见 COMMON-notice） |
| 多数据源动态切换的业务使用 | 不适用（未实现） | `common/annotation/DataSource.java`、`framework/aspectj/DataSourceAspect.java`、`framework/datasource/DynamicDataSource.java`、`common/config/datasource/DynamicDataSourceContextHolder.java` 存在，但**全量扫描 `@DataSource` 零业务使用**，仅 `application-druid.yml` 的 `master` 数据源实际生效（事实） |
| 敏感数据脱敏（`@Sensitive`） | 不适用（未实现） | `common/annotation/Sensitive.java`、`common/config/serializer/SensitiveJsonSerializer.java`、`common/utils/DesensitizedUtil.java`、`common/enums/DesensitizedType.java` 存在，但**全量扫描 `@Sensitive` 零业务使用**（事实） |
| 代码生成器 | 不适用（已裁剪） | 无 `com.qvsu.generator` 包；`templates/tool/build/**` 残留框架模板但无对应 Controller（`docs/tools/semantics.json` 的 `Endpoints` 中无 `tool` 前缀）；`Constants.JOB_ERROR_STR` 仍引用 `com.qvsu.generator` 属遗留常量 |

---

## 安全风险与存疑项

| 编号 | 风险/存疑 | 等级 | 证据 | 结论级别 |
|---|---|---|---|---|
| R-1 | **OpenAPI 管理域 17 个权限码完全未在后端强制**：`open:app:*`、`open:api:*`、`open:auth:*`、`open:log:*`、`open:doc:*` 已在菜单 SQL 中定义（`open-api/sql/open_api_menu.sql`、`deploy/local-docker/*/init/40-open-api-menu.sql`），但 `OpenAppController`、`OpenApiMgrController`、`OpenAuthController`、`OpenLogController`、`OpenDocController` 共 25 个端点**零 `@RequiresPermissions`**，模板 `templates/open/**` **零 `shiro:hasPermission`**。任何已认证用户（含最低权限角色）可完整读写应用/接口/授权/日志/文档 | 高 | `docs/tools/semantics.json`（`open:*` 权限码不在 105 条带权限端点内）；`docs/tools/assets.json` 的 `PermissionCodes` 55 条不含任何 `open:*` | 事实 |
| R-2 | **CSRF 防护默认关闭且前端无 Token 注入**：`csrf.enabled=false`，全部 88 个 POST 端点无 CSRF 防护；若开启，因前端从不发送 `X-CSRF-Token`，所有表单将立即失效 | 高 | `resources/application.yml:144`、`framework/config/ShiroConfig.java:139,285`、`templates/**` 与 `static/**` 内 `X-CSRF-Token` 零命中 | 事实 |
| R-3 | **XSS 过滤覆盖窄且不含 JSON Body**：`xss.urlPatterns=/system/*,/tool/*` 未覆盖 `/admin/open/**`、`/common/**`、`/system/user/profile/**`、`/monitor/**`；`XssHttpServletRequestWrapper` 仅重写 `getParameterValues`，`application/json` 请求体完全绕过；`/system/notice/*` 被显式排除，而公告内容为富文本 | 中高 | `resources/application.yml:137,139`、`common/xss/XssFilter.java:62`、`common/xss/XssHttpServletRequestWrapper.java:23`、`framework/config/FilterConfig.java:36` | 事实 |
| R-4 | **授权缓存无主动失效**：`sys-authCache` 为永久缓存（`eternal=true`），`UserRealm.clearCachedAuthorizationInfo`/`clearAllCachedAuthorizationInfo` 在全量源码中**无调用点**（grep `clearCachedAuthorizationInfo` 仅命中 `UserRealm` 自身定义与内部调用）。角色菜单变更后，已登录用户的权限视图不会刷新，存在「越权持续有效」与「授权不生效」双向风险 | 中高 | `resources/ehcache/ehcache-shiro.xml:46`、`framework/shiro/realm/UserRealm.java:138,147`、`system/service/impl/SysRoleServiceImpl.java`（无缓存清理调用） | 事实 |
| R-5 | **`rememberMe` Cookie 密钥每次启动随机**：`shiro.cookie.cipherKey` 为空时 `CipherUtils.generateNewKey(128, "AES")` 随机生成，重启后所有已签发记住我 Cookie 解密失败；且该密钥无法在集群中共享 | 中 | `framework/config/ShiroConfig.java:407-414`、`resources/application.yml:116` | 事实 |
| R-6 | **`Md5Utils.hash` 失败静默返回明文**：`catch` 分支 `return s` 返回原始字符串，若 MD5 不可用将导致口令以明文形态参与比较/存储 | 中 | `common/utils/security/Md5Utils.java:61-65` | 事实 |
| R-7 | **全局异常处理器吞异常可能破坏事务回滚判定**：`handleRuntimeException`/`handleException` 返回 `AjaxResult` 而不重新抛出。对 `@Transactional(rollbackFor = Exception.class)` 的 Service（如 `SysJobServiceImpl`）而言，AOP 事务切面在异常传播路径上工作，Controller 层捕获不影响事务；但对在 Controller 内直接完成的多步写操作，异常被转换为 200 响应会掩盖失败 | 中 | `framework/web/exception/GlobalExceptionHandler.java:66-83`、`quartz/service/impl/SysJobServiceImpl.java:80` | 推断 |
| R-8 | **异常消息直接回显给前端**：`handleException`/`handleRuntimeException` 返回 `e.getMessage()`，可能泄露 SQL、路径、类名等内部信息 | 中 | `framework/web/exception/GlobalExceptionHandler.java:71,82` | 事实 |
| R-9 | **`/captcha/captchaCode` 存在验证码旁路后门**：受 `qvsu.testing.exposeCaptchaCode` 控制，一旦被配置为 `true` 即可通过 HTTP 直接读取当前会话验证码，使验证码防护完全失效；该端点在生产配置中默认 `false`，但属于高危开关 | 中高 | `web/controller/system/SysCaptchaController.java:112-134`、`resources/application.yml:15-16` | 事实 |
| R-10 | **在线用户与日志读侧缺失，导致审计与运维能力不闭环**：`sys_oper_log`、`sys_logininfor`、`sys_user_online` 三张表**只写不读**——无 `/monitor/operlog/**`、`/monitor/logininfor/**`、`/monitor/userOnline/**` 路由，`templates/monitor/` 下仅有 `job/` 子目录，`ISysUserOnlineService.forceLogout`/`selectUserOnlineList` 无 REST 消费者 | 中 | `docs/tools/assets.json` 的 `Routes`；`resources/templates/monitor/` 目录清单；`system/service/ISysUserOnlineService.java:51,58` | 事实 |
| R-11 | **`maxSession = -1` 使并发登录控制实际失效**：`kickout` 过滤器虽在 `/**` 链上，但 `maxSession == -1` 时 `onAccessDenied` 第 64 行直接放行，踢人逻辑永不触发 | 中 | `resources/application.yml:125`、`framework/shiro/web/filter/kickout/KickoutSessionFilter.java:64` | 事实 |
| R-12 | **Quartz 使用内存 JobStore，`QRTZ_*` 11 张表为无用 DDL**：`quartz/config/ScheduleConfig.java` 为空占位类（注释明确「当前使用 Spring Boot 自动配置的 Scheduler（内存模式）」），`SysJobServiceImpl.init` 启动时 `scheduler.clear()` 全量重建；DB 中存在 `QRTZ_*` 表但不被读写，造成运维误判 | 中 | `quartz/config/ScheduleConfig.java`、`quartz/service/impl/SysJobServiceImpl.java:39-48`、`open-api/sql/quartz.sql` 与 `deploy/local-docker/*/init/35-quartz.sql` | 事实 |
| R-13 | **开放平台 nonce 去重为单机内存实现**，集群部署时重放防护失效；签名把 `appSecret` 拼入被签名串又作为 HMAC 密钥，语义不规范 | 中高 | `open/service/OpenApiSecurityService.java:39,130-137,210-225` | 事实 |
| R-14 | **多处以 `HttpServletResponse` 直接输出但异常被静默吞掉**，用户侧表现为空白响应、无错误提示：`CommonController.fileDownload`/`resourceDownload`、`OpenLogController.exportCsv`、`OpenDocController.download`、`SysCaptchaController.getKaptchaImage` | 低中 | `web/controller/common/CommonController.java:66-69,159-162`、`open/controller/OpenLogController.java:112-115`、`open/controller/OpenDocController.java:102-104`、`web/controller/system/SysCaptchaController.java:88-90` | 事实 |
| R-15 | **`SysCaptchaController.getKaptchaImage` 未校验 `type` 参数**：`type` 既非 `math` 也非 `char` 时 `bi` 保持 `null`，`ImageIO.write(null, ...)` 抛 NPE 并被吞掉，返回空响应 | 低 | `web/controller/system/SysCaptchaController.java:57-71,83` | 事实 |
| R-16 | **菜单可见性被硬编码白名单收窄**：`SysMenuServiceImpl.filterToOpenApiAndQuartzMenus` 仅保留 `menuId=1`、`2100`、`110` 及其子节点，新增菜单若不在白名单内将不显示，属隐式耦合 | 低中 | `system/service/impl/SysMenuServiceImpl.java:39-43,198-223` | 事实 |
| R-17 | **存疑：`@RepeatSubmit` 是否有意废弃**：注解、拦截器、实现类三件套齐备且拦截器已注册到 `/**`，但零方法标注。无法从源码判定是「预留未用」还是「迁移时被移除」 | 存疑 | `common/annotation/RepeatSubmit.java`、`framework/interceptor/RepeatSubmitInterceptor.java`、`framework/config/ResourcesConfig.java:66` | 假设 |
| R-18 | **存疑：`validationInterval` 单位语义**：`ShiroConfig` 的 `expireTime` 以「分钟」乘 60*1000 使用，而 `SpringSessionValidationScheduler` 的 `sessionValidationInterval` 也乘 60*1000（第 98 行），但字段注释写「单位毫秒」。两处口径不一致，实际生效为分钟 | 存疑 | `framework/config/ShiroConfig.java:237`、`framework/shiro/web/session/SpringSessionValidationScheduler.java:46-48,98`、`resources/application.yml:119-123` | 推断 |
| R-19 | **存疑：`OnlineSessionDAO` 单参构造器为空实现**：`OnlineSessionDAO(long expireTime)` 仅调用 `super()` 且不使用入参，若被外部以该构造器创建将丢失超时设置 | 低 | `framework/shiro/session/OnlineSessionDAO.java:41-44` | 事实 |
| R-20 | **存疑：`/selftest/**` 生产可用性**：`ShiroConfig` 将 `/selftest/**` 置为 `anon`，`OpenSelftestHttpbinController` 9 个端点（含 `/selftest/httpbin/timeout` 可被用于资源消耗）无需认证。是否应仅限测试环境，源码无环境判断 | 存疑 | `framework/config/ShiroConfig.java:334`、`open/controller/OpenSelftestHttpbinController.java` | 推断 |

---

## 覆盖统计与自检

- 本文件主定义：`COMMON-*` 14 个；`CSI-*` 44 个（合计 58 条 `- ID:` 主定义，同一 ID 在本文件内仅出现一次）。
- 逐个公共能力 ID 与其 `CSI-*` 对应关系：

| COMMON ID | 下属 CAPI ID 列表 | CAPI 数量 |
|---|---|---:|
| COMMON-authentication | CSI-auth-login、CSI-auth-captcha、CSI-auth-password-retry、CSI-auth-remember-me、CSI-auth-logout、CSI-auth-register | 6 |
| COMMON-permission | CSI-perm-annotation、CSI-perm-anonymous-url、CSI-perm-role、CSI-perm-menutree、CSI-perm-frontend、CSI-perm-unauthorized | 6 |
| COMMON-tenant-organization | CSI-org-dept-tree、CSI-org-post、CSI-org-user-role-post-link、CSI-scope-filter | 4 |
| COMMON-session-online | CSI-online-session-db、CSI-online-concurrent-limit、CSI-online-force-offline | 3 |
| COMMON-security-guard | CSI-xss-filter、CSI-csrf-filter、CSI-sync-session-filter、CSI-password-crypto | 4 |
| COMMON-audit | CSI-audit-operlog、CSI-audit-logininfor、CSI-audit-async | 3 |
| COMMON-dictionary-config | CSI-dict-lookup、CSI-config-lookup | 2 |
| COMMON-notice | CSI-notice-crud | 1 |
| COMMON-file | CSI-file-upload、CSI-file-download | 2 |
| COMMON-import-export | CSI-excel-export、CSI-excel-import、CSI-csv-export | 3 |
| COMMON-scheduling | CSI-job-definition、CSI-job-execute、CSI-job-log | 3 |
| COMMON-cache | CSI-cache-manager | 1 |
| COMMON-response-exception | CSI-resp-ajaxresult、CSI-resp-pagination、CSI-resp-exception | 3 |
| COMMON-idempotency-lock | CSI-idem-openapi-sign、CSI-idem-form-dup、CSI-idem-lock | 3 |

- 逐项覆盖判定（技能第 9 节要求：使用 / 明确不使用 / 未知，禁止留空）：

| 能力 | 判定 |
|---|---|
| COMMON-authentication | 使用：全部后台功能 guard；`/open/**`、`/selftest/**`、`/captcha/**`、`/login`、`/register` 明确不使用 |
| COMMON-permission | 使用：`system:*`、`monitor:job:*` 覆盖的 105 个端点；`open:*` 5 页面功能**后端明确不使用**（仅菜单定义，见 R-1） |
| COMMON-tenant-organization | 使用：用户/角色/部门列表与树；数据范围仅作用于 6 个 Service 方法（见 CSI-scope-filter）；OpenAPI 域功能明确不使用 |
| COMMON-session-online | 使用：全部认证请求（过滤链）；查询/强退**未实现**（R-10） |
| COMMON-security-guard | XSS 部分使用（4 个 URL 前缀）；CSRF 明确不使用（开关关闭）；同步过滤器全量使用 |
| COMMON-audit | 使用：70 处 `@Log` + 13 处登录日志埋点；查询/导出明确不使用（R-10） |
| COMMON-dictionary-config | 使用：字典 8 个类型 + 参数 9 个键；OpenAPI 域功能明确不使用（`open/domain/*` 无字典注解） |
| COMMON-notice | 使用：公告自身 7 个端点；其他功能明确不使用 |
| COMMON-file | 使用：头像上传 + 通用上传下载；OpenAPI 域明确不使用（文档下载为内存生成，不落盘） |
| COMMON-import-export | 使用：8 个 Excel 导出 + 1 个 Excel 导入 + 1 个 CSV 导出 |
| COMMON-scheduling | 使用：`sys_job` 定义的全部任务；`QRTZ_*` 表明确不使用（R-12） |
| COMMON-cache | 使用：7 个命名缓存；未知：`sys-cache` 仅有通用工具方法，全量扫描 `CacheUtils.get(String)`/`put(String,Object)` 单参重载**无业务调用点**（仅命中 `CacheUtils` 自身），判定为预留 |
| COMMON-response-exception | 使用：全部 REST 端点 |
| COMMON-idempotency-lock | 使用：`/open/**` 全量请求；管理端表单防重明确不使用（R-17）；分布式锁未实现 |

- 反向消费者检查（从公共 Service/DAO/自有表反查）：`SysUserOnlineServiceImpl.selectUserOnlineList`、`SysUserOnlineServiceImpl.forceLogout`、`CacheUtils` 单参重载、`UserRealm.clearCachedAuthorizationInfo`、`@Anonymous`、`@DataSource`、`@Sensitive`、`@RepeatSubmit` 共 8 处**存在实现但无消费者**，已分别登记于对应 `CSI-*` 的「消费功能列表」与「安全风险与存疑项」风险表，无未归属调用点。
- 与 `COMMON-*` 交叉的独立业务能力（网关级应用鉴权、开放平台调用日志、文档生成）属于 `com.qvsu.open` 业务域自身能力，本文件仅在 `COMMON-idempotency-lock` 与 `COMMON-response-exception` 中记录其对该公共能力的依赖，不对其业务功能本体建模（由功能清单与接口索引负责）。
