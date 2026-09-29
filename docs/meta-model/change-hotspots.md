# 变更热点与风险

本文件从「如果改这里会牵动多少地方」的口径，登记 `SYS-qvsu-openapi`（QVSU OpenAPI 管理与网关服务，精简版，版本 1.0）的变更热点、耦合风险、工程保障缺口与数据一致性风险。

- 本文档不是任何稳定 ID 前缀的主定义文件：`SYS-*` 主定义在 [技术架构](./technical-architecture.md)，`MOD-*` 主定义在 [模块索引](./module-index.md)，`API-*` 主定义在 [接口索引](./interface-index.md)，`TBL-*` 主定义在 [数据库模型](./database-model.md)，`CFG-*` 主定义在 [配置索引](./config-index.md)，`FUNC-*` 主定义在 [功能清单](./functional-inventory.md)。本文只引用 ID 文本与物理名。
- 热点编号使用 `HOT-*` 命名，`HOT-*` 不属于稳定 ID 前缀集合，仅为本文件内部的章节标签。
- 证据等级：`事实` = 直接读源码；`推断` = 由多处证据推出；`假设` = 待确认。
- 端到端链路见 [端到端流程索引](./flow-index.md)。

## 热点总表

| 编号 | 热点位置 | 热度成因 | 影响面 | 建议动作 |
|---|---|---|---|---|
| HOT-SHIRO-CHAIN | `ShiroConfig.java` 过滤链 + `FilterConfig.java` + `PermitAllUrlProperties.java` | 全站唯一认证授权开关，配置驱动，无测试保护 | 全部 HTTP 端点、全部会话、全部权限判定 | 引入配置化过滤链清单与回归用例 |
| HOT-APP-YML | `application.yml`、`application-druid.yml`、`deploy/local-docker/conf/application-docker-local.yml`、`src/test/resources/application-druid.yml` | 168 个配置键、4 份副本、编码已损坏 | 启动、数据源、分页方言、安全过滤、限流 | 统一单一事实源 + 修复编码 |
| HOT-ROUTING-CONTRACT | `sys_menu` + `SysMenuMapper.xml` + `templates/**` 的 `ctx + "..."` 契约 | 菜单数据驱动路由与权限，数据库与前端隐式耦合 | 全部后台页面、全部按钮权限 | 建立菜单-路由-模板三方一致性校验 |
| HOT-OPEN-TABLES | `open_app`(14)、`open_api`(17)、`open_app_api`(9)、`open_call_log`(22)、`open_api_doc`(12) | 遗留 `s_*` 兼容列 + 双时间列 + 无外键 | 网关鉴权、转发、日志、文档、全部管理页 | 定版列语义并清理兼容列 |
| HOT-MAPPER-SQL | `src/main/resources/mapper/**/*.xml`（19 个文件）+ `DataScopeAspect` 拼接 SQL | 手写 SQL、方言函数、字符串拼接 | 系统域全部 CRUD、数据范围过滤 | 方言抽象 + 参数化改造 |
| HOT-EXC-HANDLER | `GlobalExceptionHandler.java` | 全局 `@RestControllerAdvice` 捕获所有异常并回显消息 | 所有 Controller 的错误响应与页面渲染 | 分流消息、脱敏、页面/接口分别处理 |
| HOT-QUARTZ-JOB | `sys_job` 定义 + `JobInvokeUtil` 反射 + `ScheduleUtils` | 数据库驱动 + 反射调用，无白名单 | 任意类加载与外部 HTTP 调用 | 启用白名单并补权限码 |
| HOT-CALLLOG-COLS | `open_call_log` 字段 + `open_call_log_headers_upgrade.sql` | 结构已变更一次、兼容列并存、headers 列空置 | 日志查询、统计、导出、升级脚本 | 补齐 headers 写入并归档升级脚本 |
| HOT-COUPLING | 跨模块依赖与前端 URL 隐式契约 | 编译期无约束 | 全部前端页面与后端路由 | 契约测试 + URL 常量集中 |
| HOT-DIALECT | MySQL / PostgreSQL 两套初始化脚本 | 21 个 SQL 文件双份维护，含方言专有语法 | 部署、种子数据、自测脚本 | 单一 SQL 生成源 + 方言冒烟 |
| HOT-NO-TESTS | `src/test` 仅 4 个类 | 无 CI、无契约测试、无单测 | 全部改动 | 建立可离线运行的测试基线 |
| HOT-PERM-GAP | `@RequiresPermissions` 覆盖 105/184 | 79 个端点无权限码 | `open` 包全部管理端点、`/selftest/**`、`/common/**` | 补齐注解或网关侧统一拦截 |
| HOT-DATA-CONSIST | 多表写入事务边界、逻辑删除、编号生成、并发授权 | `JdbcTemplate` 与 MyBatis 混用、删除语义不统一 | `open_*` 五表、`sys_*` 授权关联表 | 统一事务与删除策略 |

---

## 1. 高风险热点清单

### HOT-SHIRO-CHAIN — Shiro 过滤器链与安全过滤器注册

**热点位置**

| 文件 | 关键内容 | 证据等级 |
|---|---|---|
| `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java` | `shiroFilterFactoryBean(SecurityManager)` 中 `filterChainDefinitionMap` 共 20 条规则；`filters` Map 注册 6 个自定义过滤器 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/FilterConfig.java` | `@ConditionalOnProperty("xss.enabled")` 下注册 `XssFilter`，`setOrder(FilterRegistrationBean.HIGHEST_PRECEDENCE)` | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/properties/PermitAllUrlProperties.java` | `afterPropertiesSet()` 扫描 `@Anonymous` 注解并把 URL 加入 `anon` 白名单 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java` | `@Component` + `OncePerRequestFilter`，**未设置 `@Order` 或 `FilterRegistrationBean`**，仅拦截 `/open/` | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/framework/config/DruidConfig.java` | `removeDruidFilterRegistrationBean` 修改 Druid 监控页注入的 `common.js` | 事实 |

**为什么是热点**

1. **单点决定全站认证与授权。** `filterChainDefinitionMap.put("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")` 一行即覆盖所有未被前面规则命中的路径；`/login`、`/register`、`/open/**`、`/selftest/**` 与 12 条静态资源前缀为 `anon`（证据等级：事实，`ShiroConfig.java:304-350`）。
2. **白名单是复合来源。** `anon` 集合 = ShiroConfig 硬编码 12 条静态资源 + `/login` + `/register` + `/open/**` + `/selftest/**` + `PermitAllUrlProperties` 扫描结果。当前全库**无任何 `@Anonymous` 使用**，因此扫描结果恒为空——扩展机制存在但未被使用（证据等级：事实，全库 grep `@Anonymous` 无匹配）。
3. **安全过滤器覆盖面与直觉相反。**
   - `XssFilter` 的 `urlPatterns=/system/*,/tool/*`，**不覆盖** `/open/**`、`/admin/open/**`、`/selftest/**`、`/common/**`（证据等级：事实，`application.yml:139`）。而网关会原样转发外部请求体，`open_call_log.req_body` 也会原样落库。
   - `CsrfValidateFilter` 挂在 `/**` 段，但 `csrf.enabled=false` 使其 `setEnabled(false)`，实际不生效（证据等级：事实，`application.yml:144`、`ShiroConfig.java:285`）。
   - `csrf.whites=/druid` 与 Druid 监控台 `/druid/*`（`statViewServlet.enabled=true`，账号 `postgres`/`123456`）说明 Druid 页面是被刻意排除在 CSRF 之外的（证据等级：事实，`application-druid.yml:43-50`）。
4. **`OpenApiFilter` 与 `XssFilter` 的相对顺序未显式声明。** `OpenApiFilter` 依赖 `@Component` 自动注册（默认顺序为 `Ordered.LOWEST_PRECEDENCE`），`XssFilter` 为 `HIGHEST_PRECEDENCE`；`CachedBodyHttpServletRequest` 会缓存原始请求体，若顺序变化可能影响包装行为（证据等级：假设）。
5. **无测试保护。** `src/test` 下 4 个测试类均未断言过滤链顺序或白名单集合（证据等级：事实，见 HOT-NO-TESTS）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| HTTP 端点 | 184 个路由（`docs/tools/assets.json`） |
| 会话机制 | `OnlineWebSessionManager`、`OnlineSessionDAO`、`KickoutSessionFilter`、`sys_user_online` |
| 权限判定 | `UserRealm`、`PermissionsAspect`、`sys_menu.perms` |
| 网关 | `/open/**` 的 `anon` 放行 + `OpenApiFilter` 自查鉴权 |
| 表格 | `sys_user_online`、`sys_logininfor`、`sys_menu` |

**变更建议**

- 把过滤链规则从硬编码迁移到配置清单（保持 `ShiroConfig` 只做装配），并为每条规则补注释级依据。
- 为 `OpenApiFilter` 显式设置 `FilterRegistrationBean` 与 `setOrder`，消除与 `XssFilter` 的顺序不确定性。
- 若要让 `@Anonymous` 真正可扩展，需先在至少一个端点上使用并补测试，否则应删除该机制以降低误导。
- 任何调整 `xss.urlPatterns` 的动作都会改变网关请求体的处理方式，必须与 `OpenApiSecurityService.verifySignature` 的签名算法一起回归（签名基于原始 JSON 顶层字段，若请求体被转义会直接破坏签名校验）（证据等级：推断）。

---

### HOT-APP-YML — 配置文件与配置键

**热点位置**

| 文件 | 角色 | 证据等级 |
|---|---|---|
| `open-api/qvsu-openapi/src/main/resources/application.yml` | 主配置，148 行；**中文注释为双重编码乱码** | 事实 |
| `open-api/qvsu-openapi/src/main/resources/application-druid.yml` | 数据源配置，62 行；**中文注释乱码** | 事实 |
| `open-api/deploy/local-docker/conf/application-docker-local.yml` | 容器覆盖配置，经 `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/opt/openapi/conf/application-docker-local.yml` 挂载注入 | 事实 |
| `open-api/qvsu-openapi/src/test/resources/application-druid.yml` | 测试数据源，端口 `5433` | 事实 |
| `open-api/deploy/dev-docker/docker-compose.yml` | 指向外部阿里云镜像，不可复现本地构建 | 事实 |

**为什么是热点**

1. **键数量大、消费面广。** `docs/tools/assets.json` 登记 168 个配置键；其中 `shiro.*`（14 个键）直接驱动 `ShiroConfig` 的字段注入，任一键改名会导致启动期 `@Value` 解析失败或行为静默改变（证据等级：事实，`ShiroConfig.java:55-146`）。
2. **同一语义在 4 份文件中重复。** 数据源 URL、账号、密码在 `application-druid.yml`、`deploy/local-docker/conf/application-docker-local.yml`、`src/test/resources/application-druid.yml` 三处各写一遍，主配置的 `spring.profiles.active=druid` 决定生效顺序（证据等级：事实）。
3. **编码已损坏，修改极易二次破坏。** `application.yml` 与 `application-druid.yml` 的中文注释是"UTF-8 BOM 后跟 GBK 字节被按 Latin-1 再编码"的双重乱码；同一仓库的 Java/XML/Mapper 中文正常，说明损坏只发生在这两个文件（证据等级：事实，逐字节读取确认）。`deploy/local-docker/postgres/init/40-open-api-menu.sql` 的菜单中文同样乱码（证据等级：事实）。
4. **安全相关键集中在同一文件。** `xss.enabled`、`xss.excludes`、`xss.urlPatterns`、`csrf.enabled`、`csrf.whites`、`shiro.user.captchaEnabled`、`shiro.session.maxSession`、`shiro.rememberMe.enabled` 全部在 `application.yml` 中（证据等级：事实）。
5. **Druid 监控台对外暴露。** `statViewServlet.enabled=true`、`url-pattern=/druid/*`、`login-username=postgres`、`login-password=123456`，且 `allow:` 为空（不限制来源 IP）；Shiro 过滤链无 `/druid/**` 规则，因此它落入 `/**` 段需要登录——但 CSRF 白名单又把它排除（证据等级：事实，`application-druid.yml:41-50`、`ShiroConfig.java:306-349`）。
6. **`spring.devtools.restart.enabled=true`** 在生产配置中保持开启，会引入额外类加载器与热重启行为（证据等级：事实，`application.yml:73-76`）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 启动 | 全部 `@Value` 注入点（`ShiroConfig`、`FilterConfig`、`ResourcesConfig`、`DruidProperties`） |
| 数据源 | `DynamicDataSource`、主从切换（`slave.enabled=false`） |
| 分页 | `pagehelper.helperDialect=postgresql`（改方言会同时影响手写 SQL 与 PageHelper 生成的 count 语句） |
| 安全 | XSS/CSRF/验证码/会话上限/RememberMe |
| 模板 | `spring.thymeleaf.cache=false`（生产建议为 true）、`spring.messages.basename` |
| 上传 | `spring.servlet.multipart.max-file-size`、`max-request-size`、`qvsu.profile` |

**变更建议**

- 用 UTF-8（无 BOM）重写 `application.yml` 与 `application-druid.yml` 的中文注释；修复后必须比对键集合与值，确保无语义漂移（证据等级：推断，按损坏形态判断，注释内容已被破坏无法逐字还原）。
- 数据源与账号只保留一份（建议以环境变量或外部挂载文件为唯一来源），测试配置通过 profile 覆盖而非复制。
- 生产 profile 关闭 `spring.devtools.restart.enabled` 与 `statViewServlet.enabled`；若必须保留 Druid 控制台，至少设置 `allow` 白名单并改用强口令。
- 把 `xss.urlPatterns` 与 `csrf.*` 的现状（保护范围）写入 [配置索引](./config-index.md) 的键级说明，避免"以为开启就全覆盖"的误判。

---

### HOT-ROUTING-CONTRACT — `sys_menu` 驱动的路由与权限

**热点位置**

| 文件/对象 | 关键内容 | 证据等级 |
|---|---|---|
| `sys_menu`（16 列） | `menu_id`、`parent_id`、`menu_name`、`url`、`target`、`menu_type`、`visible`、`perms`、`icon` 等 | 事实 |
| `open-api/sql/open_api_menu.sql` | 33 个 C 类页面菜单 + 111 个 F 类按钮 + 5 个 M 类目录的基线数据；同时**删除** `monitor/operlog`、`monitor/logininfor`、`monitor/online`、`monitor/data`、`monitor/server`、`monitor/cache` 与全部 `tool:*` 菜单，并 `DROP TABLE gen_table_column; DROP TABLE gen_table;` | 事实 |
| `open-api/qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml`（197 行） | `selectMenusByUserId` / `selectPermsByUserId` / `selectPermsByRoleId` / `deleteMenuById` 等 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysMenuServiceImpl.java` | `selectMenusByUser` / `selectPermsByUserId` / `selectPermsByRoleId` / `updateMenuSort` 等 | 事实 |
| `open-api/qvsu-openapi/src/main/resources/templates/**/*.html`（144 个模板） | 每个页面用 `var prefix = ctx + "<模块>/<资源>"` 拼接口地址 | 事实 |

**为什么是热点**

1. **数据库行是路由的唯一来源。** 后台页面的 URL 来自 `sys_menu.url`（如 `/admin/open/app`），目录结构来自 `parent_id`，排序来自 `order_num`。改一行 `url` 就要同步改：`@RequestMapping` 前缀、Thymeleaf 模板里的 `prefix`、`sys_role_menu` 授权行（证据等级：事实）。
2. **权限码存在两套语义。** `sys_menu.perms` 同时承担"页面可见权限码"（如 `open:app:view`）与"按钮权限码"（如 `open:app:add`）；`selectPermsByUserId` 只查 `m.visible='0' and r.status='0'`，而 `selectMenusByUserId` 还额外要求 `m.menu_type in ('M','C')`——**F 类按钮行的 `perms` 会进入权限集合，但不能作为菜单渲染**（证据等级：事实，`SysMenuMapper.xml:32-72`）。
3. **`open:*` 权限码只存在于数据里。** `open_api_menu.sql` 插入 14 个 `open:*` 权限码，但 `docs/tools/assets.json` 的 `PermissionCodes` 只有 55 个（全部为 `system:*` 与 `monitor:job:*`），且 `com/qvsu/open/` 包下 7 个 Controller 无任何 `@RequiresPermissions`。也就是说 `open:*` 权限码**在代码侧完全没有校验点**，仅影响菜单是否出现在页面上（证据等级：事实）。
4. **模板 URL 是隐式契约。** 144 个模板中 84 处 `var prefix = ctx + "..."`，例如 `templates/open/app/index.html:45` 的 `ctx + "admin/open/app"` 对应 `@RequestMapping("/admin/open/app")`。前后端之间没有任何编译期或测试期约束（证据等级：事实）。
5. **菜单 SQL 还会删表。** `open_api_menu.sql:111-112` 直接 `DROP TABLE IF EXISTS gen_table_column; DROP TABLE IF EXISTS gen_table;`——在已上线环境重复执行该脚本会删除代码生成器表（证据等级：事实）。
6. **菜单变更不会自动刷新授权缓存。** `UserRealm` 的授权缓存名为 `Constants.SYS_AUTH_CACHE`（Ehcache）；菜单/角色变更后若不调用 `clearCachedAuthorizationInfo` / `clearAllCachedAuthorizationInfo`，权限判定沿用旧值（证据等级：事实，`UserRealm.java:138-157`）。
7. **菜单规模。** `docs/tools/menus.json` 记 149 行菜单数据（33 个 C 类页面、111 个 F 类按钮、5 个 M 类目录）（证据等级：事实）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 前端 | 144 个 Thymeleaf 模板、`static/qvsu/js/**` 中的表格/弹窗脚本 |
| 后端路由 | 184 个路由（页面级 + 接口级） |
| 权限 | `sys_role_menu`、`sys_menu.perms`、Ehcache 授权缓存 |
| 表格 | `sys_menu`、`sys_role_menu` |
| 部署脚本 | `open-api/sql/open_api_menu.sql`、`deploy/local-docker/{mysql,postgres}/init/40-open-api-menu.sql` |

**变更建议**

- 建立"菜单-路由-模板"三方一致性检查（从 `sys_menu.url` 提取路径，与 `@RequestMapping` 注解集合、模板 `prefix` 字面量做集合比对），纳入发布前校验。
- 把 `open:*` 权限码补到对应 Controller 方法的 `@RequiresPermissions`，或明确声明该模块仅依赖"登录 + 菜单可见性"，并在文档中标注为已知风险。
- 把 `open_api_menu.sql` 中的 `DROP TABLE gen_table*` 与菜单删除语句拆到独立的一次性清理脚本，避免重复执行误删。
- 菜单/角色授权变更后统一触发授权缓存清理，或改用可失效的集中式缓存（证据等级：推断）。

---

### HOT-OPEN-TABLES — `open_*` 五张业务表结构

**热点位置**

| 物理表 | 列数 | 关键列 | 证据等级 |
|---|---|---|---|
| `open_app` | 14 | `s_id`(PK)、`app_name`、`app_key`(UNIQUE)、`app_secret`、`contact`、`status`、`expire_time`、`remark`、`create_time`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time` | 事实 |
| `open_api` | 17 | `s_id`(PK)、`api_name`、`api_path`(UNIQUE)、`method`、`target_url`、`timeout_ms`、`status`、`need_sign`、`description`、`req_example`、`resp_example`、`create_time`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time` | 事实 |
| `open_app_api` | 9 | `s_id`(PK)、`app_id`、`api_id`、`create_time`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time`、`UNIQUE KEY uk_app_api(app_id, api_id)` | 事实 |
| `open_call_log` | 22 | 见 HOT-CALLLOG-COLS | 事实 |
| `open_api_doc` | 12 | `s_id`(PK)、`app_id`、`doc_title`、`doc_version`、`api_ids`、`html_content`、`create_time`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time` | 事实 |

DDL 来源：`open-api/sql/open_api.sql:10-101`；同时镜像到 `deploy/local-docker/mysql/init/30-open-api.sql` 与 `deploy/local-docker/postgres/init/30-open-api.sql`。

**为什么是热点**

1. **遗留兼容列与正式列并存。** 每张表都同时有 `create_time`/`update_time` 与 `s_created_time`/`s_updated_time`，还有 `s_status` 与 `s_is_del`。`OpenManageService` 的 SELECT 用 `create_time as s_created_time` 做别名映射，因此**写入的是正式列、读取的是别名**；直接改列名或去掉任一套会使 `BeanPropertyRowMapper` 映射失败（证据等级：事实，`OpenManageService.java:41-43,70-71,80-82`）。
2. **`s_is_del` 语义不明且默认值为 1。** DDL 为 `s_is_del TINYINT DEFAULT 1 COMMENT 'compat delete flag'`，升级脚本把空值统一置为 1（`open_api_compat_upgrade.sql:57`）。代码中**从不读取该列做过滤**（所有业务查询用物理 DELETE 或 `status`），因此它当前是死列，但名字暗示"已删除"，容易被后续开发者误用（证据等级：事实）。
3. **无外键约束。** `open_app_api.app_id`、`open_app_api.api_id`、`open_api_doc.app_id` 均无 `FOREIGN KEY`；引用完整性完全由 Service 层手工维护（`deleteAppByIds` / `deleteApiByIds` 手工级联）（证据等级：事实）。
4. **`open_api_doc.api_ids` 是逗号分隔字符串。** `VARCHAR(500)` 存 ID 列表，运行期用 `Convert.toLongArray` 再 `selectApisByIds` 还原；ID 数量增多会撑爆 500 字符上限且无法索引（证据等级：事实）。
5. **`open_app_api` 主键是 `s_id` 自增，业务唯一键是 `uk_app_api`。** PostgreSQL 版本需确认是否同样声明了唯一约束（证据等级：假设，需比对 `deploy/local-docker/postgres/init/30-open-api.sql`）。
6. **`open_app.expire_time` 参与鉴权条件。** `where ... and (expire_time is null or expire_time > now())`；改时区或改列类型会直接影响应用可用性（证据等级：事实，`OpenApiSecurityService.java:243`）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 网关鉴权 | `OpenApiSecurityService.loadAppInfo` / `loadApiInfo` / `hasPermission` |
| 网关转发 | `OpenApiProxyService`（依赖 `target_url`、`timeout_ms`） |
| 管理页面 | `OpenAppController`、`OpenApiMgrController`、`OpenAuthController`、`OpenDocController`、`OpenLogController` |
| 领域对象 | `OpenApp`、`OpenApi`、`OpenAppApi`、`OpenCallLog`、`OpenApiDoc`（`OpenCallLog` 继承 `OptBaseEntity`，含 `sId`/`sCreateBy`/`sCreatedTime` 等兼容属性） |
| 升级脚本 | `open-api/sql/open_api_compat_upgrade.sql`（MySQL 存储过程 `add_column_if_absent`） |
| 种子脚本 | `open_api_selftest_seed.sql`、`open_api_httpbin_min_seed.sql` |

**变更建议**

- 先给两套列定版：明确"正式列"为唯一读写面，把 `s_*` 兼容列标记为待废弃并在 `database-schema.md` 中记录 `Writers=无`。
- 为 `open_api_doc.api_ids` 设计规范化子表（或在应用层强校验长度），并在文档中登记当前 500 字符上限。
- 补 `FOREIGN KEY` 或至少补应用层级联校验与唯一性测试；`saveAppAuth` 应先校验 `appId`/`apiId` 存在性（证据等级：推断）。
- 任何列改名必须同步四处：`OpenManageService` 的 SQL 字面量、三个方言 DDL 副本、`BeanPropertyRowMapper` 目标属性、Thymeleaf 模板的字段引用。

---

### HOT-MAPPER-SQL — Mapper XML 中的手写 SQL 与切面拼接 SQL

**热点位置**

| 文件 | 行数 | 关键点 | 证据等级 |
|---|---|---|---|
| `open-api/qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | 246 | 最多的动态 SQL；`limit 1`、`concat('%',#{x},'%')`、`del_flag='0'` | 事实 |
| `mapper/system/SysMenuMapper.xml` | 197 | 菜单树与权限查询；`deleteMenuById` 为物理删除 | 事实 |
| `mapper/system/SysDeptMapper.xml` | 158 | `select concat(d.dept_id, d.dept_name) as dept_name` | 事实 |
| `mapper/quartz/SysJobMapper.xml` | 142 | `now()` 时间函数 | 事实 |
| `mapper/system/SysRoleMapper.xml` / `SysRoleMenuMapper.xml` / `SysRoleDeptMapper.xml` | 134 / 34 / 34 | 角色、角色菜单、角色部门关联 | 事实 |
| `mapper/system/` 其余 12 个文件 | 34–123 | 字典、参数、公告、操作日志、登录日志、在线用户、岗位、用户岗位、用户角色 | 事实 |
| `framework/aspectj/DataScopeAspect.java` | 182 | 字符串拼装 `dataScope` SQL 片段 | 事实 |
| `open/service/OpenManageService.java` | 399 | `JdbcTemplate` 内联 SQL，含 `in (<拼接>)` 与 `::` 强制转换 | 事实 |

**为什么是热点**

1. **手写 SQL 总量 144 条 Mapper 语句 + 727 条 SQL 片段**（`docs/tools/assets.json` 的 `DaoMethods=144`、`SqlStatements=727`），任何列改名都要逐条排查，没有 ORM 映射层可以兜底（证据等级：事实）。
2. **方言差异已经埋入。**
   - `DataScopeAspect.dataScopeFilter` 用 `find_in_set( {} , ancestors )`（证据等级：事实，`DataScopeAspect.java:136`）。`find_in_set` **是 MySQL 专有函数，PostgreSQL 不存在**，因此"本部门及以下数据权限"（`data_scope='4'`）在 PostgreSQL 上必然执行失败。
   - `OpenManageService.queryLogStatsToday` 用 `call_time::date` 与 `round(avg(cost_ms)::numeric,2)`（PostgreSQL 专有）（证据等级：事实，`OpenManageService.java:344-345,354`）。
   - Mapper 中普遍使用 `limit 1`（PostgreSQL 支持，MySQL 支持），但 `concat()` 与 `now()` 的语义在两种数据库下都可用（证据等级：事实）。
3. **切面把 SQL 片段写进实体参数。** `DataScopeAspect` 把拼接结果放入 `BaseEntity.params.put("dataScope", " AND (...)")`，由 Mapper 动态 SQL 用 `${params.dataScope}` 之类的原样拼接输出；`clearDataScope` 每次先清空以防注入，但**这是唯一的防线**，任何新增的 `@DataScope` 用法若忘记先清空就会形成注入面（证据等级：事实，`DataScopeAspect.java:159-181`）。
4. **`in (...)` 手工拼接。** `OpenManageService` 的 `deleteAppByIds` / `deleteApiByIds` / `selectApisByIds` 用 `Collectors.joining(",")` 拼 ID 列表进 SQL 文本。当前入参经 `Convert.toLongArray` / `List<Long>`，不可注入；但**模式本身是危险的**，若后续改用字符串 ID 会立即变成注入漏洞（证据等级：推断）。
5. **`SysRoleDeptMapper.xml`、`SysRoleMenuMapper.xml`、`SysUserPostMapper.xml` 各只有 34 行**，是纯关联表操作，改动时容易被忽略但影响面最大（角色-菜单决定权限集合，角色-部门决定数据范围）（证据等级：事实）。
6. **`SysMenuMapper.deleteMenuById` 是物理删除** `delete from sys_menu where menu_id = ? or parent_id = ?`，而 `sys_user` / `sys_role` 用 `del_flag` 逻辑删除。语义不统一使"删除"的后果依赖具体表（证据等级：事实，`SysMenuMapper.xml:118`）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 系统域 | 用户、角色、菜单、部门、岗位、字典、参数、公告、操作日志、登录日志、在线用户 |
| 调度域 | `sys_job`、`sys_job_log` |
| 开放域 | `OpenManageService` 内联 SQL（不经 MyBatis） |
| 数据范围 | `DataScopeAspect` 生成的 SQL 片段 |
| 分页 | PageHelper 依据 `pagehelper.helperDialect` 改写 SQL |

**变更建议**

- 修复 `find_in_set`：改为数据库无关写法（例如在应用层展开 `ancestors` 后生成 `IN` 列表），并补 PostgreSQL 回归用例。
- 为 `queryLogStatsToday` 抽出方言适配层（或改用 `LocalDate` 参数比较替代 `::date`）。
- 把 `in (...)` 拼接全部改为 `JdbcTemplate.batchUpdate` 或参数化 `IN`，并在代码规约中禁止字符串拼 SQL（证据等级：推断）。
- 统一删除语义：明确哪些表用物理删除、哪些用逻辑删除，并在 [数据库关系](./database-relations.md) 中登记。
- 新增 `@DataScope` 用法时强制走 `clearDataScope` 路径，考虑用注解处理器或测试断言保障（证据等级：推断）。

---

### HOT-EXC-HANDLER — 全局异常处理器

**热点位置**

`open-api/qvsu-openapi/src/main/java/com/qvsu/framework/web/exception/GlobalExceptionHandler.java`（149 行，`@RestControllerAdvice`）

| 处理器 | 异常类型 | 返回 | 证据等级 |
|---|---|---|---|
| `handleAuthorizationException` | `AuthorizationException` | Ajax → `AjaxResult.error(PermissionUtils.getMsg(...))`；否则 `ModelAndView("error/unauth")` | 事实 |
| `handleHttpRequestMethodNotSupported` | `HttpRequestMethodNotSupportedException` | `AjaxResult.error(e.getMessage())` | 事实 |
| `handleRuntimeException` | `RuntimeException` | `AjaxResult.error(e.getMessage())` | 事实 |
| `handleException` | `Exception` | `AjaxResult.error(e.getMessage())` | 事实 |
| `handleServiceException` | `ServiceException` | Ajax → JSON；否则 `ModelAndView("error/service", ...)` | 事实 |
| `handleMissingPathVariableException` | `MissingPathVariableException` | `AjaxResult.error(...)` | 事实 |
| `handleMethodArgumentTypeMismatchException` | `MethodArgumentTypeMismatchException` | `AjaxResult.error(...)`，值经 `EscapeUtil.clean` | 事实 |
| `handleBindException` | `BindException` | `AjaxResult.error(e.getAllErrors().get(0).getDefaultMessage())` | 事实 |
| `handleDemoModeException` | `DemoModeException` | `AjaxResult.error("演示模式，不允许操作")` | 事实 |

**为什么是热点**

1. **`@RestControllerAdvice` 覆盖全部 Controller，包括页面渲染端点。** `handleRuntimeException` 与 `handleException` 无条件返回 `AjaxResult`（JSON）。若某个返回视图名的端点（如 `OpenGatewayController` 之外的任何 `@Controller` 页面方法）抛出未被前面处理器命中的异常，前端将收到 JSON 而不是渲染好的页面（证据等级：事实）。
2. **异常消息直接回显给调用方。** `handleException` / `handleRuntimeException` 都返回 `e.getMessage()`，会暴露数据库约束名、SQL 片段、类名等内部信息。例如 `OpenManageService.resetSecret` 的 `RuntimeException("app not found")`、数据库唯一约束冲突的驱动消息、文件路径信息等都会透出（证据等级：事实）。
3. **区分 Ajax 与页面的逻辑只写在 3 个处理器里。** `handleHttpRequestMethodNotSupported` / `handleRuntimeException` / `handleException` / `handleMissingPathVariableException` / `handleMethodArgumentTypeMismatchException` / `handleBindException` 都不做 `ServletUtils.isAjaxRequest` 判断，统一返回 JSON（证据等级：事实）。
4. **网关异常不会走到这里。** `OpenGatewayController.gateway` 自己 `catch` 了 `OpenProxyException` 与 `Exception`，并统一转成 `OpenResult.fail(...)`；`OpenApiFilter` 也在过滤器层写错误响应。因此**网关的错误格式与后台的错误格式是两套**（`OpenResult{code,msg,data}` vs `AjaxResult{code,msg,...}`），这对客户端契约是隐性差异（证据等级：事实）。
5. **异步与过滤器异常绕过全局处理器。** `LogAspect`、`AsyncFactory` 的异常被本地 `try/catch` 吞掉；`OpenApiFilter.writeError` 直接写响应。全局处理器只能覆盖 Spring MVC 分发阶段抛出的异常（证据等级：事实）。
6. **无测试断言。** 4 个测试类中没有任何一个断言错误响应体格式（证据等级：事实）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 全部 Controller | 24 个 Controller 类的错误响应 |
| 前端 | 所有依赖 `AjaxResult.code` 判断成功的表格/弹窗脚本 |
| 网关客户端 | `OpenResult` 契约 |
| 信息安全 | 异常消息中的内部信息暴露面 |
| 页面 | `error/unauth`、`error/service` 两个错误视图 |

**变更建议**

- 按返回类型分流：对返回视图名的端点保留 `ModelAndView` 分支，对 `@ResponseBody` / `@RestController` 端点返回 JSON（可依据 `ServletUtils.isAjaxRequest` 或 `@RestController` 注解判定）。
- 对外消息脱敏：数据库/驱动异常统一映射为通用文案，细节只写服务端日志（当前已有 `log.error`）。
- 统一网关与后台的错误契约，或在 [接口索引](./interface-index.md) 中显式声明两套契约的差异与适用面。
- 补错误响应格式的契约测试（证据等级：推断）。

---

### HOT-QUARTZ-JOB — 定时任务定义与反射调用

**热点位置**

| 文件 | 关键内容 | 证据等级 |
|---|---|---|
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/JobInvokeUtil.java` | `invokeMethod` / `invokeHttp` / `invokeBean`；`isValidClassName` 仅以点号数量判定类名 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/ScheduleUtils.java` | `createScheduleJob`；`whiteList` 方法存在但**调用点需确认** | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobServiceImpl.java` | `init`（启动加载全部 `sys_job`）、`pauseJob` / `resumeJob` / `changeStatus` / `run` / `deleteJobByIds` / `addJob` / `updateJob` / `updateSchedulerJob`，全部 `@Transactional(rollbackFor = Exception.class)` | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/util/AbstractQuartzJob.java` | `execute` / `before` / `after`；`ThreadLocal<Date>` 记录开始时间 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/QvsuTask.java` | Bean 任务样板：`qvsuNoParams` / `qvsuParams` / `qvsuMultipleParams` | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/task/HttpTask.java` | HTTP 任务样板：`get`/`post`/`put`/`delete`/`patch` 及 `doXxx` 带 headers 版本 | 事实 |
| `open-api/qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` | 15 个端点，11 个带 `@RequiresPermissions` | 事实 |
| `open-api/qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` / `SysJobLogMapper.xml` | 142 / 82 行手写 SQL | 事实 |

**为什么是热点**

1. **数据库行即代码。** `sys_job.invoke_target` 是一个字符串，`JobInvokeUtil` 解析为 `beanName.methodName(params)` 并反射调用。若 `isValidClassName` 判定为全限定类名（点号数 > 1），代码会执行 `Class.forName(beanName).getDeclaredConstructor().newInstance()`——**只要能把行写进 `sys_job`，就能触发任意类加载与任意无参构造**（证据等级：事实，`JobInvokeUtil.java:108-117,174-177`）。
2. **`invoke_target` 的参数解析是字符串版类型推断。** `getMethodParams` 以 `'`/`"` 判字符串、`true`/`false` 判布尔、`L` 结尾判 long、`D` 结尾判 double、其余一律当 Integer。传 `1.5`（无 `D` 后缀）会 `Integer.valueOf` 抛异常；传超长整型会溢出（证据等级：事实，`JobInvokeUtil.java:209-248`）。
3. **HTTP 任务可访问任意地址。** `invokeHttp` 使用注入的 `RestTemplate` 直接 `restTemplate.exchange(url, ...)`，`request_headers` 以 JSON 解析后原样设置请求头。**未做 URL 白名单或内网地址限制**（证据等级：事实，`JobInvokeUtil.java:54-92`）。`ScheduleUtils` 中确实存在 `whiteList` 相关方法，但其对 `invokeTarget` 的拦截范围需逐行确认（证据等级：假设）。
4. **启动期全量加载。** `SysJobServiceImpl.init()` 遍历 `sys_job` 全表并逐个建调度；表中有非法行时靠 `TaskException` 记日志跳过，不阻断启动，问题容易被忽略（证据等级：事实）。
5. **权限覆盖不全。** `SysJobController` 15 个端点中 4 个无 `@RequiresPermissions`：`checkCronExpressionIsValid`、`cron`、`queryCronExpression`、以及类级 `@RequestMapping` 之外的 `job()` 之外端点需逐一核对（证据等级：事实，`SysJobController.java:249-272`）。有权限码的 11 个端点依赖 `monitor:job:*`，而这些权限码对应的菜单在 `open_api_menu.sql` 中部分被删除（该脚本只删了 `monitor:operlog/logininfor/online/data/server/cache`，**未删 `monitor/job`**）（证据等级：事实）。
6. **`sys_job` 有 20 列，含 HTTP 专用列**（`request_url`、`request_method`、`request_headers`、`request_body`、`content_type`、`timeout`）与 Bean 专用列（`invoke_target`）共存，`job_type` 决定用哪一组；改任一列都要同时改 Mapper XML、`SysJob` 领域对象、`add.html`/`edit.html` 模板、`JobInvokeUtil` 分支（证据等级：事实）。
7. **`after` 恒写日志。** 即使 `sysJob` 拷贝失败，`after` 仍会尝试写 `sys_job_log`；`SpringUtils.getBean(ISysJobLogService.class)` 在容器未就绪时可能失败并只打日志（证据等级：推断）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 实体与表 | `sys_job`(20)、`sys_job_log`(8)、11 张 `QRTZ_*` |
| 服务与工具 | `SysJobServiceImpl`、`ScheduleUtils`、`AbstractQuartzJob`、`JobInvokeUtil`、`CronUtils`、`ScheduleConfig` |
| 任务实现 | `QvsuTask`、`HttpTask` 及其被反射调用的方法签名 |
| 前端 | `templates/monitor/job/{job,jobLog,add,edit,detail,cron}.html` |
| 安全 | 反射类加载面、任意 URL 出网面 |
| 一致性 | 数据库事务与 Quartz Scheduler 状态 |

**变更建议**

- 对 `invoke_target` 实施强白名单：限定可调用的 Bean 名/类名前缀与方法名集合，禁用全限定类名反射路径（或至少限制包前缀）。
- 对 HTTP 任务的 `request_url` 补目标白名单或内网地址拒绝清单，并记录出网审计。
- 给 `SysJobController` 未授权端点补权限码，或明确声明为"已登录即可访问"并登记风险。
- 增加"数据库事务与 Scheduler 状态一致性"的处理：先写库后同步调度器，或在失败时补偿（证据等级：推断）。
- 为 `sys_job` 的 20 列建立与 `SysJob` 字段、Mapper XML、模板字段的三方对照表。

---

### HOT-CALLLOG-COLS — `open_call_log` 字段结构

**热点位置**

| 项 | 内容 | 证据等级 |
|---|---|---|
| DDL | `open-api/sql/open_api.sql:60-86`，22 列 | 事实 |
| 结构变更脚本 | `open-api/sql/open_call_log_headers_upgrade.sql`（3 行）：`ALTER TABLE open_call_log ADD COLUMN req_headers TEXT NULL AFTER method, ADD COLUMN resp_headers TEXT NULL AFTER resp_code;` | 事实 |
| 索引 | `idx_trace_id`、`idx_app_key`、`idx_call_time` | 事实 |
| 写入点 | `OpenApiLogService.save` 写 13 列（**不含 `req_headers`、`resp_headers`**） | 事实 |
| 冗余写入点 | `OpenManageService.insertCallLog` 写同样 13 列（当前无调用方，属死代码）（证据等级：推断） | 推断 |
| 查询点 | `OpenManageService.selectLogList` / `queryLogStatsToday`；`OpenLogController.list` / `stats` / `exportCsv` | 事实 |
| 兼容升级 | `open_api_compat_upgrade.sql:40-45,79-85` 为 `open_call_log` 补 `create_time`/`update_time`/`s_status`/`s_is_del`/`s_created_time`/`s_updated_time` 并回填 | 事实 |

**为什么是热点**

1. **结构已经被改过一次。** `open_call_log_headers_upgrade.sql` 的存在说明 `req_headers` 与 `resp_headers` 是后加的列，且加列语句使用 MySQL 的 `AFTER` 语法；同时 `open_api.sql` 的完整 DDL 里已经包含这两列（`open-api/sql/open_api.sql:67,70`），说明**新库用完整 DDL、老库用升级脚本**，两条路径必须同时维护（证据等级：事实）。
2. **加列了但没写入。** 记录头信息的列存在，而写入 SQL 完全没有这两列；`OpenGatewayController` 已经把响应头序列化进请求属性 `OPEN_RESPONSE_HEADERS`（`OpenGatewayController.java:52,69,84`），但 `OpenApiLogService.save` 未读取该属性。**结果是"结构支持、能力缺失"的半成品状态**（证据等级：事实）。
3. **`resp_code` 语义偏弱。** 网关对下游响应统一返回 HTTP 200，`OPEN_RESPONSE_CODE` 也被统一写成 200，因此该列无法还原下游真实状态码；但对鉴权失败与转发失败，因为写入的是请求属性/变量而非真实 HTTP 码，取值规律依赖异常分支（证据等级：推断，依据 `OpenGatewayController.java:68,83,94` 与 `OpenApiLogService.java:42`）。
4. **`status` 编码是三态业务码而非 HTTP 码。** 0=成功、1=鉴权失败、2=转发失败（注释见 `open-api/sql/open_api.sql:73` 与 `OpenCallLog.java:40`），必须与错误码表（40001–40005、50001、50002）联合解读。
5. **正文列会被截断。** `req_body`、`resp_body`、`error_msg` 在写入前统一 `cut` 到 4000 字符（`TEXT_MAX_LENGTH`），但 DDL 中 `req_body`/`resp_body` 是 `TEXT`（PostgreSQL 无长度上限），`error_msg` 是 `VARCHAR(500)`——**若截断阈值 4000 与 `error_msg` 的 500 不匹配，超长 `error_msg` 会由数据库报错并被写入侧的 `catch` 吞掉，导致整条日志丢失**（证据等级：推断，依据 `OpenApiLogService.java:20,46` 与 `open-api/sql/open_api.sql:74`）。
6. **无过期清理。** 该表只增不删，没有清理任务、分区或归档策略；后台也没有删除/清理入口（`OpenLogController` 只有 4 个端点）。在 `logs.level.com.qvsu=debug` 与高频调用下会持续膨胀（证据等级：事实）。
7. **导出为全量。** `exportCsv` 不调用 `startPage()`，会把满足筛选条件的**全部**行读入内存并拼接字符串（证据等级：事实，`OpenLogController.java:81-108`）。

**影响面**

| 受影响面 | 具体对象 |
|---|---|
| 写入 | `OpenApiLogService.save`（网关每请求 1 行） |
| 查询 | `OpenManageService.selectLogList` / `queryLogStatsToday` |
| 页面与导出 | `templates/open/log/index.html`、`OpenLogController` |
| 领域对象 | `OpenCallLog`（继承 `OptBaseEntity`，含 `sId`/`sCreateBy`/`sCreatedTime`） |
| 脚本 | `open_api.sql`、`open_call_log_headers_upgrade.sql`、`open_api_compat_upgrade.sql`、`deploy/local-docker/{mysql,postgres}/init/30-open-api.sql` |
| 统计口径 | `queryLogStatsToday` 的 `status=0` 成功率与 `avg(cost_ms)` |

**变更建议**

- 决策两列 `req_headers` / `resp_headers`：要么在 `OpenApiLogService.save` 中读取 `OPEN_RESPONSE_HEADERS` 与请求头并写入，要么从 DDL 与升级脚本中删除以避免"看似有数据"的误解。
- 统一截断阈值与列宽：把 `error_msg` 改为 `TEXT`，或把 `cut` 阈值按列分别配置。
- 补日志保留策略（定时清理任务或分区），并在 [数据库模型](./database-model.md) 登记为运维必需项。
- 导出改为流式写出并复用列表的分页与筛选语义，或至少加行数上限（证据等级：推断）。
- 把 `resp_code` 改为记录下游真实 HTTP 状态码（需同步 `OpenGatewayController` 的属性写法与前端列定义）。

---

## 2. 耦合与依赖风险

### HOT-COUPLING — 模块间依赖与前端 URL 隐式契约

| 风险 | 具体表现 | 证据等级 |
|---|---|---|
| 开放域与系统域共享 Shiro 会话 | `/admin/open/**` 页面走 Shiro 会话与菜单权限；`/open/**` 网关走 appKey 签名，两套认证共存于同一 `SecurityManager` | 事实 |
| 开放域绕过 MyBatis | `com/qvsu/open/service/*` 全部使用 `JdbcTemplate` 内联 SQL，不经 Mapper；PageHelper 只对 `OpenLogController.list` / `OpenApiMgrController.list` 的 MyBatis 查询生效，而这两个查询也是 `JdbcTemplate`，因此**PageHelper 实际未生效于开放域查询**（证据等级：推断，依据 `OpenAppController.list` / `OpenLogController.list` 调 `startPage()` 但下游是 `jdbcTemplate.query`） | 推断 |
| 前端模板与接口路径隐式契约 | 144 个模板中 84 处 `var prefix = ctx + "<路径>"`；与 `@RequestMapping` 无编译期关联 | 事实 |
| 模板中硬编码 URL | `templates/open/log/index.html:39` `url: prefix + "/list"`、`:111` `window.location.href = prefix + '/exportCsv?' + q.join('&')`；`templates/open/auth/index.html:117` `url: prefix + "/save"`；`templates/open/api/index.html:30`、`templates/open/app/index.html:48` 同理 | 事实 |
| 重复的 `resolveBaseUrl` | `OpenApiMgrController.resolveBaseUrl` 与 `OpenDocController.resolveBaseUrl` 是逐字符相同的两份实现（含 `isDefaultPort`），改一处容易漏另一处 | 事实 |
| 重复的日志查询写入 | `OpenApiLogService.save` 与 `OpenManageService.insertCallLog` 是同一张表的两个写入实现 | 事实 |
| 网关与后台错误契约不同 | 网关返回 `OpenResult{code,msg,data}`；后台返回 `AjaxResult{code,msg,...}` | 事实 |
| `RestTemplate` 双来源 | `ResourcesConfig.restTemplate()` 定义 `@Bean`（供 `HttpTask`/`invokeHttp` 使用）；`OpenApiProxyService.forward` 每次请求 `new RestTemplate(...)` 手建实例，**不复用连接池** | 事实 |
| `TraceContext` 的 ThreadLocal 边界 | `OpenApiFilter` 在 `finally` 中 `TraceContext.clear()`；若将来引入异步 Servlet/`@Async` 转发，ThreadLocal 不会跨线程传递 | 事实 |
| 循环依赖风险 | `ShiroConfig.sessionManager()` 中 `SpringUtils.getBean(SpringSessionValidationScheduler.class)`，同时 `securityManager` 依赖 `sessionManager`；`getEhCacheManager()` 被多处调用。当前能启动说明依赖方向可解析，但 `SpringUtils.getBean` 的运行时查找绕过了构造期依赖检查（证据等级：推断） | 推断 |
| 主机头信任 | `resolveBaseUrl` 优先信 `X-Forwarded-Proto` / `X-Forwarded-Host` / `X-Forwarded-Port`，未做白名单校验；生成的 cURL 示例与下载文档中的地址可被请求方控制（证据等级：推断） | 推断 |
| 数字序列生成 | `IdUtils` / `Seq` / `UUID` 三个工具类共存；开放域用 `UUID.randomUUID()` 手拼 `ak_`/`sk_`；系统域无统一序列服务（证据等级：事实） | 事实 |

**变更建议**

- 把 URL 前缀抽成两侧共享的常量（后端用注解常量、前端用生成的清单），并加一致性检查脚本。
- 抽取 `resolveBaseUrl` 到公共工具类；对 `X-Forwarded-*` 做可信代理白名单校验。
- 统一日志写入入口（保留一个实现），统一错误契约或在文档中显式声明差异。
- `OpenApiProxyService` 改为复用带连接池的 `RestTemplate`/`HttpClient`（当前每请求新建工厂与模板，长连接与连接池均未使用）（证据等级：事实）。

### HOT-DIALECT — MySQL 与 PostgreSQL 双套脚本

| 风险 | 具体表现 | 证据等级 |
|---|---|---|
| 脚本份数 | `open-api/sql/` 7 个脚本 + `deploy/local-docker/mysql/init/` 7 个 + `deploy/local-docker/postgres/init/` 7 个，共 21 个 SQL 文件 | 事实 |
| 同名不同内容 | `open-api/sql/open_api.sql` 与 `deploy/local-docker/mysql/init/30-open-api.sql` 字节数完全相同（5323）；`deploy/local-docker/postgres/init/30-open-api.sql` 为 3735 字节，是改写版本 | 事实 |
| 方言专有语法 | MySQL：`AUTO_INCREMENT`、`ENGINE=InnoDB`、`TINYINT`、`LONGTEXT`、`AFTER column`、`ON DUPLICATE KEY UPDATE`、`SYSDATE()`、存储过程 + `DELIMITER`（`open_api_compat_upgrade.sql`）。PostgreSQL：`SERIAL`/`BIGSERIAL`、`now()`、`::` 强转 | 事实 |
| 运行时方言依赖 | `DataScopeAspect` 的 `find_in_set` 仅 MySQL 可用；`queryLogStatsToday` 的 `::date`/`::numeric` 仅 PostgreSQL 可用。**两处不可能同时正确** | 事实 |
| 编码不一致 | MySQL 版 `40-open-api-menu.sql` 中文正常；PostgreSQL 版同一文件中文乱码（`搴旂敤绠＄悊`） | 事实 |
| 列定义漂移 | `open_call_log_headers_upgrade.sql` 用 MySQL `AFTER` 语法，无 PostgreSQL 对应升级脚本 | 事实 |
| 种子脚本方言 | `open_api_httpbin_min_seed.sql` 使用 `ON DUPLICATE KEY UPDATE`（MySQL 专有），而项目生产库为 PostgreSQL | 事实 |
| 初始化顺序依赖 | `deploy/local-docker/postgres/init/` 依赖文件名前缀排序（`00-` → `10-` → `30-` → `31-` → `35-` → `40-` → `50-`）；重命名会改变执行顺序 | 事实 |

**变更建议**

- 选定唯一目标方言（现状为 PostgreSQL 11），把 MySQL 脚本标记为"仅本地演示"，并在 [数据库清单](./database-inventory.md) 中登记两套脚本的对应关系与差异。
- 修复 `find_in_set` 与 `::` 强转，使运行时代码与目标方言一致。
- 为 PostgreSQL 补 `req_headers`/`resp_headers` 的等价升级脚本（`ADD COLUMN` 不需要 `AFTER`）。
- 修复 PostgreSQL 初始化脚本的编码；把种子脚本改为方言无关写法（`INSERT ... WHERE NOT EXISTS` 或先 `DELETE` 后 `INSERT`，`open_api_selftest_seed.sql` 已采用后者）。
- 建立"两套脚本结构一致性"检查（比对表名、列名、索引名集合），避免只改一边。

---

## 3. 缺失的工程保障

### HOT-NO-TESTS — 测试覆盖与 CI

**现状（全部为事实）**

| 项 | 内容 |
|---|---|
| 测试类数量 | 4 个，全部在 `open-api/qvsu-openapi/src/test/java/com/qvsu/openapi/` |
| 测试类清单 | `AutoCaptchaLoginIntegrationTest.java`、`OpenApiManagementIntegrationTest.java`、`OpenManageCompatibilityIntegrationTest.java`、`QuartzManagementIntegrationTest.java` |
| 测试资源 | 仅 `src/test/resources/application-druid.yml` 一个文件 |
| 单元测试 | 0 个：没有任何 Mockito / 纯逻辑断言测试 |
| 测试类型 | 全部为集成测试，且依赖外部运行时（见下） |
| CI | `.github/workflows/blank.yml` 名为 `CI`，但只执行 `echo Hello, world!` 与 `echo Add other actions...`，不构建、不测试（`blank.yml:29-36`） |
| 构建校验 | 仓库中无 `Jenkinsfile`、`.gitlab-ci.yml`、`azure-pipelines.yml`、`Makefile` 等任何构建入口（证据等级：事实，仅 `.github/workflows/blank.yml` 一个流水线文件） |
| 接口契约测试 | 0 个：没有任何 schema/契约（如 OpenAPI 文档）驱动的测试 |
| 前端测试 | 0 个 |

**各测试的实际可运行性**

| 测试类 | 依赖 | 可离线运行 | 证据等级 |
|---|---|---|---|
| `OpenApiManagementIntegrationTest` | 需要一个已启动的实例（默认 `http://localhost:5656`）+ 已灌种子数据；`runProxySuite` 的目标指向公网 `httpbin.org` | 否 | 事实 |
| `AutoCaptchaLoginIntegrationTest` | 依赖 `qvsu.testing.exposeCaptchaCode=true` 暴露验证码 | 否（需实例） | 事实 |
| `QuartzManagementIntegrationTest` | `@SpringBootTest` + `@AutoConfigureMockMvc` + 真实 PostgreSQL（`localhost:5433`，见测试配置），并从 `deploy/local-docker/postgres/init` 装载 Quartz 数据 | 否 | 事实 |
| `OpenManageCompatibilityIntegrationTest` | 同类集成测试 | 否 | 事实 |

**为什么是热点**

1. **没有"改完就能验证"的基线。** 任何上表热点的改动都缺乏自动化回归：Shiro 过滤链、菜单权限、`open_*` 表结构、方言 SQL、Quartz 反射调用全部无测试保护（证据等级：事实）。
2. **测试默认会失败或跳过。** `OpenApiManagementIntegrationTest.shouldLoginAndSeeOpenApiMenusWhenCaptchaProvided` 在未提供验证码时用 `Assumptions.assumeTrue` 跳过；`shouldProxyHttpbinCategories` 无跳过条件，离线环境必然失败（目标为公网 `httpbin.org`）（证据等级：事实）。
3. **CI 形同虚设。** 名为 `CI` 的工作流不执行 `mvn`/`gradle` 任何目标，即使有人提交破坏性改动也不会被拦截（证据等级：事实）。
4. **测试与生产的数据库端口不一致。** 测试配置用 `5433`（对应 `deploy/local-docker` 暴露的宿主端口），主配置用 `5432`；`spring.datasource.druid.master.url` 被 `QuartzManagementIntegrationTest` 的 `@TestPropertySource` 相关断言引用（证据等级：事实）。
5. **仓库根 `README.md` 与 `open-api/README.md` 中文乱码**，新成员无法从文档获得准确的启动与测试步骤（证据等级：事实）。

**变更建议**

- 建立可离线运行的测试基线：至少覆盖 `OpenApiSecurityService.authenticate`（签名/时间戳/nonce/权限判定）、`DataScopeAspect.dataScopeFilter`（5 种 data_scope 的 SQL 片段生成）、`JobInvokeUtil.getMethodParams` / `isValidClassName`（参数解析）、`OpenLogController.csv`（转义）等纯逻辑。
- 把依赖外部实例的集成测试标注为 `@Tag("integration")` 并在 CI 中独立阶段运行；把 `httpbin.org` 目标改为本地 `/selftest/httpbin/*`（种子脚本已具备该能力，只需修改 `target_url`）。
- 让 `blank.yml` 真正执行构建与测试（`mvn -B verify` 或等价命令），并加方言冒烟（PostgreSQL 容器）。
- 修复两份 README 的编码，补精确的启动/测试/自检步骤。

### HOT-PERM-GAP — `@RequiresPermissions` 覆盖不完整

**现状（事实）**

| 指标 | 数值 | 来源 |
|---|---|---|
| Controller 端点总数 | 184 | `docs/tools/assets.json` 的 `Routes=184`；`docs/tools/semantics.json` 的 `Endpoints` 184 条 |
| 带权限码的端点 | 105 | `docs/tools/semantics.json` 中 `Permission` 非空计数 |
| 无权限码的端点 | 79 | 184 − 105 |
| 已登记的权限码总数 | 55 | `docs/tools/assets.json` 的 `PermissionCodes`，全部为 `system:*` 与 `monitor:job:*` |

**79 个未覆盖端点的分布（事实）**

| 来源 | 端点数量 | 保护机制 | 风险 |
|---|---|---|---|
| `com.qvsu.open.controller` 的 5 个管理 Controller（`OpenAppController` 9、`OpenApiMgrController` 9、`OpenAuthController` 6、`OpenDocController` 7、`OpenLogController` 5） | 36 | 仅 Shiro `/**` 段的 `user` 过滤器（需登录）+ 菜单可见性 | **任一登录用户可直接调用 `POST /admin/open/auth/save` 修改任意应用授权、调用 `/admin/open/app/resetSecret` 重置密钥、调用 `/admin/open/log/exportCsv` 全量导出含请求体的日志** |
| `OpenGatewayController` | 1 | `anon` + `OpenApiFilter` 的 appKey 签名 | 业务侧无问题；但 `need_sign=0` 的接口完全无认证 |
| `OpenSelftestHttpbinController` | 9 | `anon`（ShiroConfig 显式放行） | 自检桩在生产环境同样可访问，会回显请求参数/头/UA；`/selftest/httpbin/timeout` 可被用于占用线程 3 秒 |
| `CommonController`（上传下载） | 4 | 仅需登录 | 任意登录用户可上传文件到 `qvsu.profile` 并获取可访问 URL |
| `SysIndexController` | 6 | 仅需登录 | 含 `/lockscreen`、`/unlockscreen`、`/system/menuStyle/{style}` |
| `SysProfileController` | 9 | 仅需登录 | 个人中心，设计如此 |
| `SysLoginController` / `SysRegisterController` | 3 / 2 | `anon` | 设计如此 |
| 其余零散端点（`SysCaptchaController` 中未带码的 1 个、`SysJobController` 中的 `checkCronExpressionIsValid`/`cron`/`queryCronExpression`） | 9 | 仅需登录 | Cron 查询与校验非敏感；但 `SysJobLogController` 的 1 个未覆盖端点需确认 |

**补充事实**

- `open:*` 的 14 个权限码只存在于 `open-api/sql/open_api_menu.sql`（`open:app:view|list|add|edit|remove`、`open:api:view|list|add|edit|remove`、`open:auth:view|save`、`open:log:view|list`、`open:doc:view|generate`），代码中 0 处引用。
- 菜单 SQL 只把 `2100`–`2150` 授权给角色 `1` 与 `2`（`open_api_menu.sql:28-62`）。
- 前端模板对 `open` 模块**未使用任何 `shiro:hasPermission` 判断**（证据等级：事实，`templates/open/**` 中 grep 无匹配）——按钮显隐不依赖权限码。

**变更建议**

- 为 `open` 包 36 个管理端点补 `@RequiresPermissions`，复用已存在的 `open:*` 权限码（这样权限码才真正生效）；同时对 `/selftest/**` 与 `/common/**` 明确生产环境策略（`/selftest/**` 建议按 profile 关闭或限制来源）。
- 把"端点-权限码"对照表纳入 [接口索引](./interface-index.md)，并在发布前用脚本校验"每个非 `anon` 写操作端点都有权限码"。
- 若决定不引入注解式权限，则需在 [技术架构](./technical-architecture.md) 明确"该模块仅以登录与会话隔离为边界"的结论，避免误以为存在细粒度授权。

---

## 4. 数据一致性风险

### HOT-DATA-CONSIST — 事务边界、逻辑删除、编号生成、并发授权

**4.1 多表写入的事务边界（事实）**

| 操作 | 涉及表 | 事务标注 | 风险 |
|---|---|---|---|
| `saveAppAuth(appId, apiIds)` | `open_app_api`：先 D 后批量 C | `@Transactional` | 事务内先删后插；若同应用并发保存，后提交者覆盖前者（无版本号） |
| `deleteAppByIds(ids)` | `open_app_api` D + `open_app` D | `@Transactional` | 一致 |
| `deleteApiByIds(ids)` | `open_app_api` D + `open_api` D | `@Transactional` | 一致 |
| `insertApp(app)` / `insertApi(api)` | 单表 C | `@Transactional` | 标注但无多表操作 |
| `updateApp(app)` | `open_app` U | 无标注 | 单表，无实质风险 |
| `updateApi(api)` | `open_api` U | 无标注 | **SQL 未更新 `update_time`**，与 `updateApp` 不一致 |
| `saveDoc(doc)` | `open_api_doc` C | 无标注 | 无更新入口，持续累积 |
| `resetSecret(appId)` | `open_app` U | 无标注 | 影响行数为 0 时抛 `RuntimeException` |
| 网关调用日志写入 | `open_call_log` C | 无事务 | 写入失败被 `catch` 吞掉，日志静默丢失 |
| 登录 | `sys_user` U + `sys_logininfor` C（异步） | 无事务 | 异步线程失败则审计缺失 |
| 操作审计 | `sys_oper_log` C（异步 `TimerTask`） | 无事务 | 业务回滚后审计仍可能落库 |
| Quartz 任务增删改 | `sys_job` + `QRTZ_*` | `@Transactional(rollbackFor=Exception.class)` | 但 `QRTZ_*` 由 Scheduler 独立写入，**跨事务域** |

**4.2 逻辑删除语义不统一（事实）**

| 表 | 删除方式 | 证据 |
|---|---|---|
| `open_app`、`open_api`、`open_app_api` | 物理 DELETE | `OpenManageService.java:132-133,237-238,262` |
| `open_api_doc`、`open_call_log` | 无删除入口 | `OpenManageService` 无对应方法 |
| `sys_menu` | 物理 DELETE（含子节点） | `SysMenuMapper.xml:118` |
| `sys_user`、`sys_role`、`sys_dept`、`sys_post`、`sys_dict_*` | `del_flag` 逻辑删除 | Mapper 条件 `del_flag = '0'` |
| `open_*` 五表的 `s_is_del` 列 | **从不读取**，DDL 默认 1 | `open-api/sql/open_api.sql:22` 等 |

**风险**：`s_is_del` 默认 1 且无人使用，后续开发者可能按字面理解"1 表示已删除"从而写出错误过滤条件，导致所有数据被过滤或全部不过滤（证据等级：推断）。

**4.3 编号生成（事实）**

| 对象 | 生成方式 | 风险 |
|---|---|---|
| `open_app.app_key` | `"ak_" + UUID(去横线)前 16 位`（`genAppKey`） | 截断到 16 位十六进制（64 bit），碰撞概率高于完整 UUID；`app_key` 有 `UNIQUE` 约束，碰撞时插入失败并抛数据库异常 |
| `open_app.app_secret` | `"sk_" + UUID(去横线)`（`genAppSecret`） | 完整 UUID（128 bit），但**未使用加密安全随机源**（`java.util.UUID.randomUUID` 基于 `SecureRandom`，实际安全）（证据等级：事实） |
| 主键 | 全部为数据库自增/序列 | 依赖数据库方言 |
| `sys_job_log`、`sys_oper_log` 等 | 数据库自增 | 无 |
| 通用 ID 工具 | `IdUtils`、`Seq`、`UUID` 三个类并存，开放域未使用 | 无统一约定 |
| 文档编号 | `open_api_doc` 无编号列，靠 `doc_title` + `doc_version` 自由文本 | 无法保证唯一性，可重复生成同名同版本文档（证据等级：事实） |

**4.4 并发授权修改（推断，基于代码结构）**

- `saveAppAuth` 采用"先全删该应用授权、再批量插入"的模式，且 `open_app_api` 无版本列。两个管理员同时编辑同一应用的授权时，后提交者会完整覆盖前者的结果，且**没有任何冲突提示**（证据等级：推断）。
- `resetSecret(appId)` 无并发保护：两个管理员同时重置会生成两个新密钥，只有最后一次生效，先拿到密钥的一方立即失效（证据等级：推断）。
- `SysJobServiceImpl.changeStatus` / `run` 与 Quartz Scheduler 状态之间无分布式锁；多实例部署时 `sys_job` 的状态与各实例的 Scheduler 会漂移（证据等级：推断）。
- Ehcache 中的授权缓存与 `sys_role_menu` 之间无失效通知：多实例部署时，实例 A 改权限，实例 B 的缓存不会失效（证据等级：推断）。
- `OpenApiSecurityService` 的 `NONCE_CACHE` 与 `SysPasswordService` 的 `loginRecordCache` 都是进程内状态：多实例下 nonce 去重与登录重试计数都会失效（证据等级：事实/推断，见 [端到端流程索引](./flow-index.md) 的 FLOW-OPEN-GATEWAY 与 FLOW-ADMIN-LOGIN）。

**变更建议**

- 为 `open_app_api` 引入乐观锁（版本列）或改用差量更新（比对后只增删变化项），并在授权页提示"他人已修改"。
- 统一删除策略：明确 `open_*` 与 `sys_*` 各自的删除语义，删除或启用 `s_is_del`，把 `s_is_del` 列的处理写入 [数据库模型](./database-model.md) 与 [数据归属](./data-ownership.md)。
- 为 `app_key` 生成改用完整 UUID 或加长截断长度，并在写入前做唯一性重试。
- 将 nonce 与登录重试计数迁移到共享存储（如数据库表或集中缓存）以支持多实例。
- 补 `updateApi` 的 `update_time` 更新，统一所有 `update` 语句的时间戳行为。
- 为 `open_call_log` 与 `sys_oper_log` 建立保留策略，避免无界增长影响备份与查询性能。

---

## 5. 待确认项

| 项 | 说明 | 证据等级 |
|---|---|---|
| `ScheduleUtils.whiteList` 的实际拦截范围 | 方法存在，需逐行确认它是否真正限制 `invokeTarget` 的可调用目标 | 假设 |
| PostgreSQL 版 `30-open-api.sql` 是否声明 `uk_app_api` 唯一约束 | 影响 `saveAppAuth` 的 `on conflict (app_id, api_id)` 是否可用 | 假设 |
| `OpenManageService.insertCallLog` 是否有调用方 | 若为死代码应删除；若有调用方则需同步维护 | 推断 |
| `open_api.api_path` 的 `UNIQUE` 是否生效 | 若生效则同一路径无法配置多种 `method`，与 `loadApiInfo` 的 `method` 匹配逻辑存在语义冲突 | 假设 |
| `OpenApiFilter` 与 `XssFilter` 的运行时顺序 | 源码未显式声明，需在运行实例上验证 | 假设 |
| `error_msg` 超长时日志是否整条丢失 | `VARCHAR(500)` 与 4000 截断阈值不匹配，需在 PostgreSQL 上实测 | 推断 |
| `QvsuConfig.getUploadPath()` 与 `getDownloadPath()` 的目录关系 | 影响 `/common/download` 与 `/common/download/resource` 的路径拼接正确性 | 假设 |
| 生产部署形态（单实例还是多实例） | 决定 nonce、重试计数、授权缓存、Quartz 状态漂移风险的实际严重程度 | 假设 |
| `open_*` 五表的 `s_*` 兼容列是否为外部系统依赖 | 若有外部消费者直接读写这些列，则不能简单废弃 | 假设 |
