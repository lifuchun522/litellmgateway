# 模块索引（module-index）

- 文档语言: zh-CN
- 归属系统: QVSU OpenAPI 管理网关（精简版，`open-api/qvsu-openapi`）
- 稳定 ID 主定义范围: `MOD-*`（模块）、`SVC-*`（对外提供可复用能力的服务）
- 本文件是 `MOD-*` 与 `SVC-*` 的**唯一主定义文件**，其他文档只能引用本文件的 ID，不得重复定义
- 最后核验: 2026-09-29，依据 `open-api/qvsu-openapi/src/main/java` 全量 265 个 `.java` 文件、`pom.xml`、`src/main/resources/mapper/**`、`src/main/resources/templates/**`
- 源码根前缀: 本文所有「文件路径」列的相对路径均以 `open-api/qvsu-openapi/src/main/java/` 为前缀
- 相关文档: [技术架构](./technical-architecture.md)、[源码资产清单](./source-asset-inventory.md)、[功能清单](./functional-inventory.md)

## 1. 范围、方法与证据等级

### 1.1 覆盖范围

| 项 | 值 | 证据等级 |
|---|---|---|
| 被索引的顶层包 | `com.qvsu.common`、`com.qvsu.framework`、`com.qvsu.system`、`com.qvsu.quartz`、`com.qvsu.open`、`com.qvsu.web` 共 6 个，逐一对应 MOD-common / MOD-framework / MOD-system / MOD-quartz / MOD-open / MOD-web；另含承载启动类的根包 `com.qvsu`，其 2 个类归入 MOD-framework（见 3.2.2） | 事实 |
| 模块 ID 命名规则 | 模块 ID 使用顶级包短名（`MOD-<包名>`），固定 6 个，不增不减；服务 ID 使用 `SVC-001` 至 `SVC-026` 顺序编号 | 事实 |
| `src/main/java` 下包目录总数 | 88 个（其中 77 个目录直接包含 `.java` 且声明了对应包；11 个为仅含子包的聚合目录：`com`、`com/qvsu/common`、`com/qvsu/common/core`、`com/qvsu/framework`、`com/qvsu/framework/shiro`、`com/qvsu/framework/web`、`com/qvsu/open`、`com/qvsu/quartz`、`com/qvsu/system`、`com/qvsu/web`、`com/qvsu/web/controller`） | 事实 |
| `src/main/java` 下 `.java` 文件数 | 265 个 | 事实 |
| 各顶层包文件数 | `common` 113、`framework` 44、`system` 50、`quartz` 19、`open` 22、`web` 15、根包 `com.qvsu` 2 | 事实 |
| `src/test/java` 包目录 | 3 个目录 / 1 个包 `com.qvsu.openapi` / 4 个集成测试类；不属于本文 6 个顶层包的运行时代码 | 事实 |

### 1.2 证据等级定义

| 等级 | 含义 |
|---|---|
| 事实 | 直接读取源码、配置或 SQL 文件得到，可由文件路径复核 |
| 推断 | 由多处源码证据归纳得到，未被单一文件直接声明 |
| 假设 | 缺少直接证据、需要运行或人工确认的判断 |

### 1.3 依赖判定方法

模块间依赖方向由 `import com.qvsu.*` 的**全量扫描**得出（265 个文件逐文件解析 import，排除同顶级模块内部引用），不依赖目录命名习惯或文档描述。扫描脚本按「源顶级模块 → 目标顶级模块」计数，结果见第 4 节。

## 2. 模块总览

| ID | 模块名称 | 顶层包 | 包目录数 | 类数 | 对外服务数 | 所属部署单元 | 证据等级 |
|---|---|---|---:|---:|---:|---|---|
| MOD-common | 通用基座模块 | `com.qvsu.common` | 33 | 113 | 0 个服务接口（提供基类与静态工具能力） | 单体 `qvsu-openapi` | 事实 |
| MOD-framework | 框架层模块（含根包启动类） | `com.qvsu.framework` + 根包 `com.qvsu` | 27 | 46 | 7 | 单体 `qvsu-openapi` | 事实 |
| MOD-system | 系统管理域模块 | `com.qvsu.system` | 5 | 50 | 12 | 单体 `qvsu-openapi` | 事实 |
| MOD-quartz | 调度域模块 | `com.qvsu.quartz` | 9 | 19 | 2 | 单体 `qvsu-openapi` | 事实 |
| MOD-open | OpenAPI 管理网关模块 | `com.qvsu.open` | 9 | 22 | 5 | 单体 `qvsu-openapi` | 事实 |
| MOD-web | Web 入口层模块 | `com.qvsu.web` | 4 | 15 | 0 个服务接口（提供 15 个控制器） | 单体 `qvsu-openapi` | 事实 |

## 3. 模块主定义

### 3.1 MOD-common 通用基座模块

## MOD-common - 通用基座模块（com.qvsu.common）

- ID: MOD-common
- 名称: 通用基座模块（通用基座 / Common Foundation）
- 源码路径（顶层包）: `com.qvsu.common`
- 职责: 为全部上层模块提供零业务依赖的公共基座：注解定义、常量、核心基类与统一响应体、分页模型、枚举、异常体系、JSON 包装、通用工具类（字符串/日期/文件/Excel/HTTP/IP/加密/反射/Spring 容器/命名/SQL 转义）、XSS 防护，以及 6 个系统核心领域实体（`SysUser`、`SysRole`、`SysMenu`、`SysDept`、`SysDictType`、`SysDictData`）的宿主包。该模块对 `com.qvsu` 内其他模块**零出向依赖**，是全项目的依赖汇聚点。
- 包含的关键类: 无 Controller、无 Service、无 ServiceImpl、无 Mapper；共 113 个类，全部为实现基类、注解、枚举、常量、异常与工具类，明细见 3.1.1
- 对外提供的服务: 不定义服务接口（无 `MOD-common` 命名空间下的 `@Service`/`@Component` 业务服务）。对外可复用能力以「基类 + 静态方法 + 注解 + 全局过滤器」形式提供：`BaseController`（控制器基类，24 个控制器中的 21 个继承它；`CommonController`、`OpenGatewayController`、`OpenSelftestHttpbinController` 3 个未继承）、`AjaxResult`/`TableDataInfo`/`R`（统一响应体）、`BaseEntity`/`OptBaseEntity`/`TreeEntity`（领域实体基类）、`Constants`/`PermissionConstants`/`ShiroConstants`/`UserConstants`/`ScheduleConstants`/`GenConstants`（常量）、`@DataScope`/`@DataSource`/`@Log`/`@RepeatSubmit`/`@Sensitive`/`@Excel`/`@Excels`/`@Anonymous`（注解，由 MOD-framework 的切面与过滤器消费）、`XssFilter`（由 MOD-framework 的 `FilterConfig` 注册）。因均非 Spring 服务 Bean，本文不为其分配 `SVC-` 编号，避免与「服务」语义混淆（推断）。
- 依赖的其他模块: 无。全量 import 扫描显示 `com.qvsu.common` 对 `com.qvsu.framework`、`com.qvsu.system`、`com.qvsu.quartz`、`com.qvsu.open`、`com.qvsu.web` 的出向 import 数均为 0（事实）
- 所属部署单元: 单体应用 `qvsu-openapi`（`open-api/qvsu-openapi/pom.xml`，`artifactId=qvsu-openapi`、`version=1.0.0`、`packaging=jar`、`finalName=qvsu-openapi`）
- 证据等级: 事实

#### 3.1.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/common/annotation` | `Anonymous` | `com/qvsu/common/annotation/Anonymous.java` | 注解 |
| `com/qvsu/common/annotation` | `DataScope` | `com/qvsu/common/annotation/DataScope.java` | 注解 |
| `com/qvsu/common/annotation` | `DataSource` | `com/qvsu/common/annotation/DataSource.java` | 注解 |
| `com/qvsu/common/annotation` | `Excel` | `com/qvsu/common/annotation/Excel.java` | 注解 |
| `com/qvsu/common/annotation` | `Excels` | `com/qvsu/common/annotation/Excels.java` | 注解 |
| `com/qvsu/common/annotation` | `Log` | `com/qvsu/common/annotation/Log.java` | 注解 |
| `com/qvsu/common/annotation` | `RepeatSubmit` | `com/qvsu/common/annotation/RepeatSubmit.java` | 注解 |
| `com/qvsu/common/annotation` | `Sensitive` | `com/qvsu/common/annotation/Sensitive.java` | 注解 |
| `com/qvsu/common/config` | `QvsuConfig` | `com/qvsu/common/config/QvsuConfig.java` | 配置类（`@ConfigurationProperties(prefix="qvsu")`） |
| `com/qvsu/common/config` | `ServerConfig` | `com/qvsu/common/config/ServerConfig.java` | 配置类（启动时打印访问地址） |
| `com/qvsu/common/config/datasource` | `DynamicDataSourceContextHolder` | `com/qvsu/common/config/datasource/DynamicDataSourceContextHolder.java` | 工具类（数据源上下文） |
| `com/qvsu/common/config/serializer` | `SensitiveJsonSerializer` | `com/qvsu/common/config/serializer/SensitiveJsonSerializer.java` | 序列化器 |
| `com/qvsu/common/config/thread` | `ThreadPoolConfig` | `com/qvsu/common/config/thread/ThreadPoolConfig.java` | 配置类（线程池） |
| `com/qvsu/common/constant` | `Constants` | `com/qvsu/common/constant/Constants.java` | 常量类 |
| `com/qvsu/common/constant` | `GenConstants` | `com/qvsu/common/constant/GenConstants.java` | 常量类（代码生成残留） |
| `com/qvsu/common/constant` | `PermissionConstants` | `com/qvsu/common/constant/PermissionConstants.java` | 常量类 |
| `com/qvsu/common/constant` | `ScheduleConstants` | `com/qvsu/common/constant/ScheduleConstants.java` | 常量类 |
| `com/qvsu/common/constant` | `ShiroConstants` | `com/qvsu/common/constant/ShiroConstants.java` | 常量类 |
| `com/qvsu/common/constant` | `UserConstants` | `com/qvsu/common/constant/UserConstants.java` | 常量类 |
| `com/qvsu/common/core/context` | `PermissionContextHolder` | `com/qvsu/common/core/context/PermissionContextHolder.java` | 工具类（权限上下文） |
| `com/qvsu/common/core/controller` | `BaseController` | `com/qvsu/common/core/controller/BaseController.java` | 基类（全部业务控制器父类） |
| `com/qvsu/common/core/domain` | `AjaxResult` | `com/qvsu/common/core/domain/AjaxResult.java` | 统一响应体 |
| `com/qvsu/common/core/domain` | `BaseEntity` | `com/qvsu/common/core/domain/BaseEntity.java` | 实体基类 |
| `com/qvsu/common/core/domain` | `CxSelect` | `com/qvsu/common/core/domain/CxSelect.java` | 视图对象（级联下拉） |
| `com/qvsu/common/core/domain` | `OptBaseEntity` | `com/qvsu/common/core/domain/OptBaseEntity.java` | 实体基类（OpenAPI 域实体父类） |
| `com/qvsu/common/core/domain` | `R` | `com/qvsu/common/core/domain/R.java` | 统一响应体 |
| `com/qvsu/common/core/domain` | `TreeEntity` | `com/qvsu/common/core/domain/TreeEntity.java` | 实体基类（树形） |
| `com/qvsu/common/core/domain` | `Ztree` | `com/qvsu/common/core/domain/Ztree.java` | 视图对象（树节点） |
| `com/qvsu/common/core/domain/entity` | `SysDept` | `com/qvsu/common/core/domain/entity/SysDept.java` | 领域实体（映射 `sys_dept`） |
| `com/qvsu/common/core/domain/entity` | `SysDictData` | `com/qvsu/common/core/domain/entity/SysDictData.java` | 领域实体（映射 `sys_dict_data`） |
| `com/qvsu/common/core/domain/entity` | `SysDictType` | `com/qvsu/common/core/domain/entity/SysDictType.java` | 领域实体（映射 `sys_dict_type`） |
| `com/qvsu/common/core/domain/entity` | `SysMenu` | `com/qvsu/common/core/domain/entity/SysMenu.java` | 领域实体（映射 `sys_menu`） |
| `com/qvsu/common/core/domain/entity` | `SysRole` | `com/qvsu/common/core/domain/entity/SysRole.java` | 领域实体（映射 `sys_role`） |
| `com/qvsu/common/core/domain/entity` | `SysUser` | `com/qvsu/common/core/domain/entity/SysUser.java` | 领域实体（映射 `sys_user`） |
| `com/qvsu/common/core/page` | `PageDomain` | `com/qvsu/common/core/page/PageDomain.java` | 分页模型 |
| `com/qvsu/common/core/page` | `TableDataInfo` | `com/qvsu/common/core/page/TableDataInfo.java` | 分页响应体 |
| `com/qvsu/common/core/page` | `TableSupport` | `com/qvsu/common/core/page/TableSupport.java` | 分页工具 |
| `com/qvsu/common/core/text` | `CharsetKit` | `com/qvsu/common/core/text/CharsetKit.java` | 工具类 |
| `com/qvsu/common/core/text` | `Convert` | `com/qvsu/common/core/text/Convert.java` | 工具类（类型转换，被 MOD-open 复用） |
| `com/qvsu/common/core/text` | `StrFormatter` | `com/qvsu/common/core/text/StrFormatter.java` | 工具类 |
| `com/qvsu/common/enums` | `BusinessStatus` | `com/qvsu/common/enums/BusinessStatus.java` | 枚举 |
| `com/qvsu/common/enums` | `BusinessType` | `com/qvsu/common/enums/BusinessType.java` | 枚举 |
| `com/qvsu/common/enums` | `DataSourceType` | `com/qvsu/common/enums/DataSourceType.java` | 枚举 |
| `com/qvsu/common/enums` | `DesensitizedType` | `com/qvsu/common/enums/DesensitizedType.java` | 枚举 |
| `com/qvsu/common/enums` | `OnlineStatus` | `com/qvsu/common/enums/OnlineStatus.java` | 枚举 |
| `com/qvsu/common/enums` | `OperatorType` | `com/qvsu/common/enums/OperatorType.java` | 枚举 |
| `com/qvsu/common/enums` | `UserStatus` | `com/qvsu/common/enums/UserStatus.java` | 枚举 |
| `com/qvsu/common/exception` | `DemoModeException` | `com/qvsu/common/exception/DemoModeException.java` | 异常 |
| `com/qvsu/common/exception` | `GlobalException` | `com/qvsu/common/exception/GlobalException.java` | 异常 |
| `com/qvsu/common/exception` | `ServiceException` | `com/qvsu/common/exception/ServiceException.java` | 异常 |
| `com/qvsu/common/exception` | `UtilException` | `com/qvsu/common/exception/UtilException.java` | 异常 |
| `com/qvsu/common/exception/base` | `BaseException` | `com/qvsu/common/exception/base/BaseException.java` | 异常基类 |
| `com/qvsu/common/exception/file` | `FileException` | `com/qvsu/common/exception/file/FileException.java` | 异常 |
| `com/qvsu/common/exception/file` | `FileNameLengthLimitExceededException` | `com/qvsu/common/exception/file/FileNameLengthLimitExceededException.java` | 异常 |
| `com/qvsu/common/exception/file` | `FileSizeLimitExceededException` | `com/qvsu/common/exception/file/FileSizeLimitExceededException.java` | 异常 |
| `com/qvsu/common/exception/file` | `FileUploadException` | `com/qvsu/common/exception/file/FileUploadException.java` | 异常 |
| `com/qvsu/common/exception/file` | `InvalidExtensionException` | `com/qvsu/common/exception/file/InvalidExtensionException.java` | 异常 |
| `com/qvsu/common/exception/job` | `TaskException` | `com/qvsu/common/exception/job/TaskException.java` | 异常（被 MOD-quartz 复用） |
| `com/qvsu/common/exception/user` | `BlackListException` | `com/qvsu/common/exception/user/BlackListException.java` | 异常 |
| `com/qvsu/common/exception/user` | `CaptchaException` | `com/qvsu/common/exception/user/CaptchaException.java` | 异常 |
| `com/qvsu/common/exception/user` | `RoleBlockedException` | `com/qvsu/common/exception/user/RoleBlockedException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserBlockedException` | `com/qvsu/common/exception/user/UserBlockedException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserDeleteException` | `com/qvsu/common/exception/user/UserDeleteException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserException` | `com/qvsu/common/exception/user/UserException.java` | 异常基类 |
| `com/qvsu/common/exception/user` | `UserNotExistsException` | `com/qvsu/common/exception/user/UserNotExistsException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserPasswordNotMatchException` | `com/qvsu/common/exception/user/UserPasswordNotMatchException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserPasswordRetryLimitCountException` | `com/qvsu/common/exception/user/UserPasswordRetryLimitCountException.java` | 异常 |
| `com/qvsu/common/exception/user` | `UserPasswordRetryLimitExceedException` | `com/qvsu/common/exception/user/UserPasswordRetryLimitExceedException.java` | 异常 |
| `com/qvsu/common/json` | `JSON` | `com/qvsu/common/json/JSON.java` | 工具类（fastjson 封装） |
| `com/qvsu/common/json` | `JSONObject` | `com/qvsu/common/json/JSONObject.java` | 工具类 |
| `com/qvsu/common/utils` | `AddressUtils` | `com/qvsu/common/utils/AddressUtils.java` | 工具类 |
| `com/qvsu/common/utils` | `Arith` | `com/qvsu/common/utils/Arith.java` | 工具类（精确运算） |
| `com/qvsu/common/utils` | `CacheUtils` | `com/qvsu/common/utils/CacheUtils.java` | 工具类（Ehcache/Shiro 缓存访问） |
| `com/qvsu/common/utils` | `CookieUtils` | `com/qvsu/common/utils/CookieUtils.java` | 工具类 |
| `com/qvsu/common/utils` | `DateUtils` | `com/qvsu/common/utils/DateUtils.java` | 工具类 |
| `com/qvsu/common/utils` | `DesensitizedUtil` | `com/qvsu/common/utils/DesensitizedUtil.java` | 工具类（脱敏） |
| `com/qvsu/common/utils` | `DictUtils` | `com/qvsu/common/utils/DictUtils.java` | 工具类（字典缓存，被 Thymeleaf 模板消费） |
| `com/qvsu/common/utils` | `ExceptionUtil` | `com/qvsu/common/utils/ExceptionUtil.java` | 工具类 |
| `com/qvsu/common/utils` | `IpUtils` | `com/qvsu/common/utils/IpUtils.java` | 工具类（被 MOD-open `OpenApiLogService` 复用） |
| `com/qvsu/common/utils` | `LogUtils` | `com/qvsu/common/utils/LogUtils.java` | 工具类 |
| `com/qvsu/common/utils` | `MapDataUtil` | `com/qvsu/common/utils/MapDataUtil.java` | 工具类 |
| `com/qvsu/common/utils` | `MessageUtils` | `com/qvsu/common/utils/MessageUtils.java` | 工具类（i18n） |
| `com/qvsu/common/utils` | `PageUtils` | `com/qvsu/common/utils/PageUtils.java` | 工具类（PageHelper 分页） |
| `com/qvsu/common/utils` | `ServletUtils` | `com/qvsu/common/utils/ServletUtils.java` | 工具类 |
| `com/qvsu/common/utils` | `ShiroUtils` | `com/qvsu/common/utils/ShiroUtils.java` | 工具类（当前登录用户） |
| `com/qvsu/common/utils` | `StringUtils` | `com/qvsu/common/utils/StringUtils.java` | 工具类（被 MOD-open 全量复用） |
| `com/qvsu/common/utils` | `Threads` | `com/qvsu/common/utils/Threads.java` | 工具类 |
| `com/qvsu/common/utils/bean` | `BeanUtils` | `com/qvsu/common/utils/bean/BeanUtils.java` | 工具类 |
| `com/qvsu/common/utils/bean` | `BeanValidators` | `com/qvsu/common/utils/bean/BeanValidators.java` | 工具类 |
| `com/qvsu/common/utils/file` | `FileTypeUtils` | `com/qvsu/common/utils/file/FileTypeUtils.java` | 工具类 |
| `com/qvsu/common/utils/file` | `FileUploadUtils` | `com/qvsu/common/utils/file/FileUploadUtils.java` | 工具类（被 `CommonController`、`SysProfileController` 复用） |
| `com/qvsu/common/utils/file` | `FileUtils` | `com/qvsu/common/utils/file/FileUtils.java` | 工具类 |
| `com/qvsu/common/utils/file` | `ImageUtils` | `com/qvsu/common/utils/file/ImageUtils.java` | 工具类 |
| `com/qvsu/common/utils/file` | `MimeTypeUtils` | `com/qvsu/common/utils/file/MimeTypeUtils.java` | 工具类 |
| `com/qvsu/common/utils/html` | `EscapeUtil` | `com/qvsu/common/utils/html/EscapeUtil.java` | 工具类 |
| `com/qvsu/common/utils/html` | `HTMLFilter` | `com/qvsu/common/utils/html/HTMLFilter.java` | 工具类（HTML 白名单过滤） |
| `com/qvsu/common/utils/http` | `HttpUtils` | `com/qvsu/common/utils/http/HttpUtils.java` | 工具类 |
| `com/qvsu/common/utils/http` | `UserAgentUtils` | `com/qvsu/common/utils/http/UserAgentUtils.java` | 工具类（yauaa 解析 UA） |
| `com/qvsu/common/utils/poi` | `ExcelHandlerAdapter` | `com/qvsu/common/utils/poi/ExcelHandlerAdapter.java` | 接口（Excel 处理器扩展点） |
| `com/qvsu/common/utils/poi` | `ExcelUtil` | `com/qvsu/common/utils/poi/ExcelUtil.java` | 工具类（导出/导入 Excel） |
| `com/qvsu/common/utils/reflect` | `ReflectUtils` | `com/qvsu/common/utils/reflect/ReflectUtils.java` | 工具类（被 `JobInvokeUtil` 复用） |
| `com/qvsu/common/utils/security` | `CipherUtils` | `com/qvsu/common/utils/security/CipherUtils.java` | 工具类（AES） |
| `com/qvsu/common/utils/security` | `Md5Utils` | `com/qvsu/common/utils/security/Md5Utils.java` | 工具类（口令散列） |
| `com/qvsu/common/utils/security` | `PermissionUtils` | `com/qvsu/common/utils/security/PermissionUtils.java` | 工具类（权限串解析） |
| `com/qvsu/common/utils/spring` | `SpringUtils` | `com/qvsu/common/utils/spring/SpringUtils.java` | 工具类（容器静态访问） |
| `com/qvsu/common/utils/sql` | `SqlUtil` | `com/qvsu/common/utils/sql/SqlUtil.java` | 工具类（排序字段注入防护） |
| `com/qvsu/common/utils/uuid` | `IdUtils` | `com/qvsu/common/utils/uuid/IdUtils.java` | 工具类 |
| `com/qvsu/common/utils/uuid` | `Seq` | `com/qvsu/common/utils/uuid/Seq.java` | 工具类 |
| `com/qvsu/common/utils/uuid` | `UUID` | `com/qvsu/common/utils/uuid/UUID.java` | 工具类 |
| `com/qvsu/common/xss` | `Xss` | `com/qvsu/common/xss/Xss.java` | 注解 |
| `com/qvsu/common/xss` | `XssFilter` | `com/qvsu/common/xss/XssFilter.java` | 过滤器（由 MOD-framework `FilterConfig` 注册） |
| `com/qvsu/common/xss` | `XssHttpServletRequestWrapper` | `com/qvsu/common/xss/XssHttpServletRequestWrapper.java` | 请求包装器 |
| `com/qvsu/common/xss` | `XssValidator` | `com/qvsu/common/xss/XssValidator.java` | 校验器 |

### 3.2 MOD-framework 框架层模块

## MOD-framework - 框架层模块（com.qvsu.framework）

- ID: MOD-framework
- 名称: 框架层模块（框架与横切能力，含应用启动类）
- 源码路径（顶层包）: `com.qvsu.framework`；并含根包 `com.qvsu` 的 2 个启动类（见 3.2.2 与归并说明）
- 职责: 承载全部技术框架装配与横切关注点：Shiro 安全框架（`ShiroConfig`、`UserRealm`、会话/在线管理、验证码/CSRF/踢出/在线/同步 5 类过滤器、记住我）、数据源与动态数据源、MyBatis 与 PageHelper 配置、AOP 切面（数据权限、多数据源、操作日志、权限二次校验）、拦截器（重复提交）、异步管理器与工厂、全局异常处理，以及专门服务 Thymeleaf 模板的 3 个视图服务（`ConfigService`、`DictService`、`PermissionService`）。同时承担唯一进程入口与部署构件边界：Spring Boot 启动类（`@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })`，因使用 Druid 多数据源而排除自动装配）与 war 部署适配器（`SpringBootServletInitializer` 子类）。
- 包含的关键类: 无 Controller、无 Mapper；含 7 个服务类（`ConfigService`、`DictService`、`PermissionService`、`SysLoginService`、`SysPasswordService`、`SysRegisterService`、`SysShiroService`）、4 个切面类、9 个配置类、6 个过滤器/包装类、3 个在线会话类与 2 个根包启动类，共 46 个类，明细见 3.2.1 与 3.2.2
- 对外提供的服务: SVC-001、SVC-002、SVC-003（Thymeleaf 模板服务）、SVC-004、SVC-005、SVC-006、SVC-007（Shiro 会话与登录服务）；另对外提供 `ShiroConfig`（Shiro 过滤器链装配）、`GlobalExceptionHandler`（全局异常兜底）、`AsyncManager`/`AsyncFactory`（异步落库日志）、`AuthorizationUtils`（权限缓存清理），以及进程入口 `QvsuApplication.main(String[])` 与 war 部署入口 `QvsuServletInitializer.configure(SpringApplicationBuilder)`
- 依赖的其他模块: MOD-common（`common.annotation` 6 处、`common.config` 3 处、`common.constant` 20 处、`common.core` 24 处、`common.enums` 6 处、`common.exception` 16 处、`common.json` 2 处、`common.utils` 62 处、`common.xss` 1 处 import，合计 140 处）；MOD-system（`system.service` 15 处、`system.domain` 6 处 import，合计 21 处）；模块内自引用 42 处。不依赖 MOD-quartz / MOD-open / MOD-web
- 所属部署单元: 单体应用 `qvsu-openapi`（`open-api/qvsu-openapi/pom.xml`：`com.qvsu:qvsu-openapi:1.0.0`、`packaging=jar`、`finalName=qvsu-openapi`；`server.port=5656`、`server.servlet.context-path=/`；`deploy/local-docker` 提供应用 + `postgres:11` 编排）
- 证据等级: 事实（框架类、启动类与 pom）／推断（运行时装配范围，依据 `@SpringBootApplication` 默认扫描根包 `com.qvsu`）

#### 3.2.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/framework/aspectj` | `DataScopeAspect` | `com/qvsu/framework/aspectj/DataScopeAspect.java` | 切面（数据权限） |
| `com/qvsu/framework/aspectj` | `DataSourceAspect` | `com/qvsu/framework/aspectj/DataSourceAspect.java` | 切面（多数据源路由） |
| `com/qvsu/framework/aspectj` | `LogAspect` | `com/qvsu/framework/aspectj/LogAspect.java` | 切面（操作日志） |
| `com/qvsu/framework/aspectj` | `PermissionsAspect` | `com/qvsu/framework/aspectj/PermissionsAspect.java` | 切面（权限注解校验） |
| `com/qvsu/framework/config` | `ApplicationConfig` | `com/qvsu/framework/config/ApplicationConfig.java` | 配置类 |
| `com/qvsu/framework/config` | `CaptchaConfig` | `com/qvsu/framework/config/CaptchaConfig.java` | 配置类（kaptcha） |
| `com/qvsu/framework/config` | `DruidConfig` | `com/qvsu/framework/config/DruidConfig.java` | 配置类（主从数据源与动态数据源） |
| `com/qvsu/framework/config` | `FilterConfig` | `com/qvsu/framework/config/FilterConfig.java` | 配置类（注册 `XssFilter`，`xss.enabled=true` 时生效） |
| `com/qvsu/framework/config` | `I18nConfig` | `com/qvsu/framework/config/I18nConfig.java` | 配置类（国际化） |
| `com/qvsu/framework/config` | `KaptchaTextCreator` | `com/qvsu/framework/config/KaptchaTextCreator.java` | 组件类（验证码算式） |
| `com/qvsu/framework/config` | `MyBatisConfig` | `com/qvsu/framework/config/MyBatisConfig.java` | 配置类 |
| `com/qvsu/framework/config` | `ResourcesConfig` | `com/qvsu/framework/config/ResourcesConfig.java` | 配置类（静态资源与拦截器注册） |
| `com/qvsu/framework/config` | `ShiroConfig` | `com/qvsu/framework/config/ShiroConfig.java` | 配置类（Shiro 过滤器链与 Bean） |
| `com/qvsu/framework/config/properties` | `DruidProperties` | `com/qvsu/framework/config/properties/DruidProperties.java` | 配置类（Druid 参数） |
| `com/qvsu/framework/config/properties` | `PermitAllUrlProperties` | `com/qvsu/framework/config/properties/PermitAllUrlProperties.java` | 配置类（收集 `@Anonymous` 放行 URL） |
| `com/qvsu/framework/datasource` | `DynamicDataSource` | `com/qvsu/framework/datasource/DynamicDataSource.java` | 组件类（`AbstractRoutingDataSource`） |
| `com/qvsu/framework/interceptor` | `RepeatSubmitInterceptor` | `com/qvsu/framework/interceptor/RepeatSubmitInterceptor.java` | 拦截器基类 |
| `com/qvsu/framework/interceptor/impl` | `SameUrlDataInterceptor` | `com/qvsu/framework/interceptor/impl/SameUrlDataInterceptor.java` | 拦截器实现（防重复提交） |
| `com/qvsu/framework/manager` | `AsyncManager` | `com/qvsu/framework/manager/AsyncManager.java` | 管理器（异步任务调度） |
| `com/qvsu/framework/manager` | `ShutdownManager` | `com/qvsu/framework/manager/ShutdownManager.java` | 管理器（停机钩子） |
| `com/qvsu/framework/manager/factory` | `AsyncFactory` | `com/qvsu/framework/manager/factory/AsyncFactory.java` | 工厂类（异步写在线会话/操作日志/登录日志） |
| `com/qvsu/framework/shiro/realm` | `UserRealm` | `com/qvsu/framework/shiro/realm/UserRealm.java` | 组件类（Shiro Realm，授权数据源） |
| `com/qvsu/framework/shiro/rememberMe` | `CustomCookieRememberMeManager` | `com/qvsu/framework/shiro/rememberMe/CustomCookieRememberMeManager.java` | 组件类（记住我） |
| `com/qvsu/framework/shiro/service` | `SysLoginService` | `com/qvsu/framework/shiro/service/SysLoginService.java` | 服务类（见 SVC-004） |
| `com/qvsu/framework/shiro/service` | `SysPasswordService` | `com/qvsu/framework/shiro/service/SysPasswordService.java` | 服务类（见 SVC-005） |
| `com/qvsu/framework/shiro/service` | `SysRegisterService` | `com/qvsu/framework/shiro/service/SysRegisterService.java` | 服务类（见 SVC-006） |
| `com/qvsu/framework/shiro/service` | `SysShiroService` | `com/qvsu/framework/shiro/service/SysShiroService.java` | 服务类（见 SVC-007） |
| `com/qvsu/framework/shiro/session` | `OnlineSession` | `com/qvsu/framework/shiro/session/OnlineSession.java` | 会话模型 |
| `com/qvsu/framework/shiro/session` | `OnlineSessionDAO` | `com/qvsu/framework/shiro/session/OnlineSessionDAO.java` | 会话 DAO |
| `com/qvsu/framework/shiro/session` | `OnlineSessionFactory` | `com/qvsu/framework/shiro/session/OnlineSessionFactory.java` | 会话工厂 |
| `com/qvsu/framework/shiro/util` | `AuthorizationUtils` | `com/qvsu/framework/shiro/util/AuthorizationUtils.java` | 工具类（权限缓存清理） |
| `com/qvsu/framework/shiro/web` | `CustomShiroFilterFactoryBean` | `com/qvsu/framework/shiro/web/CustomShiroFilterFactoryBean.java` | 组件类 |
| `com/qvsu/framework/shiro/web/filter` | `LogoutFilter` | `com/qvsu/framework/shiro/web/filter/LogoutFilter.java` | 过滤器（退出登录） |
| `com/qvsu/framework/shiro/web/filter/captcha` | `CaptchaValidateFilter` | `com/qvsu/framework/shiro/web/filter/captcha/CaptchaValidateFilter.java` | 过滤器（验证码校验） |
| `com/qvsu/framework/shiro/web/filter/csrf` | `CsrfValidateFilter` | `com/qvsu/framework/shiro/web/filter/csrf/CsrfValidateFilter.java` | 过滤器（CSRF 校验） |
| `com/qvsu/framework/shiro/web/filter/kickout` | `KickoutSessionFilter` | `com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java` | 过滤器（并发登录踢出） |
| `com/qvsu/framework/shiro/web/filter/online` | `OnlineSessionFilter` | `com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java` | 过滤器（在线状态校验） |
| `com/qvsu/framework/shiro/web/filter/sync` | `SyncOnlineSessionFilter` | `com/qvsu/framework/shiro/web/filter/sync/SyncOnlineSessionFilter.java` | 过滤器（会话同步落库） |
| `com/qvsu/framework/shiro/web/session` | `OnlineWebSessionManager` | `com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java` | 组件类（Web 会话管理器） |
| `com/qvsu/framework/shiro/web/session` | `SpringSessionValidationScheduler` | `com/qvsu/framework/shiro/web/session/SpringSessionValidationScheduler.java` | 组件类（会话校验调度） |
| `com/qvsu/framework/web/exception` | `GlobalExceptionHandler` | `com/qvsu/framework/web/exception/GlobalExceptionHandler.java` | 全局异常处理（`@ControllerAdvice`） |
| `com/qvsu/framework/web/service` | `ConfigService` | `com/qvsu/framework/web/service/ConfigService.java` | 服务类（见 SVC-001） |
| `com/qvsu/framework/web/service` | `DictService` | `com/qvsu/framework/web/service/DictService.java` | 服务类（见 SVC-002） |
| `com/qvsu/framework/web/service` | `PermissionService` | `com/qvsu/framework/web/service/PermissionService.java` | 服务类（见 SVC-003） |

#### 3.2.2 根包启动类清单（`com.qvsu`）

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu` | `QvsuApplication` | `com/qvsu/QvsuApplication.java` | 启动类（`@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })`） |
| `com/qvsu` | `QvsuServletInitializer` | `com/qvsu/QvsuServletInitializer.java` | war 部署适配器（`SpringBootServletInitializer` 子类） |

归并说明：根包 `com.qvsu` 的 2 个类在物理上不属于 `com.qvsu.framework`，本模块索引把它们归入 MOD-framework（证据等级: 推断），理由有三：①模块清单固定为 `com.qvsu.{common,framework,system,quartz,open,web}` 6 个顶层包，根包必须归入其中之一，否则会出现未归属资产；②这 2 个类只做 Spring Boot 引导与 war 适配，不含任何业务语义，与框架层的技术装配职责同属一类；③`@SpringBootApplication` 的组件扫描范围即根包 `com.qvsu`，是全部 6 个模块共享同一部署单元的直接证据。包级归属登记见 6.1 第 2 行。

### 3.3 MOD-system 系统管理域模块

## MOD-system - 系统管理域模块（com.qvsu.system）

- ID: MOD-system
- 名称: 系统管理域模块（平台用户、权限与基础数据）
- 源码路径（顶层包）: `com.qvsu.system`
- 职责: 平台自身的用户、角色、菜单、部门、岗位、字典、参数、通知公告、操作日志、登录日志、在线用户共 11 个业务子域的领域模型、数据访问与服务实现；共 12 个服务接口与 12 个实现类、16 个 MyBatis Mapper 接口（对应 `src/main/resources/mapper/system/` 下 16 个 XML）、10 个辅助领域实体。该模块**不含控制器**（其控制器由 MOD-web 承载），也不直接使用 Shiro 或 Spring 切面，只依赖 MOD-common。
- 包含的关键类: 无 Controller；12 个服务接口（SVC-008 至 SVC-019）、12 个 ServiceImpl、16 个 Mapper 接口、10 个领域实体，明细见 3.3.1
- 对外提供的服务: SVC-008、SVC-009、SVC-010、SVC-011、SVC-012、SVC-013、SVC-014、SVC-015、SVC-016、SVC-017、SVC-018、SVC-019
- 依赖的其他模块: MOD-common（`common.core` 50 处、`common.utils` 24 处、`common.annotation` 11 处、`common.constant` 9 处、`common.exception` 7 处、`common.enums` 1 处、`common.xss` 1 处 import，合计 103 处）；模块内自引用 66 处。不依赖 MOD-framework / MOD-quartz / MOD-open / MOD-web
- 所属部署单元: 单体应用 `qvsu-openapi`
- 证据等级: 事实

#### 3.3.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/system/domain` | `SysConfig` | `com/qvsu/system/domain/SysConfig.java` | 领域实体（映射 `sys_config`） |
| `com/qvsu/system/domain` | `SysLogininfor` | `com/qvsu/system/domain/SysLogininfor.java` | 领域实体（映射 `sys_logininfor`） |
| `com/qvsu/system/domain` | `SysNotice` | `com/qvsu/system/domain/SysNotice.java` | 领域实体（映射 `sys_notice`） |
| `com/qvsu/system/domain` | `SysOperLog` | `com/qvsu/system/domain/SysOperLog.java` | 领域实体（映射 `sys_oper_log`） |
| `com/qvsu/system/domain` | `SysPost` | `com/qvsu/system/domain/SysPost.java` | 领域实体（映射 `sys_post`） |
| `com/qvsu/system/domain` | `SysRoleDept` | `com/qvsu/system/domain/SysRoleDept.java` | 关联实体（`sys_role_dept`） |
| `com/qvsu/system/domain` | `SysRoleMenu` | `com/qvsu/system/domain/SysRoleMenu.java` | 关联实体（`sys_role_menu`） |
| `com/qvsu/system/domain` | `SysUserOnline` | `com/qvsu/system/domain/SysUserOnline.java` | 领域实体（`sys_user_online`） |
| `com/qvsu/system/domain` | `SysUserPost` | `com/qvsu/system/domain/SysUserPost.java` | 关联实体（`sys_user_post`） |
| `com/qvsu/system/domain` | `SysUserRole` | `com/qvsu/system/domain/SysUserRole.java` | 关联实体（`sys_user_role`） |
| `com/qvsu/system/mapper` | `SysConfigMapper` | `com/qvsu/system/mapper/SysConfigMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysDeptMapper` | `com/qvsu/system/mapper/SysDeptMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysDictDataMapper` | `com/qvsu/system/mapper/SysDictDataMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysDictTypeMapper` | `com/qvsu/system/mapper/SysDictTypeMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysLogininforMapper` | `com/qvsu/system/mapper/SysLogininforMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysMenuMapper` | `com/qvsu/system/mapper/SysMenuMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysNoticeMapper` | `com/qvsu/system/mapper/SysNoticeMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysOperLogMapper` | `com/qvsu/system/mapper/SysOperLogMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysPostMapper` | `com/qvsu/system/mapper/SysPostMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysRoleDeptMapper` | `com/qvsu/system/mapper/SysRoleDeptMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysRoleMapper` | `com/qvsu/system/mapper/SysRoleMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysRoleMenuMapper` | `com/qvsu/system/mapper/SysRoleMenuMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysUserMapper` | `com/qvsu/system/mapper/SysUserMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysUserOnlineMapper` | `com/qvsu/system/mapper/SysUserOnlineMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysUserPostMapper` | `com/qvsu/system/mapper/SysUserPostMapper.java` | 数据访问接口 |
| `com/qvsu/system/mapper` | `SysUserRoleMapper` | `com/qvsu/system/mapper/SysUserRoleMapper.java` | 数据访问接口 |
| `com/qvsu/system/service` | `ISysConfigService` | `com/qvsu/system/service/ISysConfigService.java` | 服务接口（SVC-015） |
| `com/qvsu/system/service` | `ISysDeptService` | `com/qvsu/system/service/ISysDeptService.java` | 服务接口（SVC-011） |
| `com/qvsu/system/service` | `ISysDictDataService` | `com/qvsu/system/service/ISysDictDataService.java` | 服务接口（SVC-014） |
| `com/qvsu/system/service` | `ISysDictTypeService` | `com/qvsu/system/service/ISysDictTypeService.java` | 服务接口（SVC-013） |
| `com/qvsu/system/service` | `ISysLogininforService` | `com/qvsu/system/service/ISysLogininforService.java` | 服务接口（SVC-018） |
| `com/qvsu/system/service` | `ISysMenuService` | `com/qvsu/system/service/ISysMenuService.java` | 服务接口（SVC-010） |
| `com/qvsu/system/service` | `ISysNoticeService` | `com/qvsu/system/service/ISysNoticeService.java` | 服务接口（SVC-016） |
| `com/qvsu/system/service` | `ISysOperLogService` | `com/qvsu/system/service/ISysOperLogService.java` | 服务接口（SVC-017） |
| `com/qvsu/system/service` | `ISysPostService` | `com/qvsu/system/service/ISysPostService.java` | 服务接口（SVC-012） |
| `com/qvsu/system/service` | `ISysRoleService` | `com/qvsu/system/service/ISysRoleService.java` | 服务接口（SVC-009） |
| `com/qvsu/system/service` | `ISysUserOnlineService` | `com/qvsu/system/service/ISysUserOnlineService.java` | 服务接口（SVC-019） |
| `com/qvsu/system/service` | `ISysUserService` | `com/qvsu/system/service/ISysUserService.java` | 服务接口（SVC-008） |
| `com/qvsu/system/service/impl` | `SysConfigServiceImpl` | `com/qvsu/system/service/impl/SysConfigServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysDeptServiceImpl` | `com/qvsu/system/service/impl/SysDeptServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysDictDataServiceImpl` | `com/qvsu/system/service/impl/SysDictDataServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysDictTypeServiceImpl` | `com/qvsu/system/service/impl/SysDictTypeServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysLogininforServiceImpl` | `com/qvsu/system/service/impl/SysLogininforServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysMenuServiceImpl` | `com/qvsu/system/service/impl/SysMenuServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysNoticeServiceImpl` | `com/qvsu/system/service/impl/SysNoticeServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysOperLogServiceImpl` | `com/qvsu/system/service/impl/SysOperLogServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysPostServiceImpl` | `com/qvsu/system/service/impl/SysPostServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysRoleServiceImpl` | `com/qvsu/system/service/impl/SysRoleServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysUserOnlineServiceImpl` | `com/qvsu/system/service/impl/SysUserOnlineServiceImpl.java` | 服务实现 |
| `com/qvsu/system/service/impl` | `SysUserServiceImpl` | `com/qvsu/system/service/impl/SysUserServiceImpl.java` | 服务实现 |

### 3.4 MOD-quartz 调度域模块

## MOD-quartz - 调度域模块（com.qvsu.quartz）

- ID: MOD-quartz
- 名称: 调度域模块（定时任务定义、执行与日志）
- 源码路径（顶层包）: `com.qvsu.quartz`
- 职责: 基于 Spring Boot Quartz Starter 的定时任务管理：任务定义（`SysJob`）与执行日志（`SysJobLog`）的持久化与页面管理、Cron 表达式校验与预览、任务创建/暂停/恢复/立即执行/状态切换、并发控制策略（`QuartzJobExecution`、`QuartzDisallowConcurrentExecution`）、反射调用与白名单校验（`JobInvokeUtil`、`ScheduleUtils.whiteList`），以及两个可供任务调用的反射目标 Bean（`@Component("httpTask")`、`@Component("qvsuTask")`）。该模块自带 2 个控制器，不依赖 MOD-framework 与 MOD-system，仅依赖 MOD-common 与自身。
- 包含的关键类: 2 个 Controller（`SysJobController`、`SysJobLogController`）、2 个服务接口（SVC-020、SVC-021）与 2 个 ServiceImpl、2 个 Mapper 接口、2 个领域实体、2 个任务 Bean、6 个 Quartz 工具类，明细见 3.4.1
- 对外提供的服务: SVC-020、SVC-021；另对外提供可被 `sys_job.invoke_target` 反射调用的 `HttpTask`（HTTP 请求任务）与 `QvsuTask`（示例任务）
- 依赖的其他模块: MOD-common（`common.utils` 15 处、`common.core` 10 处、`common.constant` 7 处、`common.annotation` 5 处、`common.exception` 5 处、`common.enums` 2 处 import，合计 44 处）；模块内自引用 28 处。不依赖 MOD-framework / MOD-system / MOD-open / MOD-web
- 所属部署单元: 单体应用 `qvsu-openapi`
- 证据等级: 事实

#### 3.4.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/quartz/config` | `ScheduleConfig` | `com/qvsu/quartz/config/ScheduleConfig.java` | 配置类（Quartz 调度器） |
| `com/qvsu/quartz/controller` | `SysJobController` | `com/qvsu/quartz/controller/SysJobController.java` | 控制器（`/monitor/job`） |
| `com/qvsu/quartz/controller` | `SysJobLogController` | `com/qvsu/quartz/controller/SysJobLogController.java` | 控制器（`/monitor/jobLog`） |
| `com/qvsu/quartz/domain` | `SysJob` | `com/qvsu/quartz/domain/SysJob.java` | 领域实体（映射 `sys_job`） |
| `com/qvsu/quartz/domain` | `SysJobLog` | `com/qvsu/quartz/domain/SysJobLog.java` | 领域实体（映射 `sys_job_log`） |
| `com/qvsu/quartz/mapper` | `SysJobLogMapper` | `com/qvsu/quartz/mapper/SysJobLogMapper.java` | 数据访问接口 |
| `com/qvsu/quartz/mapper` | `SysJobMapper` | `com/qvsu/quartz/mapper/SysJobMapper.java` | 数据访问接口 |
| `com/qvsu/quartz/service` | `ISysJobLogService` | `com/qvsu/quartz/service/ISysJobLogService.java` | 服务接口（SVC-021） |
| `com/qvsu/quartz/service` | `ISysJobService` | `com/qvsu/quartz/service/ISysJobService.java` | 服务接口（SVC-020） |
| `com/qvsu/quartz/service/impl` | `SysJobLogServiceImpl` | `com/qvsu/quartz/service/impl/SysJobLogServiceImpl.java` | 服务实现 |
| `com/qvsu/quartz/service/impl` | `SysJobServiceImpl` | `com/qvsu/quartz/service/impl/SysJobServiceImpl.java` | 服务实现 |
| `com/qvsu/quartz/task` | `HttpTask` | `com/qvsu/quartz/task/HttpTask.java` | 调度任务 Bean（`@Component("httpTask")`） |
| `com/qvsu/quartz/task` | `QvsuTask` | `com/qvsu/quartz/task/QvsuTask.java` | 调度任务 Bean（`@Component("qvsuTask")`） |
| `com/qvsu/quartz/util` | `AbstractQuartzJob` | `com/qvsu/quartz/util/AbstractQuartzJob.java` | 调度基类（日志埋点） |
| `com/qvsu/quartz/util` | `CronUtils` | `com/qvsu/quartz/util/CronUtils.java` | 工具类（Cron 校验/预览） |
| `com/qvsu/quartz/util` | `JobInvokeUtil` | `com/qvsu/quartz/util/JobInvokeUtil.java` | 工具类（反射调用目标方法） |
| `com/qvsu/quartz/util` | `QuartzDisallowConcurrentExecution` | `com/qvsu/quartz/util/QuartzDisallowConcurrentExecution.java` | 调度实现（禁止并发） |
| `com/qvsu/quartz/util` | `QuartzJobExecution` | `com/qvsu/quartz/util/QuartzJobExecution.java` | 调度实现（允许并发） |
| `com/qvsu/quartz/util` | `ScheduleUtils` | `com/qvsu/quartz/util/ScheduleUtils.java` | 工具类（任务注册与白名单） |

### 3.5 MOD-open OpenAPI 管理网关模块

## MOD-open - OpenAPI 管理网关模块（com.qvsu.open）

- ID: MOD-open
- 名称: OpenAPI 管理网关模块（应用/接口/授权/日志/文档 与运行时网关）
- 源码路径（顶层包）: `com.qvsu.open`
- 职责: 本项目相对 RuoYi 基座的**核心增量业务域**，同时承担两类职责：(1) 管理面——应用管理、接口管理、授权管理、调用日志、文档管理 5 个后台页面及其服务；(2) 运行面——`/open/**` 统一网关入口：请求体缓存、traceId 生成、`X-App-Key`/`X-Timestamp`/`X-Nonce`/`X-Sign` 头校验、HmacSHA256 签名与 nonce 防重放、时间戳漂移校验、应用-接口授权校验、RestTemplate 转发目标地址、统一 `OpenResult` 响应封装、调用日志落库，另含 9 个自检用 httpbin 端点（`/selftest/httpbin/*`）。该模块**不使用 MyBatis**，全部数据访问通过 `JdbcTemplate` 原生 SQL 完成；不依赖 MOD-framework 与 MOD-system。
- 包含的关键类: 7 个 Controller、5 个服务类（SVC-022 至 SVC-026 中的 5 个，其中 `ApiDocService` 位于 `doc` 子包）、5 个领域实体、2 个模型类、1 个网关过滤器、1 个请求包装器、1 个 trace 上下文；**无 Service 接口、无 Mapper 接口、无 Mapper XML**，明细见 3.5.1
- 对外提供的服务: SVC-022、SVC-023、SVC-024、SVC-025、SVC-026；另对外提供 `TraceContext`（线程内 traceId 传递）、`OpenResult`（网关统一响应体）、`OpenAuthContext`（鉴权上下文）
- 依赖的其他模块: MOD-common（`common.core` 20 处、`common.utils` 6 处、`common.annotation` 2 处、`common.enums` 2 处 import，合计 30 处）；模块内自引用 32 处。不依赖 MOD-framework / MOD-system / MOD-quartz / MOD-web
- 所属部署单元: 单体应用 `qvsu-openapi`
- 证据等级: 事实

#### 3.5.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/open/controller` | `OpenApiMgrController` | `com/qvsu/open/controller/OpenApiMgrController.java` | 控制器（`/admin/open/api`） |
| `com/qvsu/open/controller` | `OpenAppController` | `com/qvsu/open/controller/OpenAppController.java` | 控制器（`/admin/open/app`） |
| `com/qvsu/open/controller` | `OpenAuthController` | `com/qvsu/open/controller/OpenAuthController.java` | 控制器（`/admin/open/auth`） |
| `com/qvsu/open/controller` | `OpenDocController` | `com/qvsu/open/controller/OpenDocController.java` | 控制器（`/admin/open/doc`） |
| `com/qvsu/open/controller` | `OpenGatewayController` | `com/qvsu/open/controller/OpenGatewayController.java` | 控制器（`/open/**` 网关入口） |
| `com/qvsu/open/controller` | `OpenLogController` | `com/qvsu/open/controller/OpenLogController.java` | 控制器（`/admin/open/log`） |
| `com/qvsu/open/controller` | `OpenSelftestHttpbinController` | `com/qvsu/open/controller/OpenSelftestHttpbinController.java` | 控制器（`/selftest/httpbin/*`） |
| `com/qvsu/open/doc` | `ApiDocService` | `com/qvsu/open/doc/ApiDocService.java` | 服务类（SVC-026） |
| `com/qvsu/open/domain` | `OpenApi` | `com/qvsu/open/domain/OpenApi.java` | 领域实体（映射 `open_api`） |
| `com/qvsu/open/domain` | `OpenApiDoc` | `com/qvsu/open/domain/OpenApiDoc.java` | 领域实体（映射 `open_api_doc`） |
| `com/qvsu/open/domain` | `OpenApp` | `com/qvsu/open/domain/OpenApp.java` | 领域实体（映射 `open_app`） |
| `com/qvsu/open/domain` | `OpenAppApi` | `com/qvsu/open/domain/OpenAppApi.java` | 关联实体（映射 `open_app_api`） |
| `com/qvsu/open/domain` | `OpenCallLog` | `com/qvsu/open/domain/OpenCallLog.java` | 领域实体（映射 `open_call_log`） |
| `com/qvsu/open/filter` | `OpenApiFilter` | `com/qvsu/open/filter/OpenApiFilter.java` | 过滤器（网关鉴权与日志埋点） |
| `com/qvsu/open/model` | `OpenAuthContext` | `com/qvsu/open/model/OpenAuthContext.java` | 模型（鉴权上下文） |
| `com/qvsu/open/model` | `OpenResult` | `com/qvsu/open/model/OpenResult.java` | 模型（网关统一响应体） |
| `com/qvsu/open/service` | `OpenApiLogService` | `com/qvsu/open/service/OpenApiLogService.java` | 服务类（SVC-025） |
| `com/qvsu/open/service` | `OpenApiProxyService` | `com/qvsu/open/service/OpenApiProxyService.java` | 服务类（SVC-024） |
| `com/qvsu/open/service` | `OpenApiSecurityService` | `com/qvsu/open/service/OpenApiSecurityService.java` | 服务类（SVC-023） |
| `com/qvsu/open/service` | `OpenManageService` | `com/qvsu/open/service/OpenManageService.java` | 服务类（SVC-022） |
| `com/qvsu/open/trace` | `TraceContext` | `com/qvsu/open/trace/TraceContext.java` | 工具类（traceId 线程上下文） |
| `com/qvsu/open/web` | `CachedBodyHttpServletRequest` | `com/qvsu/open/web/CachedBodyHttpServletRequest.java` | 请求包装器（可重复读请求体） |

### 3.6 MOD-web Web 入口层模块

## MOD-web - Web 入口层模块（com.qvsu.web.controller）

- ID: MOD-web
- 名称: Web 入口层模块（登录、注册、首页、个人中心与系统管理控制器）
- 源码路径（顶层包）: `com.qvsu.web`，全部类位于 `com.qvsu.web.controller` 及其子包 `com.qvsu.web.controller.common`、`com.qvsu.web.controller.system`
- 职责: 承载所有用户可见的 Web 入口与 HTTP 控制器，包括登录/注册/验证码/退出、首页与锁屏/换肤、个人中心（资料、改密、头像）、通用上传下载，以及**系统管理域全部 8 个后台模块的控制器**（用户、角色、菜单、部门、岗位、字典类型、字典数据、参数、通知公告，共 14 个控制器）。该模块不定义业务服务接口，只做参数绑定、分页、权限注解声明、模板视图渲染与视图服务调用。
- 包含的关键类: 15 个 Controller，无服务接口/Service/ServiceImpl/Mapper；其中 `web.controller.system` 下 14 个，`web.controller.common` 下 1 个，明细见 3.6.1
- 对外提供的服务: 不定义服务接口；作为 HTTP 入口对外暴露 15 个控制器的全部路由（含 `/login`、`/register`、`/captcha/captchaImage`、`/captcha/captchaCode`、`/index`、`/lockscreen`、`/unlockscreen`、`/system/main`、`/system/switchSkin`、`/system/menuStyle/{style}`、`/common/upload`、`/common/uploads`、`/common/download`、`/common/download/resource`、`/system/user/**`、`/system/role/**`、`/system/menu/**`、`/system/dept/**`、`/system/post/**`、`/system/dict/**`、`/system/dict/data/**`、`/system/config/**`、`/system/notice/**`、`/system/user/profile/**`）
- 依赖的其他模块: MOD-common（`common.core` 58 处、`common.utils` 27 处、`common.annotation` 10 处、`common.enums` 10 处、`common.config` 4 处、`common.constant` 2 处 import，合计 111 处）；MOD-framework（`framework.shiro` 7 处、`framework.web` 1 处 import，合计 8 处）；MOD-system（`system.service` 18 处、`system.domain` 4 处 import，合计 22 处）。不依赖 MOD-quartz / MOD-open
- 所属部署单元: 单体应用 `qvsu-openapi`
- 证据等级: 事实

#### 3.6.1 类清单

| 包目录 | 类名 | 文件路径 | 类别 |
|---|---|---|---|
| `com/qvsu/web/controller/common` | `CommonController` | `com/qvsu/web/controller/common/CommonController.java` | 控制器（`/common` 上传下载） |
| `com/qvsu/web/controller/system` | `SysCaptchaController` | `com/qvsu/web/controller/system/SysCaptchaController.java` | 控制器（`/captcha`） |
| `com/qvsu/web/controller/system` | `SysConfigController` | `com/qvsu/web/controller/system/SysConfigController.java` | 控制器（`/system/config`） |
| `com/qvsu/web/controller/system` | `SysDeptController` | `com/qvsu/web/controller/system/SysDeptController.java` | 控制器（`/system/dept`） |
| `com/qvsu/web/controller/system` | `SysDictDataController` | `com/qvsu/web/controller/system/SysDictDataController.java` | 控制器（`/system/dict/data`） |
| `com/qvsu/web/controller/system` | `SysDictTypeController` | `com/qvsu/web/controller/system/SysDictTypeController.java` | 控制器（`/system/dict`） |
| `com/qvsu/web/controller/system` | `SysIndexController` | `com/qvsu/web/controller/system/SysIndexController.java` | 控制器（`/index`、`/lockscreen`、`/system/main`） |
| `com/qvsu/web/controller/system` | `SysLoginController` | `com/qvsu/web/controller/system/SysLoginController.java` | 控制器（`/login`、`/unauth`） |
| `com/qvsu/web/controller/system` | `SysMenuController` | `com/qvsu/web/controller/system/SysMenuController.java` | 控制器（`/system/menu`） |
| `com/qvsu/web/controller/system` | `SysNoticeController` | `com/qvsu/web/controller/system/SysNoticeController.java` | 控制器（`/system/notice`） |
| `com/qvsu/web/controller/system` | `SysPostController` | `com/qvsu/web/controller/system/SysPostController.java` | 控制器（`/system/post`） |
| `com/qvsu/web/controller/system` | `SysProfileController` | `com/qvsu/web/controller/system/SysProfileController.java` | 控制器（`/system/user/profile`） |
| `com/qvsu/web/controller/system` | `SysRegisterController` | `com/qvsu/web/controller/system/SysRegisterController.java` | 控制器（`/register`） |
| `com/qvsu/web/controller/system` | `SysRoleController` | `com/qvsu/web/controller/system/SysRoleController.java` | 控制器（`/system/role`） |
| `com/qvsu/web/controller/system` | `SysUserController` | `com/qvsu/web/controller/system/SysUserController.java` | 控制器（`/system/user`） |

## 4. 服务主定义

本节为每个对外提供可复用能力的服务给出主定义。判定口径：源码中存在的 Spring 服务类（`@Service`）或服务接口/实现对，且被本模块之外的调用方（控制器、过滤器、其他服务、Thymeleaf 模板）消费。

### 4.1 框架层服务（MOD-framework）

## SVC-001 - ConfigService（Thymeleaf 参数服务）

- ID: SVC-001
- 名称: ConfigService（模板参数读取服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/web/service/ConfigService.java`（`@Component`，Bean 名 `config`）
- 职责: 为 Thymeleaf 模板提供按参数键读取参数值的能力，模板中以 `@config.getKey('sys.user.initPassword')`、`@config.getKey('sys.account.chrtype')` 形式直接调用，是模板层访问参数配置的唯一入口。
- 关键方法清单:
  - `public String getKey(String configKey)`
- 调用方（消费者）: `com/qvsu/web/controller/system/SysLoginController.java`、`com/qvsu/web/controller/system/SysRegisterController.java`、`com/qvsu/web/controller/system/SysConfigController.java`、`com/qvsu/web/controller/system/SysIndexController.java`、`com/qvsu/framework/shiro/service/SysLoginService.java`、`com/qvsu/system/service/impl/SysUserServiceImpl.java`；模板 `templates/system/user/add.html`、`templates/system/user/resetPwd.html`、`templates/system/user/profile/profile.html`、`templates/system/user/profile/resetPwd.html`
- 底层依赖: SVC-015（`ISysConfigService`）
- 证据等级: 事实

## SVC-002 - DictService（Thymeleaf 字典服务）

- ID: SVC-002
- 名称: DictService（模板字典读取服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/web/service/DictService.java`（`@Component`，Bean 名 `dict`）
- 职责: 为 Thymeleaf 模板提供字典下拉数据与字典标签翻译，模板中以 `@dict.getType('sys_normal_disable')`、`@dict.getLabel('sys_user_sex', sex)` 形式调用。
- 关键方法清单:
  - `public List<SysDictData> getType(String dictType)`
  - `public String getLabel(String dictType, String dictValue)`
- 调用方（消费者）: 仅 Thymeleaf 模板消费（`templates/system/**`、`templates/monitor/**`、`templates/open/**` 未使用）；Java 代码中无直接调用者（全量 import/引用扫描为 0）
- 底层依赖: SVC-013（`ISysDictTypeService`）、SVC-014（`ISysDictDataService`）
- 证据等级: 事实

## SVC-003 - PermissionService（Thymeleaf 权限服务）

- ID: SVC-003
- 名称: PermissionService（模板权限判定服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/web/service/PermissionService.java`（`@Component`，Bean 名 `permission`）
- 职责: 为 Thymeleaf 模板与页面脚本提供当前登录主体的权限/角色判定，模板中以 `var editFlag = [[${@permission.hasPermi('system:config:edit')}]]` 形式输出布尔标志，控制页面按钮的显示。
- 关键方法清单:
  - `public String hasPermi(String permission)`
  - `public String lacksPermi(String permission)`
  - `public String hasAnyPermi(String permissions)`
  - `public String hasRole(String role)`
  - `public String lacksRole(String role)`
  - `public String hasAnyRoles(String roles)`
  - `public boolean isUser()`
  - `public boolean isPermitted(String permission)`
  - `public boolean isLacksPermitted(String permission)`
  - `public boolean hasAnyPermissions(String permissions)`
  - `public boolean hasAnyPermissions(String permissions, String delimeter)`
  - `public boolean isRole(String role)`
  - `public boolean isLacksRole(String role)`
  - `public boolean isAnyRoles(String roles)`
  - `public boolean isAnyRoles(String roles, String delimeter)`
  - `public Object getPrincipalProperty(String property)`
- 调用方（消费者）: 仅 Thymeleaf 模板消费（`templates/system/**`、`templates/monitor/job/**`）；Java 代码中无直接调用者
- 底层依赖: Apache Shiro `SecurityUtils`/`Subject`
- 证据等级: 事实

## SVC-004 - SysLoginService（登录服务）

- ID: SVC-004
- 名称: SysLoginService（登录认证编排服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/shiro/service/SysLoginService.java`（`@Component`）
- 职责: 编排登录全流程：校验用户是否存在/是否停用/角色是否停用、调用口令服务校验口令、加载角色权限集合、记录登录信息（IP 与时间）。
- 关键方法清单:
  - `public SysUser login(String username, String password)`
  - `public void setRolePermission(SysUser user)`
  - `public void recordLoginInfo(Long userId)`
- 调用方（消费者）: `com/qvsu/framework/shiro/realm/UserRealm.java`、`com/qvsu/framework/shiro/rememberMe/CustomCookieRememberMeManager.java`
- 底层依赖: SVC-008（`ISysUserService`）、SVC-009（`ISysRoleService`）、SVC-010（`ISysMenuService`）、SVC-015（`ISysConfigService`）、SVC-005（`SysPasswordService`）、SVC-001（`ConfigService`）
- 证据等级: 事实

## SVC-005 - SysPasswordService（口令服务）

- ID: SVC-005
- 名称: SysPasswordService（口令校验与加解密服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/shiro/service/SysPasswordService.java`（`@Component`，含 `@PostConstruct init()` 初始化重试次数缓存）
- 职责: 口令匹配校验、登录失败次数限制与解锁、口令加密（盐值散列），并把失败计数写入 Ehcache。
- 关键方法清单:
  - `public void init()`
  - `public void validate(SysUser user, String password)`
  - `public boolean matches(SysUser user, String newPassword)`
  - `public void clearLoginRecordCache(String loginName)`
  - `public String encryptPassword(String loginName, String password, String salt)`
- 调用方（消费者）: `com/qvsu/framework/shiro/service/SysLoginService.java`、`com/qvsu/framework/shiro/service/SysRegisterService.java`、`com/qvsu/web/controller/system/SysIndexController.java`、`com/qvsu/web/controller/system/SysProfileController.java`、`com/qvsu/web/controller/system/SysUserController.java`
- 底层依赖: MOD-common（`common.utils.security.Md5Utils`、`common.utils.CacheUtils`、`common.exception.user.*`）
- 证据等级: 事实

## SVC-006 - SysRegisterService（注册服务）

- ID: SVC-006
- 名称: SysRegisterService（用户注册服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/shiro/service/SysRegisterService.java`（`@Component`）
- 职责: 校验注册开关（参数 `sys.account.registerUser`）、校验验证码、校验登录名唯一性后创建用户并返回结果消息。
- 关键方法清单:
  - `public String register(SysUser user)`
- 调用方（消费者）: `com/qvsu/web/controller/system/SysRegisterController.java`
- 底层依赖: SVC-008（`ISysUserService`）、SVC-005（`SysPasswordService`）、SVC-015（`ISysConfigService`）
- 证据等级: 事实

## SVC-007 - SysShiroService（会话服务）

- ID: SVC-007
- 名称: SysShiroService（Shiro 在线会话同步服务）
- 接口/实现: 无接口，实体类 `com/qvsu/framework/shiro/service/SysShiroService.java`（`@Component`）
- 职责: 在 Shiro 会话生命周期内把在线会话同步到数据库：创建会话、按 sessionId 获取会话、删除会话（含在线表记录）。
- 关键方法清单:
  - `public void deleteSession(OnlineSession onlineSession)`
  - `public Session getSession(Serializable sessionId)`
  - `public Session createSession(SysUserOnline userOnline)`
- 调用方（消费者）: `com/qvsu/framework/shiro/session/OnlineSessionDAO.java`
- 底层依赖: SVC-019（`ISysUserOnlineService`）
- 证据等级: 事实

### 4.2 系统管理域服务（MOD-system）

## SVC-008 - ISysUserService（系统用户服务）

- ID: SVC-008
- 名称: ISysUserService（系统用户服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysUserService.java`；实现 `com/qvsu/system/service/impl/SysUserServiceImpl.java`（注入 `SysUserMapper`、`SysUserRoleMapper`、`SysUserPostMapper`、`SysRoleMapper`、`SysPostMapper`，并调用 SVC-011、SVC-015）
- 职责: 用户主数据的增删改查、导入、状态切换、头像与登录信息维护、角色/岗位分配、登录名/手机/邮箱唯一性校验、用户数据范围与操作合法性校验、用户所属角色与岗位显示名拼装。
- 关键方法清单:
  - `public List<SysUser> selectUserList(SysUser user)`
  - `public List<SysUser> selectAllocatedList(SysUser user)`
  - `public List<SysUser> selectUnallocatedList(SysUser user)`
  - `public SysUser selectUserByLoginName(String userName)`
  - `public SysUser selectUserByPhoneNumber(String phoneNumber)`
  - `public SysUser selectUserByEmail(String email)`
  - `public SysUser selectUserById(Long userId)`
  - `public List<SysUserRole> selectUserRoleByUserId(Long userId)`
  - `public int deleteUserById(Long userId)`
  - `public int deleteUserByIds(String ids)`
  - `public int insertUser(SysUser user)`
  - `public boolean registerUser(SysUser user)`
  - `public int updateUser(SysUser user)`
  - `public int updateUserInfo(SysUser user)`
  - `public boolean updateUserAvatar(Long userId, String avatar)`
  - `public void updateLoginInfo(Long userId, String loginIp, Date loginDate)`
  - `public void insertUserAuth(Long userId, Long[] roleIds)`
  - `public int resetUserPwd(SysUser user)`
  - `public boolean checkLoginNameUnique(SysUser user)`
  - `public boolean checkPhoneUnique(SysUser user)`
  - `public boolean checkEmailUnique(SysUser user)`
  - `public void checkUserAllowed(SysUser user)`
  - `public void checkUserDataScope(Long userId)`
  - `public String selectUserRoleGroup(Long userId)`
  - `public String selectUserPostGroup(Long userId)`
  - `public String importUser(List<SysUser> userList, Boolean isUpdateSupport, String operName)`
  - `public int changeStatus(SysUser user)`
- 调用方（消费者）: `com/qvsu/framework/shiro/service/SysLoginService.java`、`com/qvsu/framework/shiro/service/SysRegisterService.java`、`com/qvsu/web/controller/system/SysUserController.java`、`com/qvsu/web/controller/system/SysRoleController.java`、`com/qvsu/web/controller/system/SysProfileController.java`
- 证据等级: 事实

## SVC-009 - ISysRoleService（系统角色服务）

- ID: SVC-009
- 名称: ISysRoleService（系统角色服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysRoleService.java`；实现 `com/qvsu/system/service/impl/SysRoleServiceImpl.java`（注入 `SysRoleMapper`、`SysRoleMenuMapper`、`SysRoleDeptMapper`、`SysUserRoleMapper`）
- 职责: 角色主数据维护、角色键集合查询（供 Shiro 授权）、数据范围（数据权限）授权、角色-用户/角色-菜单/角色-部门关联维护、角色名与权限字符唯一性校验、角色与数据范围合法性校验。
- 关键方法清单:
  - `public List<SysRole> selectRoleList(SysRole role)`
  - `public Set<String> selectRoleKeys(Long userId)`
  - `public List<SysRole> selectRolesByUserId(Long userId)`
  - `public List<SysRole> selectRoleAll()`
  - `public SysRole selectRoleById(Long roleId)`
  - `public boolean deleteRoleById(Long roleId)`
  - `public int deleteRoleByIds(String ids)`
  - `public int insertRole(SysRole role)`
  - `public int updateRole(SysRole role)`
  - `public int authDataScope(SysRole role)`
  - `public boolean checkRoleNameUnique(SysRole role)`
  - `public boolean checkRoleKeyUnique(SysRole role)`
  - `public void checkRoleAllowed(SysRole role)`
  - `public void checkRoleDataScope(Long... roleIds)`
  - `public int countUserRoleByRoleId(Long roleId)`
  - `public int changeStatus(SysRole role)`
  - `public int deleteAuthUser(SysUserRole userRole)`
  - `public int deleteAuthUsers(Long roleId, String userIds)`
  - `public int insertAuthUsers(Long roleId, String userIds)`
- 调用方（消费者）: `com/qvsu/framework/shiro/realm/UserRealm.java`、`com/qvsu/web/controller/system/SysRoleController.java`、`com/qvsu/web/controller/system/SysUserController.java`
- 证据等级: 事实

## SVC-010 - ISysMenuService（系统菜单服务）

- ID: SVC-010
- 名称: ISysMenuService（系统菜单与权限服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysMenuService.java`；实现 `com/qvsu/system/service/impl/SysMenuServiceImpl.java`（注入 `SysMenuMapper`、`SysRoleMenuMapper`）
- 职责: 菜单树的查询与维护、按用户/角色计算权限字符串集合（Shiro 授权数据源）、角色菜单树与菜单树数据（Ztree）、菜单排序、菜单名唯一性与父子约束校验。
- 关键方法清单:
  - `public List<SysMenu> selectMenusByUser(SysUser user)`
  - `public List<SysMenu> selectMenuList(SysMenu menu, Long userId)`
  - `public List<SysMenu> selectMenuAll(Long userId)`
  - `public Set<String> selectPermsByUserId(Long userId)`
  - `public Set<String> selectPermsByRoleId(Long roleId)`
  - `public List<Ztree> roleMenuTreeData(SysRole role, Long userId)`
  - `public List<Ztree> menuTreeData(Long userId)`
  - `public Map<String, String> selectPermsAll(Long userId)`
  - `public int deleteMenuById(Long menuId)`
  - `public SysMenu selectMenuById(Long menuId)`
  - `public int selectCountMenuByParentId(Long parentId)`
  - `public int selectCountRoleMenuByMenuId(Long menuId)`
  - `public int insertMenu(SysMenu menu)`
  - `public int updateMenu(SysMenu menu)`
  - `public void updateMenuSort(String[] menuIds, String[] orderNums)`
  - `public boolean checkMenuNameUnique(SysMenu menu)`
- 调用方（消费者）: `com/qvsu/framework/shiro/realm/UserRealm.java`、`com/qvsu/framework/shiro/service/SysLoginService.java`、`com/qvsu/web/controller/system/SysMenuController.java`、`com/qvsu/web/controller/system/SysIndexController.java`
- 证据等级: 事实

## SVC-011 - ISysDeptService（部门服务）

- ID: SVC-011
- 名称: ISysDeptService（组织部门服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysDeptService.java`；实现 `com/qvsu/system/service/impl/SysDeptServiceImpl.java`（注入 `SysDeptMapper`）
- 职责: 部门树的增删改查、部门树数据（Ztree，含排除子节点场景）、角色-部门数据权限树、父部门与子部门/用户存在性校验、部门数据范围校验。
- 关键方法清单:
  - `public List<SysDept> selectDeptList(SysDept dept)`
  - `public List<Ztree> selectDeptTree(SysDept dept)`
  - `public List<Ztree> selectDeptTreeExcludeChild(SysDept dept)`
  - `public List<Ztree> roleDeptTreeData(SysRole role)`
  - `public int selectDeptCount(Long parentId)`
  - `public boolean checkDeptExistUser(Long deptId)`
  - `public int deleteDeptById(Long deptId)`
  - `public int insertDept(SysDept dept)`
  - `public int updateDept(SysDept dept)`
  - `public SysDept selectDeptById(Long deptId)`
  - `public int selectNormalChildrenDeptById(Long deptId)`
  - `public boolean checkDeptNameUnique(SysDept dept)`
  - `public void checkDeptDataScope(Long deptId)`
- 调用方（消费者）: `com/qvsu/web/controller/system/SysDeptController.java`、`com/qvsu/web/controller/system/SysRoleController.java`、`com/qvsu/web/controller/system/SysUserController.java`、`com/qvsu/system/service/impl/SysUserServiceImpl.java`
- 证据等级: 事实

## SVC-012 - ISysPostService（岗位服务）

- ID: SVC-012
- 名称: ISysPostService（岗位服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysPostService.java`；实现 `com/qvsu/system/service/impl/SysPostServiceImpl.java`（注入 `SysPostMapper`、`SysUserPostMapper`）
- 职责: 岗位主数据维护、按用户查询岗位、岗位编码/名称唯一性校验、岗位被用户引用计数校验。
- 关键方法清单:
  - `public List<SysPost> selectPostList(SysPost post)`
  - `public List<SysPost> selectPostAll()`
  - `public List<SysPost> selectPostsByUserId(Long userId)`
  - `public SysPost selectPostById(Long postId)`
  - `public int deletePostByIds(String ids)`
  - `public int insertPost(SysPost post)`
  - `public int updatePost(SysPost post)`
  - `public int countUserPostById(Long postId)`
  - `public boolean checkPostNameUnique(SysPost post)`
  - `public boolean checkPostCodeUnique(SysPost post)`
- 调用方（消费者）: `com/qvsu/web/controller/system/SysPostController.java`、`com/qvsu/web/controller/system/SysUserController.java`
- 证据等级: 事实

## SVC-013 - ISysDictTypeService（字典类型服务）

- ID: SVC-013
- 名称: ISysDictTypeService（字典类型服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysDictTypeService.java`；实现 `com/qvsu/system/service/impl/SysDictTypeServiceImpl.java`（注入 `SysDictTypeMapper`、`SysDictDataMapper`）
- 职责: 字典类型维护、字典缓存加载/清理/重置、按类型查字典数据、字典类型唯一性校验、字典树数据。
- 关键方法清单:
  - `public List<SysDictType> selectDictTypeList(SysDictType dictType)`
  - `public List<SysDictType> selectDictTypeAll()`
  - `public List<SysDictData> selectDictDataByType(String dictType)`
  - `public SysDictType selectDictTypeById(Long dictId)`
  - `public SysDictType selectDictTypeByType(String dictType)`
  - `public void deleteDictTypeByIds(String ids)`
  - `public void loadingDictCache()`
  - `public void clearDictCache()`
  - `public void resetDictCache()`
  - `public int insertDictType(SysDictType dictType)`
  - `public int updateDictType(SysDictType dictType)`
  - `public boolean checkDictTypeUnique(SysDictType dictType)`
  - `public List<Ztree> selectDictTree(SysDictType dictType)`
- 调用方（消费者）: `com/qvsu/framework/web/service/DictService.java`、`com/qvsu/web/controller/system/SysDictTypeController.java`
- 证据等级: 事实

## SVC-014 - ISysDictDataService（字典数据服务）

- ID: SVC-014
- 名称: ISysDictDataService（字典数据服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysDictDataService.java`；实现 `com/qvsu/system/service/impl/SysDictDataServiceImpl.java`（注入 `SysDictDataMapper`）
- 职责: 字典数据的增删改查与「类型+值 → 标签」翻译查询。
- 关键方法清单:
  - `public List<SysDictData> selectDictDataList(SysDictData dictData)`
  - `public String selectDictLabel(String dictType, String dictValue)`
  - `public SysDictData selectDictDataById(Long dictCode)`
  - `public void deleteDictDataByIds(String ids)`
  - `public int insertDictData(SysDictData dictData)`
  - `public int updateDictData(SysDictData dictData)`
- 调用方（消费者）: `com/qvsu/framework/web/service/DictService.java`、`com/qvsu/web/controller/system/SysDictDataController.java`
- 证据等级: 事实

## SVC-015 - ISysConfigService（参数设置服务）

- ID: SVC-015
- 名称: ISysConfigService（系统参数服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysConfigService.java`；实现 `com/qvsu/system/service/impl/SysConfigServiceImpl.java`（注入 `SysConfigMapper`）
- 职责: 参数配置的增删改查、按键取值（带缓存）、参数缓存加载/清理/重置、参数键唯一性校验；是登录、注册、首页、用户初始口令等功能读取运行期开关的数据源。
- 关键方法清单:
  - `public SysConfig selectConfigById(Long configId)`
  - `public String selectConfigByKey(String configKey)`
  - `public List<SysConfig> selectConfigList(SysConfig config)`
  - `public int insertConfig(SysConfig config)`
  - `public int updateConfig(SysConfig config)`
  - `public void deleteConfigByIds(String ids)`
  - `public void loadingConfigCache()`
  - `public void clearConfigCache()`
  - `public void resetConfigCache()`
  - `public boolean checkConfigKeyUnique(SysConfig config)`
- 调用方（消费者）: `com/qvsu/framework/web/service/ConfigService.java`、`com/qvsu/framework/shiro/service/SysLoginService.java`、`com/qvsu/web/controller/system/SysConfigController.java`、`com/qvsu/web/controller/system/SysIndexController.java`、`com/qvsu/web/controller/system/SysRegisterController.java`、`com/qvsu/system/service/impl/SysUserServiceImpl.java`
- 证据等级: 事实

## SVC-016 - ISysNoticeService（通知公告服务）

- ID: SVC-016
- 名称: ISysNoticeService（通知公告服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysNoticeService.java`；实现 `com/qvsu/system/service/impl/SysNoticeServiceImpl.java`（注入 `SysNoticeMapper`）
- 职责: 通知公告的增删改查与单条详情读取。
- 关键方法清单:
  - `public SysNotice selectNoticeById(Long noticeId)`
  - `public List<SysNotice> selectNoticeList(SysNotice notice)`
  - `public int insertNotice(SysNotice notice)`
  - `public int updateNotice(SysNotice notice)`
  - `public int deleteNoticeByIds(String ids)`
- 调用方（消费者）: `com/qvsu/web/controller/system/SysNoticeController.java`
- 证据等级: 事实

## SVC-017 - ISysOperLogService（操作日志服务）

- ID: SVC-017
- 名称: ISysOperLogService（操作日志服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysOperLogService.java`；实现 `com/qvsu/system/service/impl/SysOperLogServiceImpl.java`（注入 `SysOperLogMapper`）
- 职责: 操作日志写入（由异步工厂调用）、查询、按 id 详情、批量删除与清空。
- 关键方法清单:
  - `public void insertOperlog(SysOperLog operLog)`
  - `public List<SysOperLog> selectOperLogList(SysOperLog operLog)`
  - `public int deleteOperLogByIds(String ids)`
  - `public SysOperLog selectOperLogById(Long operId)`
  - `public void cleanOperLog()`
- 调用方（消费者）: `com/qvsu/framework/manager/factory/AsyncFactory.java`（操作日志异步落库）；查询/删除由系统监控页面控制器消费（当前 `web` 包内未发现操作日志页面控制器，见第 6 节存疑项）
- 证据等级: 事实（写路径）/ 假设（页面读写路径，需与功能清单核对）

## SVC-018 - ISysLogininforService（登录日志服务）

- ID: SVC-018
- 名称: ISysLogininforService（登录日志服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysLogininforService.java`；实现 `com/qvsu/system/service/impl/SysLogininforServiceImpl.java`（注入 `SysLogininforMapper`）
- 职责: 登录日志写入、查询、批量删除与清空。
- 关键方法清单:
  - `public void insertLogininfor(SysLogininfor logininfor)`
  - `public List<SysLogininfor> selectLogininforList(SysLogininfor logininfor)`
  - `public int deleteLogininforByIds(String ids)`
  - `public void cleanLogininfor()`
- 调用方（消费者）: 源码中仅被 `AsyncFactory` 以**实现类**方式引用（`import com.qvsu.system.service.impl.SysLogininforServiceImpl`），是唯一未通过接口消费的系统服务，属跨层直连（见第 5.3 节）
- 证据等级: 事实

## SVC-019 - ISysUserOnlineService（在线用户服务）

- ID: SVC-019
- 名称: ISysUserOnlineService（在线用户服务）
- 接口/实现: 接口 `com/qvsu/system/service/ISysUserOnlineService.java`；实现 `com/qvsu/system/service/impl/SysUserOnlineServiceImpl.java`（注入 `SysUserOnlineMapper`）
- 职责: 在线会话记录的保存、查询、批量删除、按 sessionId 删除、强制退出、超期会话查询与用户缓存清理。
- 关键方法清单:
  - `public SysUserOnline selectOnlineById(String sessionId)`
  - `public void deleteOnlineById(String sessionId)`
  - `public void batchDeleteOnline(List<String> sessions)`
  - `public void saveOnline(SysUserOnline online)`
  - `public List<SysUserOnline> selectUserOnlineList(SysUserOnline userOnline)`
  - `public void forceLogout(String sessionId)`
  - `public void removeUserCache(String loginName, String sessionId)`
  - `public List<SysUserOnline> selectOnlineByExpired(Date expiredDate)`
- 调用方（消费者）: `com/qvsu/framework/shiro/service/SysShiroService.java`、`com/qvsu/framework/shiro/web/filter/LogoutFilter.java`、`com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java`、`com/qvsu/framework/manager/factory/AsyncFactory.java`
- 证据等级: 事实

### 4.3 调度域服务（MOD-quartz）

## SVC-020 - ISysJobService（定时任务服务）

- ID: SVC-020
- 名称: ISysJobService（定时任务服务）
- 接口/实现: 接口 `com/qvsu/quartz/service/ISysJobService.java`；实现 `com/qvsu/quartz/service/impl/SysJobServiceImpl.java`（注入 `SysJobMapper`，并使用 `ScheduleUtils` 操作 Quartz `Scheduler`）
- 职责: 任务定义维护并把变更同步到 Quartz 调度器：新增/更新任务即注册或重建 JobDetail 与 Trigger，暂停/恢复/删除/立即执行/状态切换，Cron 表达式合法性校验。
- 关键方法清单:
  - `public List<SysJob> selectJobList(SysJob job)`
  - `public SysJob selectJobById(Long jobId)`
  - `public int pauseJob(SysJob job) throws SchedulerException`
  - `public int resumeJob(SysJob job) throws SchedulerException`
  - `public int deleteJob(SysJob job) throws SchedulerException`
  - `public void deleteJobByIds(String ids) throws SchedulerException`
  - `public int changeStatus(SysJob job) throws SchedulerException`
  - `public boolean run(SysJob job) throws SchedulerException`
  - `public int insertJob(SysJob job) throws SchedulerException, TaskException`
  - `public int updateJob(SysJob job) throws SchedulerException, TaskException`
  - `public boolean checkCronExpressionIsValid(String cronExpression)`
- 调用方（消费者）: `com/qvsu/quartz/controller/SysJobController.java`、`com/qvsu/quartz/controller/SysJobLogController.java`
- 证据等级: 事实

## SVC-021 - ISysJobLogService（任务日志服务）

- ID: SVC-021
- 名称: ISysJobLogService（定时任务日志服务）
- 接口/实现: 接口 `com/qvsu/quartz/service/ISysJobLogService.java`；实现 `com/qvsu/quartz/service/impl/SysJobLogServiceImpl.java`（注入 `SysJobLogMapper`）
- 职责: 任务执行日志写入、查询、按任务删除、批量删除与清空。
- 关键方法清单:
  - `public List<SysJobLog> selectJobLogList(SysJobLog jobLog)`
  - `public SysJobLog selectJobLogById(Long jobLogId)`
  - `public void addJobLog(SysJobLog jobLog)`
  - `public int deleteJobLogByIds(String ids)`
  - `public int deleteJobLogById(Long jobId)`
  - `public void cleanJobLog()`
- 调用方（消费者）: `com/qvsu/quartz/util/AbstractQuartzJob.java`（每次执行写日志）、`com/qvsu/quartz/controller/SysJobLogController.java`
- 证据等级: 事实

### 4.4 OpenAPI 网关与管理域服务（MOD-open）

## SVC-022 - OpenManageService（OpenAPI 管理数据服务）

- ID: SVC-022
- 名称: OpenManageService（OpenAPI 应用/接口/授权/日志/文档 统一数据服务）
- 接口/实现: 无接口，实体类 `com/qvsu/open/service/OpenManageService.java`（`@Service`，构造注入 `JdbcTemplate`）
- 职责: 管理面唯一的数据服务，覆盖 5 张 `open_*` 表的全部读写：应用（含 appKey/appSecret 生成与重置密钥）、接口（含按路径+方法查询）、应用-接口授权（先删后批量插入，使用 `on conflict ... do update` 幂等写法）、调用日志（查询与今日统计）、接口文档（保存与列表）、下拉选项与按 id 批量查接口。
- 关键方法清单:
  - `public List<OpenApp> selectAppList(OpenApp query)`
  - `public OpenApp selectAppById(Long sId)`
  - `public OpenApp selectAppByAppKey(String appKey)`
  - `public OpenApp selectUsableAppByApiId(Long apiId)`
  - `public int insertApp(OpenApp app)`
  - `public int updateApp(OpenApp app)`
  - `public int deleteAppByIds(String ids)`
  - `public String resetSecret(Long appId)`
  - `public List<OpenApi> selectApiList(OpenApi query)`
  - `public OpenApi selectApiById(Long sId)`
  - `public OpenApi selectApiByPath(String apiPath, String method)`
  - `public int insertApi(OpenApi api)`
  - `public int updateApi(OpenApi api)`
  - `public int deleteApiByIds(String ids)`
  - `public List<Map<String, Object>> listAppOptions()`
  - `public List<Map<String, Object>> listApiOptions()`
  - `public List<Long> listAuthorizedApiIds(Long appId)`
  - `public void saveAppAuth(Long appId, List<Long> apiIds)`
  - `public List<OpenCallLog> selectLogList(OpenCallLog query)`
  - `public int insertCallLog(OpenCallLog log)`
  - `public Map<String, Object> queryLogStatsToday()`
  - `public List<OpenApiDoc> selectDocList()`
  - `public int saveDoc(OpenApiDoc doc)`
  - `public List<OpenApi> selectApisByIds(List<Long> ids)`
- 调用方（消费者）: `com/qvsu/open/controller/OpenAppController.java`、`com/qvsu/open/controller/OpenApiMgrController.java`、`com/qvsu/open/controller/OpenAuthController.java`、`com/qvsu/open/controller/OpenLogController.java`、`com/qvsu/open/controller/OpenDocController.java`、`com/qvsu/open/doc/ApiDocService.java`
- 证据等级: 事实

## SVC-023 - OpenApiSecurityService（网关鉴权服务）

- ID: SVC-023
- 名称: OpenApiSecurityService（OpenAPI 网关鉴权服务）
- 接口/实现: 无接口，实体类 `com/qvsu/open/service/OpenApiSecurityService.java`（`@Service`，构造注入 `JdbcTemplate`）；内部异常 `OpenApiSecurityException`（带业务码）
- 职责: 网关唯一鉴权入口：路径归一化（去尾斜杠）、按 `api_path`+`method` 加载接口定义（含 `POST` 方法兼容回退与禁用状态判定）、`need_sign=0` 时匿名放行、校验 `X-App-Key`/`X-Timestamp`/`X-Nonce`/`X-Sign` 四头、时间戳漂移 ±5 分钟、nonce 5 分钟内防重放（`ConcurrentHashMap` 缓存，超 10 万条触发清理）、应用存在性与有效期校验、应用-接口授权校验、按参数名排序拼接 `appKey=..&timestamp=..&nonce=..&业务参数..&appSecret=..` 后计算 HmacSHA256 十六进制签名并比对，成功后产出 `OpenAuthContext`。
- 关键方法清单:
  - `public OpenAuthContext authenticate(HttpServletRequest request, String body)`
  - `public int getCode()`（内部异常 `OpenApiSecurityException.getCode()`）
  - 常量为鉴权头契约：`HEADER_APP_KEY=X-App-Key`、`HEADER_TIMESTAMP=X-Timestamp`、`HEADER_NONCE=X-Nonce`、`HEADER_SIGN=X-Sign`
- 调用方（消费者）: `com/qvsu/open/filter/OpenApiFilter.java`
- 证据等级: 事实

## SVC-024 - OpenApiProxyService（网关转发服务）

- ID: SVC-024
- 名称: OpenApiProxyService（OpenAPI 网关转发服务）
- 接口/实现: 无接口，实体类 `com/qvsu/open/service/OpenApiProxyService.java`（`@Service`）；内部异常 `OpenProxyException`（带业务码）
- 职责: 按鉴权上下文中的 `targetUrl`、`timeoutMs` 与原始请求方法/头/查询串/请求体，用 `RestTemplate`（`SimpleClientHttpRequestFactory` 按接口级超时构造）转发到目标服务，回传原始字节响应；区分超时、连接失败与其他异常并映射为业务错误码；透传 `X-Trace-Id`。
- 关键方法清单:
  - `public ResponseEntity<byte[]> forward(OpenAuthContext context, HttpServletRequest request, byte[] body)`
  - `public int getCode()`（内部异常 `OpenProxyException.getCode()`）
- 调用方（消费者）: `com/qvsu/open/controller/OpenGatewayController.java`
- 证据等级: 事实

## SVC-025 - OpenApiLogService（网关调用日志服务）

- ID: SVC-025
- 名称: OpenApiLogService（OpenAPI 调用日志服务）
- 接口/实现: 无接口，实体类 `com/qvsu/open/service/OpenApiLogService.java`（`@Service`，构造注入 `JdbcTemplate`）
- 职责: 在网关请求结束（含鉴权失败与转发异常）时写入 `open_call_log`：traceId、appKey、appName、路径、方法、截断到 4000 字的请求体/响应体/错误信息、响应码、耗时、状态、客户端 IP、调用时间；日志写入异常被捕获并仅记录错误日志，不阻断主流程。
- 关键方法清单:
  - `public void save(String traceId, OpenAuthContext authContext, HttpServletRequest request, HttpServletResponse response, String requestBody, Integer httpCode, String responseBody, Integer status, String errorMsg, long costMs)`
- 调用方（消费者）: `com/qvsu/open/filter/OpenApiFilter.java`
- 证据等级: 事实

## SVC-026 - ApiDocService（接口文档生成服务）

- ID: SVC-026
- 名称: ApiDocService（OpenAPI 接口文档生成服务）
- 接口/实现: 无接口，实体类 `com/qvsu/open/doc/ApiDocService.java`（`@Service`，调用 SVC-022）
- 职责: 生成单接口 HTML 文档与多接口汇总 HTML 文档，并生成 `curl` 调用示例（含签名参数示例）；供接口管理页预览与文档管理页生成/下载复用。
- 关键方法清单:
  - `public String generateHtml(Long appId, List<Long> apiIds)`
  - `public String generateHtml(Long appId, List<Long> apiIds, String baseUrl)`
  - `public String generateApiHtml(Long apiId)`
  - `public String generateApiHtml(Long apiId, String baseUrl)`
  - `public String buildCurlExample(OpenApi api)`
  - `public String buildCurlExample(OpenApi api, String baseUrl)`
- 调用方（消费者）: `com/qvsu/open/controller/OpenApiMgrController.java`（`/admin/open/api/curl/{id}`）、`com/qvsu/open/controller/OpenDocController.java`（`/admin/open/doc/html/{apiId}`、`/generate`、`/download`）
- 证据等级: 事实

### 4.5 未分配服务 ID 的说明

| 候选 | 位置 | 未分配 SVC 的理由 | 证据等级 |
|---|---|---|---|
| `BaseController` | `com/qvsu/common/core/controller/BaseController.java` | 抽象基类而非服务 Bean，通过继承提供分页、响应封装与当前用户访问；24 个控制器中 21 个继承它，`CommonController`、`OpenGatewayController`、`OpenSelftestHttpbinController` 未继承 | 事实 |
| `SpringUtils`、`CacheUtils`、`ShiroUtils`、`DictUtils` 等静态工具 | `com/qvsu/common/utils/**` | 静态方法工具类，无 Spring 服务契约；按 output-contract 归入公共能力文档而非模块服务索引 | 事实 |
| `AsyncManager`/`AsyncFactory` | `com/qvsu/framework/manager/**` | 是框架内部异步执行设施，不被业务模块作为服务注入（仅 `LogAspect` 等框架类使用） | 事实 |
| `SysCaptchaController` 等控制器 | `com/qvsu/web/controller/**`、`com/qvsu/open/controller/**`、`com/qvsu/quartz/controller/**` | 控制器是入口而非可复用服务；其对外契约属于接口索引文档范围 | 事实 |

## 5. 模块依赖关系

### 5.1 依赖方向与强度（基于全量 import 扫描）

| 源模块 | 目标 MOD-common | 目标 MOD-framework | 目标 MOD-system | 目标 MOD-quartz | 目标 MOD-open | 目标 MOD-web |
|---|---:|---:|---:|---:|---:|---:|
| MOD-common 通用基座 | — | 0 | 0 | 0 | 0 | 0 |
| MOD-framework 框架层（含根包启动类） | 140 | 42（自引用） | 21 | 0 | 0 | 0 |
| MOD-system 系统管理域 | 103 | 0 | 66（自引用） | 0 | 0 | 0 |
| MOD-quartz 调度域 | 44 | 0 | 0 | 28（自引用） | 0 | 0 |
| MOD-open OpenAPI 网关 | 30 | 0 | 0 | 0 | 32（自引用） | 0 |
| MOD-web Web 入口 | 111 | 8 | 22 | 0 | 0 | 0 |

表中数字为 `import com.qvsu.<目标模块>.*` 的出现次数（同顶级模块内部引用单列「自引用」）。根包 `com.qvsu` 的 2 个启动类无 `com.qvsu.*` 出向 import，其归属见 3.2.2。证据等级: 事实。

### 5.2 实际依赖方向

```text
  MOD-framework 框架层（含根包启动类 QvsuApplication，组件扫描装配全部 Bean）
        |
        |  唯一进程入口，运行期装载其余 5 个模块，无编译期源码依赖
        v
  MOD-web Web 入口层 ----------------> MOD-framework 框架层
        |    \                            |
        |     \                           | 反向依赖（唯一）
        |      \                          v
        |       \                    MOD-system 系统管理域
        |        \                        |
        v         v                       v
  MOD-system 系统管理域                 MOD-common 通用基座
        |                                 ^
        |                                 |
  MOD-quartz 调度域 --------------------------+
  MOD-open OpenAPI 网关 --------------------+
```

- 期望链路（按经典分层）：`web → system/open/quartz → framework → common`。
- 实测链路（事实）：
  - `MOD-web → MOD-framework`、`MOD-web → MOD-system`、`MOD-web → MOD-common`，成立；
  - `MOD-quartz → MOD-common` 与 `MOD-open → MOD-common`，成立，但**两者均不经过 MOD-framework**；
  - `MOD-system → MOD-common`，成立，但 `MOD-system` **不经过 MOD-framework**；
  - `MOD-framework → MOD-system → MOD-common`，即框架层反而位于系统管理域之上。
  - 根包启动类已归入 MOD-framework，其 `@SpringBootApplication` 扫描根包 `com.qvsu`，是 6 个模块共享同一上下文与部署单元的直接证据（推断）。
- 因此实测的依赖层次为三层：`MOD-web`（入口）→ `MOD-framework` + `MOD-system` + `MOD-quartz` + `MOD-open`（四者互不依赖，仅 `MOD-framework` 依赖 `MOD-system`）→ `MOD-common`（基座）。
- 证据等级: 事实。

### 5.3 循环依赖与跨层直连检查

| 检查项 | 结论 | 证据 | 证据等级 |
|---|---|---|---|
| 包级循环依赖 | **不存在**。全量 import 扫描未发现任何 A→B 且 B→A 的顶级模块对，也未发现 `MOD-common` 的出向依赖（基座零回流） | 5.1 矩阵中 `MOD-common` 行全为 0；`MOD-framework`↔`MOD-system` 为单向 | 事实 |
| 反向依赖（架构分层倒置） | **存在 1 处**：`MOD-framework → MOD-system`。框架层直接注入业务域服务：`framework/shiro/realm/UserRealm.java` → SVC-010、SVC-009；`framework/shiro/service/SysLoginService.java` → SVC-008、SVC-009、SVC-010、SVC-015；`framework/shiro/service/SysRegisterService.java` → SVC-008；`framework/shiro/service/SysShiroService.java` → SVC-019；`framework/shiro/web/filter/LogoutFilter.java` → SVC-019；`framework/shiro/web/session/OnlineWebSessionManager.java` → SVC-019；`framework/web/service/ConfigService.java` → SVC-015；`framework/web/service/DictService.java` → SVC-013、SVC-014；`framework/manager/factory/AsyncFactory.java` → SVC-017、SVC-019 | 逐文件 import 证据 | 事实 |
| 跨层直连实现类（绕过接口） | **存在 1 处**：`framework/manager/factory/AsyncFactory.java` 直接 `import com.qvsu.system.service.impl.SysLogininforServiceImpl` 并在 `recordLogininfor` 中按实现类调用，而非面向 SVC-018（`ISysLogininforService`）。这是全项目中唯一出现「框架层引用业务层实现类」的位置 | `com/qvsu/framework/manager/factory/AsyncFactory.java` | 事实 |
| 领域实体跨模块寄宿 | **存在 1 处结构性问题**：6 个被系统管理域使用的核心实体（`SysUser`、`SysRole`、`SysMenu`、`SysDept`、`SysDictType`、`SysDictData`）位于 `MOD-common` 的 `common/core/domain/entity`，而 `MOD-system` 的 `system/domain` 只存放其余 10 个实体与关联实体。实体归属与业务域归属不一致，导致 `MOD-framework`、`MOD-system`、`MOD-web` 都直接依赖基座中的业务实体 | `com/qvsu/common/core/domain/entity/*.java`、`com/qvsu/system/domain/*.java` | 事实 |
| 控制器分布不一致（跨层直连的表现之一） | **存在**：`MOD-system` 的系统管理控制器全部位于 `MOD-web`（`web/controller/system`，14 个），而 `MOD-quartz`（`quartz/controller`，2 个）与 `MOD-open`（`open/controller`，7 个）自带控制器。同一系统内存在两种入口组织方式 | 三个包的控制器清单 | 事实 |
| 网关与安全框架解耦检查 | `MOD-open` 对 `MOD-framework` 的 import 数为 0：网关鉴权完全自实现（`OpenApiSecurityService`），不复用 `ShiroConfig`/`UserRealm`；`ShiroConfig` 将 `/open/**` 与 `/selftest/**` 显式配置为 `anon`，网关过滤器 `OpenApiFilter` 通过 `shouldNotFilter` 只作用于 `/open/` 前缀 | `com/qvsu/framework/config/ShiroConfig.java`、`com/qvsu/open/filter/OpenApiFilter.java` | 事实 |
| 数据访问方式不一致 | `MOD-system`、`MOD-quartz` 使用 MyBatis Mapper 接口 + XML（16 + 2 个 Mapper、18 个 XML）；`MOD-open` 完全没有 Mapper，全部使用 `JdbcTemplate` 内联 SQL。同一部署单元内存在两套数据访问范式 | `src/main/resources/mapper/**`、`com/qvsu/open/service/OpenManageService.java` | 事实 |
| 权限注解覆盖（**MOD-open 存在缺口**） | `MOD-open` 的 7 个控制器中未发现任何 Shiro `@RequiresPermissions` 注解，也未发现 `@Anonymous`；`open:app:view`、`open:api:view`、`open:auth:view`、`open:log:view`、`open:doc:view` 5 个权限码仅存在于菜单数据中，`templates/open/**` 的 9 个模板也未使用 `@permission` 模板服务。作为对照：`MOD-web` 的 9 个管理控制器声明了 95 处 `@RequiresPermissions`（`system:*`），`MOD-quartz` 的 2 个控制器声明了 18 处（`monitor:job:*`）。因此 `/admin/open/**` 的 5 个页面仅受 Shiro `/** = user,...` 的登录校验，任何已登录用户均可访问 | 对 `com/qvsu/open` 的正则扫描（`RequiresPermissions|Anonymous|shiro` 命中 0）；`com/qvsu/quartz` 命中 19（含 1 处 import）、`com/qvsu/web` 命中 95；`templates/open/**` 对 `@permission` 命中 0 | 事实 |
| 运行期装配 | 唯一部署单元内全部模块共享一个 Spring 上下文与一个数据源（Druid 主从 + 动态数据源），不存在跨进程调用；`MOD-open` 的转发是唯一出站 HTTP 调用（`RestTemplate` → `targetUrl`） | `framework/config/DruidConfig.java`、`open/service/OpenApiProxyService.java` | 事实 |

### 5.4 依赖规则总结（供后续变更参考）

1. `MOD-common` 是唯一允许被任意模块依赖的模块，且自身不得依赖任何其他模块（当前成立）。
2. `MOD-system`、`MOD-quartz`、`MOD-open` 三者之间零依赖，可独立演进（当前成立）。
3. `MOD-framework → MOD-system` 的反向依赖是运行期安全框架与业务用户数据的耦合点；如需解耦，应把 `UserRealm`、`SysLoginService`、`SysShiroService`、`OnlineWebSessionManager`、`LogoutFilter`、`AsyncFactory` 对 SVC-008/009/010/015/017/018/019 的调用改为通过接口并在框架层声明依赖倒置契约（推断）。
4. `MOD-open` 的控制器权限注解缺失（`MOD-web` 与 `MOD-quartz` 均已声明 `@RequiresPermissions`），使 OpenAPI 管理面成为全系统唯一的权限校验空洞，属优先治理项（推断）。

## 6. 包级清单

### 6.1 `src/main/java` 包目录逐包登记（88 个目录）

「类数」为该目录**直接包含**的 `.java` 文件数（不含子包）。「归属 MOD」的判定依据见各 MOD 主定义的「源码路径」字段。

| 序号 | 包目录 | 包名 | 类数 | 归属 MOD | 证据等级 |
|---:|---|---|---:|---|---|
| 1 | `com` | 无（纯命名空间目录，无 `.java`） | 0 | 不归属任何业务模块（Java 命名空间根） | 事实 |
| 2 | `com/qvsu` | `com.qvsu` | 2 | MOD-framework（根包启动类，归并说明见 3.2.2） | 事实 |
| 3 | `com/qvsu/common` | `com.qvsu.common`（聚合目录） | 0 | MOD-common | 事实 |
| 4 | `com/qvsu/common/annotation` | `com.qvsu.common.annotation` | 8 | MOD-common | 事实 |
| 5 | `com/qvsu/common/config` | `com.qvsu.common.config` | 2 | MOD-common | 事实 |
| 6 | `com/qvsu/common/config/datasource` | `com.qvsu.common.config.datasource` | 1 | MOD-common | 事实 |
| 7 | `com/qvsu/common/config/serializer` | `com.qvsu.common.config.serializer` | 1 | MOD-common | 事实 |
| 8 | `com/qvsu/common/config/thread` | `com.qvsu.common.config.thread` | 1 | MOD-common | 事实 |
| 9 | `com/qvsu/common/constant` | `com.qvsu.common.constant` | 6 | MOD-common | 事实 |
| 10 | `com/qvsu/common/core` | `com.qvsu.common.core`（聚合目录） | 0 | MOD-common | 事实 |
| 11 | `com/qvsu/common/core/context` | `com.qvsu.common.core.context` | 1 | MOD-common | 事实 |
| 12 | `com/qvsu/common/core/controller` | `com.qvsu.common.core.controller` | 1 | MOD-common | 事实 |
| 13 | `com/qvsu/common/core/domain` | `com.qvsu.common.core.domain` | 7 | MOD-common | 事实 |
| 14 | `com/qvsu/common/core/domain/entity` | `com.qvsu.common.core.domain.entity` | 6 | MOD-common | 事实 |
| 15 | `com/qvsu/common/core/page` | `com.qvsu.common.core.page` | 3 | MOD-common | 事实 |
| 16 | `com/qvsu/common/core/text` | `com.qvsu.common.core.text` | 3 | MOD-common | 事实 |
| 17 | `com/qvsu/common/enums` | `com.qvsu.common.enums` | 7 | MOD-common | 事实 |
| 18 | `com/qvsu/common/exception` | `com.qvsu.common.exception` | 4 | MOD-common | 事实 |
| 19 | `com/qvsu/common/exception/base` | `com.qvsu.common.exception.base` | 1 | MOD-common | 事实 |
| 20 | `com/qvsu/common/exception/file` | `com.qvsu.common.exception.file` | 5 | MOD-common | 事实 |
| 21 | `com/qvsu/common/exception/job` | `com.qvsu.common.exception.job` | 1 | MOD-common | 事实 |
| 22 | `com/qvsu/common/exception/user` | `com.qvsu.common.exception.user` | 10 | MOD-common | 事实 |
| 23 | `com/qvsu/common/json` | `com.qvsu.common.json` | 2 | MOD-common | 事实 |
| 24 | `com/qvsu/common/utils` | `com.qvsu.common.utils` | 17 | MOD-common | 事实 |
| 25 | `com/qvsu/common/utils/bean` | `com.qvsu.common.utils.bean` | 2 | MOD-common | 事实 |
| 26 | `com/qvsu/common/utils/file` | `com.qvsu.common.utils.file` | 5 | MOD-common | 事实 |
| 27 | `com/qvsu/common/utils/html` | `com.qvsu.common.utils.html` | 2 | MOD-common | 事实 |
| 28 | `com/qvsu/common/utils/http` | `com.qvsu.common.utils.http` | 2 | MOD-common | 事实 |
| 29 | `com/qvsu/common/utils/poi` | `com.qvsu.common.utils.poi` | 2 | MOD-common | 事实 |
| 30 | `com/qvsu/common/utils/reflect` | `com.qvsu.common.utils.reflect` | 1 | MOD-common | 事实 |
| 31 | `com/qvsu/common/utils/security` | `com.qvsu.common.utils.security` | 3 | MOD-common | 事实 |
| 32 | `com/qvsu/common/utils/spring` | `com.qvsu.common.utils.spring` | 1 | MOD-common | 事实 |
| 33 | `com/qvsu/common/utils/sql` | `com.qvsu.common.utils.sql` | 1 | MOD-common | 事实 |
| 34 | `com/qvsu/common/utils/uuid` | `com.qvsu.common.utils.uuid` | 3 | MOD-common | 事实 |
| 35 | `com/qvsu/common/xss` | `com.qvsu.common.xss` | 4 | MOD-common | 事实 |
| 36 | `com/qvsu/framework` | `com.qvsu.framework`（聚合目录） | 0 | MOD-framework | 事实 |
| 37 | `com/qvsu/framework/aspectj` | `com.qvsu.framework.aspectj` | 4 | MOD-framework | 事实 |
| 38 | `com/qvsu/framework/config` | `com.qvsu.framework.config` | 9 | MOD-framework | 事实 |
| 39 | `com/qvsu/framework/config/properties` | `com.qvsu.framework.config.properties` | 2 | MOD-framework | 事实 |
| 40 | `com/qvsu/framework/datasource` | `com.qvsu.framework.datasource` | 1 | MOD-framework | 事实 |
| 41 | `com/qvsu/framework/interceptor` | `com.qvsu.framework.interceptor` | 1 | MOD-framework | 事实 |
| 42 | `com/qvsu/framework/interceptor/impl` | `com.qvsu.framework.interceptor.impl` | 1 | MOD-framework | 事实 |
| 43 | `com/qvsu/framework/manager` | `com.qvsu.framework.manager` | 2 | MOD-framework | 事实 |
| 44 | `com/qvsu/framework/manager/factory` | `com.qvsu.framework.manager.factory` | 1 | MOD-framework | 事实 |
| 45 | `com/qvsu/framework/shiro` | `com.qvsu.framework.shiro`（聚合目录） | 0 | MOD-framework | 事实 |
| 46 | `com/qvsu/framework/shiro/realm` | `com.qvsu.framework.shiro.realm` | 1 | MOD-framework | 事实 |
| 47 | `com/qvsu/framework/shiro/rememberMe` | `com.qvsu.framework.shiro.rememberMe` | 1 | MOD-framework | 事实 |
| 48 | `com/qvsu/framework/shiro/service` | `com.qvsu.framework.shiro.service` | 4 | MOD-framework | 事实 |
| 49 | `com/qvsu/framework/shiro/session` | `com.qvsu.framework.shiro.session` | 3 | MOD-framework | 事实 |
| 50 | `com/qvsu/framework/shiro/util` | `com.qvsu.framework.shiro.util` | 1 | MOD-framework | 事实 |
| 51 | `com/qvsu/framework/shiro/web` | `com.qvsu.framework.shiro.web` | 1 | MOD-framework | 事实 |
| 52 | `com/qvsu/framework/shiro/web/filter` | `com.qvsu.framework.shiro.web.filter` | 1 | MOD-framework | 事实 |
| 53 | `com/qvsu/framework/shiro/web/filter/captcha` | `com.qvsu.framework.shiro.web.filter.captcha` | 1 | MOD-framework | 事实 |
| 54 | `com/qvsu/framework/shiro/web/filter/csrf` | `com.qvsu.framework.shiro.web.filter.csrf` | 1 | MOD-framework | 事实 |
| 55 | `com/qvsu/framework/shiro/web/filter/kickout` | `com.qvsu.framework.shiro.web.filter.kickout` | 1 | MOD-framework | 事实 |
| 56 | `com/qvsu/framework/shiro/web/filter/online` | `com.qvsu.framework.shiro.web.filter.online` | 1 | MOD-framework | 事实 |
| 57 | `com/qvsu/framework/shiro/web/filter/sync` | `com.qvsu.framework.shiro.web.filter.sync` | 1 | MOD-framework | 事实 |
| 58 | `com/qvsu/framework/shiro/web/session` | `com.qvsu.framework.shiro.web.session` | 2 | MOD-framework | 事实 |
| 59 | `com/qvsu/framework/web` | `com.qvsu.framework.web`（聚合目录） | 0 | MOD-framework | 事实 |
| 60 | `com/qvsu/framework/web/exception` | `com.qvsu.framework.web.exception` | 1 | MOD-framework | 事实 |
| 61 | `com/qvsu/framework/web/service` | `com.qvsu.framework.web.service` | 3 | MOD-framework | 事实 |
| 62 | `com/qvsu/system` | `com.qvsu.system`（聚合目录） | 0 | MOD-system | 事实 |
| 63 | `com/qvsu/system/domain` | `com.qvsu.system.domain` | 10 | MOD-system | 事实 |
| 64 | `com/qvsu/system/mapper` | `com.qvsu.system.mapper` | 16 | MOD-system | 事实 |
| 65 | `com/qvsu/system/service` | `com.qvsu.system.service` | 12 | MOD-system | 事实 |
| 66 | `com/qvsu/system/service/impl` | `com.qvsu.system.service.impl` | 12 | MOD-system | 事实 |
| 67 | `com/qvsu/quartz` | `com.qvsu.quartz`（聚合目录） | 0 | MOD-quartz | 事实 |
| 68 | `com/qvsu/quartz/config` | `com.qvsu.quartz.config` | 1 | MOD-quartz | 事实 |
| 69 | `com/qvsu/quartz/controller` | `com.qvsu.quartz.controller` | 2 | MOD-quartz | 事实 |
| 70 | `com/qvsu/quartz/domain` | `com.qvsu.quartz.domain` | 2 | MOD-quartz | 事实 |
| 71 | `com/qvsu/quartz/mapper` | `com.qvsu.quartz.mapper` | 2 | MOD-quartz | 事实 |
| 72 | `com/qvsu/quartz/service` | `com.qvsu.quartz.service` | 2 | MOD-quartz | 事实 |
| 73 | `com/qvsu/quartz/service/impl` | `com.qvsu.quartz.service.impl` | 2 | MOD-quartz | 事实 |
| 74 | `com/qvsu/quartz/task` | `com.qvsu.quartz.task` | 2 | MOD-quartz | 事实 |
| 75 | `com/qvsu/quartz/util` | `com.qvsu.quartz.util` | 6 | MOD-quartz | 事实 |
| 76 | `com/qvsu/open` | `com.qvsu.open`（聚合目录） | 0 | MOD-open | 事实 |
| 77 | `com/qvsu/open/controller` | `com.qvsu.open.controller` | 7 | MOD-open | 事实 |
| 78 | `com/qvsu/open/doc` | `com.qvsu.open.doc` | 1 | MOD-open | 事实 |
| 79 | `com/qvsu/open/domain` | `com.qvsu.open.domain` | 5 | MOD-open | 事实 |
| 80 | `com/qvsu/open/filter` | `com.qvsu.open.filter` | 1 | MOD-open | 事实 |
| 81 | `com/qvsu/open/model` | `com.qvsu.open.model` | 2 | MOD-open | 事实 |
| 82 | `com/qvsu/open/service` | `com.qvsu.open.service` | 4 | MOD-open | 事实 |
| 83 | `com/qvsu/open/trace` | `com.qvsu.open.trace` | 1 | MOD-open | 事实 |
| 84 | `com/qvsu/open/web` | `com.qvsu.open.web` | 1 | MOD-open | 事实 |
| 85 | `com/qvsu/web` | `com.qvsu.web`（聚合目录） | 0 | MOD-web | 事实 |
| 86 | `com/qvsu/web/controller` | `com.qvsu.web.controller`（聚合目录） | 0 | MOD-web | 事实 |
| 87 | `com/qvsu/web/controller/common` | `com.qvsu.web.controller.common` | 1 | MOD-web | 事实 |
| 88 | `com/qvsu/web/controller/system` | `com.qvsu.web.controller.system` | 14 | MOD-web | 事实 |

合计：88 个目录，其中 77 个目录含 `.java` 且声明包名一致，11 个为聚合目录；类数合计 265，与全量文件数一致。

### 6.2 `src/test/java` 包目录登记（3 个目录，不归属上述 6 个顶层包）

| 序号 | 包目录 | 包名 | 类数 | 归属 | 证据等级 |
|---:|---|---|---:|---|---|
| 1 | `com` | 无（纯命名空间目录） | 0 | 不归属业务模块 | 事实 |
| 2 | `com/qvsu/openapi` | `com.qvsu.openapi` | 4 | 集成测试（`AutoCaptchaLoginIntegrationTest`、`OpenApiManagementIntegrationTest`、`OpenManageCompatibilityIntegrationTest`、`QuartzManagementIntegrationTest`），不参与运行时代码模块划分 | 事实 |
| 3 | `src/test/java` 根 | 无 | 0 | 测试源码根目录 | 事实 |

### 6.3 包目录数与共享上下文的一致性核对

| 项 | 共享上下文声明 | 本文实测 | 差异 | 结论 | 证据等级 |
|---|---:|---:|---:|---|---|
| `src/main/java` 包目录数 | 93 | 88 | -5 | 无法从源码树重现「93」这一计数；实测明细已全量登记于 6.1（88 行）。差异计入存疑项，建议主任务以本表为对账基准 | 事实（实测）／假设（差异成因） |
| `com.qvsu` 下包（含包名目录）数 | 未单列 | 87（含 `com.qvsu` 自身；其中 77 个含类、10 个为聚合目录） | — | 6 个业务顶层包及其子包全部覆盖，无遗漏包 | 事实 |
| `.java` 文件数 | 未声明 | 265（`src/main/java`） | — | 与共享上下文所述「409 个在范围内源码文件」不冲突：后者覆盖 `src/main/java`、`src/main/resources`（含 144 个模板）与其他范围资产 | 事实 |

## 7. 覆盖自检与存疑项

### 7.1 覆盖自检

| 检查项 | 结果 | 证据等级 |
|---|---|---|
| 6 个顶层包是否各有 MOD 主定义 | 是：MOD-common / MOD-framework / MOD-system / MOD-quartz / MOD-open / MOD-web 与 6 个顶层包一一对应；根包 `com.qvsu` 的 2 个启动类归入 MOD-framework（见 3.2.2） | 事实 |
| 是否每个包目录都归属某个 MOD | 是：6.1 中 87 行归入 MOD-common 至 MOD-web，第 1 行 `com` 为纯命名空间目录（不含 `.java`）已注明 | 事实 |
| 是否列出全部 Controller | 是：24 个控制器（MOD-web 的 15 个、MOD-open 的 7 个、MOD-quartz 的 2 个）全部列出并给出路径 | 事实 |
| 是否列出全部 Service 与 ServiceImpl | 是：MOD-system 的 12 + 12、MOD-quartz 的 2 + 2、MOD-framework 的 7 个服务类、MOD-open 的 5 个服务类，全部列出 | 事实 |
| 是否列出全部 Mapper | 是：MOD-system 的 16 个、MOD-quartz 的 2 个，并说明 MOD-open 无 Mapper | 事实 |
| 是否说明 6 个模块的依赖方向 | 是：第 5.1 节矩阵与 5.2 节链路图 | 事实 |
| 是否指出循环依赖与跨层直连 | 是：5.3 节逐项判定 | 事实 |
| 是否使用 `MOD-` / `SVC-` 之外的 ID 前缀 | 否，全文仅使用 `MOD-common` 至 `MOD-web` 共 6 个模块 ID、`SVC-001` 至 `SVC-026` 共 26 个服务 ID | 事实 |

### 7.2 存疑项

| 编号 | 存疑内容 | 当前判断 | 需要的验证动作 | 证据等级 |
|---|---|---|---|---|
| D1 | 共享上下文声明 `src/main/java` 有 93 个包目录，实测为 88 个（77 含类 + 11 聚合），差异 5 个无法定位 | 可能把 `src/test/java` 目录、资源目录或历史计数一并计入 | 以 6.1 全量清单为准；请主任务确认 93 的来源口径 | 假设 |
| D2 | `MOD-open` 的 7 个控制器完全没有权限注解，5 个 `open:*` 权限码仅存在于菜单数据；而 `MOD-web` 声明 95 处、`MOD-quartz` 声明 18 处 `@RequiresPermissions` | 任何已登录用户均可访问 `/admin/open/**` 的 5 个管理页面与全部管理接口（Shiro 仅按 `/** = user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter` 做登录校验），权限码形同装饰 | 运行一次「非管理员账号访问 `/admin/open/app` 并执行新增/删除」的越权测试确认 | 推断 |
| D3 | `SVC-017`（操作日志）与 `SVC-018`（登录日志）只有写入路径有明确调用方，源码中未发现查询/删除的调用控制器，且 `templates/demo/**` 之外无对应监控页面 | 监控页面（操作日志/登录日志）可能在本精简版中被裁剪，或仅在框架示例中保留 | 与功能清单文档核对是否存在对应功能点 | 假设 |
| D4 | `ISysLogininforService` 被 `AsyncFactory` 以实现类方式引用 | 编译期无问题，但违反接口隔离，且是框架层唯一的实现类直连 | 建议改为注入 SVC-018 接口；变更前需评估 Ehcache/事务行为 | 事实 |
| D5 | `Constants.java` 第 121 行仍保留 `com.qvsu.generator` 包名（代码生成基包白名单），但 `com.qvsu.generator` 包在源码中不存在 | 属 RuoYi 代码生成模块被裁剪后的残留常量 | 无需修复，但应在排除项文档中登记 | 事实 |
| D6 | `templates/tool/build/build.html` 存在但 `com.qvsu` 下无任何代码生成控制器 | 代码生成页面模板为裁剪残留，无后台支撑 | 与排除项文档核对 | 事实 |
| D7 | `MOD-framework` 直接依赖 `MOD-system` 的分层倒置是否为有意设计 | 从代码看是 RuoYi 基座的既有形态（Realm 需要用户/权限数据），非本项目增量引入 | 若后续引入多租户或插件化，需要先做依赖倒置改造 | 推断 |
| D8 | `OpenApiFilter` 通过 `@Component` + `OncePerRequestFilter` 注册，`shouldNotFilter` 限定 `/open/` 前缀；未在 `FilterConfig` 中显式注册，顺序依赖 Spring Boot 自动注册 | 过滤器顺序为默认值（未设置 order），而 Shiro 过滤器链对 `/open/**` 为 `anon`，因此不受 Shiro 顺序影响 | 如后续新增过滤器需调整 order | 推断 |
| D9 | `OpenApiSecurityService` 的 nonce 防重放使用 JVM 内存 `ConcurrentHashMap` | 单实例部署有效；多实例横向扩容会失去防重放能力 | 多实例部署前需改为集中式存储（如 Redis/数据库） | 推断 |

### 7.3 与其他文档的边界

- 本文只定义模块与服务边界、类落点与依赖方向；菜单与页面功能点、接口级契约、对象字段、物理表字段、配置键、技术组件能力分别由其他文档承担，本文不重复定义也不引用未确认的稳定 ID。
- 若其他文档需要引用模块或服务，请直接引用本文的 `MOD-common`、`MOD-framework`、`MOD-system`、`MOD-quartz`、`MOD-open`、`MOD-web` 与 `SVC-001` 至 `SVC-026`。
