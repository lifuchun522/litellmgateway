# 技术组件与组件能力索引

本文件是 `COMP-*` 与 `TCA-*` 稳定 ID 的唯一主定义位置。
结论级别：`事实`（直接读 `pom.xml`/源码/模板/静态资源）、`推断`（多迹象一致）、`假设`（待确认）。
最后核验日期：2026-03-27。核验基线：`open-api/qvsu-openapi/pom.xml`、`open-api/qvsu-openapi/src/main/java/**`、`open-api/qvsu-openapi/src/main/resources/{templates,static}/**`。

系统级背景见 [technical-architecture.md](./technical-architecture.md)；配置键级登记见 [config-index.md](./config-index.md)。

## 0. 组件盘点口径

- **组件分母**：`open-api/qvsu-openapi/pom.xml` 中 `<dependencies>` 直接声明的 19 条坐标（第 72-100 行），加上 4 条在代码中被直接 API 调用但由传递依赖提供的构件（`spring-jdbc`、`ehcache`、`aspectjweaver`、`snakeyaml`），合计 23 个后端 COMP 节点。
- **前端组件分母**：`resources/static/` 中实际存在的前端库与项目自有前端封装，全部登记为 COMP 节点，共 36 个（后端 23 + 前端 36 = 59）。每个前端组件都标注了「被引用的模板文件数量」与「仅连接资源、无自有能力接口」判定。
- **组件能力分母**：每个已接入的组件至少 1 个 `TCA-*`。共 74 个 `TCA-*` 节点。
- 未在模板或代码中引用、仅作为静态文件存在的资源，登记为「仅连接资源、无自有能力接口」，不虚构能力接口。

## 1. 后端组件目录（23）

| COMP ID | 组件 | 坐标 | 版本 | 能力节点数 |
|---|---|---|---|---:|
| COMP-spring-boot-web | Spring MVC 运行时基座 | `org.springframework.boot:spring-boot-starter-web` | 2.7.18 | 1 |
| COMP-spring-boot-thymeleaf | 服务端模板渲染 | `org.springframework.boot:spring-boot-starter-thymeleaf` | 2.7.18 | 1 |
| COMP-spring-boot-aop | 切面编程基座 | `org.springframework.boot:spring-boot-starter-aop` | 2.7.18 | 1 |
| COMP-spring-boot-quartz | 定时任务调度 | `org.springframework.boot:spring-boot-starter-quartz` | 2.7.18 | 2 |
| COMP-spring-boot-validation | Bean 校验 | `org.springframework.boot:spring-boot-starter-validation` | 2.7.18 | 1 |
| COMP-spring-boot-test | 测试基座 | `org.springframework.boot:spring-boot-starter-test` | 2.7.18（test） | 1 |
| COMP-spring-jdbc | 模板化 SQL 访问 | `org.springframework:spring-jdbc`（传递依赖） | 5.3.39 | 2 |
| COMP-postgresql-driver | PostgreSQL JDBC 驱动 | `org.postgresql:postgresql` | 42.7.5 | 1 |
| COMP-druid | Druid 连接池与监控 | `com.alibaba:druid-spring-boot-starter` | 1.2.27 | 4 |
| COMP-kaptcha | 验证码生成 | `pro.fessional:kaptcha` | 2.3.3 | 2 |
| COMP-shiro-core | Shiro 安全内核 | `org.apache.shiro:shiro-core` | 1.13.0 | 3 |
| COMP-shiro-spring | Shiro Spring 集成 | `org.apache.shiro:shiro-spring` | 1.13.0 | 2 |
| COMP-shrio-ehcache | Shiro Ehcache 缓存桥 | `org.apache.shiro:shiro-ehcache` | 1.13.0 | 1 |
| COMP-ehcache | Ehcache 缓存引擎 | `net.sf.ehcache:ehcache`（传递依赖） | 2.10.9.2 | 2 |
| COMP-thymeleaf-extras-shiro | 模板权限标签 | `com.github.theborakompanioni:thymeleaf-extras-shiro` | 2.1.0 | 1 |
| COMP-pagehelper | 物理分页 | `com.github.pagehelper:pagehelper-spring-boot-starter` | 1.4.7 | 2 |
| COMP-commons-lang3 | 通用工具库 | `org.apache.commons:commons-lang3` | 3.12.0 | 2 |
| COMP-jackson-databind | Jackson JSON | `com.fasterxml.jackson.core:jackson-databind` | 2.13.5 | 1 |
| COMP-fastjson | Fastjson | `com.alibaba:fastjson` | 1.2.83 | 2 |
| COMP-commons-io | IO 工具库 | `commons-io:commons-io` | 2.21.0 | 1 |
| COMP-poi-ooxml | Excel 读写 | `org.apache.poi:poi-ooxml` | 4.1.2 | 2 |
| COMP-yauaa | User-Agent 解析 | `nl.basjes.parse.useragent:yauaa` | 7.32.0 | 1 |
| COMP-aspectjweaver | AspectJ 织入 | `org.aspectj:aspectjweaver`（传递依赖） | 1.9.7 | 1 |

## 2. 前端组件目录（36）

| COMP ID | 组件 | 版本 | 引用模板数 | 自有能力接口 |
|---|---|---:|---:|---|
| COMP-jquery | jQuery | 3.7.1 | 全局（include.html footer，128 页复用 header/footer） | 有 |
| COMP-bootstrap | Bootstrap 3（JS + CSS） | 3.4.1 | 全局 | 有 |
| COMP-fontawesome | FontAwesome 图标字体 | 4.7.0 | 全局 | **仅连接资源** |
| COMP-bootstrap-table | bootstrap-table | 1.24.1 | 全局 | 有 |
| COMP-bootstrap-table-mobile | bootstrap-table mobile 扩展 | 1.24.1 | 全局 | 有 |
| COMP-bootstrap-table-tree | bootstrap-table tree 扩展 | 1.24.1 | 全局 | 有 |
| COMP-jquery-validate | jQuery Validate | 1.21.0 | 全局 + login.html/register.html | 有 |
| COMP-blockui | jQuery BlockUI | 2.70.0 | 全局 + login.html/register.html | 有 |
| COMP-icheck | iCheck | 1.0.3 | 全局 | 有 |
| COMP-layer | layer 弹层 | 3.7.0 | 全局 | 有 |
| COMP-layui | layui（含 laydate） | 2.8.18 | 全局 | 有 |
| COMP-ruoyi-ui | RuoYi 前端封装（`ruoyi/js/common.js`、`ruoyi/js/ry-ui.js`、`ruoyi/css/ry-ui.css`） | 4.8.2 | 全局 | 有 |
| COMP-metismenu | metisMenu 侧边菜单 | 未标注版本 | index.html / index-topnav.html | 有 |
| COMP-slimscroll | slimScroll | 未标注版本 | index.html / index-topnav.html | 有 |
| COMP-ztree | zTree 3.5 | 3.5 | 8（`ztree-css`/`ztree-js` 片段消费方） | 有 |
| COMP-select2 | select2 | 4.0.13 | 4 | 有 |
| COMP-bootstrap-select | bootstrap-select | 1.13.18 | 2 | 有 |
| COMP-datetimepicker | bootstrap-datetimepicker | 2.4.4 | 3 | 有 |
| COMP-summernote | summernote 富文本 | 0.8.18 | 3 | 有 |
| COMP-duallistbox | bootstrap-duallistbox | 3.0.9 | 1 | 有 |
| COMP-fileinput | bootstrap-fileinput | 5.5.4 | 1 | 有 |
| COMP-cropper | Cropper 图像裁剪 | 1.5.12 | 1 | 有 |
| COMP-cxselect | jQuery cxSelect 多级联动 | 1.4.2 | 2 | 有 |
| COMP-suggest | bootstrap-suggest | 0.1.29 | 1 | 有 |
| COMP-typeahead | bootstrap-typeahead | 4.0.2 | 1 | 有 |
| COMP-jasny | jasny-bootstrap | 3.1.3 | 1 | 有 |
| COMP-smartwizard | jquery-smartwizard | 5.1.1 | 1 | 有 |
| COMP-jquery-layout | jQuery UI Layout | 1.4.4 | 1 | 有 |
| COMP-jsonview | jQuery jsonview | 1.2.0 | 0（仅 include.html 片段定义） | **仅连接资源** |
| COMP-echarts | 百度 ECharts | 4.2.1 | 1 | 有 |
| COMP-sparkline | jQuery Sparkline | 2.1.2 | 3 | 有 |
| COMP-peity | jQuery Peity | 2.0.3 | 2 | 有 |
| COMP-flot | jQuery Flot（含 pie/resize/spline/symbol/tooltip/curvedLines） | 未标注版本 | main_v1.html | 有 |
| COMP-bootstrap-table-ext | bootstrap-table 扩展族（export/print/cookie/editable/fixed-columns/auto-refresh/custom-view/reorder-rows/reorder-columns/resizable） | 1.24.1（tableExport 1.10.24、dragtable 5.3.5、tablednd 1.0.3、resizableColumns 0.1.0、bootstrap-editable 1.5.1） | 各 1-2 | 有 |
| COMP-highlight | highlight.js | 未标注版本 | 0（`static/ajax/libs/highlight` 内文件存在，无片段定义） | **仅连接资源** |
| COMP-three | three.js | 未标注版本 | 0 | **仅连接资源** |

> 说明：`COMP-jsonview`、`COMP-highlight`、`COMP-three`、`COMP-fontawesome` 四者判定为「仅连接资源、无自有能力接口」，理由分别见各自节点。

---

# 3. 后端组件节点

## COMP-spring-boot-web - Spring MVC 运行时基座

- ID: COMP-spring-boot-web
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 73 行
- 坐标: `org.springframework.boot:spring-boot-starter-web`，版本由 `spring-boot-dependencies:2.7.18` 管理；内嵌 Tomcat 由 `tomcat.version=9.0.112` 显式锁定（`pom.xml` 第 31、54-56 行）
- 用途: 提供 Spring MVC DispatcherServlet、内嵌 Tomcat 容器、Jackson HTTP 消息转换、`RestTemplate` 客户端
- 源码中的实际使用位置:
  - `com.qvsu.QvsuApplication`（第 12-18 行）`@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })` 启动内嵌容器
  - `com.qvsu.framework.config.ResourcesConfig implements WebMvcConfigurer`（第 22-67 行）注册视图控制器、静态资源处理器、拦截器
  - `com.qvsu.framework.config.FilterConfig`（第 31-43 行）注册 Servlet Filter
  - `com.qvsu.framework.web.exception.GlobalExceptionHandler`（`@RestControllerAdvice`，第 28 行）
  - `com.qvsu.open.service.OpenApiProxyService`（第 41-50 行）使用 `RestTemplate` + `SimpleClientHttpRequestFactory`
- 配置落点: `server.port`、`server.servlet.context-path`、`server.tomcat.uri-encoding`、`server.tomcat.accept-count`、`server.tomcat.threads.max`、`server.tomcat.threads.min-spare`、`spring.servlet.multipart.*`、`spring.jackson.*`（见 [config-index.md](./config-index.md)）
- 消费者: 全部 24 个 Controller 类、全部 Servlet Filter、`GlobalExceptionHandler`、`ResourcesConfig` 拦截器链

## TCA-web-mvc-dispatch - MVC 请求分发与视图解析能力

- ID: TCA-web-mvc-dispatch
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 24 个 Controller 类注解与 `ResourcesConfig`
- 能力接口: `org.springframework.web.servlet.DispatcherServlet`（容器装配，无需显式调用）；`WebMvcConfigurer#addViewControllers/addResourceHandlers/addInterceptors`
- 调用点:
  - `com.qvsu.framework.config.ResourcesConfig#addViewControllers`（第 45-49 行）`registry.addViewController("/").setViewName("forward:" + indexUrl)`
  - `com.qvsu.framework.config.ResourcesConfig#addResourceHandlers`（第 51-58 行）`registry.addResourceHandler(Constants.RESOURCE_PREFIX + "/**").addResourceLocations("file:" + QvsuConfig.getProfile() + "/")`
  - `com.qvsu.framework.config.ResourcesConfig#addInterceptors`（第 63-67 行）注册 `RepeatSubmitInterceptor`
- 全部消费者功能（按 Controller 类，24 个）:
  `com.qvsu.web.controller.common.CommonController`、`com.qvsu.web.controller.system.SysConfigController`、`SysCaptchaController`、`SysDictTypeController`、`SysDictDataController`、`SysDeptController`、`SysNoticeController`、`SysMenuController`、`SysUserController`、`SysLoginController`、`SysIndexController`、`SysRoleController`、`SysProfileController`、`SysRegisterController`、`SysPostController`、`com.qvsu.quartz.controller.SysJobController`、`SysJobLogController`、`com.qvsu.open.controller.OpenAuthController`、`OpenLogController`、`OpenAppController`、`OpenDocController`、`OpenGatewayController`、`OpenApiMgrController`、`OpenSelftestHttpbinController`
  （功能级消费者 ID 由功能清单文档定义，本文件不引用）

## COMP-spring-boot-thymeleaf - 服务端模板渲染

- ID: COMP-spring-boot-thymeleaf
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 74 行、`templates/include.html`
- 坐标: `org.springframework.boot:spring-boot-starter-thymeleaf`，版本 2.7.18（BOM 管理）
- 用途: 服务端渲染 Thymeleaf 模板，承载全部 144 个页面的 HTML 输出
- 源码中的实际使用位置:
  - `templates/include.html` 第 2 行 `th:fragment=header(title)`、第 20 行 `th:fragment="footer"`、第 45-227 行 30 余个 `th:fragment` 资源片段
  - 业务页样板：`templates/open/app/index.html` 第 4 行 `th:include="include :: header('Open应用管理')"`、第 43 行 `th:include="include :: footer"`
  - `templates/index.html`、`templates/index-topnav.html`、`templates/login.html`、`templates/register.html`、`templates/main.html`、`templates/main_v1.html`
  - 错误页：`GlobalExceptionHandler` 返回 `new ModelAndView("error/unauth")` 与 `new ModelAndView("error/service", "errorMessage", ...)`
- 配置落点: `spring.thymeleaf.mode=HTML`、`spring.thymeleaf.encoding=utf-8`、`spring.thymeleaf.cache=false`
- 消费者: 全部 144 个 `templates/**/*.html`；模板间复用统计为 `header` 片段 128 次、`footer` 片段 127 次（事实，正则聚合统计）

## TCA-thymeleaf-fragment - 模板片段组合与内联脚本能力

- ID: TCA-thymeleaf-fragment
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 与 329 处 `th:include` 调用
- 能力接口: Thymeleaf `th:fragment` / `th:include` / `th:replace` / `th:inline="javascript"` / `@{...}` URL 表达式 / `${...}` 变量表达式
- 调用点:
  - `templates/include.html#header(title)`（第 2-17 行）输出 6 个 CSS：`bootstrap.min.css?v=3.4.1`、`font-awesome.min.css?v=4.7.0`、`bootstrap-table.min.css?v=1.24.1`、`animate.min.css?v=20210831`、`style.min.css?v=20250731`、`ruoyi/css/ry-ui.css?v=4.8.2`
  - `templates/include.html#footer`（第 20-42 行）输出 12 个 JS：`jquery.min.js?v=3.7.1`、`bootstrap.min.js?v=3.4.1`、`bootstrap-table.min.js`、`bootstrap-table-zh-CN.min.js`、`bootstrap-table-mobile.js`、`jquery.validate.min.js`、`jquery.validate.extend.js`、`messages_zh.js`、`bootstrap-table-tree.min.js`、`jquery.blockUI.js`、`icheck.min.js`、`layer.min.js`、`layui.min.js`、`ruoyi/js/common.js`、`ruoyi/js/ry-ui.js`
  - `templates/open/app/index.html` 第 44 行 `<script th:inline="javascript">` 内用 `var prefix = ctx + "admin/open/app";` 拼接 Ajax 前缀
- 全部消费者: 128 个消费 `header` 片段的模板 + 127 个消费 `footer` 片段的模板；`ztree-css/js`(8)、`select2-css/js`(4)、`summernote-css/js`(3)、`datetimepicker-css/js`(3)、`sparkline-js`(3)、`jquery-cxselect-js`(2)、`bootstrap-select-css/js`(2)、`peity-js`(2)、`bootstrap-table-custom-view-js`(2) 等片段（共 41 个片段被使用，事实，`[regex]::Matches(...,'include\s*::\s*([A-Za-z0-9_\-]+)')` 聚合）

## COMP-spring-boot-aop - 切面编程基座

- ID: COMP-spring-boot-aop
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 75 行
- 坐标: `org.springframework.boot:spring-boot-starter-aop`，版本 2.7.18（BOM 管理）；传递 AspectJ `aspectjweaver`
- 用途: 提供 `@Aspect`/`@Around`/`@Before`/`@AfterReturning`/`@AfterThrowing` 与 `@EnableAspectJAutoProxy`
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.ApplicationConfig` 第 14 行 `@EnableAspectJAutoProxy(exposeProxy = true)`
  - `com.qvsu.framework.aspectj.LogAspect`（`@Aspect @Component`）
  - `com.qvsu.framework.aspectj.DataScopeAspect`（`@Aspect`，第 24 行）
  - `com.qvsu.framework.aspectj.PermissionsAspect`（`@Aspect`，第 16 行）
  - `com.qvsu.framework.aspectj.DataSourceAspect`（`@Aspect @Order(1)`，第 23-24 行）
- 消费者: `LogAspect` → 所有标注 `@Log` 的 Controller 方法；`DataScopeAspect` → 所有标注 `@DataScope` 的方法；`PermissionsAspect` → 所有标注 `@RequiresPermissions` 的方法；`DataSourceAspect` → 所有标注 `@DataSource` 的方法

## TCA-aop-aspect-proxy - 切面代理与自定义注解拦截能力

- ID: TCA-aop-aspect-proxy
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 4 个切面类的注解绑定
- 能力接口: `org.aspectj.lang.annotation.Aspect` / `@Around` / `@Before` / `@AfterReturning` / `@AfterThrowing`；`@annotation(...)` 切点表达式；`AopContext.currentProxy()`（`exposeProxy=true` 时可用）
- 调用点与全部消费者:
  - `LogAspect#doBefore/doAfterReturning/doAfterThrowing`（第 56/67/79 行）绑定 `@annotation(controllerLog)` → 消费者为所有使用 `com.qvsu.common.annotation.Log` 的 Controller 方法（覆盖系统管理域与 OpenAPI 管理域的增删改导出操作）
  - `DataScopeAspect#doBefore`（第 58 行）绑定 `@annotation(controllerDataScope)` → 消费者为使用 `com.qvsu.common.annotation.DataScope` 的方法
  - `PermissionsAspect#doBefore`（第 20 行）绑定 `@annotation(controllerRequiresPermissions)` → 消费者为 105 个带 `@RequiresPermissions` 的端点
  - `DataSourceAspect#dsPointCut/around`（第 30/37 行）绑定 `@annotation(com.qvsu.common.annotation.DataSource)` → 当前无实际使用点（`slave.enabled=false`）

## COMP-spring-boot-quartz - 定时任务调度

- ID: COMP-spring-boot-quartz
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 76 行、`ScheduleConfig.java`
- 坐标: `org.springframework.boot:spring-boot-starter-quartz`，版本 2.7.18（BOM 管理）；传递 `org.quartz-scheduler:quartz`
- 用途: 提供 Quartz `Scheduler`、`JobDetail`、`Trigger`、Cron 表达式执行能力
- 源码中的实际使用位置:
  - `com.qvsu.quartz.config.ScheduleConfig`（第 11-13 行）——**空占位类**，注释明确「当前使用 Spring Boot 自动配置的 Scheduler（内存模式）」
  - `com.qvsu.quartz.controller.SysJobController`、`com.qvsu.quartz.controller.SysJobLogController`
  - `com.qvsu.quartz.service.impl.SysJobServiceImpl`（8 个 `@Transactional(rollbackFor = Exception.class)` 方法）
  - `com.qvsu.quartz.util.*`、`com.qvsu.quartz.task.HttpTask`（第 12-13 行使用 `fastjson` 解析任务参数）
  - `com.qvsu.framework.config.ResourcesConfig#restTemplate()`（第 36-40 行）为 HTTP 任务提供 `RestTemplate`
- 存储: 任务定义持久化在业务表 `sys_job`（Mapper：`resources/mapper/quartz/SysJobMapper.xml`、`SysJobLogMapper.xml`，共 2 个 Mapper XML）；调度器状态为内存 RAMJobStore（`事实`：`ScheduleConfig` 为空占位 + `ConfigKeys` 中无任何 `spring.quartz.*` 键）
- 消费者: `sys_job` 表中的任务定义数据；执行结果写入 `sys_job_log`

## TCA-quartz-job-schedule - 任务定义驱动的调度执行能力

- ID: TCA-quartz-job-schedule
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `ScheduleConfig` 注释、`SysJobServiceImpl`、`SysJobMapper.xml` 存在
- 能力接口: `org.quartz.Scheduler#scheduleJob/pauseJob/resumeJob/deleteJob/triggerJob`（经 `com.qvsu.quartz.util.ScheduleUtils` 封装，`推断`：工具类命名与 `SysJobServiceImpl` 的业务动作一一对应）
- 调用点:
  - `com.qvsu.quartz.service.impl.SysJobServiceImpl` 第 80/100/120/140/157/179/203/221 行共 8 个事务方法，覆盖新增/修改/删除/启停/立即执行等任务生命周期动作
  - `com.qvsu.quartz.controller.SysJobController` 提供菜单入口 `/monitor/job`
- 全部消费者: 「定时任务管理」页面的增删改查与启停操作（菜单 `/monitor/job`）、「调度日志」页面（菜单 `/monitor/jobLog`）
- 未证明的部分: 未找到 `SchedulerFactoryBean` 配置，也未发现 `spring.quartz.job-store-type=jdbc` 配置键，因此 11 张 `QRTZ_*` 表（DDL 见 `open-api/sql/quartz.sql`）**当前不被使用**（`推断`，与 `ScheduleConfig` 注释一致）

## TCA-quartz-http-task - HTTP 调用型任务执行能力

- ID: TCA-quartz-http-task
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `com.qvsu.quartz.task.HttpTask` 与 `ResourcesConfig#restTemplate()`
- 能力接口: 任务目标串（`invokeTarget`）指向 Spring Bean 方法，由 `com.qvsu.quartz.util.JobInvokeUtil`（第 14-15 行引入 fastjson）反射调用；`HttpTask` 作为可被调度的 Bean 执行 HTTP 请求
- 调用点: `com.qvsu.quartz.task.HttpTask`；参数经 `JSON.parseObject` 解析（`JobInvokeUtil`、`HttpTask`）
- 全部消费者: `sys_job` 表中 `invoke_target` 指向 `httpTask.*` 的任务记录
- 证据缺口: 未检索到 `@Scheduled`、`@XxlJob`、`@KafkaListener`、`@RabbitListener`、`@JmsListener` 注解，`../tools/assets.json` 的 `Jobs` 集合为空（`事实`），说明不存在硬编码触发器，全部任务由表数据驱动

## COMP-spring-boot-validation - Bean 校验

- ID: COMP-spring-boot-validation
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 77 行、`common/xss/Xss.java`
- 坐标: `org.springframework.boot:spring-boot-starter-validation`，版本 2.7.18（BOM 管理）；提供 Hibernate Validator 实现
- 用途: 提供 `@Valid`、`@NotNull`、`@Size` 等约束与自定义 `ConstraintValidator` 扩展点
- 源码中的实际使用位置:
  - `com.qvsu.common.xss.Xss`（第 17 行 `@Constraint(validatedBy = { XssValidator.class })`）
  - `com.qvsu.common.xss.XssValidator implements ConstraintValidator<Xss, String>`（第 14 行）
  - `com.qvsu.framework.web.exception.GlobalExceptionHandler#handleBindException(BindException)`（第 133-139 行）处理校验失败
- 消费者: 使用 `@Xss` 标注的 domain 字段所在的管理页面表单提交；`BindException` 处理器服务于全部表单校验失败场景

## TCA-validation-custom-constraint - 自定义约束与统一校验异常能力

- ID: TCA-validation-custom-constraint
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `common/xss/Xss.java`、`XssValidator.java`、`GlobalExceptionHandler.java`
- 能力接口: `javax.validation.ConstraintValidator<Xss, String>#isValid`；`@ExceptionHandler(BindException.class)`
- 调用点: `XssValidator#isValid`（对入参做 HTML 转义/非法字符判定）；`GlobalExceptionHandler#handleBindException`（第 133-139 行，取 `getAllErrors().get(0).getDefaultMessage()` 返回给前端）
- 全部消费者: 所有以 `@Valid` 绑定且含 `@Xss` 字段的表单提交（用户、角色、菜单、部门、岗位、字典、参数、通知公告、OpenAPI 应用与接口表单）

## COMP-spring-boot-test - 测试基座

- ID: COMP-spring-boot-test
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 95-99 行
- 坐标: `org.springframework.boot:spring-boot-starter-test`，版本 2.7.18（BOM 管理），`<scope>test</scope>`
- 用途: 提供 JUnit、Spring Test、AssertJ、Mockito 等测试设施
- 源码中的实际使用位置: 测试资源目录 `open-api/qvsu-openapi/src/test/resources/application-druid.yml`（19 个配置键，连接 `localhost:5433`）
- 消费者: 测试用例（`事实`：仓库内无 `src/test/java` 下的测试类，仅存在测试资源配置；无任何测试断言可据以确认行为）
- 说明: 由于无测试类，本组件**不提供可被生产链路调用的能力**（见 TCA 节点）

## TCA-test-context-bootstrap - 测试上下文装配能力

- ID: TCA-test-context-bootstrap
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `src/test/resources/application-druid.yml` 存在而 `src/test/java` 缺失
- 能力接口: `@SpringBootTest` / `@ContextConfiguration` 等（依赖已具备）
- 调用点: **无**（`事实`：`src/test/java` 下无测试类）
- 全部消费者: 无
- 证据缺口: 该组件为「已声明未使用」状态；`src/test/resources/application-druid.yml` 的 19 个键是启用测试时唯一生效的测试期配置（详见 [config-index.md](./config-index.md)）

## COMP-spring-jdbc - 模板化 SQL 访问

- ID: COMP-spring-jdbc
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `OpenApiSecurityService`/`OpenApiLogService` 的 `JdbcTemplate` 构造注入
- 坐标: `org.springframework:spring-jdbc`，版本 5.3.39（由 `spring-framework-bom:5.3.39` 管理）
- 依赖来源: `推断`（`pom.xml` 未直接声明；`JdbcTemplate` 由 `spring-boot-starter-jdbc`/`druid-spring-boot-starter` 传递引入）
- 用途: 提供 `JdbcTemplate` 裸 SQL 执行与结果映射；同时提供 `DataSourceTransactionManager` 支撑 `@Transactional`
- 源码中的实际使用位置:
  - `com.qvsu.open.service.OpenApiSecurityService`（第 41-46 行构造注入 `JdbcTemplate`；第 242-251、266-291、302-312、326-330 行执行 5 条不同 SQL）
  - `com.qvsu.open.service.OpenApiLogService`（第 22-27 行构造注入；第 34-48 行 `insert into open_call_log(...)`）
- 消费者: `OpenApiFilter`（经 `OpenApiSecurityService` 鉴权、经 `OpenApiLogService` 记日志）、`OpenGatewayController`（间接）、全部 `@Transactional` 方法（经 `DataSourceTransactionManager`）

## TCA-jdbc-template-sql - 裸 SQL 执行与行映射能力

- ID: TCA-jdbc-template-sql
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `OpenApiSecurityService.java` 与 `OpenApiLogService.java`
- 能力接口: `JdbcTemplate#query(String, RowMapper, Object...)`、`#queryForList(String, Object...)`、`#queryForObject(String, Class, Object...)`、`#update(String, Object...)`
- 调用点（逐条）:
  1. `OpenApiSecurityService#loadAppInfo` 第 242-251 行：`select s_id, app_name, app_secret from open_app where app_key=? and status=1 and (expire_time is null or expire_time > now()) limit 1`
  2. `OpenApiSecurityService#loadApiInfo` 第 266-267 行：`select s_id, api_path, method, status from open_api where api_path=?`
  3. `OpenApiSecurityService#loadApiInfo` 第 281-291 行：`select s_id, target_url, timeout_ms, need_sign from open_api where api_path=? and method=? and status=1 limit 1`
  4. `OpenApiSecurityService#loadApiInfo` 第 302-312 行：`select s_id, target_url, timeout_ms, need_sign from open_api where api_path=? and method='POST' and status=1 limit 1`
  5. `OpenApiSecurityService#hasPermission` 第 326-330 行：`select count(1) from open_app_api where app_id=? and api_id=?`
  6. `OpenApiLogService#save` 第 34-48 行：`insert into open_call_log(trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time) values(...)`
- 全部消费者: `com.qvsu.open.filter.OpenApiFilter#doFilterInternal`（唯一调用方，经两个 Service）

## TCA-jdbc-transaction-manager - 声明式事务能力

- ID: TCA-jdbc-transaction-manager
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据全仓 26 处 `@Transactional` 与 `@Primary` 数据源
- 能力接口: `org.springframework.transaction.annotation.Transactional`；由 `DataSourceTransactionManager`（Spring Boot 自动配置，绑定 `@Primary` 的 `dynamicDataSource`）驱动
- 调用点: 26 处 `@Transactional`，分布：`OpenManageService`(5)、`SysUserServiceImpl`(5)、`SysRoleServiceImpl`(5)、`SysMenuServiceImpl`(1)、`SysDictTypeServiceImpl`(1)、`SysDeptServiceImpl`(1)、`SysJobServiceImpl`(8，`rollbackFor = Exception.class`)
- 全部消费者: 上述 7 个 Service 实现类所承载的管理操作；Controller 层不使用事务
- 证据缺口: `ApplicationConfig` 未声明 `@EnableTransactionManagement`，`推断` 事务能力来自 Spring Boot 自动配置；未运行验证隔离级别与传播行为

## COMP-postgresql-driver - PostgreSQL JDBC 驱动

- ID: COMP-postgresql-driver
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 30、78 行
- 坐标: `org.postgresql:postgresql`，版本 `42.7.5`（`pom.xml` 第 30 行属性 `postgresql.version`）
- 用途: 提供 PostgreSQL JDBC 连接，`Driver` 类为 `org.postgresql.Driver`
- 源码中的实际使用位置:
  - `application-druid.yml` 第 5 行 `driverClassName: org.postgresql.Driver`
  - `deploy/local-docker/conf/application-docker-local.yml` 第 3 行 `driverClassName: org.postgresql.Driver`
  - `src/test/resources/application-druid.yml` 第 4 行 `driverClassName: org.postgresql.Driver`
- 连接串特性: 三处均带 `currentSchema=public&stringtype=unspecified`（`stringtype=unspecified` 是 PostgreSQL 驱动参数，用于在未指定类型时按 unknown 传递字符串）
- 消费者: `DruidDataSource`（master/slave 两处配置）、`JdbcTemplate`、MyBatis `SqlSessionFactory`

## TCA-pg-jdbc-connection - PostgreSQL 连接建立能力

- ID: TCA-pg-jdbc-connection
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 3 份 `driverClassName` 配置与连接串
- 能力接口: `java.sql.Driver#connect`（由 Druid 池调用）；连接参数 `currentSchema`、`stringtype`
- 调用点: `com.qvsu.framework.config.DruidConfig#masterDataSource`（第 35-41 行）经 `DruidDataSourceBuilder` 装配；`DruidProperties#dataSource`（第 54-88 行）写入 13 个池参数
- 全部消费者: `DynamicDataSource`、MyBatis `SqlSessionFactory`（`MyBatisConfig#sqlSessionFactory`）、`JdbcTemplate`（`OpenApiSecurityService`、`OpenApiLogService`）

## COMP-druid - Druid 连接池与监控

- ID: COMP-druid
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 23、57、79 行与 `DruidConfig.java`
- 坐标: `com.alibaba:druid-spring-boot-starter`，版本 `1.2.27`（`pom.xml` 第 23 行属性 `druid.version`，第 57 行 dependencyManagement 锁定，第 79 行实际引用）
- 用途: 数据库连接池、SQL 监控统计、慢 SQL 日志、Wall 防护过滤器、内置监控台 Servlet
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.DruidConfig`：
    - `masterDataSource`（第 35-41 行）`@ConfigurationProperties("spring.datasource.druid.master")` + `DruidDataSourceBuilder.create().build()`
    - `slaveDataSource`（第 43-50 行）`@ConditionalOnProperty(prefix="spring.datasource.druid.slave", name="enabled", havingValue="true")`
    - `dynamicDataSource`（第 52-60 行）`@Primary`，聚合 MASTER/SLAVE
    - `removeDruidFilterRegistrationBean`（第 84-127 行）用匿名 `Filter` 替换 `support/http/resources/js/common.js`，正则移除 `banner` 与 `powered...shrek.wang`
  - `com.qvsu.framework.config.properties.DruidProperties`（13 个 `@Value` + 第 54-88 行回写池参数）
  - `com.qvsu.framework.datasource.DynamicDataSource`
  - `com.qvsu.framework.aspectj.DataSourceAspect`（`@Order(1)`）
  - `com.qvsu.common.enums.DataSourceType`、`com.qvsu.common.annotation.DataSource`
- 配置落点: 29 个 `spring.datasource.druid.*` 键（见 [config-index.md](./config-index.md) 的 CFG-002 节点）
- 消费者: MyBatis `SqlSessionFactory`、`JdbcTemplate`、`dynamicDataSource` 的下游全部数据访问

## TCA-druid-connection-pool - 连接池管理能力

- ID: TCA-druid-connection-pool
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `DruidProperties.java` 第 54-88 行与 `application-druid.yml`
- 能力接口: `com.alibaba.druid.pool.DruidDataSource#setInitialSize/setMaxActive/setMinIdle/setMaxWait/setConnectTimeout/setSocketTimeout/setTimeBetweenEvictionRunsMillis/setMinEvictableIdleTimeMillis/setMaxEvictableIdleTimeMillis/setValidationQuery/setTestWhileIdle/setTestOnBorrow/setTestOnReturn`
- 调用点: `com.qvsu.framework.config.properties.DruidProperties#dataSource(DruidDataSource)`（第 54-88 行）
- 生效参数: `initialSize=5`、`minIdle=10`、`maxActive=20`、`maxWait=60000`、`connectTimeout=30000`、`socketTimeout=60000`、`timeBetweenEvictionRunsMillis=60000`、`minEvictableIdleTimeMillis=300000`、`maxEvictableIdleTimeMillis=900000`、`validationQuery=SELECT 1`、`testWhileIdle=true`、`testOnBorrow=false`、`testOnReturn=false`
- 全部消费者: `DynamicDataSource#getConnection`（对上层透明）、MyBatis、`JdbcTemplate`
- 风险提示: `minIdle=10` 大于 `initialSize=5`，启动后按需增长至 10（`推断`）

## TCA-druid-stat-monitor - SQL 监控统计能力

- ID: TCA-druid-stat-monitor
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `application-druid.yml` 第 41-57 行与 `DruidConfig.java` 第 84-127 行
- 能力接口: `DruidStatProperties.StatViewServlet`（`url-pattern`、`login-username`、`login-password`、`allow`）；`webStatFilter.enabled`；`filter.stat`（`enabled`/`log-slow-sql`/`slow-sql-millis`/`merge-sql`）
- 调用点:
  - `DruidConfig#removeDruidFilterRegistrationBean(DruidStatProperties)`（第 87-127 行）读取 `config.getUrlPattern()` 计算 `commonJsPattern`，注册去广告过滤器
  - 监控台入口 `GET /druid/*`（`application-druid.yml` 第 47 行）
- 全部消费者: 运维/开发人员直接访问 `/druid/*` 查看 SQL 与连接池状态；`filter.stat` 的慢 SQL 日志（阈值 1000 ms）进入 Logback
- 敏感性: `statViewServlet.login-password=123456`、`login-username=postgres`（明文弱口令，见 [config-index.md](./config-index.md) 的敏感项表）

## TCA-druid-wall-filter - SQL Wall 防护能力

- ID: TCA-druid-wall-filter
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `application-druid.yml` 第 58-60 行
- 能力接口: `spring.datasource.druid.filter.wall.config.*`（Druid WallFilter 配置项）
- 调用点: 配置为 `multi-statement-allow: true`
- 全部消费者: 全部经 Druid 执行的 SQL
- 风险提示: `multi-statement-allow=true` 显式允许多语句执行，削弱了 WallFilter 的注入纵深防御（`事实`）

## TCA-druid-dynamic-datasource - 多数据源动态切换能力

- ID: TCA-druid-dynamic-datasource
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `DruidConfig.java` 第 52-79 行、`DataSourceAspect.java`
- 能力接口: `com.qvsu.framework.datasource.DynamicDataSource`（继承 `AbstractRoutingDataSource`，`determineCurrentLookupKey` 取 `DynamicDataSourceContextHolder.getDataSourceType()`）；`DynamicDataSourceContextHolder#setDataSourceType/clearDataSourceType`
- 调用点:
  - `DruidConfig#dataSource(DataSource masterDataSource)`（第 52-60 行）构造 `targetDataSources`，`setDataSource(..., DataSourceType.SLAVE.name(), "slaveDataSource")` 静态注册从库
  - `DataSourceAspect#dsPointCut/around`（第 30-55 行）在 `@DataSource` 注解方法前后切换
- 全部消费者: 目标源仅 MASTER 生效（`slave.enabled=false`）；`DataSourceAspect` 当前无实际注解使用点
- 风险提示: `DruidConfig#setDataSource`（第 69-79 行）使用空 `catch (Exception e) {}` 吞掉所有异常，从库配置错误会被静默忽略（`事实`）

## COMP-kaptcha - 验证码生成

- ID: COMP-kaptcha
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 25、58、80-83 行与 `CaptchaConfig.java`
- 坐标: `pro.fessional:kaptcha`，版本 `2.3.3`（`pom.xml` 第 25 行属性 `kaptcha.version`）；`pom.xml` 第 80-83 行显式排除 `javax.servlet:servlet-api`
- 用途: 生成字符型与算术型图形验证码
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.CaptchaConfig#getKaptchaBean()`（第 18-44 行）Bean 名 `captchaProducer`：`KAPTCHA_SESSION_CONFIG_KEY=kaptchaCode`、宽 160、高 60、字号 38、字符长度 4、字体 `DejaVu Sans,DejaVu Serif`、样式 `ShadowGimpy`
  - `com.qvsu.framework.config.CaptchaConfig#getKaptchaBeanMath()`（第 46-82 行）Bean 名 `captchaProducerMath`：`KAPTCHA_SESSION_CONFIG_KEY=kaptchaCodeMath`、字号 35、字符长度 6、`KAPTCHA_TEXTPRODUCER_IMPL=com.qvsu.framework.config.KaptchaTextCreator`、噪点 `NoNoise`
  - `com.qvsu.framework.config.KaptchaTextCreator`（算术表达式文本生成器）
  - `com.qvsu.web.controller.system.SysCaptchaController`（第 35-39 行 `@Resource(name="captchaProducer")` 与 `@Resource(name="captchaProducerMath")`；第 44 行 `@GetMapping("/captchaImage")`）
  - `com.qvsu.framework.shiro.web.filter.captcha.CaptchaValidateFilter`
- 配置落点: `shiro.user.captchaEnabled=true`、`shiro.user.captchaType=math`、`qvsu.testing.exposeCaptchaCode=false`
- 消费者: `templates/login.html`、`templates/register.html`（页面内引用 `/captcha/captchaImage`）；`CaptchaValidateFilter` 在 `/login`、`/register` 链上校验

## TCA-kaptcha-image - 图形/算术验证码生成能力

- ID: TCA-kaptcha-image
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `CaptchaConfig.java` 与 `SysCaptchaController.java`
- 能力接口: `com.google.code.kaptcha.Producer#createText`、`#createImage(String)`
- 调用点: `com.qvsu.web.controller.system.SysCaptchaController#getKaptchaImage`（第 44-135 行），按 `type` 参数选择 `captchaProducer`（char）或 `captchaProducerMath`（math），输出 `image/jpeg`
- 全部消费者: 登录页 `/login`、注册页 `/register`；以及 `CaptchaValidateFilter` 的会话校验（读取 `kaptchaCode` / `kaptchaCodeMath`）
- 辅助能力: 当 `qvsu.testing.exposeCaptchaCode=true` 时，`SysCaptchaController` 第 116 行的 `if (!exposeCaptchaCode)` 分支被绕过，验证码明文可被接口读出（`事实`，默认 `false`）

## TCA-kaptcha-arithmetic - 算术验证码文本生成能力

- ID: TCA-kaptcha-arithmetic
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `CaptchaConfig#getKaptchaBeanMath` 第 66 行与 `KaptchaTextCreator`
- 能力接口: `com.google.code.kaptcha.text.TextProducer`（由 `com.qvsu.framework.config.KaptchaTextCreator` 实现）
- 调用点: `CaptchaConfig` 第 66 行 `properties.setProperty(KAPTCHA_TEXTPRODUCER_IMPL, "com.qvsu.framework.config.KaptchaTextCreator")`
- 全部消费者: `captchaProducerMath` Bean → `SysCaptchaController#getKaptchaImage`（`type=math` 分支）；`shiro.user.captchaType=math` 使其成为默认类型

## COMP-shiro-core - Shiro 安全内核

- ID: COMP-shiro-core
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 21、59、84 行与 `com/qvsu/framework/shiro/**`
- 坐标: `org.apache.shiro:shiro-core`，版本 `1.13.0`（`pom.xml` 第 21 行属性 `shiro.version`）
- 用途: 认证（Authentication）、授权（Authorization）、会话管理（Session）、加密（Cryptography）、RememberMe
- 源码中的实际使用位置:
  - `com.qvsu.framework.shiro.realm.UserRealm`
  - `com.qvsu.framework.shiro.rememberMe.CustomCookieRememberMeManager`
  - `com.qvsu.framework.shiro.session.{OnlineSession, OnlineSessionDAO, OnlineSessionFactory}`
  - `com.qvsu.framework.shiro.service.{SysLoginService, SysPasswordService, SysRegisterService, SysShiroService}`
  - `com.qvsu.framework.shiro.util.AuthorizationUtils`
  - `com.qvsu.framework.shiro.web.{CustomShiroFilterFactoryBean}`、`web/filter/{LogoutFilter, captcha/CaptchaValidateFilter, csrf/CsrfValidateFilter, kickout/KickoutSessionFilter, online/OnlineSessionFilter, sync/SyncOnlineSessionFilter}`、`web/session/{OnlineWebSessionManager, SpringSessionValidationScheduler}`
  - `com.qvsu.common.utils.ShiroUtils`（`getSysUser`、`getIp`、`getSession`）
  - `com.qvsu.common.constant.ShiroConstants`（`CSRF_TOKEN`、`X_CSRF_TOKEN` 等）
- 消费者: 全部 `/**` 受保护请求；`LogAspect#handleLog`（经 `ShiroUtils.getSysUser()`）；`CsrfValidateFilter`（经 `ShiroUtils.getSession()`）

## TCA-shiro-authentication - 身份认证能力

- ID: TCA-shiro-authentication
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `UserRealm` 与 `SysLoginService`
- 能力接口: `org.apache.shiro.realm.AuthorizingRealm#doGetAuthenticationInfo`（由 `UserRealm` 实现）；`SecurityUtils.getSubject().login(token)`（经 `SysLoginService`）
- 调用点: `com.qvsu.web.controller.system.SysLoginController`（登录入口 `/login`）；`com.qvsu.web.controller.system.SysRegisterController`（注册入口 `/register`）；`com.qvsu.framework.shiro.service.SysLoginService`
- 全部消费者: 登录页 `/login`、注册页 `/register`、`/logout` 流程
- 相关配置: `shiro.user.loginUrl=/login`、`user.password.maxRetryCount=5`

## TCA-shiro-authorization - 权限授权能力

- ID: TCA-shiro-authorization
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `UserRealm`、`PermissionsAspect`、`AuthorizationAttributeSourceAdvisor`
- 能力接口: `AuthorizingRealm#doGetAuthorizationInfo`、`#isPermitted`；`@RequiresPermissions`；`AuthorizationAttributeSourceAdvisor` 切面通知器
- 调用点:
  - `com.qvsu.framework.config.ShiroConfig#authorizationAttributeSourceAdvisor`（第 447-454 行）
  - `com.qvsu.framework.aspectj.PermissionsAspect#doBefore`（第 20 行）
  - `com.qvsu.common.utils.security.PermissionUtils`（异常消息转译）
  - `com.qvsu.framework.web.service.PermissionService`
- 全部消费者: 105 个带 `@RequiresPermissions` 的端点（`事实`，`../tools/semantics.json`）；55 个权限码（`../tools/assets.json` 的 `PermissionCodes`）；`templates/**` 中 `shiro:` 标签（经 COMP-thymeleaf-extras-shiro）

## TCA-shiro-session-persistence - 会话持久化能力

- ID: TCA-shiro-session-persistence
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `OnlineSessionDAO.java`、`OnlineWebSessionManager.java`、`SysShiroService`
- 能力接口: `EnterpriseCacheSessionDAO#doReadSession/doDelete`、`#syncToDb(OnlineSession)`；`SessionManager#getSession`
- 调用点:
  - `OnlineSessionDAO#doReadSession`（第 52-56 行）→ `sysShiroService.getSession(sessionId)`
  - `OnlineSessionDAO#syncToDb`（第 67-101 行）按 `shiro.session.dbSyncPeriod`（分钟）节流，属性变化时强制同步，经 `AsyncManager.me().execute(AsyncFactory.syncSessionToDb(onlineSession))` 异步写库
  - `OnlineSessionDAO#doDelete`（第 106-116 行）置 `OnlineStatus.off_line` 后 `sysShiroService.deleteSession`
- 全部消费者: `SyncOnlineSessionFilter`（链上第 4 位）、`OnlineSessionFilter`（第 3 位）、`KickoutSessionFilter`（第 2 位）、在线用户管理页面（`SysUserOnlineMapper.xml`）
- 相关配置: `shiro.session.expireTime=30`、`dbSyncPeriod=1`、`validationInterval=10`、`maxSession=-1`、`kickoutAfter=false`

## COMP-shiro-spring - Shiro Spring 集成

- ID: COMP-shiro-spring
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 60、85 行与 `ShiroConfig.java`
- 坐标: `org.apache.shiro:shiro-spring`，版本 `1.13.0`
- 用途: `ShiroFilterFactoryBean` 过滤器链装配、`DefaultWebSecurityManager`、Spring 注解通知器、`SimpleCookie`、`AccessControlFilter` 基类
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.ShiroConfig`：`getEhCacheManager()`(第 151-166)、`userRealm()`(196-203)、`sessionDAO()`(208-213)、`sessionFactory()`(218-223)、`sessionManager()`(228-249)、`securityManager()`(254-267)、`logoutFilter()`(272-277)、`csrfValidateFilter()`(282-288)、`shiroFilterFactoryBean()`(293-353)、`onlineSessionFilter()`(358-364)、`syncOnlineSessionFilter()`(369-374)、`captchaValidateFilter()`(379-385)、`rememberMeCookie()`(390-398)、`rememberMeManager()`(403-416)、`kickoutSessionFilter()`(421-433)、`authorizationAttributeSourceAdvisor()`(447-454)
  - `com.qvsu.framework.shiro.web.CustomShiroFilterFactoryBean`
  - 6 个自定义过滤器均继承 `org.apache.shiro.web.filter.AccessControlFilter`（`CsrfValidateFilter` 第 20 行）
- 消费者: 全部 HTTP 请求（`/**` 链）；`GlobalExceptionHandler#handleAuthorizationException`（捕获 `AuthorizationException`）

## TCA-shiro-filter-chain - 过滤器链装配能力

- ID: TCA-shiro-filter-chain
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ShiroConfig.java` 第 293-353 行
- 能力接口: `ShiroFilterFactoryBean#setFilters`、`#setFilterChainDefinitionMap`、`#setLoginUrl`、`#setUnauthorizedUrl`
- 调用点: `ShiroConfig#shiroFilterFactoryBean(SecurityManager)`（第 293-353 行）
- 过滤器链定义（按匹配顺序，`LinkedHashMap` 保序）:
  - `anon` 段：`/favicon.ico**`、`/qvsu.png**`、`/ruoyi.png**`、`/html/**`、`/css/**`、`/docs/**`、`/fonts/**`、`/img/**`、`/ajax/**`、`/js/**`、`/qvsu/**`、`/ruoyi/**`、`/captcha/captchaImage**`、`/captcha/captchaCode**`、`@Anonymous` 收集项、`/open/**`、`/selftest/**`
  - `logout` 段：`/logout`
  - `anon,captchaValidate` 段：`/login`、`/register`
  - 兜底段：`/**` → `user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter`
- 全部消费者: 全部 24 个 Controller 的端点、全部静态资源请求

## TCA-shiro-rememberme - 记住我能力

- ID: TCA-shiro-rememberme
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ShiroConfig.java` 第 260-261、390-416 行与 `CustomCookieRememberMeManager.java`
- 能力接口: `DefaultWebSecurityManager#setRememberMeManager`；`CustomCookieRememberMeManager`（继承 `CookieRememberMeManager`）；`SimpleCookie("rememberMe")`
- 调用点:
  - `ShiroConfig#securityManager`（第 261 行）`securityManager.setRememberMeManager(rememberMe ? rememberMeManager() : null)`，开关来自 `shiro.rememberMe.enabled=true`
  - `ShiroConfig#rememberMeCookie()`（第 390-398 行）`setDomain/setPath/setHttpOnly/setMaxAge(maxAge * 24 * 60 * 60)`
  - `ShiroConfig#rememberMeManager()`（第 403-416 行）密钥来自 `shiro.cookie.cipherKey`，为空则 `CipherUtils.generateNewKey(128, "AES").getEncoded()`
- 全部消费者: 登录页 `templates/login.html` 的「记住我」勾选；`/**` 链第 1 位的 Shiro 内置 `user` 过滤器
- 风险: Cookie 未设置 `SameSite`；`maxAge=30` 按天解释为 30 天；密钥随机生成导致重启后失效（详见 [technical-architecture.md](./technical-architecture.md) 技术债第 8、15 条）

## COMP-shrio-ehcache - Shiro Ehcache 缓存桥

- ID: COMP-shrio-ehcache
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 61、86 行与 `ShiroConfig#getEhCacheManager`
- 坐标: `org.apache.shiro:shiro-ehcache`，版本 `1.13.0`
- 用途: 把 Ehcache 适配为 Shiro 的 `CacheManager`，支撑授权缓存、认证缓存与会话缓存
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.ShiroConfig#getEhCacheManager()`（第 151-166 行）`new EhCacheManager()`，缓存管理器名 `qvsu`，配置来源 `classpath:ehcache/ehcache-shiro.xml`
  - `ShiroConfig#getCacheManagerConfigFileInputStream()`（第 171-191 行）先把配置文件读入 `ByteArrayInputStream`，避免 Ehcache 长期占用配置文件
  - `ShiroConfig#userRealm(EhCacheManager)`（第 200 行）`userRealm.setCacheManager(cacheManager)`
  - `ShiroConfig#kickoutSessionFilter`（第 424 行）`setCacheManager(getEhCacheManager())`
- 消费者: `UserRealm`（授权缓存 `sys-authCache`）、`OnlineWebSessionManager`（`shiro-activeSessionCache`）、`KickoutSessionFilter`

## TCA-shiro-cache-bridge - Shiro 缓存委托能力

- ID: TCA-shiro-cache-bridge
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ShiroConfig#getEhCacheManager` 与 `ehcache-shiro.xml`
- 能力接口: `org.apache.shiro.cache.ehcache.EhCacheManager#setCacheManager`、`#getCache(String)`
- 调用点: `ShiroConfig#getEhCacheManager()`（第 151-166 行）；`ShiroConfig#getCacheManagerConfigFileInputStream()`（第 171-191 行）
- 缓存名清单（`ehcache/ehcache-shiro.xml`）: `defaultCache`(空闲 3600s/存活 3600s)、`loginRecordCache`(空闲 600s)、`sys-userCache`、`sys-authCache`(LRU、不过期)、`sys-cache`、`sys-config`、`sys-dict`、`shiro-activeSessionCache`
- 全部消费者: `UserRealm`、`OnlineWebSessionManager`、`KickoutSessionFilter`、`SysPasswordService`（`loginRecordCache` 实现密码重试锁定）

## COMP-ehcache - Ehcache 缓存引擎

- ID: COMP-ehcache
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `ShiroConfig.java` 第 154-165 行直接引用 `net.sf.ehcache.CacheManager`
- 坐标: `net.sf.ehcache:ehcache`，版本 `2.10.9.2`（`推断`：`pom.xml` 未直接声明，由 `shiro-ehcache:1.13.0` 传递；版本号取自 Shiro 1.13.0 的依赖链）
- 用途: 进程内堆缓存，提供授权缓存、会话缓存、密码重试计数与系统参数/字典缓存
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.ShiroConfig#getEhCacheManager()`（第 154 行 `net.sf.ehcache.CacheManager.getCacheManager("qvsu")`；第 158 行 `new net.sf.ehcache.CacheManager(...)`）
  - 配置文件 `resources/ehcache/ehcache-shiro.xml`（`<ehcache name="qvsu" updateCheck="false">`，`diskStore path="java.io.tmpdir"`）
- 消费者: `ShiroConfig` 全部缓存相关 Bean；`SysPasswordService`（重试锁定）；`ConfigService`/`DictService`（`sys-config`/`sys-dict` 缓存名定义存在，具体调用点在 `framework/web/service/{ConfigService,DictService}.java`）

## TCA-ehcache-embedded - 进程内堆缓存能力

- ID: TCA-ehcache-embedded
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ehcache-shiro.xml` 全部 `<cache>` 定义
- 能力接口: `net.sf.ehcache.CacheManager#getCache(String)`、`Cache#get/put/removeAll`；`CacheManager#getCacheManager(String)`
- 调用点: `ShiroConfig#getEhCacheManager()`；配置 `ehcache/ehcache-shiro.xml` 第 2、16-88 行
- 全部消费者: 见 COMP-shrio-ehcache 的 TCA-shiro-cache-bridge 消费者清单
- 风险提示: 全部缓存为**单 JVM 进程内**实现，水平扩展时授权缓存与会话缓存不共享（`事实`，无 Redis/分布式缓存组件）

## TCA-ehcache-login-record - 登录重试计数缓存能力

- ID: TCA-ehcache-login-record
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `ehcache-shiro.xml` 第 25-32 行与 `messages.properties` 锁定文案
- 能力接口: `Cache#get/put`（缓存名 `loginRecordCache`）
- 调用点: `ehcache-shiro.xml` 第 25-32 行定义 `loginRecordCache`（`maxEntriesLocalHeap=2000`、`timeToIdleSeconds=600`）；调用方为 `com.qvsu.framework.shiro.service.SysPasswordService`
- 全部消费者: 登录失败的密码重试限制流程（上限由 `user.password.maxRetryCount=5` 控制；提示语 `user.password.retry.limit.exceed=密码输入错误{0}次，帐户锁定10分钟`）
- 证据缺口: 未逐行读取 `SysPasswordService` 的缓存键构造，`推断` 其使用该缓存名（依据：缓存名语义 + 600 秒与「锁定 10 分钟」一致）

## COMP-thymeleaf-extras-shiro - 模板权限标签

- ID: COMP-thymeleaf-extras-shiro
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 22、62、87 行与 `ShiroConfig#shiroDialect`
- 坐标: `com.github.theborakompanioni:thymeleaf-extras-shiro`，版本 `2.1.0`（`pom.xml` 第 22 行属性 `thymeleaf.extras.shiro.version`）
- 用途: 在 Thymeleaf 模板中按权限/角色条件渲染 DOM
- 源码中的实际使用位置: `com.qvsu.framework.config.ShiroConfig#shiroDialect()`（第 438-442 行）注册 `at.pollux.thymeleaf.shiro.dialect.ShiroDialect` Bean
- 消费者: `templates/**` 中使用 `shiro:hasPermission` / `shiro:hasRole` / `shiro:principal` 的页面（如菜单与按钮按权限显隐）；配合后端 105 个 `@RequiresPermissions` 端点形成前后端一致控制

## TCA-shiro-template-taglib - 模板权限条件渲染能力

- ID: TCA-shiro-template-taglib
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ShiroConfig#shiroDialect()` 与 `ShiroDialect` 方言注册
- 能力接口: `at.pollux.thymeleaf.shiro.dialect.ShiroDialect` 提供的 `shiro:hasPermission`、`shiro:lacksPermission`、`shiro:hasRole`、`shiro:principal`、`shiro:authenticated`、`shiro:guest` 等属性处理器
- 调用点: `ShiroConfig#shiroDialect()`（第 438-442 行）
- 全部消费者: 144 个模板中依赖按钮级权限显隐的页面；权限码来源为 `../tools/assets.json` 的 `PermissionCodes`（55 个）与 `../tools/menus.json` 中 111 个 F 类按钮权限

## COMP-pagehelper - 物理分页

- ID: COMP-pagehelper
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 26、64、88 行与 `application.yml` 第 88-91 行
- 坐标: `com.github.pagehelper:pagehelper-spring-boot-starter`，版本 `1.4.7`（`pom.xml` 第 26 行属性 `pagehelper.boot.version`）
- 用途: MyBatis 物理分页拦截，自动改写 SQL 并执行 count 查询
- 源码中的实际使用位置:
  - 配置 `application.yml` 第 88-91 行 `helperDialect: postgresql`、`supportMethodsArguments: true`、`params: count=countSql`
  - `deploy/local-docker/conf/application-docker-local.yml` 第 10-11 行再次覆盖 `helperDialect: postgresql`
  - Mapper 层调用 `PageHelper.startPage(...)`（位于 `com.qvsu.system.service.impl.*` 与 `com.qvsu.quartz.service.impl.SysJobServiceImpl`）
  - 返回结构 `com.qvsu.common.core.page.TableDataInfo`（配合 `BaseController#getDataTable`）
- 消费者: 全部列表页的 bootstrap-table 服务端分页请求（用户、角色、菜单、部门、岗位、字典、参数、通知公告、操作日志、登录日志、在线用户、定时任务、调度日志、OpenAPI 应用/接口/授权/调用日志/文档）

## TCA-pagehelper-dialect-paging - 方言化物理分页能力

- ID: TCA-pagehelper-dialect-paging
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `application.yml` 第 89 行与 `application-docker-local.yml` 第 11 行
- 能力接口: `com.github.pagehelper.PageHelper#startPage(int, int)`、`PageInfo`；`helperDialect` 方言选择器
- 调用点: Service 实现类的列表查询方法；`params: count=countSql` 使 count 查询复用 `countSql` 命名语句
- 全部消费者: 所有返回 `TableDataInfo` 的列表端点

## TCA-pagehelper-count-optimize - count 查询优化能力

- ID: TCA-pagehelper-count-optimize
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `application.yml` 第 91 行 `params: count=countSql`
- 能力接口: PageHelper `params` 参数（`count` → `countSql`）
- 调用点: `application.yml` 第 91 行；Mapper XML 中 id 为 `countSql` 的语句（如 `SysUserMapper.xml` 等）被优先用于统计
- 全部消费者: 与 TCA-pagehelper-dialect-paging 相同；当 Mapper 未提供 `countSql` 时回退为默认 count 改写（`推断`）

## COMP-commons-lang3 - 通用工具库

- ID: COMP-commons-lang3
- 状态: active
- 结论级别: 事实（版本为推断）
- 最后核验: 2026-03-27，依据 `pom.xml` 第 89 行与全仓 import
- 坐标: `org.apache.commons:commons-lang3`，版本 `3.12.0`（`pom.xml` 未显式声明版本，`推断` 取自 `spring-boot-dependencies:2.7.18` 的 `commons-lang3.version`）
- 用途: 字符串、日期、数组、反射、异常、并发工具
- 源码中的实际使用位置（代表性且有索引意义的调用点）:
  - `com.qvsu.common.utils.StringUtils extends org.apache.commons.lang3.StringUtils`（第 18 行）
  - `com.qvsu.common.utils.DateUtils extends org.apache.commons.lang3.time.DateUtils`（第 19 行）
  - `com.qvsu.framework.aspectj.LogAspect`（第 7 行 `ArrayUtils`；第 197 行 `ArrayUtils.addAll`）
  - `com.qvsu.common.config.thread.ThreadPoolConfig`（第 6 行 `BasicThreadFactory`）
  - `com.qvsu.common.core.text.Convert`（第 11 行 `ArrayUtils`）
  - `com.qvsu.common.utils.ExceptionUtil`（第 5 行 `ExceptionUtils`）
  - `com.qvsu.common.utils.file.FileUtils`（第 16 行 `ArrayUtils`）、`FileTypeUtils`（第 4 行 `StringUtils`）、`FileUploadUtils`（第 7 行 `FilenameUtils` 来自 commons-io）
  - `com.qvsu.common.utils.poi.ExcelUtil`（第 27-29 行 `ArrayUtils`/`RegExUtils`/`FieldUtils`）
  - 全部 domain 实体的 `toString()`（约 20 个类使用 `ToStringBuilder`/`ToStringStyle`）
- 消费者: 几乎全部业务包

## TCA-lang3-string-util - 字符串与数组工具能力

- ID: TCA-lang3-string-util
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `StringUtils` 继承关系与调用点
- 能力接口: `org.apache.commons.lang3.StringUtils`（经 `com.qvsu.common.utils.StringUtils` 暴露，含 `isAnyBlank`、`str2List`、`matches`、`substring`、`split`、`defaultIfEmpty`、`equalsIgnoreCase` 等）
- 调用点: `ShiroConfig` 第 25-26、286、322、407 行；`CsrfValidateFilter` 第 36、47 行；`OpenApiSecurityService` 第 79、132、139 行；`OpenApiProxyService` 第 75、111-113 行；`XssFilter` 第 66 行
- 全部消费者: 框架层全部配置类与切面、OpenAPI 网关链路、系统管理域 Service

## TCA-lang3-date-util - 日期时间工具能力

- ID: TCA-lang3-date-util
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `com.qvsu.common.utils.DateUtils` 与 `OnlineWebSessionManager` 第 7 行
- 能力接口: `org.apache.commons.lang3.time.DateUtils`（经 `DateUtils` 暴露 `DateFormatUtils` 等）
- 调用点: `com.qvsu.common.utils.DateUtils`（第 12、19 行）；`com.qvsu.framework.shiro.web.session.OnlineWebSessionManager`（第 7 行）
- 全部消费者: 列表页时间格式化、在线会话最后访问时间计算、登录/操作日志时间字段

## COMP-jackson-databind - Jackson JSON

- ID: COMP-jackson-databind
- 状态: active
- 结论级别: 事实（版本为推断）
- 最后核验: 2026-03-27，依据 `pom.xml` 第 90 行与 `application.yml` 第 60-62 行
- 坐标: `com.fasterxml.jackson.core:jackson-databind`，版本 `2.13.5`（`推断`，取自 `spring-boot-dependencies:2.7.18`）
- 用途: Spring MVC 默认 `HttpMessageConverter` 的 JSON 序列化/反序列化，统一日期格式与时区
- 源码中的实际使用位置:
  - `application.yml` 第 60-62 行 `spring.jackson.time-zone: GMT+8`、`spring.jackson.date-format: yyyy-MM-dd HH:mm:ss`
  - `com.qvsu.common.config.serializer.SensitiveJsonSerializer`（第 23 行 `DesensitizedType`，第 48 行 `prov.findValueSerializer`）——基于 Jackson 的自定义脱敏序列化器
- 消费者: 全部返回 `AjaxResult`/`TableDataInfo`/实体对象的 `@ResponseBody` 端点；`@JsonSerialize(using = SensitiveJsonSerializer.class)` 标注的敏感字段

## TCA-jackson-message-converter - HTTP JSON 编解码能力

- ID: TCA-jackson-message-converter
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `application.yml` 第 60-62 行与 `SensitiveJsonSerializer`
- 能力接口: `MappingJackson2HttpMessageConverter`（容器自动装配）；`JsonSerializer<T>#serialize`（自定义扩展点）
- 调用点: `com.qvsu.common.config.serializer.SensitiveJsonSerializer#serialize`（第 48 行附近）对用户名/手机号/身份证等字段做脱敏输出
- 全部消费者: 全部 Ajax 端点响应；数据脱敏作用于使用该注解的 domain 字段（`SysUser` 等）

## COMP-fastjson - Fastjson

- ID: COMP-fastjson
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 27、67、91 行与 6 处 import
- 坐标: `com.alibaba:fastjson`，版本 `1.2.83`（`pom.xml` 第 27 行属性 `fastjson.version`）
- 用途: 高性能 JSON 解析与序列化，被用于网关响应包装、签名参数提取、操作日志参数序列化、定时任务参数解析
- 源码中的实际使用位置:
  - `com.qvsu.framework.aspectj.LogAspect`（第 19-20 行 `JSONObject`、`PropertyPreFilters`；第 178、214 行 `JSONObject.toJSONString(..., excludePropertyPreFilter(...))`）
  - `com.qvsu.open.controller.OpenGatewayController`（第 3 行 `JSON`；第 50、66、82、92、111、131 行）
  - `com.qvsu.open.service.OpenApiSecurityService`（第 3-4 行；第 166 行 `JSON.parseObject(body)`）
  - `com.qvsu.open.filter.OpenApiFilter`（第 3 行；第 153 行 `JSON.toJSONString(OpenResult.fail(...))`）
  - `com.qvsu.open.doc.ApiDocService`（第 3-4 行）
  - `com.qvsu.open.controller.OpenSelftestHttpbinController`（第 3-4 行）
  - `com.qvsu.quartz.util.JobInvokeUtil`（第 14-15 行）、`com.qvsu.quartz.task.HttpTask`（第 12-13 行）
  - `com.qvsu.common.utils.AddressUtils`（第 5 行）
- 消费者: `OpenApiFilter`、`OpenGatewayController`、`OpenApiSecurityService`、`LogAspect`、`JobInvokeUtil`、`HttpTask`、`AddressUtils`、`ApiDocService`、`OpenSelftestHttpbinController`

## TCA-fastjson-json-parse - JSON 解析与序列化能力

- ID: TCA-fastjson-json-parse
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据上列 6 处 import 与调用行号
- 能力接口: `com.alibaba.fastjson.JSON#parse/parseObject/toJSONString`、`JSONObject#forEach/getString`
- 调用点:
  - `OpenApiSecurityService#extractBizParams`（第 166 行）把 JSON body 展平为待签名参数
  - `OpenGatewayController` 第 111 行解析下游响应体（解析失败则按纯文本处理，第 113-116 行）
  - `OpenApiFilter#writeError`（第 153 行）序列化错误响应
  - `LogAspect#setRequestValue`（第 178 行）序列化请求参数
- 全部消费者: 见 COMP-fastjson 的消费者清单

## TCA-fastjson-property-filter - 属性排除序列化能力

- ID: TCA-fastjson-property-filter
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `LogAspect.java` 第 45、195-198 行
- 能力接口: `com.alibaba.fastjson.support.spring.PropertyPreFilters.MySimplePropertyPreFilter#addExcludes`
- 调用点: `LogAspect#excludePropertyPreFilter(String[])`（第 195-198 行），排除项为常量 `EXCLUDE_PROPERTIES = { "password", "oldPassword", "newPassword", "confirmPassword" }` 与注解 `@Log(excludeParamNames=...)` 的并集
- 全部消费者: 所有 `@Log` 标注方法的操作日志参数记录（有效避免密码明文入库）

## COMP-commons-io - IO 工具库

- ID: COMP-commons-io
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 28、65、92 行与 4 处 import
- 坐标: `commons-io:commons-io`，版本 `2.21.0`（`pom.xml` 第 28 行属性 `commons.io.version`）
- 用途: 流读写、文件与文件名工具
- 源码中的实际使用位置:
  - `com.qvsu.framework.config.ShiroConfig`（第 10 行 `IOUtils`；第 178 行 `IOUtils.toByteArray(inputStream)`；第 189 行 `IOUtils.closeQuietly`）
  - `com.qvsu.common.utils.file.FileUtils`（第 14-15 行 `FilenameUtils`、`IOUtils`）
  - `com.qvsu.common.utils.file.FileUploadUtils`（第 7 行 `FilenameUtils`）
- 消费者: `ShiroConfig`（Ehcache 配置流加载）、文件上传下载公共入口 `CommonController`、头像/文件工具链

## TCA-commons-io-stream - 流与文件操作能力

- ID: TCA-commons-io-stream
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ShiroConfig` 第 171-191 行与 `FileUtils`、`FileUploadUtils`
- 能力接口: `org.apache.commons.io.IOUtils#toByteArray/closeQuietly`、`org.apache.commons.io.FilenameUtils#getExtension/getBaseName`
- 调用点: `ShiroConfig#getCacheManagerConfigFileInputStream`（第 171-191 行）；`FileUploadUtils` 的文件名/后缀处理；`FileUtils` 的下载文件名处理
- 全部消费者: Shiro 缓存初始化、文件上传端点、文件下载端点

## COMP-poi-ooxml - Excel 读写

- ID: COMP-poi-ooxml
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 29、66、93 行与 `ExcelUtil.java` 的 40 余处 import
- 坐标: `org.apache.poi:poi-ooxml`，版本 `4.1.2`（`pom.xml` 第 29 行属性 `poi.version`）
- 用途: Excel（.xls/.xlsx）导入导出、单元格样式、数据校验下拉、图片嵌入
- 源码中的实际使用位置:
  - `com.qvsu.common.utils.poi.ExcelUtil`（第 30-69 行 import 覆盖 `HSSFWorkbook`、`XSSFWorkbook`、`SXSSFWorkbook`、`WorkbookFactory`、`CellStyle`、`DataValidation` 等；实现 `exportExcel`/`importExcel` 全流程）
  - `com.qvsu.common.utils.poi.ExcelHandlerAdapter`（第 3-4 行 `Cell`、`Workbook`）
  - `com.qvsu.common.annotation.Excel`（第 8-9 行 `HorizontalAlignment`、`IndexedColors`）
  - `com.qvsu.common.utils.reflect.ReflectUtils`（第 13 行 `DateUtil`）
  - `com.qvsu.common.utils.file.ImageUtils`（第 9 行 `org.apache.poi.util.IOUtils`）
- 消费者: 各管理页面的「导出」按钮对应的 Controller 方法（用户、角色、菜单、部门、岗位、字典、参数、通知公告、操作日志、登录日志等）；`@Excel` 注解标注 domain 字段

## TCA-poi-excel-export - Excel 导出能力

- ID: TCA-poi-excel-export
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ExcelUtil` 与 `@Excel` 注解
- 能力接口: `ExcelUtil<T>#exportExcel(HttpServletResponse, List<T>, String)`；`@Excel(name=..., dateFormat=..., readConverterExp=..., type=...)`
- 调用点: 各 Controller 的导出方法（经 `BaseController` 的响应封装）；`ExcelUtil` 内部使用 `SXSSFWorkbook` 流式写出
- 全部消费者: 列表页导出的全部业务域（系统管理域 + 调度域 + OpenAPI 管理域）

## TCA-poi-excel-import - Excel 导入能力

- ID: TCA-poi-excel-import
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `ExcelUtil` 与 `ExcelHandlerAdapter`
- 能力接口: `ExcelUtil<T>#importExcel(InputStream, Class<T>)`、`#importTemplateExcel(...)`；`ExcelHandlerAdapter#format(Object, String, Object[])` 自定义转换扩展点
- 调用点: `com.qvsu.common.utils.poi.ExcelUtil`；`ExcelHandlerAdapter` 实现类由业务方提供（`SysUser` 等导入场景）
- 全部消费者: 各管理页面的「导入」按钮对应端点（用户导入为典型场景）

## COMP-yauaa - User-Agent 解析

- ID: COMP-yauaa
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `pom.xml` 第 24、63、94 行与 `UserAgentUtils.java`
- 坐标: `nl.basjes.parse.useragent:yauaa`，版本 `7.32.0`（`pom.xml` 第 24 行属性 `yauaa.version`）
- 用途: 解析 UA 字符串，提取浏览器、操作系统、设备类型
- 源码中的实际使用位置: `com.qvsu.common.utils.http.UserAgentUtils`（第 6-7 行 `UserAgent`、`UserAgentAnalyzer`；第 39 行 `private static final UserAgentAnalyzer userAgentAnalyzer = UserAgentAnalyzer...`）
- 消费者: 在线用户列表（`sys_user_online`）的浏览器/操作系统列展示；登录日志（`sys_logininfor`）的浏览器字段

## TCA-yauaa-parse - UA 解析能力

- ID: TCA-yauaa-parse
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `UserAgentUtils.java` 第 39 行
- 能力接口: `nl.basjes.parse.useragent.UserAgentAnalyzer#parse(String)` → `UserAgent#getValue(String)`
- 调用点: `UserAgentUtils` 的静态 `userAgentAnalyzer` 实例（单例，类加载时构建）
- 全部消费者: 在线用户查询端点、登录日志查询端点
- 性能提示: `UserAgentAnalyzer` 构建开销较大，源码用静态 final 字段规避重复构建（`事实`）

## COMP-aspectjweaver - AspectJ 织入

- ID: COMP-aspectjweaver
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `pom.xml` 第 75 行引入 `spring-boot-starter-aop` 与 4 个 `@Aspect` 类
- 坐标: `org.aspectj:aspectjweaver`，版本 `1.9.7`（`推断`：`pom.xml` 未直接声明，由 `spring-boot-starter-aop` 传递；版本取自 Spring Boot 2.7.18 的 `aspectj.version` 属性）
- 用途: 提供 AspectJ 注解与织入基础设施，使 `@Aspect`/`@Pointcut`/`@Around` 生效
- 源码中的实际使用位置: `com.qvsu.framework.aspectj.{LogAspect, DataScopeAspect, PermissionsAspect, DataSourceAspect}` 的 import 与注解
- 消费者: 同上四类切面所服务的全部被切方法

## TCA-aspectj-weaving - 注解织入能力

- ID: TCA-aspectj-weaving
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `ApplicationConfig` 第 14 行与 4 个切面类
- 能力接口: `org.aspectj.lang.JoinPoint`、`ProceedingJoinPoint#proceed()`、`@Pointcut` 表达式
- 调用点: `DataSourceAspect#around(ProceedingJoinPoint joinPoint)`（第 37-55 行，唯一使用 `proceed()` 的切面）；其余三个切面仅用 `@Before`/`@AfterReturning`/`@AfterThrowing`
- 全部消费者: 见 TCA-aop-aspect-proxy 的消费者清单
- 证据缺口: 织入方式（Spring AOP 代理 vs AspectJ 编译期织入）未在构建配置中显式声明，`推断` 为 Spring AOP 运行期代理（依据：未引入 `aspectj-maven-plugin`）

---

# 4. 前端组件节点

> 前端组件的能力接口统一为「浏览器全局对象暴露的初始化方法/插件方法」，调用点为模板内联 `<script>` 或 `ruoyi/js/*.js` 封装。引用模板数由 `include ::` 片段聚合统计与全文关键词统计得出（`事实`）。

## COMP-jquery - jQuery

- ID: COMP-jquery
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 23 行与 `static/js/jquery.min.js`
- 坐标: 本地文件 `static/js/jquery.min.js`，URL 版本标识 `?v=3.7.1`
- 用途: DOM 操作、Ajax、事件绑定；全部前端插件的基础依赖
- 源码中的实际使用位置:
  - `templates/include.html` 第 23 行 `<script th:src="@{/js/jquery.min.js?v=3.7.1}"></script>`（位于 `footer` 片段，128 个页面复用）
  - `templates/open/app/index.html` 第 46-70 行 `$(function(){...})`、`$.table.init(options)`、第 73-82 行 `$.modal.confirm` + `$.post`
  - `templates/login.html`、`templates/register.html`、`templates/index.html`、`templates/main_v1.html`
- 消费者: 全部 144 个页面模板（`header`/`footer` 片段）、`static/ruoyi/js/common.js`、`static/ruoyi/js/ry-ui.js`、全部 `ajax/libs/**` 插件

## TCA-jquery-dom-ajax - DOM 操作与 Ajax 能力

- ID: TCA-jquery-dom-ajax
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 与 `ruoyi/js/common.js` 引用
- 能力接口: `jQuery(selector)`、`$.ajax`/`$.post`/`$.get`、`$(...).on()`、`$.each`
- 调用点: `templates/open/app/index.html` 第 74 行 `$.post(prefix + "/resetSecret", {id: id}, function(result){...})`；`templates/include.html` 第 21 行内联脚本使用 `$` 与 `window.top.location`
- 全部消费者: 全部列表页与表单页；所有前端插件库

## COMP-bootstrap - Bootstrap 3（JS + CSS）

- ID: COMP-bootstrap
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 10、24 行与 `static/css/bootstrap.min.css`
- 坐标: 本地文件 `static/css/bootstrap.min.css`、`static/js/bootstrap.min.js`，URL 版本标识 `?v=3.4.1`
- 用途: 栅格布局、按钮、表单、模态框、下拉、标签、面板等基础 UI
- 源码中的实际使用位置:
  - `templates/include.html` 第 10 行 CSS、第 24 行 JS
  - `templates/open/app/index.html` 第 8-40 行使用 `container-div`、`row`、`col-sm-12`、`search-collapse`、`btn btn-primary btn-rounded btn-sm`、`btn-group-sm`、`table-striped`、`label label-primary` 等类
  - `static/fonts/glyphicons-halflings-regular.*` 为 Bootstrap 3 自带图标字体
- 消费者: 全部 144 个模板；`static/css/{style.min.css, animate.min.css, skins.css}`、`static/ruoyi/css/ry-ui.css` 均在其之上覆写

## TCA-bootstrap-grid-component - 响应式栅格与 UI 组件能力

- ID: TCA-bootstrap-grid-component
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 与 `include.html`
- 能力接口: Bootstrap 3 的 CSS 栅格类（`row`/`col-sm-*`）、`.btn` 系列、`.label`、`.modal`、`.form-control`，以及 JS 插件 `$(...).modal()`、`$(...).dropdown()`、`$(...).tooltip()`
- 调用点: `templates/open/app/index.html` 第 8-40 行；`templates/include.html` 第 10、24 行
- 全部消费者: 全部 144 个模板

## COMP-fontawesome - FontAwesome 图标字体（仅连接资源）

- ID: COMP-fontawesome
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 11 行与 `static/fonts/FontAwesome.otf` 等 6 个字体文件
- 坐标: `static/css/font-awesome.min.css`，URL 版本标识 `?v=4.7.0`；字体文件 `static/fonts/{FontAwesome.otf, fontawesome-webfont.eot/svg/ttf/woff/woff2}`
- 用途: 纯 CSS 图标字体，无 JS API
- 源码中的实际使用位置: `templates/include.html` 第 11 行引入；图标类被大量内联使用，如 `templates/open/app/index.html` 第 24 行 `<i class="fa fa-search">`、第 33 行 `<i class="fa fa-plus">`、第 63 行 `<i class="fa fa-edit">`、第 65 行 `<i class="fa fa-key">`
- **仅连接资源、无自有能力接口**：该组件只提供 CSS 类与字体资源，不存在可调用的能力接口；其效果完全由使用方的 `class` 属性决定。因此不定义 `TCA-*` 节点。
- 消费者: 全部模板的按钮/菜单图标；菜单表 `sys_menu.icon` 字段（如 `open-api/sql/open_api_menu.sql` 中的 `fa fa-plug`）

## COMP-bootstrap-table - bootstrap-table

- ID: COMP-bootstrap-table
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 13、26-27 行与 `static/ajax/libs/bootstrap-table/`
- 坐标: `static/ajax/libs/bootstrap-table/bootstrap-table.min.js` + `bootstrap-table.min.css` + `locale/bootstrap-table-zh-CN.min.js`，URL 版本标识 `?v=1.24.1`
- 用途: 服务端分页表格渲染、行选择、工具栏、列格式化、排序
- 源码中的实际使用位置:
  - `templates/include.html` 第 13 行 CSS、第 26-27 行 JS（全局 `footer` 片段）
  - `templates/open/app/index.html` 第 39 行 `<table id="bootstrap-table"></table>`；第 47-69 行 `$.table.init({url, createUrl, updateUrl, removeUrl, modalName, columns})`；第 77 行 `$.table.refresh()`
  - `templates/open/log/index.html` 第 30 行、`templates/monitor/job/jobLog.html` 第 61 行、`templates/demo/operate/table.html` 第 33 行、`templates/demo/modal/table/radio.html` 第 10 行
- 消费者: 全部列表页（系统管理域、调度域、OpenAPI 管理域）；封装层 `static/ruoyi/js/ry-ui.js` 的 `$.table` 命名空间

## TCA-bootstraptable-server-paging - 服务端分页表格能力

- ID: TCA-bootstraptable-server-paging
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 第 47-69 行与 `ruoyi/js/ry-ui.js` 的 `$.table.init`
- 能力接口: `$.table.init(options)`、`$.table.search()`、`$.table.refresh()`；bootstrap-table 原生 `$('#table').bootstrapTable({url, columns, sidePagination:'server'})`
- 调用点: `templates/open/app/index.html` 第 49 行 `url: prefix + "/list"`、第 53-67 行 `columns`（含 `checkbox` 列、`formatter` 列、操作列）；第 24 行 `$.table.search()`；第 25 行 `$.form.reset()`
- 全部消费者: 全部 25 个以上列表页（对应后端 `TableDataInfo` 响应的全部列表端点）

## TCA-bootstraptable-column-formatter - 列格式化与操作列能力

- ID: TCA-bootstraptable-column-formatter
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 第 58、61-67 行
- 能力接口: 列定义 `formatter: function(value, row, index)`、`{ checkbox: true }`
- 调用点: `templates/open/app/index.html` 第 58 行状态列渲染 `label label-primary`/`label label-danger`；第 61-67 行操作列拼接 `编辑`/`删除`/`重置密钥` 三个带 `onclick` 的按钮
- 全部消费者: 全部列表页的操作列与状态列

## COMP-bootstrap-table-mobile - bootstrap-table mobile 扩展

- ID: COMP-bootstrap-table-mobile
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 28 行
- 坐标: `static/ajax/libs/bootstrap-table/extensions/mobile/bootstrap-table-mobile.js`，`?v=1.24.1`
- 用途: 小屏下把表格行转为卡片视图
- 源码中的实际使用位置: `templates/include.html` 第 28 行（全局 `footer` 片段）
- 消费者: 全部 144 个模板的 `footer` 片段使用方

## TCA-bootstraptable-mobile-view - 移动端表格适配能力

- ID: TCA-bootstraptable-mobile-view
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 28 行
- 能力接口: bootstrap-table `mobile` 扩展选项（`mobileResponsive`、`cardView`）
- 调用点: `templates/include.html` 第 28 行引入；由 `ruoyi/js/ry-ui.js` 的 `$.table.init` 默认选项启用
- 全部消费者: 全部列表页

## COMP-bootstrap-table-tree - bootstrap-table tree 扩展

- ID: COMP-bootstrap-table-tree
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 34 行
- 坐标: `static/ajax/libs/bootstrap-table/extensions/tree/bootstrap-table-tree.min.js`，`?v=1.24.1`
- 用途: 树形表格（父子行折叠展开），用于菜单管理、部门管理
- 源码中的实际使用位置: `templates/include.html` 第 34 行（全局 `footer` 片段）
- 消费者: 菜单管理页 `/system/menu`、部门管理页 `/system/dept`

## TCA-bootstraptable-tree-render - 树形表格渲染能力

- ID: TCA-bootstraptable-tree-render
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 34 行与菜单/部门实体自引用结构
- 能力接口: bootstrap-table 列选项 `treeShowField`、`parentIdField`、`idField`
- 调用点: `templates/include.html` 第 34 行引入；`templates/system/menu/index.html`、`templates/system/dept/index.html` 的 `$.table.init` 配置
- 全部消费者: 菜单管理页、部门管理页

## COMP-jquery-validate - jQuery Validate

- ID: COMP-jquery-validate
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 30-32 行与 `static/ajax/libs/validate/`
- 坐标: `jquery.validate.min.js` + `jquery.validate.extend.js` + `messages_zh.js`（+ 未被引用的 `additional-methods.min.js`），`?v=1.21.0`
- 用途: 表单客户端校验、中文错误消息、自定义校验扩展
- 源码中的实际使用位置:
  - `templates/include.html` 第 30-32 行（全局 `footer` 片段）
  - `templates/login.html` 第 76 行、`templates/register.html` 第 71 行单独引入
  - 表单页 `templates/**/{add,edit}.html` 通过 `$.validate.form()` 封装调用（`static/ruoyi/js/ry-ui.js`）
- 消费者: 全部新增/修改表单页；登录页；注册页

## TCA-validate-form-rule - 表单校验能力

- ID: TCA-validate-form-rule
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 30-32 行与 `login.html`/`register.html`
- 能力接口: `$(form).validate({rules, messages})`、`$.validator.addMethod`（由 `jquery.validate.extend.js` 扩展）、`$.validate.form()`（`ry-ui.js` 封装）
- 调用点: `templates/login.html` 第 76 行、`templates/register.html` 第 71 行；全部 `*/add.html`、`*/edit.html`
- 全部消费者: 登录/注册/用户/角色/菜单/部门/岗位/字典/参数/通知公告/OpenAPI 应用/OpenAPI 接口的新增与修改表单
- 相关配置: `messages.properties` 的 `user.username.not.valid`、`user.password.not.valid`、`user.email.not.valid`、`user.mobile.phone.number.not.valid`、`length.not.valid`、`not.null` 等消息键为服务端同名校验文案

## COMP-blockui - jQuery BlockUI

- ID: COMP-blockui
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 36 行
- 坐标: `static/ajax/libs/blockUI/jquery.blockUI.js`，`?v=2.70.0`
- 用途: Ajax 请求期间的页面遮罩与加载提示
- 源码中的实际使用位置: `templates/include.html` 第 36 行、`templates/login.html` 第 78 行、`templates/register.html` 第 73 行
- 消费者: 全部 Ajax 操作（经 `ruoyi/js/common.js` 的请求拦截封装）

## TCA-blockui-mask - 请求遮罩能力

- ID: TCA-blockui-mask
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `include.html` 第 36 行引入与 `ruoyi/js/common.js` 存在
- 能力接口: `$.blockUI({message, css})`、`$.unblockUI()`
- 调用点: `static/ruoyi/js/common.js` 的 Ajax 全局事件（`ajaxStart`/`ajaxStop`）中调用（`推断`：未逐行读取该封装文件）
- 全部消费者: 全部 Ajax 交互页面

## COMP-icheck - iCheck

- ID: COMP-icheck
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 37 行
- 坐标: `static/ajax/libs/iCheck/icheck.min.js`（样式 `iCheck/custom.css` 存在但未被片段引用），`?v=1.0.3`
- 用途: 美化复选框/单选框
- 源码中的实际使用位置: `templates/include.html` 第 37 行（全局 `footer` 片段）
- 消费者: 表单页与列表页的复选框（含 bootstrap-table 的 `checkbox` 列）

## TCA-icheck-skin - 复选框美化能力

- ID: TCA-icheck-skin
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `include.html` 第 37 行
- 能力接口: `$(selector).iCheck({checkboxClass, radioClass})`
- 调用点: `static/ruoyi/js/ry-ui.js` 的表单/表格初始化逻辑（`推断`）
- 全部消费者: 表单页复选框、列表页多选列

## COMP-layer - layer 弹层

- ID: COMP-layer
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 38 行
- 坐标: `static/ajax/libs/layer/layer.min.js` + `layer/css/layer.css` + `layer/theme/moon/style.css`，`?v=3.7.0`
- 用途: 弹层、确认框、消息提示、iframe 弹窗（用于新增/修改页）
- 源码中的实际使用位置: `templates/include.html` 第 38 行；`templates/open/app/index.html` 第 73 行 `$.modal.confirm(...)`、第 76 行 `$.modal.alertSuccess(...)`、第 79 行 `$.modal.alertError(...)`
- 消费者: 全部弹窗型交互（`$.modal.open`/`$.modal.confirm`/`$.modal.alert*`，封装于 `ruoyi/js/ry-ui.js`）

## TCA-layer-modal - 弹层与消息提示能力

- ID: TCA-layer-modal
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 第 73-82 行
- 能力接口: `$.modal.confirm(msg, callback)`、`$.modal.alertSuccess(msg)`、`$.modal.alertError(msg)`、`$.modal.open(title, url)`、`$.modal.close()`
- 调用点: `templates/open/app/index.html` 第 73 行 `$.modal.confirm("确认重置密钥吗？", function(){...})`；第 76、79 行 `alertSuccess`/`alertError`；第 33-35 行 `$.operate.add()/edit()/removeAll()` 内部经 `$.modal.open` 打开 `add.html`/`edit.html`
- 全部消费者: 全部列表页与表单页的弹窗交互

## COMP-layui - layui（含 laydate）

- ID: COMP-layui
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 39 行与 `static/ajax/libs/layui/`
- 坐标: `static/ajax/libs/layui/layui.min.js` + `layui/css/modules/laydate.css` + `layui/modules/laydate.js`，`?v=2.8.18`
- 用途: 日期选择器（laydate）等基础组件
- 源码中的实际使用位置: `templates/include.html` 第 39 行（全局 `footer` 片段）；`static/ajax/libs/layui/modules/laydate.js` 提供 `laydate` 模块
- 消费者: 列表页的日期范围筛选、表单页的日期字段（与 `datetimepicker` 并按场景使用）

## TCA-layui-laydate - 日期选择能力

- ID: TCA-layui-laydate
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据 `include.html` 第 39 行与 `layui/modules/laydate.js` 存在
- 能力接口: `layui.use('laydate', function(){ laydate.render({elem, type, range}) })`
- 调用点: `static/ruoyi/js/ry-ui.js` 中日期控件的统一初始化（`推断`）；`templates/**/index.html` 的 `search-collapse` 日期范围输入
- 全部消费者: 含时间范围筛选的列表页（操作日志、登录日志、调用日志、调度日志）

## COMP-ruoyi-ui - RuoYi 前端封装

- ID: COMP-ruoyi-ui
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 16、40-41 行与 `static/ruoyi/`
- 坐标: `static/ruoyi/js/common.js`、`static/ruoyi/js/ry-ui.js`、`static/ruoyi/css/ry-ui.css`、`static/ruoyi/index.js`、`static/ruoyi/login.js`、`static/ruoyi/register.js`，版本标识 `?v=4.8.2`
- 用途: 本项目自有的前端交互封装层，提供 `$.table`、`$.form`、`$.operate`、`$.modal`、`$.validate` 等命名空间，是所有业务列表页/表单页的实际调用入口
- 源码中的实际使用位置:
  - `templates/include.html` 第 16 行 CSS、第 40-41 行 JS（全局 `footer` 片段）
  - `templates/open/app/index.html` 第 24 行 `$.table.search()`、第 25 行 `$.form.reset()`、第 33 行 `$.operate.add()`、第 34 行 `$.operate.edit()`、第 35 行 `$.operate.removeAll()`、第 49 行 `$.table.init(options)`、第 63-65 行 `$.operate.edit/remove`、第 73 行 `$.modal.confirm`、第 74 行 `$.post`、第 77 行 `$.table.refresh()`
  - `templates/include.html` 第 21 行内联脚本定义全局 `var ctx = [[@{/}]];`
- 消费者: 全部 144 个模板中依赖 `$.table`/`$.operate`/`$.modal`/`$.form`/`$.validate` 的页面

## TCA-ruoyi-crud-operate - 列表 CRUD 操作编排能力

- ID: TCA-ruoyi-crud-operate
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 第 33-35、47-69 行
- 能力接口: `$.operate.add(id?, url?)`、`$.operate.edit(id?)`、`$.operate.remove(id)`、`$.operate.removeAll()`、`$.operate.export()`
- 调用点: `templates/open/app/index.html` 第 33、34、35 行工具栏按钮与第 63-65 行操作列按钮；配置文件由第 47-68 行 `options` 提供 `createUrl: prefix + "/add"`、`updateUrl: prefix + "/edit/{id}"`、`removeUrl: prefix + "/remove"`、`modalName: "开放应用"`
- 全部消费者: 全部列表页（用户、角色、菜单、部门、岗位、字典、参数、通知公告、操作日志、登录日志、在线用户、定时任务、调度日志、OpenAPI 应用/接口/授权/调用日志/文档）

## TCA-ruoyi-form-reset - 查询条件复位能力

- ID: TCA-ruoyi-form-reset
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/open/app/index.html` 第 25 行与第 10-29 行查询表单
- 能力接口: `$.form.reset()`
- 调用点: `templates/open/app/index.html` 第 25 行 `<a class="btn btn-warning btn-rounded btn-sm" onclick="$.form.reset()">`，作用于第 10 行 `<form id="app-form">` 内的 `appName`/`appKey`/`status` 三个筛选条件
- 全部消费者: 全部带 `search-collapse` 查询区的列表页

## COMP-metismenu - metisMenu 侧边菜单

- ID: COMP-metismenu
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/index.html`、`templates/index-topnav.html` 与 `static/js/plugins/metisMenu/jquery.metisMenu.js`
- 坐标: `static/js/plugins/metisMenu/jquery.metisMenu.js`（版本未在 URL 中标注）
- 用途: 折叠式侧边栏菜单
- 源码中的实际使用位置: `templates/index.html`、`templates/index-topnav.html`（两套主页布局）引入并初始化
- 消费者: 后台主页左侧菜单（菜单数据来自 `sys_menu`，149 行菜单数据，见 `../tools/menus.json`）

## TCA-metismenu-collapse - 侧边菜单折叠能力

- ID: TCA-metismenu-collapse
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/index.html` 与 `templates/index-topnav.html` 的引入
- 能力接口: `$('#side-menu').metisMenu()`；`$(...).on('click', ...)` 折叠切换
- 调用点: `templates/index.html`、`templates/index-topnav.html` 的初始化脚本
- 全部消费者: `templates/index.html`、`templates/index-topnav.html`

## COMP-slimscroll - slimScroll

- ID: COMP-slimscroll
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `static/js/plugins/slimscroll/jquery.slimscroll.min.js` 与主页模板
- 坐标: `static/js/plugins/slimscroll/jquery.slimscroll.min.js`
- 用途: 侧边菜单与内容区的自定义滚动条
- 源码中的实际使用位置: `templates/index.html`、`templates/index-topnav.html`
- 消费者: 后台主页

## TCA-slimscroll-scrollbar - 自定义滚动条能力

- ID: TCA-slimscroll-scrollbar
- 状态: active
- 结论级别: 推断
- 最后核验: 2026-03-27，依据主页模板引入（未逐行确认初始化调用）
- 能力接口: `$(selector).slimScroll({height, size, position})`
- 调用点: `templates/index.html`、`templates/index-topnav.html` 的初始化脚本（`推断`）
- 全部消费者: 后台主页

## COMP-ztree - zTree 3.5

- ID: COMP-ztree
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 44-50 行与 `static/ajax/libs/jquery-ztree/3.5/`
- 坐标: `static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.all-3.5.js`（另存在 `core/excheck/exedit/exhide` 单模块版本），CSS 三套主题 `default`/`metro`/`simple`；片段引用的是 `metro`
- 用途: 树形结构选择（菜单分配、部门选择）
- 源码中的实际使用位置: `templates/include.html` 第 45-50 行定义 `ztree-css`/`ztree-js` 片段，被 8 个模板消费
- 消费者: 8 个引用 `ztree-css`/`ztree-js` 片段的模板（角色分配菜单、部门选择器等）

## TCA-ztree-node-select - 树节点选择能力

- ID: TCA-ztree-node-select
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 45-50 行与 8 个消费模板
- 能力接口: `$.fn.zTree.init(obj, setting, nodes)`、`zTreeObj.getCheckedNodes()`、`zTreeObj.expandAll()`
- 调用点: 消费 `ztree-css`/`ztree-js` 片段的模板（角色管理页的菜单树、部门树选择器）
- 全部消费者: 8 个引用该片段的模板

## COMP-select2 - select2

- ID: COMP-select2
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 52-59 行与 `static/ajax/libs/select2/`
- 坐标: `select2.min.js` + `select2.min.css` + `select2-bootstrap.min.css`，`?v=4.0.13`
- 用途: 可搜索下拉框，支持多选
- 源码中的实际使用位置: `templates/include.html` 第 53-59 行定义 `select2-css`/`select2-js` 片段，被 4 个模板消费
- 消费者: 4 个引用该片段的模板（用户角色选择、岗位选择等表单）

## TCA-select2-searchable-select - 可搜索下拉选择能力

- ID: TCA-select2-searchable-select
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 53-59 行与 4 个消费模板
- 能力接口: `$(selector).select2({placeholder, allowClear, multiple, ajax})`
- 调用点: 消费 `select2-css`/`select2-js` 片段的 4 个表单模板
- 全部消费者: 该 4 个模板（用户管理、角色管理等含下拉多选的表单）

## COMP-bootstrap-select - bootstrap-select

- ID: COMP-bootstrap-select
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 61-67 行与 `static/ajax/libs/bootstrap-select/`
- 坐标: `bootstrap-select.min.js` + `bootstrap-select.min.css`，`?v=1.13.18`
- 用途: 带搜索的下拉选择器
- 源码中的实际使用位置: `templates/include.html` 第 62-67 行定义 `bootstrap-select-css`/`bootstrap-select-js` 片段，被 2 个模板消费
- 消费者: 2 个引用该片段的模板

## TCA-bootstrapselect-dropdown - 增强下拉框能力

- ID: TCA-bootstrapselect-dropdown
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 62-67 行与 2 个消费模板
- 能力接口: `$(selector).selectpicker({liveSearch, actionsBox})`
- 调用点: 消费 `bootstrap-select-css`/`bootstrap-select-js` 片段的 2 个模板
- 全部消费者: 该 2 个模板

## COMP-datetimepicker - bootstrap-datetimepicker

- ID: COMP-datetimepicker
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 69-75 行与 `static/ajax/libs/datapicker/`
- 坐标: `bootstrap-datetimepicker.min.js` + `bootstrap-datetimepicker.min.css`，`?v=2.4.4`（目录名 `datapicker` 为源码原有拼写）
- 用途: 日期/时间拾取（含时间范围）
- 源码中的实际使用位置: `templates/include.html` 第 70-75 行定义 `datetimepicker-css`/`datetimepicker-js` 片段，被 3 个模板消费
- 消费者: 3 个引用该片段的模板（含时间范围筛选的列表页与表单页）

## TCA-datetimepicker-pick - 日期时间拾取能力

- ID: TCA-datetimepicker-pick
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 70-75 行与 3 个消费模板
- 能力接口: `$(selector).datetimepicker({format, language, autoclose, minView})`
- 调用点: 消费 `datetimepicker-css`/`datetimepicker-js` 片段的 3 个模板
- 全部消费者: 该 3 个模板

## COMP-summernote - summernote 富文本

- ID: COMP-summernote
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 85-92 行与 `static/ajax/libs/summernote/`
- 坐标: `summernote.min.js` + `summernote.css` + `summernote-zh-CN.js` + `font/`，`?v=0.8.18`
- 用途: 富文本编辑器（HTML 内容编辑）
- 源码中的实际使用位置: `templates/include.html` 第 86-92 行定义 `summernote-css`/`summernote-js` 片段，被 3 个模板消费
- 消费者: 3 个引用该片段的模板（通知公告内容编辑、OpenAPI 接口文档内容编辑）
- 安全提示: 富文本内容写入数据库后由 `xss.enabled=true` 的 XSS 过滤器处理，但 `xss.excludes=/system/notice/*` 明确**排除通知公告路径**，公告内容不被 XSS 过滤（`事实`，见 [config-index.md](./config-index.md)）

## TCA-summernote-rich-editor - 富文本编辑能力

- ID: TCA-summernote-rich-editor
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 86-92 行与 3 个消费模板
- 能力接口: `$(selector).summernote({height, lang:'zh-CN', toolbar})`、`$(selector).summernote('code')`
- 调用点: 消费 `summernote-css`/`summernote-js` 片段的 3 个模板
- 全部消费者: 该 3 个模板（通知公告、OpenAPI 文档）

## COMP-duallistbox - bootstrap-duallistbox

- ID: COMP-duallistbox
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 118-124 行与 `static/ajax/libs/duallistbox/`
- 坐标: `bootstrap-duallistbox.min.js` + `bootstrap-duallistbox.min.css`，`?v=3.0.9`
- 用途: 左右互选列表框（批量选择）
- 源码中的实际使用位置: `templates/include.html` 第 119-124 行定义 `bootstrap-duallistbox-css`/`bootstrap-duallistbox-js` 片段，被 1 个模板消费
- 消费者: 1 个引用该片段的模板

## TCA-duallistbox-transfer - 左右互选能力

- ID: TCA-duallistbox-transfer
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 119-124 行与 1 个消费模板
- 能力接口: `$(selector).bootstrapDualListbox({nonSelectedListLabel, selectedListLabel})`；表单提交时把选中项写入隐藏域
- 调用点: 消费 `bootstrap-duallistbox-*` 片段的模板
- 全部消费者: 该 1 个模板

## COMP-fileinput - bootstrap-fileinput

- ID: COMP-fileinput
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 110-116 行与 `static/ajax/libs/bootstrap-fileinput/`
- 坐标: `fileinput.min.js` + `fileinput.min.css`，`?v=5.5.4`
- 用途: 多文件上传组件（预览、进度、校验）
- 源码中的实际使用位置: `templates/include.html` 第 111-116 行定义 `bootstrap-fileinput-css`/`bootstrap-fileinput-js` 片段，被 1 个模板消费
- 消费者: 1 个引用该片段的模板（文件上传页）
- 后端对应: `spring.servlet.multipart.max-file-size=10MB`、`max-request-size=20MB`；上传落盘路径 `qvsu.profile=D:/qvsu/uploadPath`

## TCA-fileinput-multiupload - 多文件上传能力

- ID: TCA-fileinput-multiupload
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 111-116 行与 multipart 配置
- 能力接口: `$(selector).fileinput({uploadUrl, allowedFileExtensions, maxFileSize, language:'zh'})`
- 调用点: 消费 `bootstrap-fileinput-*` 片段的模板；后端端点 `com.qvsu.web.controller.common.CommonController`（`/common/upload`、`/common/download`，`推断` 具体路径由该 Controller 定义）
- 全部消费者: 该 1 个模板 + `CommonController` 上传/下载端点

## COMP-cropper - Cropper 图像裁剪

- ID: COMP-cropper
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 94-100 行与 `static/ajax/libs/cropper/`
- 坐标: `cropper.min.js` + `cropper.min.css`，`?v=1.5.12`
- 用途: 头像/图片裁剪
- 源码中的实际使用位置: `templates/include.html` 第 95-100 行定义 `cropper-css`/`cropper-js` 片段，被 1 个模板消费
- 消费者: 1 个引用该片段的模板（个人中心头像上传，对应 `SysProfileController`）

## TCA-cropper-image-crop - 图像裁剪能力

- ID: TCA-cropper-image-crop
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 95-100 行与 1 个消费模板
- 能力接口: `$(img).cropper({aspectRatio, viewMode, crop(event){...}})`
- 调用点: 消费 `cropper-*` 片段的模板（头像裁剪弹窗）
- 全部消费者: 该 1 个模板 + 头像更新端点（`SysProfileController`，经 `QvsuConfig.getAvatarPath()` 落盘）

## COMP-cxselect - jQuery cxSelect 多级联动

- ID: COMP-cxselect
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 136-139 行与 `static/ajax/libs/cxselect/`
- 坐标: `jquery.cxselect.min.js`，`?v=1.4.2`
- 用途: 多级联动下拉（省市区、部门层级）
- 源码中的实际使用位置: `templates/include.html` 第 137-139 行定义 `jquery-cxselect-js` 片段，被 2 个模板消费
- 消费者: 2 个引用该片段的模板

## TCA-cxselect-cascade - 多级联动选择能力

- ID: TCA-cxselect-cascade
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 137-139 行与 2 个消费模板
- 能力接口: `$.cxSelect.create(elem, {url, selects, nodata})`；支持 `data-value` 链式联动
- 调用点: 消费 `jquery-cxselect-js` 片段的 2 个模板
- 全部消费者: 该 2 个模板

## COMP-suggest - bootstrap-suggest

- ID: COMP-suggest
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 126-129 行与 `static/ajax/libs/suggest/`
- 坐标: `bootstrap-suggest.min.js`，`?v=0.1.29`
- 用途: 输入框搜索自动补全（支持远程数据源）
- 源码中的实际使用位置: `templates/include.html` 第 127-129 行定义 `bootstrap-suggest-js` 片段，被 1 个模板消费（`templates/demo/form/autocomplete.html` 第 156 行）
- 消费者: 1 个引用该片段的模板

## TCA-suggest-autocomplete - 远程自动补全能力

- ID: TCA-suggest-autocomplete
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 127-129 行与 `demo/form/autocomplete.html` 第 160-186 行
- 能力接口: `$(selector).bsSuggest({url, getDataMethod, effectiveFields})`
- 调用点: `templates/demo/form/autocomplete.html` 第 160、172、186 行三处初始化（其中第 275 行示例 url 指向 `http://suggest.taobao.com/sug`，为外部演示数据源）
- 全部消费者: 该 1 个模板
- 风险提示: `demo/form/autocomplete.html` 第 275 行的演示配置指向外部 HTTP 接口，在生产开启 `demoEnabled=true` 且菜单可达时会造成客户端向第三方发起请求（`事实`）

## COMP-typeahead - bootstrap-typeahead

- ID: COMP-typeahead
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 131-134 行与 `static/ajax/libs/typeahead/`
- 坐标: `bootstrap-typeahead.min.js`，`?v=4.0.2`
- 用途: 输入联想（本地/远程数据源）
- 源码中的实际使用位置: `templates/include.html` 第 132-134 行定义 `bootstrap-typeahead-js` 片段，被 1 个模板消费（`templates/demo/form/autocomplete.html` 第 157 行）
- 消费者: 1 个引用该片段的模板

## TCA-typeahead-suggest - 输入联想能力

- ID: TCA-typeahead-suggest
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 132-134 行与 `demo/form/autocomplete.html` 第 303-317 行
- 能力接口: `$(selector).typeahead({source, items, minLength})`
- 调用点: `templates/demo/form/autocomplete.html` 第 303、307、317 行
- 全部消费者: 该 1 个模板

## COMP-jasny - jasny-bootstrap

- ID: COMP-jasny
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 102-108 行与 `static/ajax/libs/jasny/`
- 坐标: `jasny-bootstrap.min.js` + `jasny-bootstrap.min.css`，`?v=3.1.3`
- 用途: Bootstrap 功能扩展（off-canvas 侧滑、文件输入样式、行内编辑）
- 源码中的实际使用位置: `templates/include.html` 第 103-108 行定义 `jasny-bootstrap-css`/`jasny-bootstrap-js` 片段，被 1 个模板消费
- 消费者: 1 个引用该片段的模板

## TCA-jasny-extension - Bootstrap 功能扩展能力

- ID: TCA-jasny-extension
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 103-108 行与 1 个消费模板
- 能力接口: `$(...).fileinput()`（Jasny 版）、`.offcanvas`、`.rowlink`
- 调用点: 消费 `jasny-bootstrap-*` 片段的模板
- 全部消费者: 该 1 个模板

## COMP-smartwizard - jquery-smartwizard

- ID: COMP-smartwizard
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 149-155 行与 `static/ajax/libs/smartwizard/`
- 坐标: `jquery.smartWizard.min.js` + `smart_wizard_all.min.css`，`?v=5.1.1`
- 用途: 分步表单向导（上一步/下一步/提交）
- 源码中的实际使用位置: `templates/include.html` 第 150-155 行定义 `jquery-smartwizard-css`/`jquery-smartwizard-js` 片段，被 1 个模板消费（`templates/demo/form/wizard.html` 第 5、227 行）
- 消费者: 1 个引用该片段的模板

## TCA-smartwizard-steps - 分步向导能力

- ID: TCA-smartwizard-steps
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `demo/form/wizard.html` 第 67、173、227-316 行
- 能力接口: `$('#smartwizard').smartWizard({selected, theme, transition})`、`.smartWizard("next"/"prev"/"reset")`、事件 `showStep`/`leaveStep`
- 调用点: `templates/demo/form/wizard.html` 第 173 行初始化；第 236/240/243 行 `reset`/`next`/`prev`；第 275 行 `showStep`；第 300 行 `leaveStep`；第 316 行 `setOptions`
- 全部消费者: 该 1 个模板

## COMP-jquery-layout - jQuery UI Layout

- ID: COMP-jquery-layout
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 77-83 行与 `static/ajax/libs/jquery-layout/`
- 坐标: `jquery.layout-latest.js` + `jquery.layout-latest.css`，`?v=1.4.4`
- 用途: 页面五区布局（上下左右中），支持拖拽分隔与折叠
- 源码中的实际使用位置: `templates/include.html` 第 78-83 行定义 `layout-latest-css`/`layout-latest-js` 片段，被 1 个模板消费
- 消费者: 1 个引用该片段的模板

## TCA-jquerylayout-panes - 多区可拖拽布局能力

- ID: TCA-jquerylayout-panes
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 78-83 行与 1 个消费模板
- 能力接口: `$(selector).layout({west/east/north/south/center 配置})`、`layout.resizeAll()`
- 调用点: 消费 `layout-latest-*` 片段的模板
- 全部消费者: 该 1 个模板

## COMP-jsonview - jQuery jsonview（仅连接资源）

- ID: COMP-jsonview
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 141-147 行与 `static/ajax/libs/jsonview/`
- 坐标: `jquery.jsonview.js` + `jquery.jsonview.css`，`?v=1.2.0`（另存在非压缩版 `jquery.jsonview.js`）
- 用途: JSON 格式化展示（操作日志参数查看）
- 源码中的实际使用位置: `templates/include.html` 第 142-147 行**定义了** `jsonview-css`/`jsonview-js` 片段
- **仅连接资源、无自有能力接口**：`templates/**` 中**无任何模板引用** `jsonview-css`/`jsonview-js` 片段（`事实`：41 个被引用的片段名清单中不含 `jsonview-*`）。因此该组件当前仅作为静态资源存在，未被页面连接，不具备可调用的能力接口，不定义 `TCA-*` 节点。
- 相关线索: `templates/main.html` 第 1264 行版本说明提到「使用jsonview展示操作日志参数」，说明历史上使用过但当前模板未引用（`推断`）
- 消费者: 无

## COMP-echarts - 百度 ECharts

- ID: COMP-echarts
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 157-160 行与 `static/ajax/libs/report/echarts/echarts-all.min.js`
- 坐标: `echarts-all.min.js`，`?v=4.2.1`
- 用途: 统计图表渲染（折线、柱状、饼图等）
- 源码中的实际使用位置: `templates/include.html` 第 158-160 行定义 `echarts-js` 片段，被 1 个模板消费（`templates/demo/report/echarts` 系列）
- 消费者: 1 个引用该片段的模板
- 说明: 144 个模板中**没有**任何业务页使用 ECharts（`事实`：`echarts-js` 片段引用计数为 1，且消费方在 `templates/demo/` 下），即当前系统无业务统计图表

## TCA-echarts-chart-render - 图表渲染能力

- ID: TCA-echarts-chart-render
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 158-160 行与 1 个消费模板
- 能力接口: `echarts.init(dom)`、`chart.setOption(option)`、`chart.resize()`
- 调用点: 消费 `echarts-js` 片段的模板
- 全部消费者: 该 1 个模板（位于 `templates/demo/report/`）；无业务页消费者

## COMP-sparkline - jQuery Sparkline

- ID: COMP-sparkline
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 167-170 行与 `static/ajax/libs/report/sparkline/`
- 坐标: `jquery.sparkline.min.js`，`?v=2.1.2`
- 用途: 行内迷你图（折线/柱状/饼图）
- 源码中的实际使用位置: `templates/include.html` 第 168-170 行定义 `sparkline-js` 片段，被 3 个模板消费（含 `templates/main_v1.html` 第 219 行）
- 消费者: 3 个引用该片段的模板

## TCA-sparkline-inline-chart - 行内迷你图能力

- ID: TCA-sparkline-inline-chart
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 168-170 行与 `main_v1.html` 第 219 行
- 能力接口: `$(selector).sparkline(values, {type, width, height, lineColor})`
- 调用点: `templates/main_v1.html` 第 219 行引入；`templates/demo/report/sparkline.html` 第 177-222 行 9 处初始化；`templates/demo/report/metrics.html` 第 384-445 行 8 处初始化
- 全部消费者: `templates/main_v1.html`、`templates/demo/report/sparkline.html`、`templates/demo/report/metrics.html`

## COMP-peity - jQuery Peity

- ID: COMP-peity
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 162-165 行与 `static/ajax/libs/report/peity/`
- 坐标: `jquery.peity.min.js`，`?v=2.0.3`
- 用途: 轻量行内饼/线/柱图
- 源码中的实际使用位置: `templates/include.html` 第 163-165 行定义 `peity-js` 片段，被 2 个模板消费
- 消费者: 2 个引用该片段的模板

## TCA-peity-pie-line-bar - 轻量饼线柱图能力

- ID: TCA-peity-pie-line-bar
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 163-165 行与 `demo/report/metrics.html` 第 383、445-463 行
- 能力接口: `$(selector).peity('pie'|'line'|'bar', options)`
- 调用点: `templates/demo/report/metrics.html` 第 445 行 `peity("pie")`、第 449 行 `peity("line")`、第 454/458 行 `peity("bar")`、第 463 行 `peity("line")`
- 全部消费者: 该 2 个模板

## COMP-flot - jQuery Flot

- ID: COMP-flot
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/main_v1.html` 第 217、332 行与 `static/ajax/libs/flot/`
- 坐标: `static/ajax/libs/flot/{jquery.flot.js, jquery.flot.pie.js, jquery.flot.resize.js, jquery.flot.spline.js, jquery.flot.symbol.js, jquery.flot.tooltip.min.js, curvedLines.js}`（版本未在 URL 中标注）
- 用途: 仪表盘折线/饼图绘制
- 源码中的实际使用位置: `templates/main_v1.html` 第 92-93 行 `<div class="flot-chart-content" id="flot-dashboard-chart">`；第 217 行 `<script th:src="@{/ajax/libs/flot/jquery.flot.js}">`；第 332 行 `$.plot($("#flot-dashboard-chart"), dataset, options)`
- 消费者: `templates/main_v1.html`（备用主页布局）

## TCA-flot-plot - 折线/饼图绘制能力

- ID: TCA-flot-plot
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `main_v1.html` 第 217、332 行
- 能力接口: `$.plot(element, dataset, options)`；扩展插件 `jquery.flot.pie/resize/spline/symbol/tooltip/curvedLines`
- 调用点: `templates/main_v1.html` 第 332 行
- 全部消费者: `templates/main_v1.html`

## COMP-bootstrap-table-ext - bootstrap-table 扩展族

- ID: COMP-bootstrap-table-ext
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `templates/include.html` 第 172-228 行与 `static/ajax/libs/bootstrap-table/extensions/`
- 坐标与版本（逐项）:

| 扩展 | 文件 | 版本 | 引用模板数 |
|---|---|---|---:|
| 行拖拽 | `extensions/reorder-rows/bootstrap-table-reorder-rows.js` + `jquery.tablednd.js` | `1.24.1` / `1.0.3` | 1 |
| 列拖拽 | `extensions/reorder-columns/bootstrap-table-reorder-columns.js` + `jquery.dragtable.js` | `1.24.1` / `5.3.5` | 1 |
| 列宽拖动 | `extensions/resizable/bootstrap-table-resizable.js` + `jquery.resizableColumns.min.js` | `1.24.1` / `0.1.0` | 1 |
| 行内编辑 | `extensions/editable/bootstrap-table-editable.js` + `bootstrap-editable.min.js` + `.css` | `1.24.1` / `1.5.1` | 1 |
| 导出 | `extensions/export/bootstrap-table-export.js` + `tableExport.min.js` | `1.24.1` / `1.10.24` | 1 |
| 冻结列 | `extensions/columns/bootstrap-table-fixed-columns.js` | `1.24.1` | 1 |
| 自动刷新 | `extensions/auto-refresh/bootstrap-table-auto-refresh.js` | `1.24.1` | 1 |
| 打印 | `extensions/print/bootstrap-table-print.js` | `1.24.1` | 1 |
| 自定义视图 | `extensions/custom-view/bootstrap-table-custom-view.js` | `1.24.1` | 2 |
| 状态保存 | `extensions/cookie/bootstrap-table-cookie.js` | `1.24.1` | 1 |
| 移动端（独立 COMP） | `extensions/mobile/bootstrap-table-mobile.js` | `1.24.1` | 全局 |
| 树形（独立 COMP） | `extensions/tree/bootstrap-table-tree.min.js` | `1.24.1` | 全局 |

- 用途: 在基础表格上叠加拖拽、编辑、导出、打印、视图持久化等交互
- 源码中的实际使用位置: `templates/include.html` 第 172-228 行逐项定义为 `th:fragment`（`bootstrap-table-reorder-rows-js`、`bootstrap-table-reorder-columns-js`、`bootstrap-table-resizable-js`、`bootstrap-editable-css`、`bootstrap-table-editable-js`、`bootstrap-table-export-js`、`bootstrap-table-fixed-columns-js`、`bootstrap-table-auto-refresh-js`、`bootstrap-table-print-js`、`bootstrap-table-custom-view-js`、`bootstrap-table-cookie-js`）
- 消费者: 引用上述 11 个片段的模板（各 1-2 个）

## TCA-bootstraptable-export-print - 表格导出与打印能力

- ID: TCA-bootstraptable-export-print
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 199-218 行
- 能力接口: bootstrap-table `showExport: true`、`showPrint: true`；`tableExport.jquery.plugin`
- 调用点: 消费 `bootstrap-table-export-js`（第 200-203 行）与 `bootstrap-table-print-js`（第 216-218 行）片段的模板
- 全部消费者: 各 1 个模板；与之配套的服务端导出能力由 COMP-poi-ooxml 的 TCA-poi-excel-export 提供

## TCA-bootstraptable-state-persist - 表格状态持久化能力

- ID: TCA-bootstraptable-state-persist
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 225-227 行
- 能力接口: bootstrap-table `cookie: true`、`cookieIdTable`、`cookieStorage`
- 调用点: 消费 `bootstrap-table-cookie-js` 片段（第 226-227 行）的模板
- 全部消费者: 该 1 个模板

## TCA-bootstraptable-row-edit - 表格行内编辑能力

- ID: TCA-bootstraptable-row-edit
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 190-197 行
- 能力接口: bootstrap-table `editable: {type, url, pk}`；`$.fn.editable`
- 调用点: 消费 `bootstrap-editable-css`/`bootstrap-table-editable-js` 片段（第 191-197 行）的模板
- 全部消费者: 该 1 个模板

## TCA-bootstraptable-reorder - 表格行列拖拽能力

- ID: TCA-bootstraptable-reorder
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `include.html` 第 172-188 行
- 能力接口: `reorderableRows`/`reorderableColumns` 选项 + `TableDnD`/`dragtable` 依赖
- 调用点: 消费 `bootstrap-table-reorder-rows-js`（第 173-176 行）与 `bootstrap-table-reorder-columns-js`（第 179-182 行）片段的模板
- 全部消费者: 各 1 个模板

## COMP-highlight - highlight.js（仅连接资源）

- ID: COMP-highlight
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `static/ajax/libs/highlight/{highlight.min.js, default.min.css}` 存在
- 坐标: `static/ajax/libs/highlight/highlight.min.js` + `default.min.css`（版本未标注）
- 用途: 源码高亮（原设计用于 JSON/SQL 展示）
- **仅连接资源、无自有能力接口**：`templates/include.html` **未定义**任何 highlight 片段，`templates/**` 中**无引用**（`事实`：`include ::` 片段名清单中不含 highlight）。因此该组件仅存在于静态资源目录，未被任何页面连接。
- 消费者: 无

## COMP-three - three.js（仅连接资源）

- ID: COMP-three
- 状态: active
- 结论级别: 事实
- 最后核验: 2026-03-27，依据 `static/js/three.min.js` 存在
- 坐标: `static/js/three.min.js`（版本未标注）
- 用途: 未知（未在任何模板或脚本中引用）
- **仅连接资源、无自有能力接口**：`templates/**` 与 `static/ruoyi/js/**` 中均未检索到 `three.min.js` 的引用（`事实`）。该文件属遗留静态资源。
- 消费者: 无
- 结论级别补充: 其存在原因与是否曾用于 3D 展示无法从源码确认（`假设`）

---

# 5. 组件能力汇总（按组件归组）

| COMP ID | TCA ID 列表 |
|---|---|
| COMP-spring-boot-web | TCA-web-mvc-dispatch |
| COMP-spring-boot-thymeleaf | TCA-thymeleaf-fragment |
| COMP-spring-boot-aop | TCA-aop-aspect-proxy |
| COMP-spring-boot-quartz | TCA-quartz-job-schedule、TCA-quartz-http-task |
| COMP-spring-boot-validation | TCA-validation-custom-constraint |
| COMP-spring-boot-test | TCA-test-context-bootstrap |
| COMP-spring-jdbc | TCA-jdbc-template-sql、TCA-jdbc-transaction-manager |
| COMP-postgresql-driver | TCA-pg-jdbc-connection |
| COMP-druid | TCA-druid-connection-pool、TCA-druid-stat-monitor、TCA-druid-wall-filter、TCA-druid-dynamic-datasource |
| COMP-kaptcha | TCA-kaptcha-image、TCA-kaptcha-arithmetic |
| COMP-shiro-core | TCA-shiro-authentication、TCA-shiro-authorization、TCA-shiro-session-persistence |
| COMP-shiro-spring | TCA-shiro-filter-chain、TCA-shiro-rememberme |
| COMP-shrio-ehcache | TCA-shiro-cache-bridge |
| COMP-ehcache | TCA-ehcache-embedded、TCA-ehcache-login-record |
| COMP-thymeleaf-extras-shiro | TCA-shiro-template-taglib |
| COMP-pagehelper | TCA-pagehelper-dialect-paging、TCA-pagehelper-count-optimize |
| COMP-commons-lang3 | TCA-lang3-string-util、TCA-lang3-date-util |
| COMP-jackson-databind | TCA-jackson-message-converter |
| COMP-fastjson | TCA-fastjson-json-parse、TCA-fastjson-property-filter |
| COMP-commons-io | TCA-commons-io-stream |
| COMP-poi-ooxml | TCA-poi-excel-export、TCA-poi-excel-import |
| COMP-yauaa | TCA-yauaa-parse |
| COMP-aspectjweaver | TCA-aspectj-weaving |
| COMP-jquery | TCA-jquery-dom-ajax |
| COMP-bootstrap | TCA-bootstrap-grid-component |
| COMP-fontawesome | **仅连接资源、无自有能力接口** |
| COMP-bootstrap-table | TCA-bootstraptable-server-paging、TCA-bootstraptable-column-formatter |
| COMP-bootstrap-table-mobile | TCA-bootstraptable-mobile-view |
| COMP-bootstrap-table-tree | TCA-bootstraptable-tree-render |
| COMP-jquery-validate | TCA-validate-form-rule |
| COMP-blockui | TCA-blockui-mask |
| COMP-icheck | TCA-icheck-skin |
| COMP-layer | TCA-layer-modal |
| COMP-layui | TCA-layui-laydate |
| COMP-ruoyi-ui | TCA-ruoyi-crud-operate、TCA-ruoyi-form-reset |
| COMP-metismenu | TCA-metismenu-collapse |
| COMP-slimscroll | TCA-slimscroll-scrollbar |
| COMP-ztree | TCA-ztree-node-select |
| COMP-select2 | TCA-select2-searchable-select |
| COMP-bootstrap-select | TCA-bootstrapselect-dropdown |
| COMP-datetimepicker | TCA-datetimepicker-pick |
| COMP-summernote | TCA-summernote-rich-editor |
| COMP-duallistbox | TCA-duallistbox-transfer |
| COMP-fileinput | TCA-fileinput-multiupload |
| COMP-cropper | TCA-cropper-image-crop |
| COMP-cxselect | TCA-cxselect-cascade |
| COMP-suggest | TCA-suggest-autocomplete |
| COMP-typeahead | TCA-typeahead-suggest |
| COMP-jasny | TCA-jasny-extension |
| COMP-smartwizard | TCA-smartwizard-steps |
| COMP-jquery-layout | TCA-jquerylayout-panes |
| COMP-jsonview | **仅连接资源、无自有能力接口** |
| COMP-echarts | TCA-echarts-chart-render |
| COMP-sparkline | TCA-sparkline-inline-chart |
| COMP-peity | TCA-peity-pie-line-bar |
| COMP-flot | TCA-flot-plot |
| COMP-bootstrap-table-ext | TCA-bootstraptable-export-print、TCA-bootstraptable-state-persist、TCA-bootstraptable-row-edit、TCA-bootstraptable-reorder |
| COMP-highlight | **仅连接资源、无自有能力接口** |
| COMP-three | **仅连接资源、无自有能力接口** |

统计（事实）:
- COMP 节点总数: 59（后端 23 + 前端 36）
- TCA 节点总数: 74
- 标注「仅连接资源、无自有能力接口」的组件: 4（`COMP-fontawesome`、`COMP-jsonview`、`COMP-highlight`、`COMP-three`）
- 未在任何模板/代码中被引用的组件: 3（`COMP-jsonview` 仅片段定义无消费、`COMP-highlight`、`COMP-three`）
- 已声明但无实际使用点的后端子组件: 1（`COMP-spring-boot-test`，无测试类）

# 6. 组件风险与证据缺口

| 项 | 类型 | 说明 | 证据等级 |
|---|---|---|---|
| `COMP-druid` | 安全 | `statViewServlet.login-password=123456` 明文弱口令 + `/druid/*` 对外开放 | 事实 |
| `COMP-druid` | 安全 | `wall.config.multi-statement-allow=true` 放宽多语句防护 | 事实 |
| `COMP-druid` | 缺陷 | `DruidConfig#setDataSource` 空 catch 吞掉从库装配异常 | 事实 |
| `COMP-shiro-spring` | 安全 | `csrf.enabled=false` 导致 `CsrfValidateFilter` 挂载但失效；Cookie 无 SameSite | 事实 |
| `COMP-shiro-core` | 缺陷 | `TCA-shiro-session-persistence` 与 `KickoutSessionFilter` 依赖 Ehcache 单机缓存，水平扩展不成立 | 事实 |
| `COMP-ehcache` | 缺陷 | 全部缓存为进程内实现，无分布式缓存组件 | 事实 |
| `COMP-spring-boot-quartz` | 缺陷 | `QRTZ_*` 11 张表已建但调度器为内存模式，表为死对象 | 推断 |
| `COMP-spring-jdbc` | 架构 | 网关链路绕过 MyBatis 用裸 SQL，与 144 条 Mapper 语句形成双轨数据访问 | 事实 |
| `COMP-fastjson` | 依赖 | `1.2.83` 已停止维护，长期需迁移 | 推断 |
| `COMP-poi-ooxml` | 依赖 | `4.1.2` 为 2020 年版本 | 推断 |
| `COMP-bootstrap` | 依赖 | Bootstrap 3.4.1 已停止维护 | 推断 |
| `COMP-suggest` | 安全 | 演示页示例指向外部 HTTP 接口 `suggest.taobao.com` | 事实 |
| `COMP-summernote` | 安全 | 富文本输出路径 `/system/notice/*` 被 `xss.excludes` 排除，无 XSS 过滤 | 事实 |
| `COMP-echarts` / `COMP-flot` / `COMP-sparkline` / `COMP-peity` | 范围 | 图表能力仅被 `templates/demo/**` 与 `main_v1.html` 消费，无业务页使用 | 事实 |
| `COMP-spring-boot-test` | 覆盖 | 无 `src/test/java` 测试类，测试基座未使用 | 事实 |
| `COMP-jsonview` / `COMP-highlight` / `COMP-three` | 覆盖 | 静态资源存在但无任何引用 | 事实 |
| `COMP-blockui` / `COMP-icheck` / `COMP-layui` / `COMP-slimscroll` | 证据 | 其调用点位于 `static/ruoyi/js/{common.js,ry-ui.js}` 封装内，未逐行核实具体调用行 | 推断 |
