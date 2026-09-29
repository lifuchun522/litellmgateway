# 源码资产清单（Source Asset Inventory）

> 产物语言：zh-CN ｜ 本文件是覆盖率的**分母**，由 `docs/tools/extract-assets.ps1` 与 `docs/tools/extract-semantics.ps1` 确定性生成。

扫描范围：`open-api/`，扩展名白名单见下，排除 `node_modules|vendor|build|dist|target|bin|obj|.git|coverage`。

## 0. 统计摘要

| 资产类型 | 数量 |
|---|---:|
| 在范围内源码文件 | 409 |
| 校验器识别的入口/DAO/模型文件 | 60 |
| REST 路由字面量 | 184 |
| 定时/事件触发器 | 0 |
| DDL 对象（含方言重复） | 86 |
| 去重后物理表 | 34 |
| Mapper 语句 | 144 |
| 配置键 | 29 |
| 权限码 | 55 |
| 视图模板 | 144 |
| 菜单行（去重后） | 74 |

## 1. 文件级资产登记（全量，含稳定 ID 与功能归属）

| Asset Type | Source Path | Symbol/Route/Handler | Stable ID | Function ID | Status | Exclusion Reason | Evidence Level |
|---|---|---|---|---|---|---|---|
| config | `deploy/dev-docker/docker-compose.yml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| config | `deploy/local-docker/conf/application-docker-local.yml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| config | `deploy/local-docker/docker-compose.yaml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/00-create-db.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/10-qvsu.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/30-open-api.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/31-open-api-compat.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/35-quartz.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/40-open-api-menu.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/mysql/init/50-open-api-seed.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/00-init.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/10-qvsu.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/30-open-api.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/31-open-api-compat.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/35-quartz.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/40-open-api-menu.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `deploy/local-docker/postgres/init/50-open-api-seed.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/pom.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/Anonymous.java` | `Anonymous` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/DataScope.java` | `DataScope` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/DataSource.java` | `DataSource` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/Excel.java` | `Excel` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/Excels.java` | `Excels` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/Log.java` | `Log` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/RepeatSubmit.java` | `RepeatSubmit` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/annotation/Sensitive.java` | `Sensitive` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/config/datasource/DynamicDataSourceContextHolder.java` | `DynamicDataSourceContextHolder` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/config/QvsuConfig.java` | `QvsuConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/config/serializer/SensitiveJsonSerializer.java` | `SensitiveJsonSerializer` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/config/ServerConfig.java` | `ServerConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/config/thread/ThreadPoolConfig.java` | `ThreadPoolConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/Constants.java` | `Constants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/GenConstants.java` | `GenConstants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/PermissionConstants.java` | `PermissionConstants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/ScheduleConstants.java` | `ScheduleConstants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/ShiroConstants.java` | `ShiroConstants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/constant/UserConstants.java` | `UserConstants` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/context/PermissionContextHolder.java` | `PermissionContextHolder` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/controller/BaseController.java` | `BaseController` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/AjaxResult.java` | `AjaxResult` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/BaseEntity.java` | `BaseEntity` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/CxSelect.java` | `CxSelect` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDept.java` | `SysDept` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDictData.java` | `SysDictData` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysDictType.java` | `SysDictType` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysMenu.java` | `SysMenu` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysRole.java` | `SysRole` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/entity/SysUser.java` | `SysUser` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/OptBaseEntity.java` | `OptBaseEntity` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/R.java` | `R` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/TreeEntity.java` | `TreeEntity` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/domain/Ztree.java` | `Ztree` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/page/PageDomain.java` | `PageDomain` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/page/TableDataInfo.java` | `TableDataInfo` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/page/TableSupport.java` | `TableSupport` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/text/CharsetKit.java` | `CharsetKit` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/text/Convert.java` | `Convert` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/core/text/StrFormatter.java` | `StrFormatter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/BusinessStatus.java` | `BusinessStatus` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/BusinessType.java` | `BusinessType` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/DataSourceType.java` | `DataSourceType` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/DesensitizedType.java` | `DesensitizedType` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/OnlineStatus.java` | `OnlineStatus` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/OperatorType.java` | `OperatorType` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/enums/UserStatus.java` | `UserStatus` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/base/BaseException.java` | `BaseException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/DemoModeException.java` | `DemoModeException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/file/FileException.java` | `FileException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/file/FileNameLengthLimitExceededException.java` | `FileNameLengthLimitExceededException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/file/FileSizeLimitExceededException.java` | `FileSizeLimitExceededException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/file/FileUploadException.java` | `FileUploadException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/file/InvalidExtensionException.java` | `InvalidExtensionException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/GlobalException.java` | `GlobalException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/job/TaskException.java` | `TaskException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/ServiceException.java` | `ServiceException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/BlackListException.java` | `BlackListException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/CaptchaException.java` | `CaptchaException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/RoleBlockedException.java` | `RoleBlockedException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserBlockedException.java` | `UserBlockedException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserDeleteException.java` | `UserDeleteException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserException.java` | `UserException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserNotExistsException.java` | `UserNotExistsException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserPasswordNotMatchException.java` | `UserPasswordNotMatchException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserPasswordRetryLimitCountException.java` | `UserPasswordRetryLimitCountException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/user/UserPasswordRetryLimitExceedException.java` | `UserPasswordRetryLimitExceedException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/exception/UtilException.java` | `UtilException` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/json/JSON.java` | `JSON` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/json/JSONObject.java` | `JSONObject` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/AddressUtils.java` | `AddressUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/Arith.java` | `Arith` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/bean/BeanUtils.java` | `BeanUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/bean/BeanValidators.java` | `BeanValidators` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/CacheUtils.java` | `CacheUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/CookieUtils.java` | `CookieUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/DateUtils.java` | `DateUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/DesensitizedUtil.java` | `DesensitizedUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/DictUtils.java` | `DictUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/ExceptionUtil.java` | `ExceptionUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileTypeUtils.java` | `FileTypeUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUploadUtils.java` | `FileUploadUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/file/FileUtils.java` | `FileUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/file/ImageUtils.java` | `ImageUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/file/MimeTypeUtils.java` | `MimeTypeUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/html/EscapeUtil.java` | `EscapeUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/html/HTMLFilter.java` | `HTMLFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/http/HttpUtils.java` | `HttpUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/http/UserAgentUtils.java` | `UserAgentUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/IpUtils.java` | `IpUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/LogUtils.java` | `LogUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/MapDataUtil.java` | `MapDataUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/MessageUtils.java` | `MessageUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/PageUtils.java` | `PageUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/poi/ExcelHandlerAdapter.java` | `ExcelHandlerAdapter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/poi/ExcelUtil.java` | `ExcelUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/reflect/ReflectUtils.java` | `ReflectUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/security/CipherUtils.java` | `CipherUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/security/Md5Utils.java` | `Md5Utils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/security/PermissionUtils.java` | `PermissionUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/ServletUtils.java` | `ServletUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/ShiroUtils.java` | `ShiroUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/spring/SpringUtils.java` | `SpringUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/sql/SqlUtil.java` | `SqlUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/StringUtils.java` | `StringUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/Threads.java` | `Threads` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/uuid/IdUtils.java` | `IdUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/uuid/Seq.java` | `Seq` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/utils/uuid/UUID.java` | `UUID` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/xss/Xss.java` | `Xss` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/xss/XssFilter.java` | `XssFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/xss/XssHttpServletRequestWrapper.java` | `XssHttpServletRequestWrapper` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/common/xss/XssValidator.java` | `XssValidator` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/DataScopeAspect.java` | `DataScopeAspect` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/DataSourceAspect.java` | `DataSourceAspect` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/LogAspect.java` | `LogAspect` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/PermissionsAspect.java` | `PermissionsAspect` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/ApplicationConfig.java` | `ApplicationConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/CaptchaConfig.java` | `CaptchaConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/DruidConfig.java` | `DruidConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/FilterConfig.java` | `FilterConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/I18nConfig.java` | `I18nConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/config/KaptchaTextCreator.java` | `KaptchaTextCreator` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/MyBatisConfig.java` | `MyBatisConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/config/properties/DruidProperties.java` | `DruidProperties` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/config/properties/PermitAllUrlProperties.java` | `PermitAllUrlProperties` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/ResourcesConfig.java` | `ResourcesConfig` | - | unassigned-supporting | modeled | - | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/framework/config/ShiroConfig.java` | `ShiroConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/datasource/DynamicDataSource.java` | `DynamicDataSource` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/interceptor/impl/SameUrlDataInterceptor.java` | `SameUrlDataInterceptor` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/interceptor/RepeatSubmitInterceptor.java` | `RepeatSubmitInterceptor` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/manager/AsyncManager.java` | `AsyncManager` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/manager/factory/AsyncFactory.java` | `AsyncFactory` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/manager/ShutdownManager.java` | `ShutdownManager` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/realm/UserRealm.java` | `UserRealm` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/rememberMe/CustomCookieRememberMeManager.java` | `CustomCookieRememberMeManager` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysLoginService.java` | `SysLoginService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysPasswordService.java` | `SysPasswordService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysRegisterService.java` | `SysRegisterService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/service/SysShiroService.java` | `SysShiroService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSession.java` | `OnlineSession` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionDAO.java` | `OnlineSessionDAO` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/session/OnlineSessionFactory.java` | `OnlineSessionFactory` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/util/AuthorizationUtils.java` | `AuthorizationUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/CustomShiroFilterFactoryBean.java` | `CustomShiroFilterFactoryBean` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/captcha/CaptchaValidateFilter.java` | `CaptchaValidateFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/csrf/CsrfValidateFilter.java` | `CsrfValidateFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/kickout/KickoutSessionFilter.java` | `KickoutSessionFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/LogoutFilter.java` | `LogoutFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/online/OnlineSessionFilter.java` | `OnlineSessionFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/filter/sync/SyncOnlineSessionFilter.java` | `SyncOnlineSessionFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/OnlineWebSessionManager.java` | `OnlineWebSessionManager` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/shiro/web/session/SpringSessionValidationScheduler.java` | `SpringSessionValidationScheduler` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/framework/web/exception/GlobalExceptionHandler.java` | `GlobalExceptionHandler` | - | FUNC-global-exception | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/web/service/ConfigService.java` | `ConfigService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/web/service/DictService.java` | `DictService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/framework/web/service/PermissionService.java` | `PermissionService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` | `OpenApiMgrController` | - | FUNC-open-api-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` | `OpenAppController` | - | FUNC-open-app-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` | `OpenAuthController` | - | FUNC-open-auth-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` | `OpenDocController` | - | FUNC-open-doc-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenGatewayController.java` | `OpenGatewayController` | - | FUNC-open-gateway-invoke | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` | `OpenLogController` | - | FUNC-open-log-query | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` | `OpenSelftestHttpbinController` | - | FUNC-open-selftest | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/doc/ApiDocService.java` | `ApiDocService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApi.java` | `OpenApi` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApiDoc.java` | `OpenApiDoc` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenApp.java` | `OpenApp` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenAppApi.java` | `OpenAppApi` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/domain/OpenCallLog.java` | `OpenCallLog` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java` | `OpenApiFilter` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/model/OpenAuthContext.java` | `OpenAuthContext` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/model/OpenResult.java` | `OpenResult` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiLogService.java` | `OpenApiLogService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiProxyService.java` | `OpenApiProxyService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/service/OpenApiSecurityService.java` | `OpenApiSecurityService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/service/OpenManageService.java` | `OpenManageService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/trace/TraceContext.java` | `TraceContext` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/open/web/CachedBodyHttpServletRequest.java` | `CachedBodyHttpServletRequest` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/quartz/config/ScheduleConfig.java` | `ScheduleConfig` | - | unassigned-supporting | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` | `SysJobController` | - | FUNC-job-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` | `SysJobLogController` | - | FUNC-job-log-query | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/domain/SysJob.java` | `SysJob` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/domain/SysJobLog.java` | `SysJobLog` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/quartz/mapper/SysJobLogMapper.java` | `SysJobLogMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/quartz/mapper/SysJobMapper.java` | `SysJobMapper` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobLogServiceImpl.java` | `SysJobLogServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/service/impl/SysJobServiceImpl.java` | `SysJobServiceImpl` | - | FUNC-job-scheduler | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/service/ISysJobLogService.java` | `ISysJobLogService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/service/ISysJobService.java` | `ISysJobService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/task/HttpTask.java` | `HttpTask` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/task/QvsuTask.java` | `QvsuTask` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/AbstractQuartzJob.java` | `AbstractQuartzJob` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/CronUtils.java` | `CronUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/JobInvokeUtil.java` | `JobInvokeUtil` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/QuartzDisallowConcurrentExecution.java` | `QuartzDisallowConcurrentExecution` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/QuartzJobExecution.java` | `QuartzJobExecution` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/quartz/util/ScheduleUtils.java` | `ScheduleUtils` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/QvsuApplication.java` | `QvsuApplication` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/QvsuServletInitializer.java` | `QvsuServletInitializer` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| model | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysConfig.java` | `SysConfig` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysLogininfor.java` | `SysLogininfor` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysNotice.java` | `SysNotice` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysOperLog.java` | `SysOperLog` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysPost.java` | `SysPost` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysRoleDept.java` | `SysRoleDept` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysRoleMenu.java` | `SysRoleMenu` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserOnline.java` | `SysUserOnline` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserPost.java` | `SysUserPost` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/domain/SysUserRole.java` | `SysUserRole` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysConfigMapper.java` | `SysConfigMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysDeptMapper.java` | `SysDeptMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysDictDataMapper.java` | `SysDictDataMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysDictTypeMapper.java` | `SysDictTypeMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysLogininforMapper.java` | `SysLogininforMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysMenuMapper.java` | `SysMenuMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysNoticeMapper.java` | `SysNoticeMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysOperLogMapper.java` | `SysOperLogMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysPostMapper.java` | `SysPostMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysRoleDeptMapper.java` | `SysRoleDeptMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysRoleMapper.java` | `SysRoleMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysRoleMenuMapper.java` | `SysRoleMenuMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysUserMapper.java` | `SysUserMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysUserOnlineMapper.java` | `SysUserOnlineMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysUserPostMapper.java` | `SysUserPostMapper` | - | unassigned-supporting | modeled | - | 事实 |
| dao | `qvsu-openapi/src/main/java/com/qvsu/system/mapper/SysUserRoleMapper.java` | `SysUserRoleMapper` | - | unassigned-supporting | modeled | - | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysConfigServiceImpl.java` | `SysConfigServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDeptServiceImpl.java` | `SysDeptServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDictDataServiceImpl.java` | `SysDictDataServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysDictTypeServiceImpl.java` | `SysDictTypeServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysLogininforServiceImpl.java` | `SysLogininforServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysMenuServiceImpl.java` | `SysMenuServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysNoticeServiceImpl.java` | `SysNoticeServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysOperLogServiceImpl.java` | `SysOperLogServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysPostServiceImpl.java` | `SysPostServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysRoleServiceImpl.java` | `SysRoleServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserOnlineServiceImpl.java` | `SysUserOnlineServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/impl/SysUserServiceImpl.java` | `SysUserServiceImpl` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysConfigService.java` | `ISysConfigService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysDeptService.java` | `ISysDeptService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysDictDataService.java` | `ISysDictDataService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysDictTypeService.java` | `ISysDictTypeService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysLogininforService.java` | `ISysLogininforService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysMenuService.java` | `ISysMenuService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysNoticeService.java` | `ISysNoticeService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysOperLogService.java` | `ISysOperLogService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysPostService.java` | `ISysPostService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysRoleService.java` | `ISysRoleService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysUserOnlineService.java` | `ISysUserOnlineService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/java/com/qvsu/system/service/ISysUserService.java` | `ISysUserService` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` | `CommonController` | - | FUNC-common-upload, FUNC-common-download | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` | `SysCaptchaController` | - | FUNC-sys-captcha | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` | `SysConfigController` | - | FUNC-sys-config-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` | `SysDeptController` | - | FUNC-sys-dept-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` | `SysDictDataController` | - | unassigned-supporting | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` | `SysDictTypeController` | - | FUNC-sys-dict-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` | `SysIndexController` | - | FUNC-sys-index, FUNC-sys-unauth | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` | `SysLoginController` | - | FUNC-sys-login, FUNC-sys-logout | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` | `SysMenuController` | - | FUNC-sys-menu-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` | `SysNoticeController` | - | FUNC-sys-notice-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` | `SysPostController` | - | FUNC-sys-post-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` | `SysProfileController` | - | FUNC-sys-profile, FUNC-sys-profile-avatar | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` | `SysRegisterController` | - | FUNC-sys-register | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` | `SysRoleController` | - | FUNC-sys-role-manage | modeled | - | 事实 |
| entry-controller | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` | `SysUserController` | - | FUNC-sys-user-manage | modeled | - | 事实 |
| config | `qvsu-openapi/src/main/resources/application-druid.yml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| config | `qvsu-openapi/src/main/resources/application.yml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/resources/ehcache/ehcache-shiro.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/resources/logback.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/quartz/SysJobLogMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/quartz/SysJobMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysConfigMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysDeptMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysDictDataMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysDictTypeMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysLogininforMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysMenuMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysNoticeMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysOperLogMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysPostMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysRoleDeptMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysRoleMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysRoleMenuMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysUserMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysUserOnlineMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysUserPostMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| mapper-xml | `qvsu-openapi/src/main/resources/mapper/system/SysUserRoleMapper.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/main/resources/mybatis/mybatis-config.xml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/beautifyhtml/beautifyhtml.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/blockUI/jquery.blockUI.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-fileinput/fileinput.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-fileinput/fileinput.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-select/bootstrap-select.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-select/bootstrap-select.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/bootstrap-table.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/auto-refresh/bootstrap-table-auto-refresh.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/columns/bootstrap-table-fixed-columns.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/cookie/bootstrap-table-cookie.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/custom-view/bootstrap-table-custom-view.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/editable/bootstrap-editable.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/editable/bootstrap-table-editable.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/export/bootstrap-table-export.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/export/tableExport.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/mobile/bootstrap-table-mobile.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/print/bootstrap-table-print.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/reorder-columns/bootstrap-table-reorder-columns.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/reorder-columns/jquery.dragtable.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/reorder-rows/bootstrap-table-reorder-rows.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/reorder-rows/jquery.tablednd.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/resizable/bootstrap-table-resizable.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/resizable/jquery.resizableColumns.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/tree/bootstrap-table-tree.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/extensions/tree/bootstrap-table-tree.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/locale/bootstrap-table-zh-CN.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/bootstrap-table/locale/bootstrap-table-zh-CN.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/cropper/cropper.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/cropper/cropper.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/cxselect/jquery.cxselect.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/cxselect/jquery.cxselect.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/datapicker/bootstrap-datetimepicker.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/datapicker/bootstrap-datetimepicker.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/duallistbox/bootstrap-duallistbox.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/duallistbox/bootstrap-duallistbox.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/curvedLines.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.pie.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.resize.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.spline.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.symbol.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/flot/jquery.flot.tooltip.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/fullscreen/jquery.fullscreen.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/highlight/highlight.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/iCheck/icheck.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jasny/jasny-bootstrap.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jasny/jasny-bootstrap.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-layout/jquery.layout-latest.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.all-3.5.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.core-3.5.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.excheck-3.5.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.exedit-3.5.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jquery-ztree/3.5/js/jquery.ztree.exhide-3.5.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/jsonview/jquery.jsonview.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/layer/layer.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/layui/layui.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/layui/modules/laydate.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/report/echarts/echarts-all.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/report/peity/jquery.peity.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/report/sparkline/jquery.sparkline.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/select2/select2.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/select2/select2.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/smartwizard/jquery.smartWizard.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/suggest/bootstrap-suggest.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/suggest/bootstrap-suggest.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/summernote/summernote-zh-CN.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/summernote/summernote.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/summernote/summernote.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/typeahead/bootstrap-typeahead.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/typeahead/bootstrap-typeahead.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/validate/additional-methods.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/validate/jquery.validate.extend.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/validate/jquery.validate.min.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ajax/libs/validate/messages_zh.js` | - | - | unassigned-supporting | excluded | 第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码 | 事实 |
| config | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/bootstrap.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/cron.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/jquery-ui-1.10.4.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/jquery.contextMenu.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/jquery.i18n.properties.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/jquery.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/jquery.tmpl.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/plugins/metisMenu/jquery.metisMenu.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/plugins/slimscroll/jquery.slimscroll.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/resize-tabs.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/js/three.min.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ruoyi/index.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ruoyi/js/common.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ruoyi/js/ry-ui.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ruoyi/login.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| static | `qvsu-openapi/src/main/resources/static/ruoyi/register.js` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/test/java/com/qvsu/openapi/AutoCaptchaLoginIntegrationTest.java` | `AutoCaptchaLoginIntegrationTest` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/test/java/com/qvsu/openapi/OpenApiManagementIntegrationTest.java` | `OpenApiManagementIntegrationTest` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/test/java/com/qvsu/openapi/OpenManageCompatibilityIntegrationTest.java` | `OpenManageCompatibilityIntegrationTest` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| source | `qvsu-openapi/src/test/java/com/qvsu/openapi/QuartzManagementIntegrationTest.java` | `QuartzManagementIntegrationTest` | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| config | `qvsu-openapi/src/test/resources/application-druid.yml` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_api.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_api_compat_upgrade.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_api_httpbin_min_seed.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_api_menu.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_api_selftest_seed.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/open_call_log_headers_upgrade.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |
| sql | `sql/quartz.sql` | - | - | unassigned-supporting | supporting | 框架/前端/静态资源或辅助类，非独立业务入口 | 事实 |

## 2. REST 路由登记（逐个 token，校验器要求独立单元格）

### 2.1 类级映射前缀（`@RequestMapping` 声明在 Controller 类上，校验器同样要求独立单元格）

| Class-Level Prefix | Controller | Source Path |
|---|---|---|
| /admin/open/api | OpenApiMgrController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /admin/open/app | OpenAppController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /admin/open/auth | OpenAuthController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| /admin/open/doc | OpenDocController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /admin/open/log | OpenLogController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` |
| /monitor/job | SysJobController | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /monitor/jobLog | SysJobLogController | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /common | CommonController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| /captcha | SysCaptchaController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` |
| /system/config | SysConfigController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /system/dept | SysDeptController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /system/dict/data | SysDictDataController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /system/dict | SysDictTypeController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /system/menu | SysMenuController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /system/notice | SysNoticeController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /system/post | SysPostController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /system/user/profile | SysProfileController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /system/role | SysRoleController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /system/user | SysUserController | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /open/** | OpenGatewayController | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenGatewayController.java` |

> 上述前缀为源码中 Controller 类上的 `@RequestMapping` 字面量，也是网关与前端实际访问路径的前缀部分。其中 `OpenGatewayController` 仅声明类级 `@RequestMapping("/open/**")`，未使用 `@GetMapping`/`@PostMapping` 方法级注解（直接操作 `HttpServletRequest`），因此下方方法级 token 表中没有它的条目。

### 2.2 方法级路由 token

| Route Token | Full Path | HTTP | Controller | Method | Source Path |
|---|---|---|---|---|---|
| /curl/{id} | /admin/open/api/curl/{id} | GET | OpenApiMgrController | curl | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /add | /admin/open/api/add | GET | OpenApiMgrController | add | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /edit/{id} | /admin/open/api/edit/{id} | GET | OpenApiMgrController | edit | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /list | /admin/open/api/list | POST | OpenApiMgrController | list | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /add | /admin/open/api/add | POST | OpenApiMgrController | addSave | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /edit | /admin/open/api/edit | POST | OpenApiMgrController | editSave | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /remove | /admin/open/api/remove | POST | OpenApiMgrController | remove | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenApiMgrController.java` |
| /add | /admin/open/app/add | GET | OpenAppController | add | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /edit/{id} | /admin/open/app/edit/{id} | GET | OpenAppController | edit | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /list | /admin/open/app/list | POST | OpenAppController | list | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /add | /admin/open/app/add | POST | OpenAppController | addSave | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /edit | /admin/open/app/edit | POST | OpenAppController | editSave | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /remove | /admin/open/app/remove | POST | OpenAppController | remove | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /resetSecret | /admin/open/app/resetSecret | POST | OpenAppController | resetSecret | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAppController.java` |
| /apps | /admin/open/auth/apps | GET | OpenAuthController | apps | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| /apis | /admin/open/auth/apis | GET | OpenAuthController | apis | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| /apiIds | /admin/open/auth/apiIds | GET | OpenAuthController | apiIds | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| /save | /admin/open/auth/save | POST | OpenAuthController | save | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenAuthController.java` |
| /apis | /admin/open/doc/apis | GET | OpenDocController | apis | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /html/{apiId} | /admin/open/doc/html/{apiId} | GET | OpenDocController | html | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /list | /admin/open/doc/list | GET | OpenDocController | list | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /download | /admin/open/doc/download | GET | OpenDocController | download | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /generate | /admin/open/doc/generate | POST | OpenDocController | generate | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenDocController.java` |
| /stats | /admin/open/log/stats | GET | OpenLogController | stats | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` |
| /exportCsv | /admin/open/log/exportCsv | GET | OpenLogController | exportCsv | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` |
| /list | /admin/open/log/list | POST | OpenLogController | list | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenLogController.java` |
| /selftest/httpbin/get | /selftest/httpbin/get | GET | OpenSelftestHttpbinController | get | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/headers | /selftest/httpbin/headers | GET | OpenSelftestHttpbinController | headers | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/ip | /selftest/httpbin/ip | GET | OpenSelftestHttpbinController | ip | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/user-agent | /selftest/httpbin/user-agent | GET | OpenSelftestHttpbinController | userAgent | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/uuid | /selftest/httpbin/uuid | GET | OpenSelftestHttpbinController | uuid | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/timeout | /selftest/httpbin/timeout | GET | OpenSelftestHttpbinController | timeout | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/post | /selftest/httpbin/post | POST | OpenSelftestHttpbinController | post | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/put | /selftest/httpbin/put | PUT | OpenSelftestHttpbinController | put | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /selftest/httpbin/delete | /selftest/httpbin/delete | DELETE | OpenSelftestHttpbinController | delete | `qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenSelftestHttpbinController.java` |
| /detail/{jobId} | /monitor/job/detail/{jobId} | GET | SysJobController | detail | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /add | /monitor/job/add | GET | SysJobController | add | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /edit/{jobId} | /monitor/job/edit/{jobId} | GET | SysJobController | edit | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /cron | /monitor/job/cron | GET | SysJobController | cron | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /queryCronExpression | /monitor/job/queryCronExpression | GET | SysJobController | queryCronExpression | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /list | /monitor/job/list | POST | SysJobController | list | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /export | /monitor/job/export | POST | SysJobController | export | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /remove | /monitor/job/remove | POST | SysJobController | remove | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /changeStatus | /monitor/job/changeStatus | POST | SysJobController | changeStatus | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /run | /monitor/job/run | POST | SysJobController | run | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /add | /monitor/job/add | POST | SysJobController | addSave | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /edit | /monitor/job/edit | POST | SysJobController | editSave | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /checkCronExpressionIsValid | /monitor/job/checkCronExpressionIsValid | POST | SysJobController | checkCronExpressionIsValid | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobController.java` |
| /detail/{jobLogId} | /monitor/jobLog/detail/{jobLogId} | GET | SysJobLogController | detail | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /list | /monitor/jobLog/list | POST | SysJobLogController | list | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /export | /monitor/jobLog/export | POST | SysJobLogController | export | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /remove | /monitor/jobLog/remove | POST | SysJobLogController | remove | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /clean | /monitor/jobLog/clean | POST | SysJobLogController | clean | `qvsu-openapi/src/main/java/com/qvsu/quartz/controller/SysJobLogController.java` |
| /download | /common/download | GET | CommonController | fileDownload | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| /download/resource | /common/download/resource | GET | CommonController | resourceDownload | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| /upload | /common/upload | POST | CommonController | uploadFile | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| /uploads | /common/uploads | POST | CommonController | uploadFiles | `qvsu-openapi/src/main/java/com/qvsu/web/controller/common/CommonController.java` |
| /captchaImage | /captcha/captchaImage | GET | SysCaptchaController | getKaptchaImage | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` |
| /captchaCode | /captcha/captchaCode | GET | SysCaptchaController | captchaCode | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysCaptchaController.java` |
| /add | /system/config/add | GET | SysConfigController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /edit/{configId} | /system/config/edit/{configId} | GET | SysConfigController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /refreshCache | /system/config/refreshCache | GET | SysConfigController | refreshCache | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /list | /system/config/list | POST | SysConfigController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /export | /system/config/export | POST | SysConfigController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /add | /system/config/add | POST | SysConfigController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /edit | /system/config/edit | POST | SysConfigController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /remove | /system/config/remove | POST | SysConfigController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /checkConfigKeyUnique | /system/config/checkConfigKeyUnique | POST | SysConfigController | checkConfigKeyUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysConfigController.java` |
| /add/{parentId} | /system/dept/add/{parentId} | GET | SysDeptController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /edit/{deptId} | /system/dept/edit/{deptId} | GET | SysDeptController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /remove/{deptId} | /system/dept/remove/{deptId} | GET | SysDeptController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /selectDeptTree/{deptId} | /system/dept/selectDeptTree/{deptId} | GET | SysDeptController | selectDeptTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /selectDeptTree/{deptId}/{excludeId} | /system/dept/selectDeptTree/{deptId}/{excludeId} | GET | SysDeptController | selectDeptTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /treeData/{excludeId} | /system/dept/treeData/{excludeId} | GET | SysDeptController | treeDataExcludeChild | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /list | /system/dept/list | POST | SysDeptController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /add | /system/dept/add | POST | SysDeptController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /edit | /system/dept/edit | POST | SysDeptController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /checkDeptNameUnique | /system/dept/checkDeptNameUnique | POST | SysDeptController | checkDeptNameUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDeptController.java` |
| /add/{dictType} | /system/dict/data/add/{dictType} | GET | SysDictDataController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /edit/{dictCode} | /system/dict/data/edit/{dictCode} | GET | SysDictDataController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /list | /system/dict/data/list | POST | SysDictDataController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /export | /system/dict/data/export | POST | SysDictDataController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /add | /system/dict/data/add | POST | SysDictDataController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /edit | /system/dict/data/edit | POST | SysDictDataController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /remove | /system/dict/data/remove | POST | SysDictDataController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictDataController.java` |
| /add | /system/dict/add | GET | SysDictTypeController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /edit/{dictId} | /system/dict/edit/{dictId} | GET | SysDictTypeController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /refreshCache | /system/dict/refreshCache | GET | SysDictTypeController | refreshCache | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /detail/{dictId} | /system/dict/detail/{dictId} | GET | SysDictTypeController | detail | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /selectDictTree/{columnId}/{dictType} | /system/dict/selectDictTree/{columnId}/{dictType} | GET | SysDictTypeController | selectDictTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /treeData | /system/dict/treeData | GET | SysDictTypeController | treeData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /list | /system/dict/list | POST | SysDictTypeController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /export | /system/dict/export | POST | SysDictTypeController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /add | /system/dict/add | POST | SysDictTypeController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /edit | /system/dict/edit | POST | SysDictTypeController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /remove | /system/dict/remove | POST | SysDictTypeController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /checkDictTypeUnique | /system/dict/checkDictTypeUnique | POST | SysDictTypeController | checkDictTypeUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysDictTypeController.java` |
| /index | /index | GET | SysIndexController | index | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /lockscreen | /lockscreen | GET | SysIndexController | lockscreen | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /system/switchSkin | /system/switchSkin | GET | SysIndexController | switchSkin | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /system/menuStyle/{style} | /system/menuStyle/{style} | GET | SysIndexController | menuStyle | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /system/main | /system/main | GET | SysIndexController | main | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /unlockscreen | /unlockscreen | POST | SysIndexController | unlockscreen | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysIndexController.java` |
| /login | /login | GET | SysLoginController | login | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` |
| /unauth | /unauth | GET | SysLoginController | unauth | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` |
| /login | /login | POST | SysLoginController | ajaxLogin | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysLoginController.java` |
| /remove/{menuId} | /system/menu/remove/{menuId} | GET | SysMenuController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /add/{parentId} | /system/menu/add/{parentId} | GET | SysMenuController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /edit/{menuId} | /system/menu/edit/{menuId} | GET | SysMenuController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /icon | /system/menu/icon | GET | SysMenuController | icon | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /roleMenuTreeData | /system/menu/roleMenuTreeData | GET | SysMenuController | roleMenuTreeData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /menuTreeData | /system/menu/menuTreeData | GET | SysMenuController | menuTreeData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /selectMenuTree/{menuId} | /system/menu/selectMenuTree/{menuId} | GET | SysMenuController | selectMenuTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /list | /system/menu/list | POST | SysMenuController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /add | /system/menu/add | POST | SysMenuController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /edit | /system/menu/edit | POST | SysMenuController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /updateSort | /system/menu/updateSort | POST | SysMenuController | updateSort | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /checkMenuNameUnique | /system/menu/checkMenuNameUnique | POST | SysMenuController | checkMenuNameUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysMenuController.java` |
| /add | /system/notice/add | GET | SysNoticeController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /edit/{noticeId} | /system/notice/edit/{noticeId} | GET | SysNoticeController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /view/{noticeId} | /system/notice/view/{noticeId} | GET | SysNoticeController | view | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /list | /system/notice/list | POST | SysNoticeController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /add | /system/notice/add | POST | SysNoticeController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /edit | /system/notice/edit | POST | SysNoticeController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /remove | /system/notice/remove | POST | SysNoticeController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysNoticeController.java` |
| /add | /system/post/add | GET | SysPostController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /edit/{postId} | /system/post/edit/{postId} | GET | SysPostController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /list | /system/post/list | POST | SysPostController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /export | /system/post/export | POST | SysPostController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /remove | /system/post/remove | POST | SysPostController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /add | /system/post/add | POST | SysPostController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /edit | /system/post/edit | POST | SysPostController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /checkPostNameUnique | /system/post/checkPostNameUnique | POST | SysPostController | checkPostNameUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /checkPostCodeUnique | /system/post/checkPostCodeUnique | POST | SysPostController | checkPostCodeUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysPostController.java` |
| /checkPassword | /system/user/profile/checkPassword | GET | SysProfileController | checkPassword | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /resetPwd | /system/user/profile/resetPwd | GET | SysProfileController | resetPwd | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /edit | /system/user/profile/edit | GET | SysProfileController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /avatar | /system/user/profile/avatar | GET | SysProfileController | avatar | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /resetPwd | /system/user/profile/resetPwd | POST | SysProfileController | resetPwd | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /update | /system/user/profile/update | POST | SysProfileController | update | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /updateAvatar | /system/user/profile/updateAvatar | POST | SysProfileController | updateAvatar | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysProfileController.java` |
| /register | /register | GET | SysRegisterController | register | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` |
| /register | /register | POST | SysRegisterController | ajaxRegister | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRegisterController.java` |
| /add | /system/role/add | GET | SysRoleController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /edit/{roleId} | /system/role/edit/{roleId} | GET | SysRoleController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authDataScope/{roleId} | /system/role/authDataScope/{roleId} | GET | SysRoleController | authDataScope | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /selectMenuTree | /system/role/selectMenuTree | GET | SysRoleController | selectMenuTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/{roleId} | /system/role/authUser/{roleId} | GET | SysRoleController | authUser | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/selectUser/{roleId} | /system/role/authUser/selectUser/{roleId} | GET | SysRoleController | selectUser | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /deptTreeData | /system/role/deptTreeData | GET | SysRoleController | deptTreeData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /list | /system/role/list | POST | SysRoleController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /export | /system/role/export | POST | SysRoleController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /add | /system/role/add | POST | SysRoleController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /edit | /system/role/edit | POST | SysRoleController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authDataScope | /system/role/authDataScope | POST | SysRoleController | authDataScopeSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /remove | /system/role/remove | POST | SysRoleController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /checkRoleNameUnique | /system/role/checkRoleNameUnique | POST | SysRoleController | checkRoleNameUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /checkRoleKeyUnique | /system/role/checkRoleKeyUnique | POST | SysRoleController | checkRoleKeyUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /changeStatus | /system/role/changeStatus | POST | SysRoleController | changeStatus | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/allocatedList | /system/role/authUser/allocatedList | POST | SysRoleController | allocatedList | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/cancel | /system/role/authUser/cancel | POST | SysRoleController | cancelAuthUser | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/cancelAll | /system/role/authUser/cancelAll | POST | SysRoleController | cancelAuthUserAll | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/unallocatedList | /system/role/authUser/unallocatedList | POST | SysRoleController | unallocatedList | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /authUser/selectAll | /system/role/authUser/selectAll | POST | SysRoleController | selectAuthUserAll | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysRoleController.java` |
| /importTemplate | /system/user/importTemplate | GET | SysUserController | importTemplate | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /add | /system/user/add | GET | SysUserController | add | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /edit/{userId} | /system/user/edit/{userId} | GET | SysUserController | edit | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /view/{userId} | /system/user/view/{userId} | GET | SysUserController | view | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /resetPwd/{userId} | /system/user/resetPwd/{userId} | GET | SysUserController | resetPwd | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /authRole/{userId} | /system/user/authRole/{userId} | GET | SysUserController | authRole | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /deptTreeData | /system/user/deptTreeData | GET | SysUserController | deptTreeData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /selectDeptTree/{deptId} | /system/user/selectDeptTree/{deptId} | GET | SysUserController | selectDeptTree | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /list | /system/user/list | POST | SysUserController | list | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /export | /system/user/export | POST | SysUserController | export | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /importData | /system/user/importData | POST | SysUserController | importData | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /add | /system/user/add | POST | SysUserController | addSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /edit | /system/user/edit | POST | SysUserController | editSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /resetPwd | /system/user/resetPwd | POST | SysUserController | resetPwdSave | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /authRole/insertAuthRole | /system/user/authRole/insertAuthRole | POST | SysUserController | insertAuthRole | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /remove | /system/user/remove | POST | SysUserController | remove | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /checkLoginNameUnique | /system/user/checkLoginNameUnique | POST | SysUserController | checkLoginNameUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /checkPhoneUnique | /system/user/checkPhoneUnique | POST | SysUserController | checkPhoneUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /checkEmailUnique | /system/user/checkEmailUnique | POST | SysUserController | checkEmailUnique | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |
| /changeStatus | /system/user/changeStatus | POST | SysUserController | changeStatus | `qvsu-openapi/src/main/java/com/qvsu/web/controller/system/SysUserController.java` |

## 3. DDL 对象登记（逐个物理对象，校验器要求独立单元格）

| Object | Kind | Source Path |
|---|---|---|
| sys_dept | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_user | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_post | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_role | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_menu | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_user_role | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_role_menu | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_role_dept | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_user_post | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_oper_log | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_dict_type | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_dict_data | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_config | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_logininfor | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_user_online | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| sys_notice | table | `deploy/local-docker/mysql/init/10-qvsu.sql` |
| open_app | table | `deploy/local-docker/mysql/init/30-open-api.sql` |
| open_api | table | `deploy/local-docker/mysql/init/30-open-api.sql` |
| open_app_api | table | `deploy/local-docker/mysql/init/30-open-api.sql` |
| open_call_log | table | `deploy/local-docker/mysql/init/30-open-api.sql` |
| open_api_doc | table | `deploy/local-docker/mysql/init/30-open-api.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/mysql/init/35-quartz.sql` |
| sys_dept | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_user | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_post | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_role | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_menu | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_user_role | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_role_menu | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_role_dept | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_user_post | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_oper_log | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_dict_type | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_dict_data | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_config | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_logininfor | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_user_online | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| sys_notice | table | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| open_app | table | `deploy/local-docker/postgres/init/30-open-api.sql` |
| open_api | table | `deploy/local-docker/postgres/init/30-open-api.sql` |
| open_app_api | table | `deploy/local-docker/postgres/init/30-open-api.sql` |
| open_call_log | table | `deploy/local-docker/postgres/init/30-open-api.sql` |
| open_api_doc | table | `deploy/local-docker/postgres/init/30-open-api.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| IF | table | `deploy/local-docker/postgres/init/35-quartz.sql` |
| open_app | table | `sql/open_api.sql` |
| open_api | table | `sql/open_api.sql` |
| open_app_api | table | `sql/open_api.sql` |
| open_call_log | table | `sql/open_api.sql` |
| open_api_doc | table | `sql/open_api.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |
| IF | table | `sql/quartz.sql` |

## 4. 定时/事件触发器登记

源码中**不存在** `@XxlJob` / `@Scheduled` / `@KafkaListener` / `@RabbitListener` / `@JmsListener` 标注的方法。

本系统的定时能力全部通过 **Quartz 数据库持久化调度**实现：任务定义存于 `sys_job`，触发器与作业明细存于 `QRTZ_*` 表，调度入口为 `com.qvsu.quartz.config` 下的 Quartz 配置与 `SysJobServiceImpl` 反射调用。因此本清单不登记注解式触发器，改由 `JOB-quartz-dispatch` 与 `FUNC-job-scheduler` 登记（见 `./interface-index.md`、`./non-menu-function-index.md`）。

## 5. 配置资产登记

| Config Key | Source Path | Value | Consumer | Evidence |
|---|---|---|---|---|
| `not.null` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.jcaptcha.error` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.not.exists` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.password.not.match` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.password.retry.limit.count` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.password.retry.limit.exceed` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.password.delete` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.blocked` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `role.blocked` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `login.blocked` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.logout.success` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `length.not.valid` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.username.not.valid` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.password.not.valid` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.email.not.valid` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.mobile.phone.number.not.valid` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.login.success` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.register.success` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.notfound` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.forcelogout` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `user.unknown.error` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `upload.exceed.maxSize` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `upload.filename.exceed.length` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.create.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.update.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.delete.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.export.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |
| `no.view.permission` | `qvsu-openapi/src/main/resources/static/i18n/messages.properties` | - | 见 ./config-index.md | 源码 |

## 6. 权限码登记（逐个权限码）

| Permission Code | Source | Menu ID | Evidence |
|---|---|---|---|
| `monitor:job:add` | 源码注解 | 1051 | `@RequiresPermissions` |
| `monitor:job:changeStatus` | 源码注解 | 1054 | `@RequiresPermissions` |
| `monitor:job:detail` | 源码注解 | 1055 | `@RequiresPermissions` |
| `monitor:job:edit` | 源码注解 | 1052 | `@RequiresPermissions` |
| `monitor:job:export` | 源码注解 | 1056 | `@RequiresPermissions` |
| `monitor:job:list` | 源码注解 | 1050 | `@RequiresPermissions` |
| `monitor:job:remove` | 源码注解 | 1053 | `@RequiresPermissions` |
| `monitor:job:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:config:add` | 源码注解 | 1031 | `@RequiresPermissions` |
| `system:config:edit` | 源码注解 | 1032 | `@RequiresPermissions` |
| `system:config:export` | 源码注解 | 1034 | `@RequiresPermissions` |
| `system:config:list` | 源码注解 | 1030 | `@RequiresPermissions` |
| `system:config:remove` | 源码注解 | 1033 | `@RequiresPermissions` |
| `system:config:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:dept:add` | 源码注解 | 1017 | `@RequiresPermissions` |
| `system:dept:edit` | 源码注解 | 1018 | `@RequiresPermissions` |
| `system:dept:list` | 源码注解 | 1016 | `@RequiresPermissions` |
| `system:dept:remove` | 源码注解 | 1019 | `@RequiresPermissions` |
| `system:dept:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:dict:add` | 源码注解 | 1026 | `@RequiresPermissions` |
| `system:dict:edit` | 源码注解 | 1027 | `@RequiresPermissions` |
| `system:dict:export` | 源码注解 | 1029 | `@RequiresPermissions` |
| `system:dict:list` | 源码注解 | 1025 | `@RequiresPermissions` |
| `system:dict:remove` | 源码注解 | 1028 | `@RequiresPermissions` |
| `system:dict:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:menu:add` | 源码注解 | 1013 | `@RequiresPermissions` |
| `system:menu:edit` | 源码注解 | 1014 | `@RequiresPermissions` |
| `system:menu:list` | 源码注解 | 1012 | `@RequiresPermissions` |
| `system:menu:remove` | 源码注解 | 1015 | `@RequiresPermissions` |
| `system:menu:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:notice:add` | 源码注解 | 1036 | `@RequiresPermissions` |
| `system:notice:edit` | 源码注解 | 1037 | `@RequiresPermissions` |
| `system:notice:list` | 源码注解 | 1035 | `@RequiresPermissions` |
| `system:notice:remove` | 源码注解 | 1038 | `@RequiresPermissions` |
| `system:notice:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:post:add` | 源码注解 | 1021 | `@RequiresPermissions` |
| `system:post:edit` | 源码注解 | 1022 | `@RequiresPermissions` |
| `system:post:export` | 源码注解 | 1024 | `@RequiresPermissions` |
| `system:post:list` | 源码注解 | 1020 | `@RequiresPermissions` |
| `system:post:remove` | 源码注解 | 1023 | `@RequiresPermissions` |
| `system:post:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:role:add` | 源码注解 | 1008 | `@RequiresPermissions` |
| `system:role:edit` | 源码注解 | 1009 | `@RequiresPermissions` |
| `system:role:export` | 源码注解 | 1011 | `@RequiresPermissions` |
| `system:role:list` | 源码注解 | 1007 | `@RequiresPermissions` |
| `system:role:remove` | 源码注解 | 1010 | `@RequiresPermissions` |
| `system:role:view` | 源码注解 | - | `@RequiresPermissions` |
| `system:user:add` | 源码注解 | 1001 | `@RequiresPermissions` |
| `system:user:edit` | 源码注解 | 1002 | `@RequiresPermissions` |
| `system:user:export` | 源码注解 | 1004 | `@RequiresPermissions` |
| `system:user:import` | 源码注解 | 1005 | `@RequiresPermissions` |
| `system:user:list` | 源码注解 | 1000 | `@RequiresPermissions` |
| `system:user:remove` | 源码注解 | 1003 | `@RequiresPermissions` |
| `system:user:resetPwd` | 源码注解 | 1006 | `@RequiresPermissions` |
| `system:user:view` | 源码注解 | - | `@RequiresPermissions` |

## 7. 菜单资产登记

| Menu ID | Name | Type | Parent | Order | URL | Perms | Visible | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | 系统管理 | M | 0 | 1 | # | - | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 100 | 用户管理 | C | 1 | 1 | /system/user | `system:user:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1000 | 用户查询 | F | 100 | 1 | # | `system:user:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1001 | 用户新增 | F | 100 | 2 | # | `system:user:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1002 | 用户修改 | F | 100 | 3 | # | `system:user:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1003 | 用户删除 | F | 100 | 4 | # | `system:user:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1004 | 用户导出 | F | 100 | 5 | # | `system:user:export` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1005 | 用户导入 | F | 100 | 6 | # | `system:user:import` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1006 | 重置密码 | F | 100 | 7 | # | `system:user:resetPwd` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1007 | 角色查询 | F | 101 | 1 | # | `system:role:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1008 | 角色新增 | F | 101 | 2 | # | `system:role:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1009 | 角色修改 | F | 101 | 3 | # | `system:role:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 101 | 角色管理 | C | 1 | 2 | /system/role | `system:role:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1010 | 角色删除 | F | 101 | 4 | # | `system:role:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1011 | 角色导出 | F | 101 | 5 | # | `system:role:export` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1012 | 菜单查询 | F | 102 | 1 | # | `system:menu:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1013 | 菜单新增 | F | 102 | 2 | # | `system:menu:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1014 | 菜单修改 | F | 102 | 3 | # | `system:menu:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1015 | 菜单删除 | F | 102 | 4 | # | `system:menu:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1016 | 部门查询 | F | 103 | 1 | # | `system:dept:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1017 | 部门新增 | F | 103 | 2 | # | `system:dept:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1018 | 部门修改 | F | 103 | 3 | # | `system:dept:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1019 | 部门删除 | F | 103 | 4 | # | `system:dept:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 102 | 菜单管理 | C | 1 | 3 | /system/menu | `system:menu:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1020 | 岗位查询 | F | 104 | 1 | # | `system:post:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1021 | 岗位新增 | F | 104 | 2 | # | `system:post:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1022 | 岗位修改 | F | 104 | 3 | # | `system:post:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1023 | 岗位删除 | F | 104 | 4 | # | `system:post:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1024 | 岗位导出 | F | 104 | 5 | # | `system:post:export` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1025 | 字典查询 | F | 105 | 1 | # | `system:dict:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1026 | 字典新增 | F | 105 | 2 | # | `system:dict:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1027 | 字典修改 | F | 105 | 3 | # | `system:dict:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1028 | 字典删除 | F | 105 | 4 | # | `system:dict:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1029 | 字典导出 | F | 105 | 5 | # | `system:dict:export` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 103 | 部门管理 | C | 1 | 4 | /system/dept | `system:dept:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1030 | 参数查询 | F | 106 | 1 | # | `system:config:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1031 | 参数新增 | F | 106 | 2 | # | `system:config:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1032 | 参数修改 | F | 106 | 3 | # | `system:config:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1033 | 参数删除 | F | 106 | 4 | # | `system:config:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1034 | 参数导出 | F | 106 | 5 | # | `system:config:export` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1035 | 公告查询 | F | 107 | 1 | # | `system:notice:list` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1036 | 公告新增 | F | 107 | 2 | # | `system:notice:add` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1037 | 公告修改 | F | 107 | 3 | # | `system:notice:edit` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1038 | 公告删除 | F | 107 | 4 | # | `system:notice:remove` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 104 | 岗位管理 | C | 1 | 5 | /system/post | `system:post:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 105 | 字典管理 | C | 1 | 6 | /system/dict | `system:dict:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 1050 | 任务查询 | F | 110 | 1 | # | `monitor:job:list` | 0 | `sql/quartz.sql` |
| 1051 | 任务新增 | F | 110 | 2 | # | `monitor:job:add` | 0 | `sql/quartz.sql` |
| 1052 | 任务修改 | F | 110 | 3 | # | `monitor:job:edit` | 0 | `sql/quartz.sql` |
| 1053 | 任务删除 | F | 110 | 4 | # | `monitor:job:remove` | 0 | `sql/quartz.sql` |
| 1054 | 状态修改 | F | 110 | 5 | # | `monitor:job:changeStatus` | 0 | `sql/quartz.sql` |
| 1055 | 任务详细 | F | 110 | 6 | # | `monitor:job:detail` | 0 | `sql/quartz.sql` |
| 1056 | 任务导出 | F | 110 | 7 | # | `monitor:job:export` | 0 | `sql/quartz.sql` |
| 106 | 参数设置 | C | 1 | 7 | /system/config | `system:config:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 107 | 通知公告 | C | 1 | 8 | /system/notice | `system:notice:view` | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |
| 110 | undefined | C | 1 | 9 | /monitor/job | `monitor:job:view` | 0 | `sql/quartz.sql` |
| 2100 | OpenAPI管理 | M | 1 | 10 | # | - | 0 | `sql/open_api_menu.sql` |
| 2101 | 应用管理 | C | 2100 | 1 | /admin/open/app | `open:app:view` | 0 | `sql/open_api_menu.sql` |
| 2102 | 接口管理 | C | 2100 | 2 | /admin/open/api | `open:api:view` | 0 | `sql/open_api_menu.sql` |
| 2103 | 授权管理 | C | 2100 | 3 | /admin/open/auth | `open:auth:view` | 0 | `sql/open_api_menu.sql` |
| 2104 | 调用日志 | C | 2100 | 4 | /admin/open/log | `open:log:view` | 0 | `sql/open_api_menu.sql` |
| 2105 | 文档管理 | C | 2100 | 5 | /admin/open/doc | `open:doc:view` | 0 | `sql/open_api_menu.sql` |
| 2110 | 应用查询 | F | 2101 | 1 | # | `open:app:list` | 0 | `sql/open_api_menu.sql` |
| 2111 | 应用新增 | F | 2101 | 2 | # | `open:app:add` | 0 | `sql/open_api_menu.sql` |
| 2112 | 应用修改 | F | 2101 | 3 | # | `open:app:edit` | 0 | `sql/open_api_menu.sql` |
| 2113 | 应用删除 | F | 2101 | 4 | # | `open:app:remove` | 0 | `sql/open_api_menu.sql` |
| 2120 | 接口查询 | F | 2102 | 1 | # | `open:api:list` | 0 | `sql/open_api_menu.sql` |
| 2121 | 接口新增 | F | 2102 | 2 | # | `open:api:add` | 0 | `sql/open_api_menu.sql` |
| 2122 | 接口修改 | F | 2102 | 3 | # | `open:api:edit` | 0 | `sql/open_api_menu.sql` |
| 2123 | 接口删除 | F | 2102 | 4 | # | `open:api:remove` | 0 | `sql/open_api_menu.sql` |
| 2130 | 授权保存 | F | 2103 | 1 | # | `open:auth:save` | 0 | `sql/open_api_menu.sql` |
| 2140 | 日志查询 | F | 2104 | 1 | # | `open:log:list` | 0 | `sql/open_api_menu.sql` |
| 2150 | 文档生成 | F | 2105 | 1 | # | `open:doc:generate` | 0 | `sql/open_api_menu.sql` |
| 4 | qvsu官网 | C | 0 | 4 | http://qvsu.vip | - | 0 | `deploy/local-docker/postgres/init/10-qvsu.sql` |

## 8. 范围排除登记

| 排除对象 | 类型 | 理由 | 证据 |
|---|---|---|---|
| `open-api/qvsu-openapi/src/main/resources/templates/demo/**` | 视图模板（约 100 个） | RuoYi 框架自带示例页，非本系统业务功能 | 目录名与 `SysIndexController` 中的 demo 入口均为框架模板 |
| `open-api/qvsu-openapi/src/main/resources/static/ajax/libs/**` | 第三方前端库 | 非自研代码 | 含 bootstrap-table、echarts、jquery.validate、duallistbox 等库文件 |
| `open-api/qvsu-openapi/src/main/resources/static/ajax/**`（非 libs） | 框架脚本 | RuoYi 通用前端脚本 | 目录结构与命名 |
| `open-api/qvsu-openapi/src/test/**` | 测试源码 | 抽样与单元测试，非运行时功能 | 目录定位 |
| `open-api/deploy/dev-docker/**` | 部署脚本 | 指向外部阿里云私有镜像，不可复现构建 | `docker-compose.yml` 中 `registry.cn-shenzhen.aliyuncs.com/chaoqs/...` |

## 9. 相关文档

- 覆盖率对账：[`source-coverage-report.md`](./source-coverage-report.md)
- 功能清单：[`functional-inventory.md`](./functional-inventory.md)
- 接口清单：[`interface-index.md`](./interface-index.md)
- 数据库清单：[`database-inventory.md`](./database-inventory.md)
