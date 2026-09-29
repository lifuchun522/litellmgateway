# 配置索引

本文件是 `CFG-*` 稳定 ID 的唯一主定义位置。
结论级别：`事实`（直接读配置源码/Java 绑定代码）、`推断`（多迹象一致）、`假设`（待确认）。
最后核验日期：2026-03-27。核验基线：`../tools/assets.json` 的 `ConfigKeys` 数组（168 条，权威机器可读事实源）、`open-api/qvsu-openapi/src/main/resources/{application.yml, application-druid.yml}`、`open-api/qvsu-openapi/src/test/resources/application-druid.yml`、`open-api/deploy/{local-docker,dev-docker}/**`、`open-api/qvsu-openapi/src/main/resources/static/i18n/messages.properties`。

## 0. 登记口径与统计

- 本文件按**配置来源文件**建立 `CFG-*` 主定义（共 8 个），每个 CFG 节点下用**键级明细表逐键登记全部 168 条配置键**，不使用配置组代替键级清单。
- 键级明细表 9 列固定为：序号、配置名、默认值、环境差异、消费者、控制行为、敏感性、证据。
- 敏感性取值：`无` / `敏感` / `高度敏感`。`高度敏感` 指明文口令、密钥或直接决定认证强度；`敏感` 指影响安全默认值、泄露内部信息或影响数据边界。
- 统计对账（事实）:

| 配置来源文件 | 键数 | CFG ID |
|---|---:|---|
| `qvsu-openapi/src/main/resources/application.yml` | 51 | CFG-001 |
| `qvsu-openapi/src/main/resources/application-druid.yml` | 30 | CFG-002 |
| `deploy/local-docker/docker-compose.yaml` | 29 | CFG-003 |
| `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | 29 | CFG-004 |
| `qvsu-openapi/src/test/resources/application-druid.yml` | 19 | CFG-005 |
| `deploy/local-docker/conf/application-docker-local.yml` | 6 | CFG-006 |
| `deploy/dev-docker/docker-compose.yml` | 4 | CFG-007 |
| **合计（等于 `../tools/assets.json` 的 ConfigKeys 总数）** | **168** | — |
| 代码中读取但不在 168 条内的运行时开关与硬编码配置 | 6 | CFG-008 |

- 未被任何 Java 代码 `@Value`/`@ConfigurationProperties` 直接读取的键，消费者列标注为实现该行为的框架组件或「无代码读取点」，避免把「存在于配置文件」误判为「被代码使用」。

---

## CFG-001 - application.yml 主配置键集

- ID: CFG-001
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/qvsu-openapi/src/main/resources/application.yml`（148 行，UTF-8 BOM + 双重编码乱码注释）
- 来源文件: `open-api/qvsu-openapi/src/main/resources/application.yml`
- 生效方式: Spring Boot 默认加载 `classpath:/application.yml`；`spring.profiles.active=druid`（第 64 行）加载同目录 `application-druid.yml`；容器环境再由 `SPRING_CONFIG_ADDITIONAL_LOCATION` 追加 `application-docker-local.yml`（见 CFG-006）
- 加载优先级（低 → 高）: `application.yml` → `application-druid.yml` → `application-docker-local.yml`
- 覆盖关系: 与 `application-docker-local.yml` 的重叠键共 3 个（`spring.datasource.driverClassName`、`spring.datasource.druid.master.*`、`pagehelper.helperDialect`、`shiro.user.captchaEnabled`，其中 `master.*` 为 3 个键），容器内以 CFG-006 的值生效
- 消费者总览: `com.qvsu.common.config.QvsuConfig`（`@ConfigurationProperties(prefix="qvsu")`）、`com.qvsu.framework.config.ShiroConfig`（15 个 `@Value`）、`com.qvsu.framework.config.CaptchaConfig`、`com.qvsu.framework.config.FilterConfig`、`com.qvsu.framework.config.MyBatisConfig`、`com.qvsu.framework.config.ResourcesConfig`、`com.qvsu.framework.config.properties.DruidProperties`、`com.qvsu.framework.web.exception.GlobalExceptionHandler`、`com.qvsu.web.controller.system.SysCaptchaController`、`com.qvsu.framework.shiro.service.SysPasswordService`，其余键由 Spring Boot / MyBatis-Plus / Shiro / Thymeleaf 等框架自身消费

### 键级明细（51 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `qvsu.name` | `鑱氭惌OpenAPI绯荤粺`（乱码，原意为「聚集OpenAPI系统」） | 三份 Docker 配置均未覆盖 | `QvsuConfig.getName()` 静态字段 | 页面标题/页脚品牌名 | 无 | `application.yml` 第 4 行；`QvsuConfig.java` 第 16 行 |
| 2 | `qvsu.version` | `鑱氭惌OpenAPI绯荤粺`（与 `name` 同值，疑为复制错误） | 无覆盖 | `QvsuConfig.getVersion()` | 版本号展示 | 无 | `application.yml` 第 6 行；`QvsuConfig.java` 第 19 行 |
| 3 | `qvsu.copyrightYear` | `2026` | 无覆盖 | `QvsuConfig.getCopyrightYear()` | 页脚版权年份 | 无 | `application.yml` 第 8 行；`QvsuConfig.java` 第 22 行 |
| 4 | `qvsu.demoEnabled` | `true` | 无覆盖 | `QvsuConfig.isDemoEnabled()` → `SysIndexController` 第 67 行 `mmap.put("demoEnabled", ...)` | 开启「演示模式」语义，前端展示 RuoYi 演示菜单；配合 `DemoModeException` 分支 | 敏感 | `application.yml` 第 10 行；`SysIndexController.java` 第 67 行 |
| 5 | `qvsu.profile` | `D:/qvsu/uploadPath` | **Docker 环境未覆盖**，容器内仍为 Windows 路径 | `QvsuConfig.getProfile()` → `ResourcesConfig` 第 55 行、`QvsuConfig.getUploadPath/getAvatarPath/getDownloadPath/getImportPath` | 文件上传/头像/下载落盘与静态暴露根目录 | 敏感 | `application.yml` 第 12 行；`ResourcesConfig.java` 第 55 行 |
| 6 | `qvsu.addressEnabled` | `false` | 无覆盖 | `QvsuConfig.isAddressEnabled()` → `AddressUtils` | 是否调用外部 IP 归属地服务；关闭时不外发客户端 IP | 无 | `application.yml` 第 14 行；`QvsuConfig.java` 第 31 行 |
| 7 | `qvsu.testing.exposeCaptchaCode` | `false` | 无覆盖 | `SysCaptchaController` 第 32-33 行 `@Value("${qvsu.testing.exposeCaptchaCode:false}")` | 为真时跳过第 116 行判断，验证码明文可被接口读出 | 高度敏感（虽默认安全，但值为真即等于关闭验证码） | `application.yml` 第 16 行；`SysCaptchaController.java` 第 32-33、116 行 |
| 8 | `server.port` | `5656` | 三份 Docker 配置均映射 `5656:5656`，未改此键 | 内嵌 Tomcat（Spring Boot） | HTTP 监听端口 | 无 | `application.yml` 第 21 行 |
| 9 | `server.servlet.context-path` | `/` | 无覆盖 | Spring MVC | 应用上下文根路径 | 无 | `application.yml` 第 24 行 |
| 10 | `server.tomcat.uri-encoding` | `UTF-8` | 无覆盖 | 内嵌 Tomcat | 请求 URI 解码字符集 | 无 | `application.yml` 第 27 行 |
| 11 | `server.tomcat.accept-count` | `1000` | 无覆盖 | 内嵌 Tomcat | 等待队列长度 | 无 | `application.yml` 第 29 行 |
| 12 | `server.tomcat.threads.max` | `800` | 无覆盖 | 内嵌 Tomcat | 最大工作线程数 | 无 | `application.yml` 第 32 行 |
| 13 | `server.tomcat.threads.min-spare` | `100` | 无覆盖 | 内嵌 Tomcat | 最小空闲线程数 | 无 | `application.yml` 第 34 行 |
| 14 | `logging.level.com.qvsu` | `debug` | 无覆盖 | Logback | 业务包日志级别；与 `logback.xml` 第 75 行的 `info` 冲突，配置优先级更高（`推断`） | 敏感（debug 级会输出签名与鉴权中间值日志） | `application.yml` 第 39 行；`logback.xml` 第 75 行 |
| 15 | `logging.level.org.springframework` | `warn` | 无覆盖 | Logback | 框架日志级别 | 无 | `application.yml` 第 40 行 |
| 16 | `user.password.maxRetryCount` | `5` | 无覆盖 | `SysPasswordService` 第 33 行 `@Value("${user.password.maxRetryCount}")` | 密码连续错误上限，超限锁定 10 分钟（配合 `loginRecordCache`） | 敏感 | `application.yml` 第 46 行；`SysPasswordService.java` 第 33 行 |
| 17 | `spring.thymeleaf.mode` | `HTML` | 无覆盖 | Thymeleaf | 模板解析模式 | 无 | `application.yml` 第 52 行 |
| 18 | `spring.thymeleaf.encoding` | `utf-8` | 无覆盖 | Thymeleaf | 模板编码 | 无 | `application.yml` 第 53 行 |
| 19 | `spring.thymeleaf.cache` | `false` | 无覆盖 | Thymeleaf | 关闭模板缓存（开发态语义），生产环境会带来重复解析开销 | 敏感（生产性能与一致性风险） | `application.yml` 第 55 行 |
| 20 | `spring.messages.basename` | `static/i18n/messages` | 无覆盖 | Spring MessageSource | 国际化消息基名，指向 `static/i18n/messages.properties`（CFG-004） | 无 | `application.yml` 第 59 行 |
| 21 | `spring.jackson.time-zone` | `GMT+8` | 无覆盖 | Jackson | JSON 日期时区 | 无 | `application.yml` 第 61 行 |
| 22 | `spring.jackson.date-format` | `yyyy-MM-dd HH:mm:ss` | 无覆盖 | Jackson | JSON 日期格式 | 无 | `application.yml` 第 62 行 |
| 23 | `spring.profiles.active` | `druid` | 无覆盖 | Spring Boot | 激活 `application-druid.yml` | 无 | `application.yml` 第 64 行 |
| 24 | `spring.servlet.multipart.max-file-size` | `10MB` | 无覆盖 | Spring MVC Multipart | 单文件上传上限 | 无 | `application.yml` 第 69 行 |
| 25 | `spring.servlet.multipart.max-request-size` | `20MB` | 无覆盖 | Spring MVC Multipart | 单请求上传总上限 | 无 | `application.yml` 第 71 行 |
| 26 | `spring.devtools.restart.enabled` | `true` | 无覆盖（`QvsuApplication` 第 17 行的关闭代码被注释掉） | Spring Boot DevTools | 类路径变更自动重启；生产环境应关闭 | 敏感 | `application.yml` 第 76 行；`QvsuApplication.java` 第 17 行 |
| 27 | `mybatis.typeAliasesPackage` | `com.qvsu.**.domain` | 无覆盖 | `MyBatisConfig#sqlSessionFactory` 第 119、122 行 | MyBatis 别名包扫描（支持 `**` 通配，由 `MyBatisConfig#setTypeAliasesPackage` 展开） | 无 | `application.yml` 第 81 行；`MyBatisConfig.java` 第 119 行 |
| 28 | `mybatis.mapperLocations` | `classpath*:mapper/**/*Mapper.xml` | 无覆盖 | `MyBatisConfig#sqlSessionFactory` 第 120、128 行 | Mapper XML 扫描位置（当前实际匹配 19 个 XML、144 条语句） | 无 | `application.yml` 第 83 行；`MyBatisConfig.java` 第 120 行 |
| 29 | `mybatis.configLocation` | `classpath:mybatis/mybatis-config.xml` | 无覆盖 | `MyBatisConfig#sqlSessionFactory` 第 121、129 行 | MyBatis 全局设置文件（`cacheEnabled`/`useGeneratedKeys`/`defaultExecutorType=SIMPLE`/`logImpl=SLF4J`） | 无 | `application.yml` 第 85 行；`MyBatisConfig.java` 第 121 行 |
| 30 | `pagehelper.helperDialect` | `postgresql` | **被 CFG-006 覆盖为同值**（显式重复声明） | PageHelper | 分页方言 | 无 | `application.yml` 第 89 行；`application-docker-local.yml` 第 11 行 |
| 31 | `pagehelper.supportMethodsArguments` | `true` | 无覆盖 | PageHelper | 允许从方法参数自动识别分页参数 | 无 | `application.yml` 第 90 行 |
| 32 | `pagehelper.params` | `count=countSql` | 无覆盖 | PageHelper | count 查询复用 `countSql` 语句 | 无 | `application.yml` 第 91 行 |
| 33 | `shiro.user.loginUrl` | `/login` | 无覆盖 | `ShiroConfig` 第 121-122 行 | 未认证跳转地址；同时用于 `LogoutFilter` 与 `OnlineSessionFilter` | 无 | `application.yml` 第 97 行；`ShiroConfig.java` 第 122 行 |
| 34 | `shiro.user.unauthorizedUrl` | `/unauth` | 无覆盖 | `ShiroConfig` 第 127-128 行 | 授权失败跳转地址 | 无 | `application.yml` 第 99 行；`ShiroConfig.java` 第 128 行 |
| 35 | `shiro.user.indexUrl` | `/index` | 无覆盖 | `ResourcesConfig` 第 27-28 行 | 根路径 `/` 转发目标 | 无 | `application.yml` 第 101 行；`ResourcesConfig.java` 第 27 行 |
| 36 | `shiro.user.captchaEnabled` | `true` | **被 CFG-006 覆盖为同值** | `ShiroConfig` 第 79-80 行 → `CaptchaValidateFilter` | 登录/注册验证码校验开关 | 敏感（置 false 即取消登录验证码） | `application.yml` 第 103 行；`ShiroConfig.java` 第 80 行；`application-docker-local.yml` 第 15 行 |
| 37 | `shiro.user.captchaType` | `math` | 无覆盖 | `ShiroConfig` 第 85-86 行 → `CaptchaValidateFilter` | 验证码类型（`math` 算术 / `char` 字符） | 无 | `application.yml` 第 105 行；`ShiroConfig.java` 第 86 行 |
| 38 | `shiro.cookie.path` | `/` | 无覆盖 | `ShiroConfig#rememberMeCookie` 第 97-98、394 行 | rememberMe Cookie 路径 | 无 | `application.yml` 第 110 行；`ShiroConfig.java` 第 394 行 |
| 39 | `shiro.cookie.httpOnly` | `true` | 无覆盖 | `ShiroConfig#rememberMeCookie` 第 103-104、395 行 | Cookie HttpOnly 标志 | 无（正向配置） | `application.yml` 第 112 行；`ShiroConfig.java` 第 395 行 |
| 40 | `shiro.cookie.maxAge` | `30` | 无覆盖 | `ShiroConfig#rememberMeCookie` 第 109-110、396 行 | **按天解释**（`maxAge * 24 * 60 * 60`），rememberMe 有效期 30 天，与注释「秒为单位」不符 | 敏感 | `application.yml` 第 114 行；`ShiroConfig.java` 第 396 行 |
| 41 | `shiro.session.expireTime` | `30` | 无覆盖 | `ShiroConfig` 第 55-56 行 → `sessionManager()` 第 237 行 | 全局会话超时（分钟，×60×1000 → 1800000 ms） | 敏感 | `application.yml` 第 119 行；`ShiroConfig.java` 第 237 行 |
| 42 | `shiro.session.dbSyncPeriod` | `1` | 无覆盖 | `OnlineSessionDAO` 第 25-26 行 → `syncToDb` 第 74 行 | 会话落库节流周期（分钟） | 无 | `application.yml` 第 121 行；`OnlineSessionDAO.java` 第 26、74 行 |
| 43 | `shiro.session.validationInterval` | `10` | 无覆盖 | `ShiroConfig` 第 61-62 行（SpringSessionValidationScheduler 使用） | 会话有效性检查间隔（分钟） | 无 | `application.yml` 第 123 行；`ShiroConfig.java` 第 62 行 |
| 44 | `shiro.session.maxSession` | `-1` | 无覆盖 | `ShiroConfig` 第 67-68 行 → `kickoutSessionFilter()` 第 427 行 | 同一账号最大并发会话数；`-1` 表示**不限制**，踢人策略实际不生效 | 敏感 | `application.yml` 第 125 行；`ShiroConfig.java` 第 427 行 |
| 45 | `shiro.session.kickoutAfter` | `false` | 无覆盖 | `ShiroConfig` 第 73-74 行 → `kickoutSessionFilter()` 第 429 行 | 踢出顺序（false = 后者登录踢出前者） | 敏感 | `application.yml` 第 127 行；`ShiroConfig.java` 第 429 行 |
| 46 | `shiro.rememberMe.enabled` | `true` | 无覆盖 | `ShiroConfig` 第 133-134 行 → `securityManager()` 第 261 行 | 是否装配 `CustomCookieRememberMeManager` | 敏感 | `application.yml` 第 130 行；`ShiroConfig.java` 第 261 行 |
| 47 | `xss.enabled` | `true` | 无覆盖 | `FilterConfig` 第 20 行 `@ConditionalOnProperty(value="xss.enabled", havingValue="true")` | 是否注册 `XssFilter` | 敏感 | `application.yml` 第 135 行；`FilterConfig.java` 第 20 行 |
| 48 | `xss.excludes` | `/system/notice/*` | 无覆盖 | `FilterConfig` 第 23-24、40 行 → `XssFilter` 第 26、31-37、66 行 | **XSS 过滤排除路径**；通知公告正文因此不过滤 | 高度敏感（明确的安全豁免） | `application.yml` 第 137 行；`FilterConfig.java` 第 23、40 行 |
| 49 | `xss.urlPatterns` | `/system/*,/tool/*` | 无覆盖 | `FilterConfig` 第 26-27、36 行 | XSS 过滤器生效路径；**`/open/**` 与 `/selftest/**` 不在范围内** | 敏感 | `application.yml` 第 139 行；`FilterConfig.java` 第 26、36 行 |
| 50 | `csrf.enabled` | `false` | 无覆盖 | `ShiroConfig` 第 139 行 `@Value("${csrf.enabled: false}")` → `csrfValidateFilter()` 第 285 行 | **CSRF 校验开关，默认关闭**；`CsrfValidateFilter` 仍挂在 `/**` 链第 5 位但不校验 | 高度敏感 | `application.yml` 第 144 行；`ShiroConfig.java` 第 139、285 行；`CsrfValidateFilter.java` 第 27-52 行 |
| 51 | `csrf.whites` | `/druid` | 无覆盖 | `ShiroConfig` 第 145-146 行 → `csrfValidateFilter().setCsrfWhites(StringUtils.str2List(csrfWhites, ","))` | CSRF 白名单；因 `csrf.enabled=false` 当前无实际作用 | 敏感 | `application.yml` 第 146 行；`ShiroConfig.java` 第 145、286 行 |

### 缺失键说明（与共享上下文差异）

- `shiro.cookie.domain`（`application.yml` 第 108 行）与 `shiro.cookie.cipherKey`（第 116 行）在源文件中**存在但值为空**，`../tools/assets.json` 的提取器因无内联值未收录，故 168 条中不含这两个键。二者均被 `ShiroConfig` 第 91-92、115-116 行 `@Value` 读取：`domain` 为空表示 Cookie 不限定域；`cipherKey` 为空触发第 413 行 `CipherUtils.generateNewKey(128, "AES")` 随机生成，属**高度敏感**（多实例部署下 rememberMe 互不兼容，且每次重启失效）。
- 因上一条，本 CFG 的 51 条 + 缺失的 2 条 = `application.yml` 实际声明 53 个键。

---

## CFG-002 - application-druid.yml 数据源配置键集

- ID: CFG-002
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/qvsu-openapi/src/main/resources/application-druid.yml`（62 行，注释为 UTF-8→GBK 单重乱码）
- 来源文件: `open-api/qvsu-openapi/src/main/resources/application-druid.yml`
- 生效方式: 由 `spring.profiles.active=druid` 激活；`spring.datasource.druid.master` 前缀绑定到 `DruidConfig#masterDataSource`，`slave` 前缀绑定到条件生效的 `slaveDataSource`
- 消费者总览: `com.qvsu.framework.config.DruidConfig`（第 35-127 行）、`com.qvsu.framework.config.properties.DruidProperties`（13 个 `@Value`，第 15-52 行）、`com.qvsu.framework.datasource.DynamicDataSource`、`com.qvsu.QvsuApplication`（第 12 行排除 `DataSourceAutoConfiguration`，因此本文件的装配是唯一数据源来源）
- 环境差异总览: `deploy/local-docker/conf/application-docker-local.yml` 覆盖 `spring.datasource.driverClassName` 与 `spring.datasource.druid.master.{url,username,password}`；`src/test/resources/application-druid.yml` 覆盖 `master.url`（端口 5433）且**完全不含** `webStatFilter`/`statViewServlet`/`filter` 四组键

### 键级明细（30 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `spring.datasource.type` | `com.alibaba.druid.pool.DruidDataSource` | 测试配置同值；Docker 覆盖文件不含此键 | `DruidConfig#masterDataSource`（`DruidDataSourceBuilder`） | 数据源实现类选择 | 无 | `application-druid.yml` 第 4 行 |
| 2 | `spring.datasource.driverClassName` | `org.postgresql.Driver` | **Docker 覆盖为同值**（冗余声明） | Druid 数据源 | JDBC 驱动类 | 无 | `application-druid.yml` 第 5 行；`application-docker-local.yml` 第 3 行 |
| 3 | `spring.datasource.druid.master.url` | `jdbc:postgresql://localhost:5432/jd_openapi?currentSchema=public&stringtype=unspecified` | Docker → `jdbc:postgresql://postgres:5432/jd_openapi?...`（容器名）；测试 → `localhost:5433` | 主数据源 | 主库连接串，含 `currentSchema=public` 与 PostgreSQL 专用参数 `stringtype=unspecified` | 敏感（暴露库名与 schema） | `application-druid.yml` 第 9 行；`application-docker-local.yml` 第 6 行；`src/test/resources/application-druid.yml` 第 7 行 |
| 4 | `spring.datasource.druid.master.username` | `postgres` | Docker/测试均为 `postgres` | 主数据源 | 主库账号 | 敏感 | `application-druid.yml` 第 10 行 |
| 5 | `spring.datasource.druid.master.password` | `123456` | Docker/测试均显式为 `123456`，未被任何环境改为强口令 | 主数据源 | 主库口令 | **高度敏感** | `application-druid.yml` 第 11 行；`application-docker-local.yml` 第 8 行；`src/test/resources/application-druid.yml` 第 9 行 |
| 6 | `spring.datasource.druid.slave.enabled` | `false` | 测试配置同值 `false` | `DruidConfig#slaveDataSource` 的 `@ConditionalOnProperty`（第 45 行） | 从库 Bean 是否装配；`false` 时从库不装配，`DataSourceAspect` 无可用目标 | 无 | `application-druid.yml` 第 15 行；`DruidConfig.java` 第 45 行 |
| 7 | `spring.datasource.druid.slave.username` | `postgres` | 测试配置不含此键 | 从库数据源（未装配） | 从库账号，当前无效果 | 敏感 | `application-druid.yml` 第 17 行 |
| 8 | `spring.datasource.druid.initialSize` | `5` | 测试同值 | `DruidProperties` 第 15 行 → `setInitialSize`（第 57 行） | 初始连接数；小于 `minIdle` 属配置不当 | 无 | `application-druid.yml` 第 19 行；`DruidProperties.java` 第 15、57 行 |
| 9 | `spring.datasource.druid.minIdle` | `10` | 测试同值 | `DruidProperties` 第 18 行 → `setMinIdle`（第 59 行） | 最小空闲连接数 | 无 | `application-druid.yml` 第 21 行；`DruidProperties.java` 第 18、59 行 |
| 10 | `spring.datasource.druid.maxActive` | `20` | 测试同值 | `DruidProperties` 第 21 行 → `setMaxActive`（第 58 行） | 最大连接数；单池 20 是并发吞吐瓶颈上界（`推断`） | 无 | `application-druid.yml` 第 23 行；`DruidProperties.java` 第 21、58 行 |
| 11 | `spring.datasource.druid.maxWait` | `60000` | 测试同值 | `DruidProperties` 第 24 行 → `setMaxWait`（第 62 行） | 获取连接最大等待毫秒 | 无 | `application-druid.yml` 第 25 行；`DruidProperties.java` 第 24、62 行 |
| 12 | `spring.datasource.druid.connectTimeout` | `30000` | 测试同值 | `DruidProperties` 第 27 行 → `setConnectTimeout`（第 65 行） | 建连超时毫秒 | 无 | `application-druid.yml` 第 27 行；`DruidProperties.java` 第 27、65 行 |
| 13 | `spring.datasource.druid.socketTimeout` | `60000` | 测试同值 | `DruidProperties` 第 30 行 → `setSocketTimeout`（第 68 行） | 网络读写超时毫秒 | 无 | `application-druid.yml` 第 29 行；`DruidProperties.java` 第 30、68 行 |
| 14 | `spring.datasource.druid.timeBetweenEvictionRunsMillis` | `60000` | 测试同值 | `DruidProperties` 第 33 行 → `setTimeBetweenEvictionRunsMillis`（第 71 行） | 空闲连接检测间隔毫秒 | 无 | `application-druid.yml` 第 31 行；`DruidProperties.java` 第 33、71 行 |
| 15 | `spring.datasource.druid.minEvictableIdleTimeMillis` | `300000` | 测试同值 | `DruidProperties` 第 36 行 → `setMinEvictableIdleTimeMillis`（第 74 行） | 连接最小生存时间毫秒 | 无 | `application-druid.yml` 第 33 行；`DruidProperties.java` 第 36、74 行 |
| 16 | `spring.datasource.druid.maxEvictableIdleTimeMillis` | `900000` | 测试同值 | `DruidProperties` 第 39 行 → `setMaxEvictableIdleTimeMillis`（第 75 行） | 连接最大生存时间毫秒 | 无 | `application-druid.yml` 第 35 行；`DruidProperties.java` 第 39、75 行 |
| 17 | `spring.datasource.druid.validationQuery` | `SELECT 1` | 测试同值 | `DruidProperties` 第 42 行 → `setValidationQuery`（第 80 行） | 连接有效性检测 SQL | 无 | `application-druid.yml` 第 37 行；`DruidProperties.java` 第 42、80 行 |
| 18 | `spring.datasource.druid.testWhileIdle` | `true` | 测试同值 | `DruidProperties` 第 45 行 → `setTestWhileIdle`（第 82 行） | 空闲时检测连接 | 无 | `application-druid.yml` 第 38 行；`DruidProperties.java` 第 45、82 行 |
| 19 | `spring.datasource.druid.testOnBorrow` | `false` | 测试同值 | `DruidProperties` 第 48 行 → `setTestOnBorrow`（第 84 行） | 借用时不做检测（性能取向） | 无 | `application-druid.yml` 第 39 行；`DruidProperties.java` 第 48、84 行 |
| 20 | `spring.datasource.druid.testOnReturn` | `false` | 测试同值 | `DruidProperties` 第 51 行 → `setTestOnReturn`（第 86 行） | 归还时不做检测 | 无 | `application-druid.yml` 第 40 行；`DruidProperties.java` 第 51、86 行 |
| 21 | `spring.datasource.druid.webStatFilter.enabled` | `true` | **测试配置无此键**（测试期不采集 Web 统计） | Druid WebStatFilter | 是否采集 Web 请求与 SQL 关联统计 | 敏感（采集 URL 与 SQL 关联信息） | `application-druid.yml` 第 42 行 |
| 22 | `spring.datasource.druid.statViewServlet.enabled` | `true` | 测试配置无此键 | `DruidConfig#removeDruidFilterRegistrationBean` 的 `@ConditionalOnProperty`（第 86 行） | 是否启用 `/druid/*` 监控台；同时决定去广告过滤器是否注册 | 高度敏感（对未授权暴露 SQL 与连接池信息） | `application-druid.yml` 第 44 行；`DruidConfig.java` 第 86 行 |
| 23 | `spring.datasource.druid.statViewServlet.url-pattern` | `/druid/*` | 测试配置无此键 | `DruidStatProperties.StatViewServlet#getUrlPattern`（`DruidConfig` 第 92 行） | 监控台映射路径；被 `csrf.whites` 引用 | 敏感 | `application-druid.yml` 第 47 行；`DruidConfig.java` 第 92 行 |
| 24 | `spring.datasource.druid.statViewServlet.login-username` | `postgres` | 测试配置无此键 | Druid StatViewServlet | 监控台登录账号，与数据库账号同名 | 敏感 | `application-druid.yml` 第 49 行 |
| 25 | `spring.datasource.druid.statViewServlet.login-password` | `123456` | 测试配置无此键；任何环境均未改为强口令 | Druid StatViewServlet | 监控台登录口令 | **高度敏感** | `application-druid.yml` 第 50 行 |
| 26 | `spring.datasource.druid.filter.stat.enabled` | `true` | 测试配置无此键 | Druid StatFilter | SQL 统计采集开关 | 无 | `application-druid.yml` 第 53 行 |
| 27 | `spring.datasource.druid.filter.stat.log-slow-sql` | `true` | 测试配置无此键 | Druid StatFilter | 是否输出慢 SQL 日志 | 敏感（慢 SQL 日志含表名与条件） | `application-druid.yml` 第 55 行 |
| 28 | `spring.datasource.druid.filter.stat.slow-sql-millis` | `1000` | 测试配置无此键 | Druid StatFilter | 慢 SQL 阈值毫秒 | 无 | `application-druid.yml` 第 56 行 |
| 29 | `spring.datasource.druid.filter.stat.merge-sql` | `true` | 测试配置无此键 | Druid StatFilter | 是否合并同结构 SQL 统计 | 无 | `application-druid.yml` 第 57 行 |
| 30 | `spring.datasource.druid.filter.wall.config.multi-statement-allow` | `true` | 测试配置无此键 | Druid WallFilter | **允许一次执行多条 SQL**，削弱注入纵深防御 | 高度敏感 | `application-druid.yml` 第 60 行 |

### 敏感项汇总（本 CFG）

| 配置键 | 值 | 风险 |
|---|---|---|
| `spring.datasource.druid.master.password` | `123456` | 数据库超弱口令，三份环境一致 |
| `spring.datasource.druid.statViewServlet.login-password` | `123456` | `/druid/*` 监控台弱口令，可导致全量 SQL 与连接信息泄露 |
| `spring.datasource.druid.statViewServlet.login-username` | `postgres` | 与数据库账号同名，缩小爆破空间 |
| `spring.datasource.druid.filter.wall.config.multi-statement-allow` | `true` | 放宽多语句防护 |
| `spring.datasource.druid.master.url` | 含库名 `jd_openapi` 与 `currentSchema=public` | 内部结构信息随代码外泄 |

### 差异与风险说明

- `slave.url`（第 16 行）为空值，与 `slave.enabled=false` 一致；`../tools/assets.json` 未收录该键（空值），故 168 条中不含。
- `statViewServlet.allow`（第 46 行）为空值，未收录；空表示不限制来源 IP（`推断`：Druid 的 `allow` 为空即允许所有访问）。
- 测试配置（CFG-005）与本文件相比，缺少 `slave.username`、`webStatFilter`、`statViewServlet`（4 键）、`filter`（5 键）共 11 个键，是**测试环境与生产环境行为差异**的主要来源：测试期慢 SQL 日志与监控台均不存在。

---

## CFG-003 - local-docker docker-compose 编排配置键集

- ID: CFG-003
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/deploy/local-docker/docker-compose.yaml`（50 行）
- 来源文件: `open-api/deploy/local-docker/docker-compose.yaml`
- 生效方式: `docker compose up -d --build`（`open-api/README.md` 第 22 行）；Compose 顶层 `name: openapi-local`
- 环境差异: 本文件即本地容器环境的**唯一编排事实源**，与环境变量 `${VAR:-default}` 形式交互；对比 `deploy/dev-docker/docker-compose.yml`（CFG-007）缺少 `version` 键、使用构建而非拉取镜像
- 消费者: Docker Compose（`postgres` 服务与 `openapi` 服务）、`deploy/local-docker/Dockerfile`（被 `build.dockerfile` 引用）、`deploy/local-docker/conf/application-docker-local.yml`（被 `volumes.source` 挂载）

### 键级明细（29 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `name` | `openapi-local` | dev-docker 无此键（使用 `version`） | Docker Compose 项目名 | 项目名，决定卷与网络前缀 | 无 | `docker-compose.yaml` 第 1 行 |
| 2 | `services.postgres.image` | `${POSTGRES_IMAGE:-docker.m.daocloud.io/library/postgres:11}` | 可用 `POSTGRES_IMAGE` 覆盖 | `postgres` 服务 | 数据库镜像，锁定 PostgreSQL 11 主版本 | 无 | `docker-compose.yaml` 第 5 行 |
| 3 | `services.postgres.container_name` | `openapi-postgres11` | 可改 | `postgres` 服务 | 容器名 | 无 | `docker-compose.yaml` 第 6 行 |
| 4 | `services.postgres.restart` | `unless-stopped` | 可改 | `postgres` 服务 | 重启策略 | 无 | `docker-compose.yaml` 第 7 行 |
| 5 | `services.postgres.environment.POSTGRES_USER` | `${POSTGRES_USER:-postgres}` | 可用环境变量覆盖 | `postgres` 服务初始化 | 初始化超级用户；与 `application-docker-local.yml` 的 `master.username` 需保持一致 | 敏感 | `docker-compose.yaml` 第 9 行 |
| 6 | `services.postgres.environment.POSTGRES_PASSWORD` | `${POSTGRES_PASSWORD:-123456}` | **默认回退值即弱口令**；可用环境变量覆盖 | `postgres` 服务初始化 | 初始化超级用户口令 | **高度敏感** | `docker-compose.yaml` 第 10 行 |
| 7 | `services.postgres.environment.POSTGRES_DB` | `${POSTGRES_DB:-jd_openapi}` | 可覆盖 | `postgres` 服务初始化 | 初始化数据库名，必须与连接串中的库名一致 | 无 | `docker-compose.yaml` 第 11 行 |
| 8 | `services.postgres.environment.TZ` | `Asia/Shanghai` | 与 `openapi` 服务同值 | `postgres` 容器 | 容器时区 | 无 | `docker-compose.yaml` 第 12 行 |
| 9 | `services.postgres.volumes.source` | `${POSTGRES_DATA_DIR:-D:/data/jd_openapi/postgres}` | 默认值为 **Windows 绝对路径**，Linux/macOS 需设 `POSTGRES_DATA_DIR` | `postgres` 数据卷（bind） | 数据持久化位置 | 敏感（路径含主机目录结构） | `docker-compose.yaml` 第 17 行 |
| 10 | `services.postgres.volumes.target` | `/var/lib/postgresql/data` | 固定 | `postgres` 数据卷 | 容器内数据目录 | 无 | `docker-compose.yaml` 第 18 行 |
| 11 | `services.postgres.volumes.source` | `./postgres/init` | 固定 | 初始化脚本挂载（叠加第 9 行之外的第二个 bind） | 注入 7 个 `.sql` 初始化脚本 | 无 | `docker-compose.yaml` 第 20 行 |
| 12 | `services.postgres.volumes.target` | `/docker-entrypoint-initdb.d` | 固定 | 初始化脚本挂载 | 容器首次启动自动执行脚本目录 | 无 | `docker-compose.yaml` 第 21 行 |
| 13 | `services.postgres.volumes.read_only` | `true` | 固定 | 初始化脚本挂载 | 只读挂载，避免容器改写 init 脚本 | 无 | `docker-compose.yaml` 第 22 行 |
| 14 | `services.postgres.healthcheck.test` | `["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]` | 固定（`$$` 转义为容器内变量） | healthcheck | 就绪探测命令；被 `openapi` 的 `depends_on.condition` 依赖 | 无 | `docker-compose.yaml` 第 24 行 |
| 15 | `services.postgres.healthcheck.interval` | `10s` | 可调 | healthcheck | 探测间隔 | 无 | `docker-compose.yaml` 第 25 行 |
| 16 | `services.postgres.healthcheck.timeout` | `5s` | 可调 | healthcheck | 探测超时 | 无 | `docker-compose.yaml` 第 26 行 |
| 17 | `services.postgres.healthcheck.retries` | `20` | 可调 | healthcheck | 失败重试次数（×10s ≈ 200s 容忍窗口） | 无 | `docker-compose.yaml` 第 27 行 |
| 18 | `services.postgres.healthcheck.start_period` | `45s` | 可调 | healthcheck | 启动宽限期 | 无 | `docker-compose.yaml` 第 28 行 |
| 19 | `services.openapi.build.context` | `../../` | 固定 | `openapi` 镜像构建 | 构建上下文为仓库 `open-api/` 目录 | 无 | `docker-compose.yaml` 第 32 行 |
| 20 | `services.openapi.build.dockerfile` | `deploy/local-docker/Dockerfile` | 固定 | `openapi` 镜像构建 | 指定多阶段 Dockerfile | 无 | `docker-compose.yaml` 第 33 行 |
| 21 | `services.openapi.image` | `openapi-app:local` | dev-docker 使用远程阿里云镜像（CFG-007 第 2 项） | `openapi` 服务 | 本地镜像标签，**可复现构建** | 无 | `docker-compose.yaml` 第 34 行 |
| 22 | `services.openapi.container_name` | `openapi-app` | 可改 | `openapi` 服务 | 容器名 | 无 | `docker-compose.yaml` 第 35 行 |
| 23 | `services.openapi.restart` | `unless-stopped` | 可改 | `openapi` 服务 | 重启策略 | 无 | `docker-compose.yaml` 第 36 行 |
| 24 | `services.openapi.depends_on.postgres.condition` | `service_healthy` | 固定 | `openapi` 启动顺序 | 等待 postgres 健康后再启动应用 | 无 | `docker-compose.yaml` 第 39 行 |
| 25 | `services.openapi.environment.SPRING_CONFIG_ADDITIONAL_LOCATION` | `file:/opt/openapi/conf/application-docker-local.yml` | 固定 | Spring Boot 配置加载 | 追加外部配置文件（CFG-006），覆盖主库连接串 | 敏感（外部配置文件路径可被篡改即为配置注入面） | `docker-compose.yaml` 第 41 行 |
| 26 | `services.openapi.environment.TZ` | `Asia/Shanghai` | 与 postgres 同值 | `openapi` 容器 | 容器时区 | 无 | `docker-compose.yaml` 第 42 行 |
| 27 | `services.openapi.volumes.source` | `./conf/application-docker-local.yml` | 固定 | 配置挂载 | 挂载外部配置到容器 | 无 | `docker-compose.yaml` 第 48 行 |
| 28 | `services.openapi.volumes.target` | `/opt/openapi/conf/application-docker-local.yml` | 固定 | 配置挂载 | 与第 25 项路径必须一致 | 无 | `docker-compose.yaml` 第 49 行 |
| 29 | `services.openapi.volumes.read_only` | `true` | 固定 | 配置挂载 | 只读挂载 | 无 | `docker-compose.yaml` 第 50 行 |

### 未收录但存在的编排键（补充登记）

`../tools/assets.json` 的提取器只抓取标量值，以下键在 `docker-compose.yaml` 中存在但未被收录：

| 配置名 | 值 | 说明 |
|---|---|---|
| `services.postgres.ports` | `"${POSTGRES_PORT:-5433}:5432"` | 宿主端口 5433 → 容器 5432；与 **CFG-005 测试配置的 5433 一致**（`推断`：测试直连本地 compose 的 postgres） |
| `services.openapi.ports` | `"${APP_PORT:-5656}:5656"` | 宿主端口可覆盖，容器端口固定 5656 |
| `services.openapi.build` | （映射） | 由第 19、20 项构成 |
| `services.postgres.volumes` | （列表，2 项） | 由第 9-13 项构成 |
| `services.openapi.volumes` | （列表，1 项） | 由第 27-29 项构成 |

---

## CFG-004 - i18n 消息键集

- ID: CFG-004
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/qvsu-openapi/src/main/resources/static/i18n/messages.properties`（37 行）与 `spring.messages.basename=static/i18n/messages`
- 来源文件: `open-api/qvsu-openapi/src/main/resources/static/i18n/messages.properties`
- 生效方式: `spring.messages.basename` 指向该基名，属**应用级配置**而非开关
- 环境差异: 无（三份 Docker 配置与测试配置均未覆盖 `spring.messages.basename`）
- 消费者: Spring `MessageSource`；由 `com.qvsu.common.utils.MessageUtils`（`推断`，依 RuoYi 精简结构）与 `com.qvsu.framework.web.service.PermissionService`、`com.qvsu.framework.shiro.service.SysPasswordService` 等取用；前端表单校验文案在 `static/ajax/libs/validate/messages_zh.js` 中另有独立定义
- 证据缺口: 提取器对 `.properties` 只取键名不取值，**默认值列取自源文件原文**（本次已直读 `messages.properties` 逐行核对）

### 键级明细（29 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `not.null` | `* 必须填写` | 无 | `MessageUtils` / 校验框架 | 必填校验失败文案 | 无 | `messages.properties` 第 2 行 |
| 2 | `user.jcaptcha.error` | `验证码错误` | 无 | `ShiroConfig`/`CaptchaValidateFilter` 链路 | 验证码校验失败提示 | 无 | 第 3 行 |
| 3 | `user.not.exists` | `用户不存在/密码错误` | 无 | `SysLoginService` | 登录失败提示（**不区分账号与密码错误**，正向设计） | 无 | 第 4 行 |
| 4 | `user.password.not.match` | `用户不存在/密码错误` | 无 | `SysPasswordService`/`SysLoginService` | 同上，密码不匹配提示 | 无 | 第 5 行 |
| 5 | `user.password.retry.limit.count` | `密码输入错误{0}次` | 无 | `SysPasswordService` | 密码重试次数提示（{0} = 已错误次数） | 无 | 第 6 行 |
| 6 | `user.password.retry.limit.exceed` | `密码输入错误{0}次，帐户锁定10分钟` | 无 | `SysPasswordService` | 超限锁定提示；与 `loginRecordCache` 的 600s 一致 | 无 | 第 7 行 |
| 7 | `user.password.delete` | `对不起，您的账号已被删除` | 无 | `SysLoginService` | 账号已删除提示 | 无 | 第 8 行 |
| 8 | `user.blocked` | `用户已封禁，请联系管理员` | 无 | `SysLoginService` | 账号封禁提示 | 无 | 第 9 行 |
| 9 | `role.blocked` | `角色已封禁，请联系管理员` | 无 | `SysLoginService` | 角色封禁提示 | 无 | 第 10 行 |
| 10 | `login.blocked` | `很遗憾，访问IP已被列入系统黑名单` | 无 | 登录链路 | IP 黑名单提示 | 无 | 第 11 行 |
| 11 | `user.logout.success` | `退出成功` | 无 | 退出链路 | 退出成功提示 | 无 | 第 12 行 |
| 12 | `length.not.valid` | `长度必须在{min}到{max}个字符之间` | 无 | 校验框架 | 长度校验文案 | 无 | 第 14 行 |
| 13 | `user.username.not.valid` | `* 2到20个汉字、字母、数字或下划线组成，且必须以非数字开头` | 无 | 用户新增/修改校验 | 用户名规则文案（前后端双份定义） | 无 | 第 16 行 |
| 14 | `user.password.not.valid` | `* 5-50个字符` | 无 | 用户新增/修改校验 | 口令长度规则文案 | 敏感（暴露口令策略） | 第 17 行 |
| 15 | `user.email.not.valid` | `邮箱格式错误` | 无 | 用户表单校验 | 邮箱格式文案 | 无 | 第 19 行 |
| 16 | `user.mobile.phone.number.not.valid` | `手机号格式错误` | 无 | 用户表单校验 | 手机号格式文案 | 无 | 第 20 行 |
| 17 | `user.login.success` | `登录成功` | 无 | 登录链路 | 登录成功提示 | 无 | 第 21 行 |
| 18 | `user.register.success` | `注册成功` | 无 | 注册链路 | 注册成功提示 | 无 | 第 22 行 |
| 19 | `user.notfound` | `请重新登录` | 无 | 会话失效链路 | 会话不存在提示 | 无 | 第 23 行 |
| 20 | `user.forcelogout` | `管理员强制退出，请重新登录` | 无 | `OnlineSessionFilter`/`KickoutSessionFilter` 链路 | 被踢出提示 | 无 | 第 24 行 |
| 21 | `user.unknown.error` | `未知错误，请重新登录` | 无 | 登录链路 | 未知错误提示 | 无 | 第 25 行 |
| 22 | `upload.exceed.maxSize` | `上传的文件大小超出限制的文件大小！<br/>允许的文件最大大小是：{0}MB！` | 无 | `CommonController` 上传端点 | 上传超限文案；{0} 由 `spring.servlet.multipart.max-file-size=10MB` 推导 | 无 | 第 28 行 |
| 23 | `upload.filename.exceed.length` | `上传的文件名最长{0}个字符` | 无 | `CommonController` 上传端点 | 文件名长度超限文案 | 无 | 第 29 行 |
| 24 | `no.permission` | `您没有数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils`/`GlobalExceptionHandler` | 数据权限不足文案 | 敏感（回显权限码，便于探测权限模型） | 第 32 行 |
| 25 | `no.create.permission` | `您没有创建数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils` | 创建权限不足文案 | 敏感 | 第 33 行 |
| 26 | `no.update.permission` | `您没有修改数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils` | 修改权限不足文案 | 敏感 | 第 34 行 |
| 27 | `no.delete.permission` | `您没有删除数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils` | 删除权限不足文案 | 敏感 | 第 35 行 |
| 28 | `no.export.permission` | `您没有导出数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils` | 导出权限不足文案 | 敏感 | 第 36 行 |
| 29 | `no.view.permission` | `您没有查看数据的权限，请联系管理员添加权限 [{0}]` | 无 | `PermissionUtils` | 查看权限不足文案 | 敏感 | 第 37 行 |

### 未被提取器收录的同目录资源

`static/i18n/` 目录下仅存在 `messages.properties` 一个文件（`事实`），**不存在 `messages_zh_CN.properties` 等语言变体**，因此 `spring.messages.basename` 实际只解析该单文件；前端中文校验消息由 `static/ajax/libs/validate/messages_zh.js` 独立提供，与后端消息键**不共享同一份文案**（`事实`，两处 `user.username.not.valid` 语义相同但文本由各自文件维护）。

---

## CFG-005 - 测试环境数据源配置键集

- ID: CFG-005
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/qvsu-openapi/src/test/resources/application-druid.yml`（24 行）
- 来源文件: `open-api/qvsu-openapi/src/test/resources/application-druid.yml`
- 生效方式: 仅在测试类路径下覆盖 `application-druid.yml`；**当前仓库无 `src/test/java` 测试类**，因此该配置实际未被任何运行过程加载（`事实`）
- 环境差异: 相对 CFG-002 有 3 处实质差异 —— ① `master.url` 端口 `5433`（CFG-002 为 5432，CFG-006 为 5432）；② 缺少 `slave.username`；③ 完全缺少 `webStatFilter`、`statViewServlet`（4 键）、`filter.stat`（4 键）、`filter.wall`（1 键）共 11 个键
- 消费者: 无（无测试类）。若后续新增 `@SpringBootTest`，本配置将成为测试期唯一数据源来源

### 键级明细（19 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `spring.datasource.type` | `com.alibaba.druid.pool.DruidDataSource` | 与 CFG-002 同值 | `DruidConfig` | 数据源实现 | 无 | `src/test/resources/application-druid.yml` 第 3 行 |
| 2 | `spring.datasource.driverClassName` | `org.postgresql.Driver` | 与 CFG-002 同值 | Druid | 驱动类 | 无 | 第 4 行 |
| 3 | `spring.datasource.druid.master.url` | `jdbc:postgresql://localhost:5433/jd_openapi?currentSchema=public&stringtype=unspecified` | **端口 5433**，与 CFG-003 的 `${POSTGRES_PORT:-5433}` 一致，与 CFG-002 的 5432 不同 | 主数据源 | 测试库连接串 | 敏感 | 第 7 行 |
| 4 | `spring.datasource.druid.master.username` | `postgres` | 与 CFG-002 同值 | 主数据源 | 账号 | 敏感 | 第 8 行 |
| 5 | `spring.datasource.druid.master.password` | `123456` | 与 CFG-002/CFG-006 同值 | 主数据源 | 口令 | **高度敏感** | 第 9 行 |
| 6 | `spring.datasource.druid.slave.enabled` | `false` | 与 CFG-002 同值 | `DruidConfig#slaveDataSource` | 从库不装配 | 无 | 第 11 行 |
| 7 | `spring.datasource.druid.initialSize` | `5` | 与 CFG-002 同值 | `DruidProperties` | 初始连接数 | 无 | 第 12 行 |
| 8 | `spring.datasource.druid.minIdle` | `10` | 与 CFG-002 同值 | `DruidProperties` | 最小空闲 | 无 | 第 13 行 |
| 9 | `spring.datasource.druid.maxActive` | `20` | 与 CFG-002 同值 | `DruidProperties` | 最大连接 | 无 | 第 14 行 |
| 10 | `spring.datasource.druid.maxWait` | `60000` | 与 CFG-002 同值 | `DruidProperties` | 等待超时 | 无 | 第 15 行 |
| 11 | `spring.datasource.druid.connectTimeout` | `30000` | 与 CFG-002 同值 | `DruidProperties` | 建连超时 | 无 | 第 16 行 |
| 12 | `spring.datasource.druid.socketTimeout` | `60000` | 与 CFG-002 同值 | `DruidProperties` | 读写超时 | 无 | 第 17 行 |
| 13 | `spring.datasource.druid.timeBetweenEvictionRunsMillis` | `60000` | 与 CFG-002 同值 | `DruidProperties` | 检测间隔 | 无 | 第 18 行 |
| 14 | `spring.datasource.druid.minEvictableIdleTimeMillis` | `300000` | 与 CFG-002 同值 | `DruidProperties` | 最小生存时间 | 无 | 第 19 行 |
| 15 | `spring.datasource.druid.maxEvictableIdleTimeMillis` | `900000` | 与 CFG-002 同值 | `DruidProperties` | 最大生存时间 | 无 | 第 20 行 |
| 16 | `spring.datasource.druid.validationQuery` | `SELECT 1` | 与 CFG-002 同值 | `DruidProperties` | 有效性 SQL | 无 | 第 21 行 |
| 17 | `spring.datasource.druid.testWhileIdle` | `true` | 与 CFG-002 同值 | `DruidProperties` | 空闲检测 | 无 | 第 22 行 |
| 18 | `spring.datasource.druid.testOnBorrow` | `false` | 与 CFG-002 同值 | `DruidProperties` | 借用检测 | 无 | 第 23 行 |
| 19 | `spring.datasource.druid.testOnReturn` | `false` | 与 CFG-002 同值 | `DruidProperties` | 归还检测 | 无 | 第 24 行 |

---

## CFG-006 - 本地 Docker 应用覆盖配置键集

- ID: CFG-006
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/deploy/local-docker/conf/application-docker-local.yml`（15 行）
- 来源文件: `open-api/deploy/local-docker/conf/application-docker-local.yml`
- 生效方式: 由 `docker-compose.yaml` 的 `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/opt/openapi/conf/application-docker-local.yml`（CFG-003 第 25 项）注入；Spring Boot 外部配置文件优先级**高于** jar 内 `application.yml`/`application-druid.yml`
- 环境差异: 本文件即「容器内相对于裸机」的全部差异来源。与裸机相比：主库主机名由 `localhost` 变为容器名 `postgres`；显式重复声明 `driverClassName`、`pagehelper.helperDialect`、`shiro.user.captchaEnabled` 三个与 jar 内同值的键（冗余但无副作用）
- 消费者: `DruidConfig`、`DruidProperties`、PageHelper、`ShiroConfig`（验证码开关）
- **未覆盖项（重要缺口）**: `qvsu.profile` 未被本文件覆盖，容器内仍使用 `D:/qvsu/uploadPath`（Windows 路径），导致容器内文件上传/头像/下载路径不可用（`事实`）

### 键级明细（6 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `spring.datasource.driverClassName` | `org.postgresql.Driver` | 与 CFG-002 同值（冗余） | Druid | 驱动类 | 无 | `application-docker-local.yml` 第 3 行 |
| 2 | `spring.datasource.druid.master.url` | `jdbc:postgresql://postgres:5432/jd_openapi?currentSchema=public&stringtype=unspecified` | **主机名 `postgres`（compose 服务名）**，端口 5432 | 主数据源 | 容器内主库连接串 | 敏感 | 第 6 行 |
| 3 | `spring.datasource.druid.master.username` | `postgres` | 与 CFG-003 的 `POSTGRES_USER` 默认值一致 | 主数据源 | 账号 | 敏感 | 第 7 行 |
| 4 | `spring.datasource.druid.master.password` | `123456` | 与 CFG-003 的 `POSTGRES_PASSWORD` 默认值一致 | 主数据源 | 口令 | **高度敏感** | 第 8 行 |
| 5 | `pagehelper.helperDialect` | `postgresql` | 与 CFG-002 同值（冗余） | PageHelper | 分页方言 | 无 | 第 11 行 |
| 6 | `shiro.user.captchaEnabled` | `true` | 与 CFG-002 同值（冗余） | `ShiroConfig` → `CaptchaValidateFilter` | 验证码开关 | 敏感 | 第 15 行 |

---

## CFG-007 - dev-docker 编排配置键集

- ID: CFG-007
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `open-api/deploy/dev-docker/docker-compose.yml`（13 行）与 `open-api/deploy/dev-docker/Dockerfile`（18 行）
- 来源文件: `open-api/deploy/dev-docker/docker-compose.yml`
- 生效方式: 需在**仓库上一级目录**执行（`Dockerfile` 第 14 行 `COPY open-api/qvsu-openapi/target/*.jar` 要求上下文包含 `open-api/`），但本 compose 文件**未声明 `build:` 段**，只引用远程镜像，二者不构成闭环
- 环境差异: 与 CFG-003 相比 —— 使用 `version: '3.8'`（CFG-003 使用顶层 `name`）；镜像来自阿里云远程仓库而非本地构建；`container_name` 为 `qvsu-openapi`（CFG-003 为 `openapi-app`）；无 postgres 服务（依赖外部数据库）
- **可复现性结论**：不可复现（`事实`）。镜像 tag 固定为 `qvsu_open_api_2026-03-27-13-12-27`，仓库内无法产出；`Dockerfile` 要求预构建 jar 存在。详见 [technical-architecture.md](./technical-architecture.md) 技术债第 5 条

### 键级明细（4 条，逐键登记）

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `version` | `'3.8'` | CFG-003 无此键（使用 Compose 顶层 `name`） | Docker Compose | 声明 Compose 文件格式版本（Compose V2 已废弃该键，会输出警告） | 无 | `deploy/dev-docker/docker-compose.yml` 第 1 行 |
| 2 | `services.openapi.image` | `registry.cn-shenzhen.aliyuncs.com/chaoqs/qvsu_open_api:qvsu_open_api_2026-03-27-13-12-27` | 与 CFG-003 的 `openapi-app:local` 完全不同 | `openapi` 服务 | 拉取外部私有仓库镜像；**构建不可复现** | 敏感（暴露内部镜像仓库地址与命名） | 第 5 行 |
| 3 | `services.openapi.container_name` | `qvsu-openapi` | CFG-003 为 `openapi-app` | `openapi` 服务 | 容器名 | 无 | 第 6 行 |
| 4 | `services.openapi.environment.TZ` | `Asia/Shanghai` | 与 CFG-003 同值 | `openapi` 容器 | 容器时区 | 无 | 第 8 行 |

### 未收录但存在的编排键（补充登记）

| 配置名 | 值 | 说明 |
|---|---|---|
| `services.openapi.ports` | `"5656:5656"` | 与 CFG-003 不同，**不支持环境变量覆盖宿主端口** |
| `services.openapi.volumes` | `./logs:/app/logs`、`./data:/app/data` | 挂载日志与数据目录；与 `logback.xml` 的 `/home/qvsu/logs` **路径不一致**，容器内日志不会落入挂载卷（`事实`） |
| `services.openapi`（无 `build` 段） | — | 必须先用外部方式产出 jar 并推送镜像 |

---

## CFG-008 - 代码内读取的运行时开关与硬编码配置

- ID: CFG-008
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 Java 源码与 `logback.xml`、`ehcache-shiro.xml`、`mybatis-config.xml`
- 来源文件: 分散在 Java 源码与 XML 资源中（**不在 `../tools/assets.json` 的 168 条 ConfigKeys 内**）
- 说明: 这些配置**同样决定运行行为**，若只登记 YAML 会漏掉；此处逐项登记，并标注其「不可通过外部配置覆盖」的事实

| # | 配置名 | 默认值 | 环境差异 | 消费者 | 控制行为 | 敏感性 | 证据 |
|---:|---|---|---|---|---|---|---|
| 1 | `logback.xml: log.path` | `/home/qvsu/logs` | 三份 Docker 配置与测试配置均未覆盖；`dev-docker` 挂载的是 `./logs`（路径不匹配） | Logback `RollingFileAppender` | 日志落盘根目录；非 Linux 或无写权限时日志文件不可生成 | 敏感 | `open-api/qvsu-openapi/src/main/resources/logback.xml` 第 4 行 |
| 2 | `logback.xml: log.pattern` | `%d{HH:mm:ss.SSS} [%thread] %-5level %logger{20} - [%method,%line] - %msg%n` | 无 | Logback 全部 appender | 日志格式；不含 `%X{traceId}`，因此 `OpenApiFilter` 写入的 MDC `traceId` **不会出现在文件日志中** | 敏感（链路追踪不可用） | `logback.xml` 第 6 行；`OpenApiFilter.java` 第 68 行 |
| 3 | `logback.xml: maxHistory` | `60`（天） | 无 | `file_info`/`file_error`/`sys-user` 三个滚动 appender | 日志保留天数 | 无 | `logback.xml` 第 23、45、67 行 |
| 4 | `ThreadPoolConfig: corePoolSize/maxPoolSize/queueCapacity/keepAliveSeconds` | `50` / `200` / `1000` / `300` | **不可通过配置覆盖**（Java 字段默认值，无 `@Value`、无 `@ConfigurationProperties`） | `com.qvsu.common.config.thread.ThreadPoolConfig` → `AsyncManager` 的异步执行器 | 操作日志落库、会话落库的线程池容量 | 敏感（无法在不重新构建的情况下调优） | `common/config/thread/ThreadPoolConfig.java` 第 21、24、27、30 行 |
| 5 | `ehcache-shiro.xml: cache 定义` | `loginRecordCache`(空闲 600s)、`sys-authCache`(不过期/LRU)、`sys-cache`/`sys-config`/`sys-dict`(eternal)、`shiro-activeSessionCache`、`sys-userCache`、`defaultCache` | 无 | `ShiroConfig#getEhCacheManager` → Shiro 缓存 | 授权/会话/密码重试/字典参数的缓存策略 | 敏感（`sys-authCache` 与 `sys-dict` 不过期，权限或字典变更后需重启或清缓存才生效） | `resources/ehcache/ehcache-shiro.xml` 第 16-88 行；`ShiroConfig.java` 第 151-166 行 |
| 6 | `mybatis-config.xml: settings` | `cacheEnabled=true`、`useGeneratedKeys=true`、`defaultExecutorType=SIMPLE`、`logImpl=SLF4J`；`mapUnderscoreToCamelCase` 被注释（默认 false） | 无 | `MyBatisConfig#sqlSessionFactory`（`mybatis.configLocation`） | MyBatis 全局行为；二级缓存开启、驼峰映射关闭（故 Mapper XML 必须显式写 `resultMap`） | 敏感（二级缓存在多实例下存在一致性风险） | `resources/mybatis/mybatis-config.xml` 第 9-17 行；`application.yml` 第 85 行 |
| 7 | `shiro.cookie.domain` | 空值 | 无 | `ShiroConfig#rememberMeCookie` 第 91-92、393 行 | Cookie 域不限定 | 敏感（未收录入 168 条） | `application.yml` 第 108 行 |
| 8 | `shiro.cookie.cipherKey` | 空值 → 运行时随机生成 AES-128 密钥 | 无 | `ShiroConfig#rememberMeManager` 第 115-116、407-414 行 | rememberMe 加密密钥；多实例部署下互不兼容，重启即失效 | **高度敏感**（未收录入 168 条） | `application.yml` 第 116 行；`ShiroConfig.java` 第 413 行 |
| 9 | `spring.datasource.druid.slave.url` | 空值 | 无 | `DruidConfig#slaveDataSource` | 从库连接串；`slave.enabled=false` 时无意义 | 敏感（未收录入 168 条） | `application-druid.yml` 第 16 行 |
| 10 | `spring.datasource.druid.statViewServlet.allow` | 空值 | 无 | Druid StatViewServlet | 监控台来源 IP 白名单；空表示不限制 | 高度敏感（未收录入 168 条） | `application-druid.yml` 第 46 行 |
| 11 | 网关默认超时 | `5000` ms | 可由 `open_api.timeout_ms` 数据行覆盖 | `OpenApiSecurityService` 第 70、117 行；`OpenApiProxyService#buildFactory` 第 118 行 | 转发下游的连接与读取超时 | 敏感 | `OpenApiSecurityService.java` 第 70、117 行 |
| 12 | 时间漂移容忍与 nonce 有效期 | `5` 分钟 / `5` 分钟 / nonce 缓存上限 `100000` | 无（常量） | `OpenApiSecurityService` 第 37-39、212-219 行 | 签名时间窗与防重放窗口；单机内存实现 | 敏感 | `OpenApiSecurityService.java` 第 37-39 行 |
| 13 | 调用日志截断长度 | `4000` 字符 | 无（常量 `TEXT_MAX_LENGTH`） | `OpenApiLogService#cut` 第 20、57-64 行 | 请求/响应体入库最大长度 | 敏感 | `OpenApiLogService.java` 第 20 行 |
| 14 | 操作日志截断长度 | `2000` 字符 | 无（常量 `PARAM_MAX_LENGTH`） | `LogAspect` 第 51、112、163、179、216-218 行 | 操作日志参数/异常/响应体入库最大长度 | 敏感 | `LogAspect.java` 第 51 行 |

---

## 1. 敏感配置汇总（跨 CFG）

| 配置键 | 值 | 所在 CFG | 风险等级 | 风险说明 |
|---|---|---|---|---|
| `spring.datasource.druid.master.password` | `123456` | CFG-002、CFG-005、CFG-006 | 高度敏感 | 数据库超弱口令，三份环境一致，未提供任何强口令或环境变量覆盖 |
| `spring.datasource.druid.statViewServlet.login-password` | `123456` | CFG-002 | 高度敏感 | `/druid/*` 监控台弱口令；监控台可查看全部 SQL、连接池、Web 会话关联数据 |
| `spring.datasource.druid.statViewServlet.login-username` | `postgres` | CFG-002 | 敏感 | 与数据库账号同名 |
| `spring.datasource.druid.statViewServlet.allow` | 空（不限制来源） | CFG-008 | 高度敏感 | 监控台无来源 IP 白名单 |
| `spring.datasource.druid.filter.wall.config.multi-statement-allow` | `true` | CFG-002 | 高度敏感 | 允许一次执行多条 SQL，削弱注入纵深防御 |
| `csrf.enabled` | `false` | CFG-001 | 高度敏感 | CSRF 校验整体关闭；`CsrfValidateFilter` 挂载但失效 |
| `csrf.whites` | `/druid` | CFG-001 | 敏感 | CSRF 白名单配置当前无效果，但语义上把监控台排除在防护之外 |
| `xss.excludes` | `/system/notice/*` | CFG-001 | 高度敏感 | 通知公告正文明确豁免 XSS 过滤 |
| `xss.urlPatterns` | `/system/*,/tool/*` | CFG-001 | 敏感 | `/open/**`、`/selftest/**` 不在 XSS 过滤范围 |
| `shiro.cookie.cipherKey` | 空 → 随机生成 | CFG-008 | 高度敏感 | rememberMe 密钥每次启动随机，多实例不兼容 |
| `shiro.session.maxSession` | `-1` | CFG-001 | 敏感 | 同账号并发会话不限，`KickoutSessionFilter` 形同虚设 |
| `shiro.session.kickoutAfter` | `false` | CFG-001 | 敏感 | 踢出策略为后者登录踢出前者 |
| `shiro.session.expireTime` | `30`（分钟） | CFG-001 | 敏感 | 会话超时 30 分钟 |
| `shiro.cookie.maxAge` | `30`（实为天） | CFG-001 | 敏感 | rememberMe 有效 30 天，远超会话超时 |
| `shiro.user.captchaEnabled` | `true` | CFG-001、CFG-006 | 敏感（正向） | 若置 false 则登录验证码完全取消 |
| `qvsu.testing.exposeCaptchaCode` | `false` | CFG-001 | 高度敏感 | 若置 true，验证码明文可被接口直接读出 |
| `qvsu.demoEnabled` | `true` | CFG-001 | 敏感 | 演示模式开启，配合 73 个 `templates/demo/**` 页面向访问者暴露框架演示能力 |
| `qvsu.profile` | `D:/qvsu/uploadPath` | CFG-001 | 敏感 | Windows 绝对路径且被 `ResourcesConfig` 第 55 行以 `file:` 暴露为静态资源目录 |
| `spring.devtools.restart.enabled` | `true` | CFG-001 | 敏感 | 生产环境不应开启热重启 |
| `spring.thymeleaf.cache` | `false` | CFG-001 | 敏感 | 生产环境应开启模板缓存 |
| `logging.level.com.qvsu` | `debug` | CFG-001 | 敏感 | debug 级会输出鉴权中间态（`OpenApiSecurityService` 多处 `log.debug`，含期望签名与实际签名，见第 141 行 `log.warn` 亦回显两者） |
| `services.postgres.environment.POSTGRES_PASSWORD` | `${POSTGRES_PASSWORD:-123456}` | CFG-003 | 高度敏感 | 默认回退值即弱口令 |
| `services.openapi.environment.SPRING_CONFIG_ADDITIONAL_LOCATION` | `file:/opt/openapi/conf/application-docker-local.yml` | CFG-003 | 敏感 | 外部配置文件挂载点，构成配置注入面 |
| `services.openapi.image` | 阿里云私有仓库镜像 | CFG-007 | 敏感 | 暴露内部镜像仓库地址与命名 |
| `logback.xml: log.path` | `/home/qvsu/logs` | CFG-008 | 敏感 | 与 dev-docker 的 `./logs` 挂载不一致，日志落地失败或分散 |
| `logback.xml: log.pattern` | 不含 `%X{traceId}` | CFG-008 | 敏感 | 网关 traceId 无法在文件日志中检索 |
| `ThreadPoolConfig` 四参数 | 硬编码 | CFG-008 | 敏感 | 异步日志/会话落库线程池不可调优 |
| `ehcache-shiro.xml` `sys-authCache`/`sys-dict` | `eternal=true` | CFG-008 | 敏感 | 权限与字典变更不即时生效 |
| `mybatis-config.xml` `cacheEnabled` | `true` | CFG-008 | 敏感 | MyBatis 二级缓存开启，多实例下有一致性风险 |

## 2. 环境差异矩阵（关键键）

| 配置键 | 裸机（CFG-001/002） | local-docker（CFG-003 + 006） | dev-docker（CFG-007） | 测试（CFG-005） |
|---|---|---|---|---|
| 数据库主机 | `localhost:5432` | `postgres:5432`（容器名） | 未声明（依赖外部） | `localhost:5433` |
| `master.password` | `123456` | `123456` | 未知（镜像内固化） | `123456` |
| `slave.enabled` | `false` | `false`（未覆盖） | 未知 | `false` |
| Druid 监控台 | 开启（`/druid/*`，弱口令） | 开启（未覆盖） | 未知 | **不开启**（无该键） |
| 慢 SQL 日志 | 开启（1000 ms） | 开启（未覆盖） | 未知 | **不开启**（无该键） |
| Wall 多语句 | 允许 | 允许（未覆盖） | 未知 | **无该配置**（Druid 默认拒绝，`推断`） |
| 服务端口 | `5656` | `5656:5656` | `5656:5656` | 继承主配置 `5656` |
| 文件上传目录 | `D:/qvsu/uploadPath` | **仍为 `D:/qvsu/uploadPath`（未覆盖，缺陷）** | 未知 | 继承主配置 |
| 日志目录 | `/home/qvsu/logs` | 未覆盖（容器内路径） | 挂载 `./logs`（路径不匹配） | 继承主配置 |
| 时区 | `GMT+8`（Jackson） | `TZ=Asia/Shanghai`（容器） | `TZ=Asia/Shanghai` | 继承主配置 |
| 验证码 | 开启 / math | 开启（显式重复声明） | 未知 | 继承主配置 |

## 3. 配置相关缺陷与存疑项

| # | 类型 | 内容 | 证据等级 |
|---:|---|---|---|
| 1 | 缺陷 | `application.yml` 中文注释与 `qvsu.name`/`qvsu.version` 为双重编码乱码（UTF-8 BOM + GBK 字节再按 Latin-1 编码），`../tools/assets.json` 提取出的值即为乱码串 | 事实 |
| 2 | 缺陷 | `qvsu.version` 与 `qvsu.name` 值完全相同，疑为复制粘贴错误 | 推断 |
| 3 | 缺陷 | `shiro.cookie.maxAge` 注释为「秒为单位」，实现按天解释（`ShiroConfig` 第 396 行），实际 rememberMe 有效期 30 天 | 事实 |
| 4 | 缺陷 | `qvsu.profile` 未在任何 Docker 配置中覆盖，容器内为 Windows 路径 | 事实 |
| 5 | 缺陷 | `logback.xml` 定义两个 `<root>` 元素（第 79-87 行），同名配置项后者覆盖前者，`console` appender 很可能不生效 | 推断 |
| 6 | 缺陷 | `logging.level.com.qvsu=debug`（配置）与 `logback.xml` 第 75 行 `level="info"`（XML）冲突；按 Spring Boot 优先级配置胜出，但两处声明并存易误导 | 推断 |
| 7 | 缺陷 | `initialSize=5` < `minIdle=10`，启动后连接数会增长至 minIdle，配置语义自相矛盾 | 推断 |
| 8 | 缺陷 | `dev-docker` 挂载 `./logs:/app/logs` 与 `logback.xml` 的 `/home/qvsu/logs` 不匹配 | 事实 |
| 9 | 缺陷 | `mybatis-config.xml` 中 `mapUnderscoreToCamelCase` 被注释（默认 false），而 `typeAliasesPackage` 为 `com.qvsu.**.domain`，Mapper 必须显式定义 `resultMap`；如有遗漏将导致字段映射为空 | 推断 |
| 10 | 覆盖缺口 | `application.yml` 的 `shiro.cookie.domain`、`shiro.cookie.cipherKey`、`application-druid.yml` 的 `slave.url`、`statViewServlet.allow` 四键因值为空未被 `../tools/assets.json` 收录，若仅依据该数据源会漏登记 | 事实 |
| 11 | 覆盖缺口 | `docker-compose.yaml` 的 `ports`、`volumes` 列表键因非标量未被收录，需人工补充（本文件已补） | 事实 |
| 12 | 存疑 | 168 条 ConfigKeys 中**无任何 `spring.quartz.*` 键**，说明调度器全部使用 Spring Boot 默认值（内存 RAMJobStore、线程池 10）；是否在生产另有外部注入方式无法从仓库确认 | 假设 |
| 13 | 存疑 | `POSTGRES_PORT`/`POSTGRES_DATA_DIR`/`APP_PORT`/`POSTGRES_IMAGE`/`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` 七个环境变量是否在部署流水线中被实际设置，仓库内无证据 | 假设 |
| 14 | 存疑 | `spring.datasource.druid.statViewServlet.allow` 为空时 Druid 是否允许所有来源，未做运行验证 | 假设 |
