# 技术架构

本文件是 `SYS-*` 稳定 ID 的唯一主定义位置。所有结论标注证据等级：`事实`（直接读源码/配置/DDL）、`推断`（多迹象一致但链路未完全闭环）、`假设`（待确认）。
最后核验日期：2026-03-27。核验基线：`open-api/` 目录内实际源码；机器可读事实源为 `../tools/assets.json`、`../tools/semantics.json`、`../tools/menus.json`。

组件级细节（坐标、版本、能力接口、消费者）见 [technical-component-index.md](./technical-component-index.md)；配置键级登记见 [config-index.md](./config-index.md)。

## SYS-qvsu-openapi - QVSU OpenAPI 管理与网关服务（精简版）

- ID: SYS-qvsu-openapi
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/qvsu-openapi/pom.xml`、`open-api/README.md`、`open-api/qvsu-openapi/src/main/resources/application.yml`
- 系统名称: `qvsu-openapi`（`pom.xml` 第 8 行 `<artifactId>qvsu-openapi</artifactId>`；配置项 `qvsu.name`/`qvsu.version` 在 `application.yml` 中为双重编码乱码值 `鑱氭惌OpenAPI绯荤粺`）
- 系统版本: `1.0.0`（`pom.xml` 第 9 行 `<version>1.0.0</version>`）
- 系统类型: 单体（非微服务）Spring Boot 应用，同时具备「后台管理平台」与「OpenAPI 网关」双重职责
- 打包形态: `<packaging>jar</packaging>`（`pom.xml` 第 10 行），同时提供 `com.qvsu.QvsuServletInitializer` 支持 war 容器外部部署
- 启动入口: `com.qvsu.QvsuApplication#main`（`open-api/qvsu-openapi/src/main/java/com/qvsu/QvsuApplication.java` 第 13-20 行）。注解为 `@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })` —— 排除 Spring Boot 自动数据源装配，改由 `com.qvsu.framework.config.DruidConfig` 手工装配多数据源
- 二次启动入口: `com.qvsu.QvsuServletInitializer`（`open-api/qvsu-openapi/src/main/java/com/qvsu/QvsuServletInitializer.java`），用于 war 部署
- 服务端口: `5656`（`application.yml` 第 21 行 `server.port: 5656`；`deploy/local-docker/docker-compose.yaml` 第 45 行 `${APP_PORT:-5656}:5656` 映射一致）
- 上下文路径: `/`（`application.yml` 第 24 行 `server.servlet.context-path: /`）
- 主数据库: PostgreSQL 11（`deploy/local-docker/docker-compose.yaml` 第 5 行 `postgres:11`；驱动 `org.postgresql:postgresql:42.7.5`）
- 默认连接串: `jdbc:postgresql://localhost:5432/jd_openapi?currentSchema=public&stringtype=unspecified`（`application-druid.yml` 第 9 行），用户 `postgres`
- 默认账号: `admin/admin123`（`open-api/README.md` 第 23 行）
- 数据库对象规模: 34 张唯一物理表、865 个字段（`../tools/semantics.json`）
- Web 层规模: 24 个 Spring MVC Controller 类、184 个端点（其中 105 个带 `@RequiresPermissions`）、144 个 Thymeleaf 模板
- 权限规模: 55 个权限码、149 行菜单数据（33 个 C 类页面菜单、111 个 F 类按钮权限、5 个 M 类目录）
- 源码索引:
  - path: `open-api/qvsu-openapi/pom.xml`
  - path: `open-api/qvsu-openapi/src/main/java/com/qvsu/QvsuApplication.java`
  - path: `open-api/qvsu-openapi/src/main/resources/application.yml`
  - path: `open-api/qvsu-openapi/src/main/resources/application-druid.yml`
  - symbol: `com.qvsu.QvsuApplication`
  - grep keywords: `QvsuApplication`、`server.port`、`spring.datasource.druid.master`、`packaging`

### 部署形态（事实）

| 部署形态 | 入口文件 | 关键事实 | 可复现性 |
|---|---|---|---|
| 本地源码直跑 | `mvn clean package -DskipTests` → `java -jar target/qvsu-openapi.jar` | `open-api/README.md` 第 15-17 行；`pom.xml` `finalName=${project.artifactId}` 产出 `qvsu-openapi.jar` | 可复现（需外部 PostgreSQL，默认 `localhost:5432`） |
| Docker 本地全栈 | `open-api/deploy/local-docker/docker-compose.yaml` + `Dockerfile` | `docker compose up -d --build`；容器 `openapi-app` 与 `openapi-postgres11`；访问 `http://localhost/login`；`depends_on.postgres.condition=service_healthy` | 可复现（多阶段 Maven 构建 + Temurin 8 JRE 运行） |
| Docker 开发镜像 | `open-api/deploy/dev-docker/docker-compose.yml` + `Dockerfile` | 直接拉取 `registry.cn-shenzhen.aliyuncs.com/chaoqs/qvsu_open_api:qvsu_open_api_2026-03-27-13-12-27` | **不可复现**：镜像为外部阿里云仓库固定 tag，`Dockerfile` 要求 `COPY open-api/qvsu-openapi/target/*.jar`，在 `deploy/dev-docker` 目录构建上下文下该路径不存在（见「已发现的技术债与风险」第 5 条） |

### 分层架构（事实）

```text
[浏览器]
  |  Thymeleaf 服务端渲染 HTML (144 模板) + jQuery/Bootstrap Ajax
  v
[入口层]  Servlet Filter 链 -> Spring MVC Interceptor -> Controller (24 类 / 184 端点)
  |  Filter: XssFilter(order=HIGHEST) -> OpenApiFilter(/open/**) -> Shiro Filter 链
  |  Interceptor: RepeatSubmitInterceptor(/**)
  v
[业务层] Service 接口 + ServiceImpl
  |  业务域: com.qvsu.open.service.*  |  平台域: com.qvsu.system.service.*
  |  调度域: com.qvsu.quartz.service.* |  框架域: com.qvsu.framework.*.service.*
  v
[数据层] MyBatis Mapper 接口 (@MapperScan com.qvsu.**.mapper) + Mapper XML (classpath*:mapper/**/*Mapper.xml, 144 条语句)
  |  另有 JdbcTemplate 直连 SQL 旁路（OpenApiSecurityService / OpenApiLogService）
  v
[存储层] PostgreSQL 11 (34 张表: open_* 5 张 + sys_*/gen_* + QRTZ_* 11 张)
```

各层落到具体代码的证据：

| 层 | 组成 | 证据（源码路径与符号） |
|---|---|---|
| 入口层 - Controller | `com.qvsu.web.controller.system.*`（14 类）、`com.qvsu.open.controller.*`（7 类）、`com.qvsu.quartz.controller.*`（2 类）、`com.qvsu.web.controller.common.CommonController` | grep `@Controller`/`@RestController` 命中 24 个类；`OpenGatewayController`、`OpenSelftestHttpbinController`、`GlobalExceptionHandler` 为 `@RestController`/`@RestControllerAdvice` |
| 入口层 - Filter | `com.qvsu.common.xss.XssFilter`、`com.qvsu.open.filter.OpenApiFilter`、Shiro 自定义过滤器 6 个 | `framework/config/FilterConfig.java`；`framework/config/ShiroConfig.java` 第 338-346 行 |
| 入口层 - Interceptor | `com.qvsu.framework.interceptor.RepeatSubmitInterceptor` 及其实现 `impl/SameUrlDataInterceptor` | `framework/config/ResourcesConfig.java` 第 64-67 行 `registry.addInterceptor(repeatSubmitInterceptor).addPathPatterns("/**")` |
| 入口层 - 全局异常 | `com.qvsu.framework.web.exception.GlobalExceptionHandler` | 类注解 `@RestControllerAdvice`，8 个 `@ExceptionHandler` |
| 业务层 | `com.qvsu.open.service`（4 个类：`OpenApiLogService`、`OpenApiProxyService`、`OpenApiSecurityService`、`OpenManageService`）、`com.qvsu.open.doc.ApiDocService`、`com.qvsu.system.service.impl.*`、`com.qvsu.quartz.service.impl.*`、`com.qvsu.framework.shiro.service.*`、`com.qvsu.framework.web.service.*` | 目录扫描 `src/main/java/com/qvsu/**/service/**` |
| 数据层 - MyBatis | `@MapperScan("com.qvsu.**.mapper")`；`SqlSessionFactory` 由 `framework/config/MyBatisConfig.java` 手工构建 | `framework/config/ApplicationConfig.java` 第 16 行；`MyBatisConfig.java` 第 116-131 行 |
| 数据层 - Mapper XML | `resources/mapper/system/*.xml` 17 个、`resources/mapper/quartz/*.xml` 2 个，共 144 条语句 | `application.yml` 第 83 行 `mapperLocations: classpath*:mapper/**/*Mapper.xml`；`../tools/assets.json` 的 `SqlStatements` |
| 数据层 - JdbcTemplate 旁路 | `OpenApiSecurityService`（鉴权查询）、`OpenApiLogService`（调用日志写入） | 两个类均 `private final JdbcTemplate jdbcTemplate;` 构造注入，直接执行裸 SQL |
| 存储层 | PostgreSQL 11，34 张唯一表 | `../tools/semantics.json`；DDL 见 `open-api/sql/*.sql` 与 `deploy/local-docker/{postgres,mysql}/init/*.sql` |
| 前端 | Thymeleaf 模板 144 个；`resources/static/{ajax,css,js,ruoyi,img,fonts,html,i18n,file}` | `templates/include.html` 定义公共 `header(title)`/`footer` 片段，聚合全部前端库 |

### 前端技术形态（事实）

- 服务端渲染：Thymeleaf，`spring.thymeleaf.mode=HTML`、`encoding=utf-8`、`cache=false`（`application.yml` 第 51-55 行）。`cache=false` 表明当前按开发态运行。
- 模板组织：`templates/include.html` 提供 `th:fragment="header(title)"` 与 `th:fragment="footer"`，业务页统一以 `<th:block th:include="include :: header('...')" />` / `"include :: footer"` 复用。
- 前端交互：jQuery 3.7.1 + Bootstrap 3.4.1 + bootstrap-table 1.24.1 的 Ajax 单页式列表页（`templates/open/app/index.html` 第 44-84 行用 `$.table.init(options)` + `$.operate.add/edit/remove` + `$.modal.confirm`）。
- 前端库清单与版本、以及「仅连接资源、无自有能力接口」的判定，逐项登记在 [technical-component-index.md](./technical-component-index.md)。
- CSRF 令牌通过页面 `<meta name="csrf-token" th:content="${session.csrf_token}"/>` 下发（`include.html` 第 8 行），但校验开关默认关闭（见下）。

### Spring Boot 版本与依赖清单（事实，来源 `open-api/qvsu-openapi/pom.xml`）

父级与属性（`pom.xml` 第 15-34 行）：

| 属性 | 值 |
|---|---|
| `java.version` | `1.8` |
| `spring-boot.version` | `2.7.18` |
| `spring-framework.version` | `5.3.39` |
| `shiro.version` | `1.13.0` |
| `thymeleaf.extras.shiro.version` | `2.1.0` |
| `druid.version` | `1.2.27` |
| `yauaa.version` | `7.32.0` |
| `kaptcha.version` | `2.3.3` |
| `pagehelper.boot.version` | `1.4.7` |
| `fastjson.version` | `1.2.83` |
| `commons.io.version` | `2.21.0` |
| `poi.version` | `4.1.2` |
| `postgresql.version` | `42.7.5` |
| `tomcat.version` | `9.0.112` |
| `logback.version` | `1.2.13` |
| `maven-jar-plugin.version` | `3.1.1`（仅声明属性，未在插件中使用） |
| `project.build.sourceEncoding` / `project.reporting.outputEncoding` | `UTF-8` |

`dependencyManagement` 导入与锁定（`pom.xml` 第 36-70 行）：`spring-framework-bom:5.3.39`（import）、`spring-boot-dependencies:2.7.18`（import）、`logback-core`/`logback-classic:1.2.13`、`tomcat-embed-core`/`tomcat-embed-el`/`tomcat-embed-websocket:9.0.112`、`druid-spring-boot-starter:1.2.27`、`pro.fessional:kaptcha:2.3.3`、`shiro-core`/`shiro-spring`/`shiro-ehcache:1.13.0`、`thymeleaf-extras-shiro:2.1.0`、`yauaa:7.32.0`、`pagehelper-spring-boot-starter:1.4.7`、`commons-io:2.21.0`、`poi-ooxml:4.1.2`、`fastjson:1.2.83`、`postgresql:42.7.5`。

实际生效依赖（`pom.xml` 第 72-100 行，逐条）：

| 坐标 | 版本 | 用途 | 证据等级 |
|---|---|---|---|
| `org.springframework.boot:spring-boot-starter-web` | 2.7.18（managed） | Spring MVC + 内嵌 Tomcat 9.0.112 | 事实 |
| `org.springframework.boot:spring-boot-starter-thymeleaf` | 2.7.18（managed） | 服务端模板渲染 | 事实 |
| `org.springframework.boot:spring-boot-starter-aop` | 2.7.18（managed） | 操作日志/数据权限/数据源切换切面 | 事实 |
| `org.springframework.boot:spring-boot-starter-quartz` | 2.7.18（managed） | 定时任务调度 | 事实 |
| `org.springframework.boot:spring-boot-starter-validation` | 2.7.18（managed） | Bean Validation（含 `@Xss` 自定义约束） | 事实 |
| `org.postgresql:postgresql` | 42.7.5 | PostgreSQL JDBC 驱动 | 事实 |
| `com.alibaba:druid-spring-boot-starter` | 1.2.27 | 连接池 + 监控 Servlet | 事实 |
| `pro.fessional:kaptcha` | 2.3.3 | 图形/算术验证码生成；已排除 `javax.servlet:servlet-api` | 事实 |
| `org.apache.shiro:shiro-core` | 1.13.0 | 认证/授权内核 | 事实 |
| `org.apache.shiro:shiro-spring` | 1.13.0 | Spring 集成、过滤器工厂、注解通知器 | 事实 |
| `org.apache.shiro:shiro-ehcache` | 1.13.0 | Shiro 缓存委托给 Ehcache | 事实 |
| `com.github.theborakompanioni:thymeleaf-extras-shiro` | 2.1.0 | 模板内 `shiro:` 标签 | 事实 |
| `com.github.pagehelper:pagehelper-spring-boot-starter` | 1.4.7 | 物理分页，方言 postgresql | 事实 |
| `org.apache.commons:commons-lang3` | 3.12.0（由 `spring-boot-dependencies` 管理，pom 未显式声明版本） | 字符串/日期/反射工具；`StringUtils`、`DateUtils` 继承它 | 推断（版本来自 Spring Boot 2.7.18 BOM 的受管版本） |
| `com.fasterxml.jackson.core:jackson-databind` | 2.13.5（受管） | JSON 序列化（`spring.jackson.*`） | 推断（版本来自 BOM） |
| `com.alibaba:fastjson` | 1.2.83 | 签名串拼接、网关响应包装、操作日志参数序列化 | 事实 |
| `commons-io:commons-io` | 2.21.0 | `IOUtils`/`FilenameUtils`（`ShiroConfig`、`FileUtils`、`FileUploadUtils`） | 事实 |
| `org.apache.poi:poi-ooxml` | 4.1.2 | Excel 导入导出（`ExcelUtil`、`Excel` 注解、`ReflectUtils`、`ImageUtils`） | 事实 |
| `nl.basjes.parse.useragent:yauaa` | 7.32.0 | 在线用户 User-Agent 解析（`common/utils/http/UserAgentUtils`） | 事实 |
| `org.springframework.boot:spring-boot-starter-test` | 2.7.18（managed，scope=test） | 单元测试基座 | 事实 |

构建插件（`pom.xml` 第 102-123 行）：`maven-compiler-plugin:3.1`（source/target=1.8，encoding=UTF-8）、`spring-boot-maven-plugin:2.7.18`（`fork=true`，绑定 `repackage` goal）。仓库源为阿里云 `https://maven.aliyun.com/repository/public`（`pom.xml` 第 125-142 行）。

未在 `pom.xml` 中显式声明却可从依赖树获得的常用构件（`推断`，来自传递依赖）：`org.springframework:spring-jdbc`（`JdbcTemplate`，被 `OpenApiSecurityService`/`OpenApiLogService` 使用）、`org.springframework:spring-web`/`spring-webmvc`、`net.sf.ehcache:ehcache`（`ShiroConfig#getEhCacheManager` 直接引用 `net.sf.ehcache.CacheManager`，由 `shiro-ehcache` 传递）、`org.aspectj:aspectjweaver`、`org.yaml:snakeyaml`、`com.github.jsqlparser`（PageHelper 传递，用于 count 优化）。

### Shiro 安全链路（事实）

安全链路全部在 `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java` 装配。

**1) Realm**

- `ShiroConfig#userRealm(EhCacheManager)`（第 196-203 行）创建 `com.qvsu.framework.shiro.realm.UserRealm`，并设置 `setAuthorizationCacheName(Constants.SYS_AUTH_CACHE)` 与 Ehcache 缓存管理器。
- 授权缓存名 `sys-authCache` 在 `resources/ehcache/ehcache-shiro.xml` 第 46-54 行定义为不过期（`timeToLiveSeconds=0`、`timeToIdleSeconds=0`）。

**2) 安全管理器与会话管理**

- `ShiroConfig#securityManager(UserRealm)`（第 254-267 行）：`DefaultWebSecurityManager`，注入 `UserRealm`、Ehcache 缓存管理器、`OnlineWebSessionManager`；`rememberMe` 为真时才设置 `CustomCookieRememberMeManager`。
- `ShiroConfig#sessionManager()`（第 228-249 行）：`OnlineWebSessionManager`，`setDeleteInvalidSessions(true)`、`setGlobalSessionTimeout(expireTime * 60 * 1000)`（`expireTime=30` → 1800000 ms = 30 分钟）、`setSessionIdUrlRewritingEnabled(false)`（去掉 URL 上的 JSESSIONID）、`setSessionValidationScheduler(SpringSessionValidationScheduler)` 且 `setSessionValidationSchedulerEnabled(true)`。
- `ShiroConfig#sessionDAO()`（第 208-213 行）：`com.qvsu.framework.shiro.session.OnlineSessionDAO extends EnterpriseCacheSessionDAO`。
- `OnlineSessionDAO#doReadSession` 委托 `sysShiroService.getSession(sessionId)` 从库中读会话；`doDelete` 将状态置 `OnlineStatus.off_line` 并调用 `sysShiroService.deleteSession`；`syncToDb` 按 `shiro.session.dbSyncPeriod` 分钟节流后经 `AsyncManager` 异步落库（`OnlineSessionDAO.java` 第 52-116 行）。
- `ShiroConfig#authorizationAttributeSourceAdvisor`（第 447-454 行）：开启 Shiro 注解通知器，使 `@RequiresPermissions`/`@RequiresRoles` 生效。
- `ShiroConfig#shiroDialect()`（第 438-442 行）：注册 `at.pollux.thymeleaf.shiro.dialect.ShiroDialect`，模板可用 `shiro:` 标签。

**3) 过滤器链顺序（关键）**

`ShiroConfig#shiroFilterFactoryBean`（第 293-353 行）分三段配置：

- 匿名段（按 `LinkedHashMap` 插入顺序逐条匹配，第 306-334 行）：
  `/favicon.ico**`、`/qvsu.png**`、`/ruoyi.png**`、`/html/**`、`/css/**`、`/docs/**`、`/fonts/**`、`/img/**`、`/ajax/**`、`/js/**`、`/qvsu/**`、`/ruoyi/**`、`/captcha/captchaImage**`、`/captcha/captchaCode**` → `anon`；`PermitAllUrlProperties` 收集的 `@Anonymous` URL 追加 `anon`（第 321-325 行）；`/logout` → `logout`；`/login` 与 `/register` → `anon,captchaValidate`；`/open/**` 与 `/selftest/**` → `anon`（网关按 appKey 签名体系自行鉴权，不走 Shiro 会话）。
- 兜底段（第 349 行）：`filterChainDefinitionMap.put("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` —— 其余全部请求按 **user → kickout → onlineSession → syncOnlineSession → csrfValidateFilter** 的顺序执行。
- 过滤器实例注册（第 338-346 行）：`onlineSession`、`syncOnlineSession`、`captchaValidate`、`csrfValidateFilter`、`kickout`、`logout`。

各过滤器作用与证据：

| 顺序 | 过滤器名 | 实现类 | 作用 | 证据 |
|---:|---|---|---|---|
| 1 | `user` | Shiro 内置 `UserFilter` | 要求已认证或 rememberMe 身份，否则跳 `shiro.user.loginUrl=/login` | `ShiroConfig` 第 349 行；`application.yml` 第 97 行 |
| 2 | `kickout` | `framework.shiro.web.filter.kickout.KickoutSessionFilter` | 同账号并发登录控制；`maxSession`、`kickoutAfter`、踢出后跳 `/login?kickout=1` | `ShiroConfig#kickoutSessionFilter` 第 421-433 行 |
| 3 | `onlineSession` | `framework.shiro.web.filter.online.OnlineSessionFilter` | 校验在线会话状态（是否被强制退出、是否被锁定等），失效则重定向 `loginUrl` | `ShiroConfig#onlineSessionFilter` 第 358-364 行 |
| 4 | `syncOnlineSession` | `framework.shiro.web.filter.sync.SyncOnlineSessionFilter` | 请求结束后把 `OnlineSession` 变化同步入库（经 `OnlineSessionDAO.syncToDb`） | `ShiroConfig#syncOnlineSessionFilter` 第 369-374 行 |
| 5 | `csrfValidateFilter` | `framework.shiro.web.filter.csrf.CsrfValidateFilter` | 对 `POST` 请求校验请求头 `X-CSRF-TOKEN` 与会话中 `csrf_token` 是否一致；白名单命中则跳过；失败返回 `{"code":"1","msg":"当前请求的安全验证未通过，请刷新页面后重试。"}` | `CsrfValidateFilter.java` 第 27-65 行 |
| 6 | `logout` | `framework.shiro.web.filter.LogoutFilter` | 退出并清理会话，跳 `loginUrl` | `ShiroConfig#logoutFilter` 第 272-277 行 |
| 链上复用 | `captchaValidate` | `framework.shiro.web.filter.captcha.CaptchaValidateFilter` | 仅在 `/login`、`/register` 链上生效；校验验证码，受 `shiro.user.captchaEnabled` 与 `shiro.user.captchaType` 控制 | `ShiroConfig#captchaValidateFilter` 第 379-385 行；第 329-331 行 |

**重要观察（事实）**：`csrfValidateFilter` 被 `ShiroConfig#csrfValidateFilter()` 用 `csrfValidateFilter.setEnabled(csrfEnabled)` 设置开关，而 `csrfEnabled` 绑定 `@Value("${csrf.enabled: false}")`（第 139-140 行），`application.yml` 第 144 行又显式写 `csrf.enabled: false`。因此**过滤器虽挂在链上但默认不生效**，全部 POST 请求缺 CSRF 校验。白名单 `csrf.whites=/druid`（`application.yml` 第 146 行）同样处于无效状态。

**4) RememberMe 密钥**

`ShiroConfig#rememberMeManager()`（第 403-416 行）：`cipherKey` 非空时 `Base64.decode(cipherKey)` 作为 AES 密钥；为空时调用 `CipherUtils.generateNewKey(128, "AES").getEncoded()` **每次启动随机生成**。`application.yml` 第 116 行 `shiro.cookie.cipherKey:` 为空值，故当前每次重启后旧 rememberMe Cookie 失效（`推断`，依据：随机密钥 + 空配置）。

**5) 密码校验与登录服务**

- `framework.shiro.service.SysLoginService`、`SysPasswordService`、`SysRegisterService`、`SysShiroService` 四个服务构成登录/注册/密码重试/在线会话持久化链路。
- 密码重试上限由 `user.password.maxRetryCount=5`（`application.yml` 第 46 行）控制，锁定提示文案见 `messages.properties` 的 `user.password.retry.limit.exceed=密码输入错误{0}次，帐户锁定10分钟`；Ehcache 中 `loginRecordCache` 的 `timeToIdleSeconds=600` 与「锁定 10 分钟」一致（`ehcache-shiro.xml` 第 25-32 行）。

### Druid 连接池与多数据源（事实）

- 装配类：`open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/DruidConfig.java`。
- `masterDataSource`（第 35-41 行）：`@ConfigurationProperties("spring.datasource.druid.master")` + `DruidDataSourceBuilder.create().build()`，再交给 `DruidProperties#dataSource` 注入池参数。
- `slaveDataSource`（第 43-50 行）：`@ConditionalOnProperty(prefix="spring.datasource.druid.slave", name="enabled", havingValue="true")`。`application-druid.yml` 第 15 行 `slave.enabled: false`，故**从库 Bean 不装配**。
- `dynamicDataSource`（第 52-60 行）：`@Primary` 的 `com.qvsu.framework.datasource.DynamicDataSource`，内含 `MASTER` 与（如启用）`SLAVE` 两个目标数据源；`setDataSource` 用 `SpringUtils.getBean(beanName)` 尝试取值并**吞掉全部异常**（第 69-79 行空 catch）。
- 切换机制：`framework/aspectj/DataSourceAspect.java` 以 `@Order(1)`、`@Around("@annotation(com.qvsu.common.annotation.DataSource)...")` 在方法前后 `DynamicDataSourceContextHolder.setDataSourceType` / `clearDataSourceType`。由于 `slave.enabled=false`，当前无实际切换使用点（`推断`：源码中除切面与 `DataSourceType` 枚举外无 `@DataSource(DataSourceType.SLAVE)` 注解使用）。
- 池参数由 `framework/config/properties/DruidProperties.java` 用 13 个 `@Value` 注入后写回 `DruidDataSource`（第 15-87 行）：`initialSize=5`、`minIdle=10`、`maxActive=20`、`maxWait=60000`、`connectTimeout=30000`、`socketTimeout=60000`、`timeBetweenEvictionRunsMillis=60000`、`minEvictableIdleTimeMillis=300000`、`maxEvictableIdleTimeMillis=900000`、`validationQuery=SELECT 1`、`testWhileIdle=true`、`testOnBorrow=false`、`testOnReturn=false`。
- 监控 Servlet：`application-druid.yml` 第 43-50 行 `statViewServlet.enabled=true`、`url-pattern=/druid/*`、`login-username=postgres`、`login-password=123456`；`webStatFilter.enabled=true`；慢 SQL 阈值 `slow-sql-millis=1000`，`merge-sql=true`，`wall.config.multi-statement-allow=true`（**放宽了多语句防护**）。
- 去广告过滤器：`DruidConfig#removeDruidFilterRegistrationBean`（第 84-127 行）拦截 `${url-pattern}js/common.js`，正则移除 `banner` 与 `powered...shrek.wang`。

### Quartz 调度（事实 + 一处无证据推断）

- 依赖：`spring-boot-starter-quartz`（`pom.xml` 第 76 行）。
- 调度域代码：`com.qvsu.quartz.controller.SysJobController`、`SysJobLogController`；`com.qvsu.quartz.service.impl.SysJobServiceImpl`（8 个方法带 `@Transactional(rollbackFor = Exception.class)`）；`com.qvsu.quartz.util.*`、`com.qvsu.quartz.task.HttpTask`、`com.qvsu.quartz.config.ScheduleConfig`。
- `ScheduleConfig` 是**空占位类**，类注释明确：「当前使用 Spring Boot 自动配置的 Scheduler（内存模式）。如需切换为 JDBC JobStore，可在此处补充 SchedulerFactoryBean 配置。」（`ScheduleConfig.java` 第 3-13 行）。因此：**调度器为 RAMJobStore 内存模式**，任务定义持久化在业务表 `sys_job`，而 11 张 `QRTZ_*` 表虽已随 DDL 建出（`open-api/sql/quartz.sql`、`deploy/local-docker/*/init/35-quartz.sql`）但当前**不被 JDBC JobStore 使用**。
- `ResourcesConfig#restTemplate()`（第 36-40 行）提供 `RestTemplate` Bean，供 HTTP 类任务（`com.qvsu.quartz.task.HttpTask`）调用下游。
- 源码中未检索到 `spring.quartz.*` 配置项（`../tools/assets.json` 的 `ConfigKeys` 里 168 条不含任何 `spring.quartz` 键），故调度器全部采用 Spring Boot 默认值（`推断`：默认 RAMJobStore、线程池 10）。
- 未检索到 `@Scheduled` 注解与 `@XxlJob`/`@KafkaListener`/`@RabbitListener`/`@JmsListener`（`../tools/assets.json` 的 `Jobs` 集合为空），说明本系统**没有硬编码的定时/事件触发器**，全部任务由 `sys_job` 表数据驱动。

### AOP 与横切能力（事实）

| 切面 | 类与注解 | 切点 | 行为 |
|---|---|---|---|
| 操作日志 | `framework/aspectj/LogAspect`（`@Aspect @Component`） | `@Before`/`@AfterReturning`/`@AfterThrowing` 绑定 `@annotation(controllerLog)`（即 `@Log`） | 采集当前用户、IP、URI、方法名、请求方式、业务类型、标题、请求参数、响应体、耗时与异常；敏感字段排除 `password`、`oldPassword`、`newPassword`、`confirmPassword`；参数与异常各截断 2000 字符；经 `AsyncManager.me().execute(AsyncFactory.recordOper` 异步落库（`LogAspect.java` 第 44-137 行） |
| 数据权限 | `framework/aspectj/DataScopeAspect` | `@Before("@annotation(controllerDataScope)")` | 依据当前用户角色的 `dataScope` 拼装 SQL 过滤条件并写入参数对象；支持 `DATA_SCOPE_CUSTOM` 等类型（第 58-103 行） |
| 权限校验 | `framework/aspectj/PermissionsAspect` | `@Before("@annotation(controllerRequiresPermissions)")` | 在 `@RequiresPermissions` 方法执行前记录权限上下文，供后续数据权限使用（第 16-20 行） |
| 数据源切换 | `framework/aspectj/DataSourceAspect`（`@Order(1)`） | `@Around("@annotation(com.qvsu.common.annotation.DataSource)")` | 前后设置/清理 `DynamicDataSourceContextHolder`（第 23-54 行） |
| 防重复提交 | `framework/interceptor/RepeatSubmitInterceptor` + `impl/SameUrlDataInterceptor` | 注册为 MVC 拦截器，`addPathPatterns("/**")` | 对同一 URL 相同参数的重复提交做拦截（`ResourcesConfig` 第 64-67 行） |

异步能力：`framework/manager/AsyncManager` + `framework/manager/factory/AsyncFactory` 承载操作日志落库与在线会话落库；线程池参数硬编码在 `common/config/thread/ThreadPoolConfig.java`（`corePoolSize=50`、`maxPoolSize=200`、`queueCapacity=1000`、`keepAliveSeconds=300`），**不来自配置文件**（`事实`：`ConfigKeys` 168 条中无对应键）。

### 全局异常处理（事实）

`com.qvsu.framework.web.exception.GlobalExceptionHandler`，类注解为 `@RestControllerAdvice`（注意：共享上下文记为 `@ControllerAdvice`，实际源码是 `@RestControllerAdvice`，此处以源码为准）。8 个处理器：

| 异常类型 | 行为 |
|---|---|
| `AuthorizationException` | Ajax 请求返回 `AjaxResult.error(PermissionUtils.getMsg(...))`；非 Ajax 跳 `error/unauth` 视图 |
| `HttpRequestMethodNotSupportedException` | 返回 `AjaxResult.error(e.getMessage())` |
| `RuntimeException` | 记录日志后返回 `AjaxResult.error(e.getMessage())` |
| `Exception` | 记录日志后返回 `AjaxResult.error(e.getMessage())` |
| `ServiceException` | Ajax 返回 `AjaxResult.error`；非 Ajax 跳 `error/service` 视图并带 `errorMessage` |
| `MissingPathVariableException` | 返回「请求路径中缺少必需的路径变量[x]」 |
| `MethodArgumentTypeMismatchException` | 经 `EscapeUtil.clean(value)` 清洗后返回类型不匹配说明 |
| `DemoModeException` | 返回「演示模式，不允许操作」 |

同时存在网关侧独立异常处理：`OpenApiSecurityService.OpenApiSecurityException` 由 `OpenApiFilter` 捕获（返回 `OpenResult.fail`），`OpenApiProxyService.OpenProxyException` 由 `OpenGatewayController` 捕获（返回 `OpenResult.fail`）；两者**不经过** `GlobalExceptionHandler`（`事实`：两者均为 `RuntimeException` 子类，但都在 Filter 内被 catch，未进入 MVC 异常解析链）。

### 事务边界（事实）

- `ApplicationConfig` 未声明 `@EnableTransactionManagement`；事务能力由 `spring-boot-starter-jdbc`（经 `druid-spring-boot-starter`/MyBatis 传递）的 `DataSourceTransactionManagerAutoConfiguration` 自动装配（`推断`）。
- 全仓 `@Transactional` 共 26 处，分布如下（`事实`，grep `@Transactional` 于 `src/main/java`）：

| 文件 | 数量 | 注解形态 |
|---|---:|---|
| `com/qvsu/open/service/OpenManageService.java` | 5 | `@Transactional`（默认回滚规则：仅 `RuntimeException`/`Error`） |
| `com/qvsu/system/service/impl/SysUserServiceImpl.java` | 5 | `@Transactional` |
| `com/qvsu/system/service/impl/SysRoleServiceImpl.java` | 5 | `@Transactional` |
| `com/qvsu/system/service/impl/SysMenuServiceImpl.java` | 1 | `@Transactional` |
| `com/qvsu/system/service/impl/SysDictTypeServiceImpl.java` | 1 | `@Transactional` |
| `com/qvsu/system/service/impl/SysDeptServiceImpl.java` | 1 | `@Transactional` |
| `com/qvsu/quartz/service/impl/SysJobServiceImpl.java` | 8 | `@Transactional(rollbackFor = Exception.class)` |

- 事务边界统一落在 Service 实现层；Controller 不标注事务。
- **未纳入事务的关键写操作（事实）**：`OpenApiLogService#save` 直接用 `JdbcTemplate.update` 插入 `open_call_log`，无事务；`OpenApiSecurityService` 的鉴权查询全部为裸 `JdbcTemplate` 读，无事务。
- **`@Transactional` 默认传播/隔离为 REQUIRED / DEFAULT**（未显式声明），隔离级别取决于 PostgreSQL 默认 READ COMMITTED（`推断`）。

### OpenAPI 网关链路（本系统核心增量，事实）

```text
Client ──X-App-Key/X-Timestamp/X-Nonce/X-Sign──> /open/**
  → OpenApiFilter (OncePerRequestFilter, shouldNotFilter: !startsWith("/open/"))
      ├ TraceContext.set(traceId) + MDC.put("traceId") + 响应头 X-Trace-Id
      ├ OpenApiSecurityService.authenticate(...)  ← JdbcTemplate 裸 SQL 查 open_api / open_app / open_app_api
      │    错误码: 40001 缺少/无效认证头、40002 时间戳过期、40003 签名失败、40004 API 禁用或无权限、40005 nonce 重复
      └ finally: OpenApiLogService.save(...) → insert into open_call_log
  → OpenGatewayController#gateway("/open/**")
      └ OpenApiProxyService.forward(context, request, body) → RestTemplate 转发到 target_url
           超时: connectTimeout=readTimeout=timeoutMs(默认 5000)
           错误码: 50001 后端调用失败、50002 请求超时
```

- 签名算法：`HmacSHA256`，明文为「业务参数按键名排序 → `k=v` 以 `&` 连接 → 追加 `&appSecret={appSecret}`」，十六进制小写输出，比较时忽略大小写（`OpenApiSecurityService.java` 第 121-145 行、第 334-358 行）。
- 时间漂移容忍：±5 分钟（`ALLOW_TIME_DRIFT_MS = TimeUnit.MINUTES.toMillis(5)`，第 37 行）。
- Nonce 防重放：进程内 `ConcurrentHashMap`，有效期 5 分钟，容量超 100000 时清理过期项（第 38-39、210-237 行）。**单机内存实现，多实例部署下不成立**（`推断`，依据：静态 `ConcurrentHashMap` + 无 Redis/DB 共享）。
- `X-Trace-Id` 请求头已由过滤器 `isSkipHeader` 之外的规则处理；`OpenApiProxyService#isSkipHeader` 会剥离 `host`、`content-length`、`x-app-key`、`x-timestamp`、`x-nonce`、`x-sign` 后再转发（第 104-114 行）。
- `need_sign=0` 的 API 跳过签名校验，`appName` 记为 `"anonymous"`（第 61-72 行）。该分支由数据行控制：DDL 默认 `need_sign=1`，两份种子脚本插入的数据也全为 `1`，故当前无数据触发（详见下文技术债第 14 条）。

### 运行时配置与部署单元（事实）

| 配置/部署单元 | 路径 | 作用 |
|---|---|---|
| 主配置 | `open-api/qvsu-openapi/src/main/resources/application.yml` | 117 个配置键：`qvsu.*`、`server.*`、`logging.*`、`user.password.*`、`spring.*`、`mybatis.*`、`pagehelper.*`、`shiro.*`、`xss.*`、`csrf.*`；`spring.profiles.active=druid` |
| 数据源配置 | `open-api/qvsu-openapi/src/main/resources/application-druid.yml` | 29 个配置键：Druid 池参数、master/slave、`statViewServlet`、`filter.stat/wall` |
| 测试数据源配置 | `open-api/qvsu-openapi/src/test/resources/application-druid.yml` | 19 个配置键，连接 `localhost:5433`，池参数裁剪版（无 `statViewServlet`/`filter`） |
| MyBatis 全局配置 | `open-api/qvsu-openapi/src/main/resources/mybatis/mybatis-config.xml` | `cacheEnabled=true`、`useGeneratedKeys=true`、`defaultExecutorType=SIMPLE`、`logImpl=SLF4J`；`mapUnderscoreToCamelCase` 被注释掉 |
| 日志配置 | `open-api/qvsu-openapi/src/main/resources/logback.xml` | 日志目录 `/home/qvsu/logs`；appender `console`、`file_info`（仅 INFO）、`file_error`（仅 ERROR）、`sys-user`；滚动按天保留 60 天；注意文件内**定义了两个 `<root>`**（第 79-87 行），后者覆盖前者，`console` 实际可能不生效（`推断`） |
| Shiro 缓存配置 | `open-api/qvsu-openapi/src/main/resources/ehcache/ehcache-shiro.xml` | 缓存 `loginRecordCache`(600s 空闲)、`sys-userCache`、`sys-authCache`、`sys-cache`、`sys-config`、`sys-dict`、`shiro-activeSessionCache` |
| 国际化 | `open-api/qvsu-openapi/src/main/resources/static/i18n/messages.properties` | 24 个消息键，`spring.messages.basename=static/i18n/messages` |
| 本地 Docker 编排 | `open-api/deploy/local-docker/docker-compose.yaml` | 21 个键；`name: openapi-local`；`openapi` 与 `postgres` 两服务；postgres 数据目录默认 `D:/data/jd_openapi/postgres`（Windows 路径，非 Linux 默认） |
| 本地 Docker 应用覆盖配置 | `open-api/deploy/local-docker/conf/application-docker-local.yml` | 6 个键；通过 `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/opt/openapi/conf/application-docker-local.yml` 注入（compose 第 41 行），覆盖 master 连接串为容器名 `postgres:5432` |
| 本地 Docker 镜像构建 | `open-api/deploy/local-docker/Dockerfile` | 多阶段：`maven:3.9.9-eclipse-temurin-8` 构建 → `eclipse-temurin:8-jre` 运行；`EXPOSE 80`（与实际 `server.port=5656` 不符，见技术债第 6 条） |
| 开发 Docker 编排 | `open-api/deploy/dev-docker/docker-compose.yml` | 4 个键（含 `version`）；`container_name: qvsu-openapi`；端口 `5656:5656`；挂载 `./logs`、`./data` |
| 开发 Docker 镜像 | `open-api/deploy/dev-docker/Dockerfile` | 基础镜像 `registry.cn-shenzhen.aliyuncs.com/chaoqs/openjdk:8-jdk-alpine`；`COPY open-api/qvsu-openapi/target/*.jar` |
| 数据库初始化（PostgreSQL） | `open-api/deploy/local-docker/postgres/init/{00-init,10-qvsu,30-open-api,31-open-api-compat,35-quartz,40-open-api-menu,50-open-api-seed}.sql` | 7 个脚本按文件名顺序执行；`00-init.sql` 只设置 `client_encoding=UTF8` 与 `timezone=Asia/Shanghai` |
| 数据库初始化（MySQL） | `open-api/deploy/local-docker/mysql/init/{00-create-db,10-qvsu,30-open-api,31-open-api-compat,35-quartz,40-open-api-menu,50-open-api-seed}.sql` | 7 个脚本；`00-create-db.sql` 建库 `jd_openapi` 字符集 `utf8mb4`。**但编排文件 `docker-compose.yaml` 只挂载了 `./postgres/init`，MySQL 这一套无对应服务**（见技术债第 7 条） |
| 独立 SQL 脚本 | `open-api/sql/{open_api,open_api_compat_upgrade,open_api_menu,open_api_selftest_seed,open_api_httpbin_min_seed,open_call_log_headers_upgrade,quartz}.sql` | 7 个脚本，供手工执行或生产升级 |
| Docker 忽略 | `open-api/.dockerignore`、`open-api/.gitignore` | 构建上下文裁剪 |

配置键级明细（168 条，含默认值/环境差异/消费者/敏感性）见 [config-index.md](./config-index.md)。

### 已发现的技术债与风险

#### 1. `application.yml` 中文注释双重编码乱码（事实，已复现）

- 位置：`open-api/qvsu-openapi/src/main/resources/application.yml` 全文注释与 `qvsu.name`/`qvsu.version` 的值。
- 现象：注释呈 `妞ゅ湱娲伴惄绋垮彠闁板秶鐤?`、`閸氬秶袨` 形态，值呈 `鑱氭惛OpenAPI绯荤粺`。典型「UTF-8 字节被按 GBK 解码后再按 UTF-8 编码」的双重损伤，且原始 zip 内即如此（`open-api.zip` 未修改）。
- 影响：`qvsu.name=鑱氭惛OpenAPI绯荤粺` 会被 `QvsuConfig.getName()` 读取并渲染到页面标题/页脚，用户可见乱码。
- 证据等级：事实（`read` 工具直读源文件第 1-16 行）。

#### 2. postgres 菜单初始化 SQL 中文乱码（事实，已复现）

- 位置：`open-api/deploy/local-docker/postgres/init/40-open-api-menu.sql` 第 5-24 行。
- 现象：菜单名如 `OpenAPI绠＄悊`、`搴旂敤绠＄悊`，第 26-40 行 `sys_role_menu` 关联的数据正常。
- 对比：MySQL 副本 `open-api/deploy/local-docker/mysql/init/40-open-api-menu.sql`（7074 字节 vs postgres 版 7139 字节）与 `open-api/sql/open_api_menu.sql` 中文正常。
- 影响：使用 PostgreSQL 本地 Docker 初始化后，「OpenAPI管理」目录与 5 个页面菜单、10 个按钮权限的中文名全部乱码。
- 证据等级：事实。

#### 3. README 乱码（部分证伪，需修正共享上下文）

- 实测：仓库根 `README.md`（2 行，`# litellmgateway` / `轻量级llm网关`）与 `open-api/README.md`（24 行）**中文均正常**，未复现 `杞婚噺绾lm缃戝叧` 形态。
- 唯一确认的乱码 README 风险来自上述第 1、2 条关联文件。
- 结论修正：`_CONTEXT-FOR-AGENTS.md` 第 2.5 节第 3 条描述的 README 乱码在当前工作区**不成立**，属于已被修复或描述失准；如仍存在于历史版本，需回源 git 历史确认（`假设`）。
- 证据等级：事实（直读两个 README 文件）。

#### 4. 前端 `templates/demo/**` 示例页（事实，范围排除）

- 位置：`open-api/qvsu-openapi/src/main/resources/templates/demo/**`，共 73 个 HTML，占 144 个模板的 50.7%。
- 性质：RuoYi 框架自带演示页（`demo/form/*`、`demo/report/*`、`demo/modal/*`、`demo/icon/*`、`demo/operate/*` 等），由 `templates/index.html`（第 86-155 行）与 `templates/index-topnav.html` 的静态菜单直达。
- 处理：登记为**范围排除**，理由——不承载本项目业务结果，仅演示第三方组件；但组件本身仍在生产链路上（`include.html` 被业务页复用），故组件能力仍建模。
- 证据等级：事实。

#### 5. `deploy/dev-docker` 不可复现构建（事实）

- 现象一：`deploy/dev-docker/docker-compose.yml` 第 5 行直接引用外部镜像 `registry.cn-shenzhen.aliyuncs.com/chaoqs/qvsu_open_api:qvsu_open_api_2026-03-27-13-12-27`，镜像不可从仓库内产出。
- 现象二：`deploy/dev-docker/Dockerfile` 第 14 行 `COPY open-api/qvsu-openapi/target/*.jar /app/qvsu-openapi.jar` 要求**仓库上一级目录**作为构建上下文，而 `docker-compose.yml` 未声明 `build:` 段，二者不构成可用闭环。
- 现象三：`open-api/code-app-example` 目录不存在（已核实 `open-api/` 下只有 `deploy`、`qvsu-openapi`、`sql`）。
- 结论：dev-docker 路径仅供「已构建 jar + 已推送镜像」的内存流程，新环境无法仅凭仓库复现。
- 证据等级：事实。

#### 6. Dockerfile `EXPOSE 80` 与真实端口不一致（新增发现，事实）

- `open-api/deploy/local-docker/Dockerfile` 第 17 行 `EXPOSE 80`，而应用监听 `5656`（`application.yml` 第 21 行），compose 端口映射也是 `5656:5656`。
- 影响：`EXPOSE` 仅为元数据，当前 compose 场景不致命；但任何依赖镜像元数据（如 `docker run -P` 自动映射、K8s 端口推导、镜像扫描基线）的场景会得到错误结论。

#### 7. MySQL 初始化脚本无对应服务（新增发现，事实）

- `open-api/deploy/local-docker/mysql/init/` 下 7 个脚本（含 `00-create-db.sql` 建 `utf8mb4` 库）完整存在，但 `docker-compose.yaml` 只声明了 `postgres` 服务，且只挂载 `./postgres/init`。
- 影响：MySQL 路径是**死代码**；同时 `10-qvsu.sql` 为 MySQL 方言（44553 字节）与 postgres 版（36100 字节）字段/语法不可互换，维护双份成本且易漂移。

#### 8. 硬编码明文口令与密钥（新增发现，事实，最高优先级）

| 位置 | 内容 | 风险 |
|---|---|---|
| `application-druid.yml` 第 11 行 | `spring.datasource.druid.master.password: 123456` | 数据库超弱口令，且随代码入库 |
| `application-druid.yml` 第 50 行 | `spring.datasource.druid.statViewServlet.login-password: 123456` | `/druid/*` 监控台可被暴力登录，暴露所有 SQL 与连接信息 |
| `application-druid.yml` 第 49 行 | `statViewServlet.login-username: postgres` | 与数据库账号同名，缩小爆破空间 |
| `deploy/local-docker/docker-compose.yaml` 第 10 行 | `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-123456}` | 默认回退值即弱口令 |
| `deploy/local-docker/conf/application-docker-local.yml` 第 8 行 | `password: 123456` | 容器内明文口令 |
| `src/test/resources/application-druid.yml` 第 9 行 | `password: 123456` | 测试配置同样明文 |
| `open-api/sql/open_api_selftest_seed.sql` 第 10 行、`open_api_httpbin_min_seed.sql` 第 9 行 | `app_secret = sk_selftest_demo_1234567890abcdef` | 种子数据内置固定 appSecret，`expire_time=NULL` 永不过期 |
| `application.yml` 第 116 行 | `shiro.cookie.cipherKey:`（空） | 每次启动随机生成 AES 密钥（`ShiroConfig` 第 413 行），多实例部署下 rememberMe 互不兼容 |

配置键级的敏感性标注见 [config-index.md](./config-index.md) 的「敏感配置汇总」章节。

#### 9. CSRF 默认关闭（新增发现，事实）

- `application.yml` 第 144 行 `csrf.enabled: false`；`ShiroConfig` 第 139 行 `@Value("${csrf.enabled: false}")` 默认值也是 `false`。
- `CsrfValidateFilter` 虽在 `/**` 链路第 5 位，但 `setEnabled(false)` 后不再校验任何 POST 请求。
- 页面仍下发 `<meta name="csrf-token">`（`include.html` 第 8 行），形成「有防护外观、无防护实效」的错觉。
- 影响：所有状态变更接口（用户/角色/菜单/字典/参数/OpenAPI 应用与授权管理）可被跨站构造请求；结合 Cookie 的 `httpOnly=true` 但**无 SameSite 声明**（`ShiroConfig#rememberMeCookie` 未设置 SameSite），风险进一步放大。

#### 10. `demoEnabled=true` 演示模式未关闭（新增发现，事实）

- `application.yml` 第 10 行 `qvsu.demoEnabled: true` → `QvsuConfig.isDemoEnabled()` 返回真 → 经 `SysIndexController` 第 67 行 `mmap.put("demoEnabled", ...)` 传入前端。
- 同时 `GlobalExceptionHandler#handleDemoModeException` 保留了「演示模式，不允许操作」分支，`DemoModeException` 类保留在 `common/exception`。
- 风险：语义上开启的是「演示模式」，与 `demo/**` 73 个示例页叠加，向访问者暴露框架演示能力；且该开关为静态字段（`private static boolean demoEnabled`），属全局可变状态，存在并发写风险（`推断`）。

#### 11. `qvsu.addressEnabled=false` 与 IP 归属地解析（新增发现，事实）

- `application.yml` 第 14 行 `qvsu.addressEnabled: false`，`AddressUtils` 依赖外部 IP 归属地服务（`com.alibaba.fastjson.JSONObject` 解析外部响应）。
- 关闭状态是安全正向选择（避免向第三方接口外发客户端 IP）；但登录日志中的「登录地点」字段因此为空，属**功能性缺失而非危险**。

#### 12. Druid `wall` 防护被放宽 + 监控台对外暴露（新增发现，事实）

- `application-druid.yml` 第 59-60 行 `filter.wall.config.multi-statement-allow: true` 允许一次执行多条 SQL，削弱 SQL 注入纵深防御。
- `statViewServlet.url-pattern: /druid/*` 且 `enabled: true`，与 `csrf.whites: /druid` 呼应，说明监控台被当作常规路径处理；结合弱口令即构成独立风险面。

#### 13. Nonce 防重放为单机内存实现（新增发现，推断）

- `OpenApiSecurityService` 第 39 行 `private static final ConcurrentHashMap<String, Long> NONCE_CACHE`。
- 多副本部署时各进程独立缓存，同一 nonce 可在不同实例重复通过 → 重放窗口存在。若做水平扩展需改为共享存储（`推断`：当前 `deploy/` 下两个编排均为单副本，尚未触发该问题）。

#### 14. `need_sign=0` 构成潜在的匿名转发通道（新增发现，事实 + 推断）

- `OpenApiSecurityService#authenticate` 第 61-72 行：`apiInfo.needSign == false` 时直接构造 `OpenAuthContext`（`appName="anonymous"`）并放行，**完全不校验 appKey、时间戳、nonce 与签名**。
- DDL 默认值为安全侧：`open_api.sql` 第 35 行 `need_sign TINYINT DEFAULT 1 COMMENT '1=sign required'`；两份种子脚本 `open_api_selftest_seed.sql`（第 14-35 行）与 `open_api_httpbin_min_seed.sql`（第 19-24 行）插入的全部记录均为 `need_sign=1`。因此该分支**当前无数据触发**（`事实`）。
- 风险在于运维侧：`open_api` 是可通过「接口管理」页面（`/admin/open/api`）写入的业务表，任何具备 `open:api:edit` 权限的用户把 `need_sign` 置 0，即可把该路径变成无需凭据的转发入口；结合 `ShiroConfig` 第 333 行 `/open/**` 为 `anon`，外部访问者可直接借道网关转发到 `target_url`，构成 SSRF 面（`推断`：可利用性取决于 `target_url` 的运维管控，且种子数据已示范了 `http://127.0.0.1:80/...` 与 `http://10.255.255.1:81/...` 这类内网地址）。

#### 15. 种子数据内置固定凭据与第三方外呼地址（新增发现，事实）

- `open-api/sql/open_api_selftest_seed.sql` 第 10 行与 `open_api_httpbin_min_seed.sql` 第 9 行插入同一组固定凭据：`app_key = ak_selftest_demo`、`app_secret = sk_selftest_demo_1234567890abcdef`，应用名「OpenAPI自测应用」，`expire_time = NULL`（永不过期）。
- 同一批种子数据把 `target_url` 指向外部互联网服务 `https://httpbin.org/get|post|headers`（`open_api_httpbin_min_seed.sql` 第 19-24 行），使网关成为**向第三方发请求的出网通道**；同时包含指向内网地址的自测行（`http://127.0.0.1:80/common/captchaImage`、`http://10.255.255.1:81/timeout`），可用于探测内网连通性。
- 部署时若执行这些脚本（`deploy/local-docker/postgres/init/50-open-api-seed.sql` 同源），固定密钥与外部回显接口会一并进入环境。

#### 16. Web 层安全头缺失（新增发现，事实）

- 全仓未检索到 `Content-Security-Policy`、`X-Frame-Options`、`Strict-Transport-Security`、`X-Content-Type-Options` 的设置点；`ShiroConfig` 的 `SimpleCookie` 只设置 `domain`/`path`/`httpOnly`/`maxAge`，未设置 `SameSite`。
- `shiro.cookie.maxAge=30` 实际被解释为**天**（`ShiroConfig` 第 396 行 `maxAge * 24 * 60 * 60`），rememberMe Cookie 有效期 30 天，与配置注释「秒为单位」不符（`事实`：注释与实现不一致）。

#### 17. 上传路径为 Windows 绝对路径（新增发现，事实）

- `application.yml` 第 12 行 `qvsu.profile: D:/qvsu/uploadPath`，且 `ResourcesConfig` 第 55 行以 `file:` + `QvsuConfig.getProfile()` 暴露为静态资源目录。
- 影响：Linux/Docker 环境下该路径不存在，文件上传与头像/下载访问会失败；同时说明该配置**未在 `application-docker-local.yml` 中被覆盖**（容器内仍用 `D:/qvsu/uploadPath`），属部署缺陷。

#### 18. `ThreadPoolConfig` 参数不可配置（新增发现，事实）

- `common/config/thread/ThreadPoolConfig.java` 中 `corePoolSize=50`、`maxPoolSize=200`、`queueCapacity=1000`、`keepAliveSeconds=300` 为 Java 字段默认值，`ConfigKeys` 168 条中无对应键。
- 影响：异步日志/会话落库线程池容量无法通过配置或环境变量调整，容量调优必须改代码重新构建。

#### 19. 配置键与源码 Java 字段绑定不一致的若干处（新增发现，事实）

- `application.yml` 第 115 行注释说明 `cipherKey` 可为空并由 `CipherUtils.generateNewKey(128, "AES")` 生成，与 `ShiroConfig` 第 407-414 行一致；但**生产环境未提供固定密钥**，见第 8 条。
- `shiro.cookie.maxAge=30` 与实现按天换算，见第 15 条。
- `logback.xml` 定义两个 `<root>` 元素（第 79-87 行），同名重复配置项以后者为准，`console` appender 很可能不生效（`推断`，未运行验证）。
- `application.yml` 中 `qvsu.version` 的值与 `qvsu.name` 完全相同（均为乱码串），疑为复制粘贴错误（`推断`）。

#### 20. 未纳入范围的框架/依赖腐化风险（推断）

- `fastjson 1.2.83`：历史反序列化高危版本线，虽 1.2.83 已修复已知 autotype 链，但 `fastjson` 已停止维护，长期应迁移至 `fastjson2` 或 Jackson（`推断`）。
- `poi 4.1.2`：2020 年版本，存在已知 CVE 修复缺口（`推断`）。
- `shiro 1.13.0`：仍需确认与 Spring Boot 2.7.18 的组合是否有已公开绕过（`假设`）。
- 前端 `bootstrap 3.4.1`、`jQuery 3.7.1`、`layui 2.8.18`：Bootstrap 3 已停止维护（`推断`）。
- `maven-jar-plugin.version=3.1.1` 属性声明后未被任何插件引用，属无用配置（`事实`）。

### 架构结论汇总

- 本系统是**单体 Spring Boot 2.7.18 + Shiro 1.13.0 + MyBatis + Druid + PostgreSQL 11** 的后台管理平台，在 RuoYi 精简基座上叠加了 **OpenAPI 网关业务域**（`com.qvsu.open`），核心增量是 `OpenApiFilter` + `OpenApiSecurityService` + `OpenApiProxyService` + `OpenApiLogService` 构成的四段式转发链路（`事实`）。
- 数据访问存在**双轨制**：管理侧走 MyBatis Mapper（144 条语句），网关侧走 `JdbcTemplate` 裸 SQL（`事实`）。这导致网关侧的表结构变更不会在 Mapper XML 中体现，是后续维护的主要耦合点。
- 安全链路的**设计强度高于实际强度**：Shiro 过滤器链 6 段齐备、CSRF 过滤器已实现、XSS 过滤器已注册，但 `csrf.enabled=false`、`wall.multi-statement-allow=true`、数据库与监控台弱口令 `123456`、`xss.excludes=/system/notice/*`、`shiro.session.maxSession=-1` 共同把实际防护拉到低位；网关侧另有 `need_sign=0` 的匿名放行分支（当前无数据触发）与内置固定 `app_secret` 的自测种子数据（`事实`）。
- 部署可复现性**只有 `deploy/local-docker` 一条路**，且该路径产出的 PostgreSQL 环境会带乱码菜单（`事实`）。
