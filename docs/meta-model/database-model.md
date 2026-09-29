# 物理表主定义（Database Model）

> 产物语言：zh-CN ｜ 本文件是全部 `TBL-*` 稳定 ID 的**唯一主定义位置**，其他文件只能引用。

34 张物理表，字段总数 342。字段级设计见 [`database-schema.md`](./database-schema.md)。

## TBL-open_api - open_api

- ID: TBL-open_api
- 对象类型: table
- 所有者: com.qvsu.open（开放平台域）
- 业务含义: 对外开放的接口定义主数据
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`
- 字段数: 17（其中带注释 10 个）
- 结论级别: 事实

## TBL-open_api_doc - open_api_doc

- ID: TBL-open_api_doc
- 对象类型: table
- 所有者: com.qvsu.open（开放平台域）
- 业务含义: 接口文档内容与版本
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`
- 字段数: 12（其中带注释 5 个）
- 结论级别: 事实

## TBL-open_app - open_app

- ID: TBL-open_app
- 对象类型: table
- 所有者: com.qvsu.open（开放平台域）
- 业务含义: 开放平台接入应用（第三方调用方）主数据
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`
- 字段数: 14（其中带注释 11 个）
- 结论级别: 事实

## TBL-open_app_api - open_app_api

- ID: TBL-open_app_api
- 对象类型: table
- 所有者: com.qvsu.open（开放平台域）
- 业务含义: 应用与接口的授权绑定关系（多对多）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`
- 字段数: 9（其中带注释 5 个）
- 结论级别: 事实

## TBL-open_call_log - open_call_log

- ID: TBL-open_call_log
- 对象类型: table
- 所有者: com.qvsu.open（开放平台域）
- 业务含义: 开放接口调用流水日志（含请求头、耗时、结果）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`
- 字段数: 22（其中带注释 7 个）
- 结论级别: 事实

## TBL-QRTZ_BLOB_TRIGGERS - QRTZ_BLOB_TRIGGERS

- ID: TBL-QRTZ_BLOB_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（BLOB_TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 4（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_CALENDARS - QRTZ_CALENDARS

- ID: TBL-QRTZ_CALENDARS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（CALENDARS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 3（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_CRON_TRIGGERS - QRTZ_CRON_TRIGGERS

- ID: TBL-QRTZ_CRON_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（CRON_TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 5（其中带注释 2 个）
- 结论级别: 事实

## TBL-QRTZ_FIRED_TRIGGERS - QRTZ_FIRED_TRIGGERS

- ID: TBL-QRTZ_FIRED_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（FIRED_TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 13（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_JOB_DETAILS - QRTZ_JOB_DETAILS

- ID: TBL-QRTZ_JOB_DETAILS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（JOB_DETAILS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 10（其中带注释 10 个）
- 结论级别: 事实

## TBL-QRTZ_LOCKS - QRTZ_LOCKS

- ID: TBL-QRTZ_LOCKS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（LOCKS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 2（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_PAUSED_TRIGGER_GRPS - QRTZ_PAUSED_TRIGGER_GRPS

- ID: TBL-QRTZ_PAUSED_TRIGGER_GRPS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（PAUSED_TRIGGER_GRPS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 2（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_SCHEDULER_STATE - QRTZ_SCHEDULER_STATE

- ID: TBL-QRTZ_SCHEDULER_STATE
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（SCHEDULER_STATE）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 4（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_SIMPLE_TRIGGERS - QRTZ_SIMPLE_TRIGGERS

- ID: TBL-QRTZ_SIMPLE_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（SIMPLE_TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 6（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_SIMPROP_TRIGGERS - QRTZ_SIMPROP_TRIGGERS

- ID: TBL-QRTZ_SIMPROP_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（SIMPROP_TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 14（其中带注释 0 个）
- 结论级别: 事实

## TBL-QRTZ_TRIGGERS - QRTZ_TRIGGERS

- ID: TBL-QRTZ_TRIGGERS
- 对象类型: table
- 所有者: Quartz 框架内部（经 com.qvsu.quartz 配置）
- 业务含义: Quartz 调度器内部存储表（TRIGGERS）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: Quartz 框架内部 JDBC，无 MyBatis Mapper
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 16（其中带注释 16 个）
- 结论级别: 事实

## TBL-sys_config - sys_config

- ID: TBL-sys_config
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 系统参数配置（运行期可改的键值）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 10（其中带注释 10 个）
- 结论级别: 事实

## TBL-sys_dept - sys_dept

- ID: TBL-sys_dept
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 组织机构树
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 14（其中带注释 14 个）
- 结论级别: 事实

## TBL-sys_dict_data - sys_dict_data

- ID: TBL-sys_dict_data
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 字典数据项
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 14（其中带注释 14 个）
- 结论级别: 事实

## TBL-sys_dict_type - sys_dict_type

- ID: TBL-sys_dict_type
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 字典类型
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 9（其中带注释 9 个）
- 结论级别: 事实

## TBL-sys_job - sys_job

- ID: TBL-sys_job
- 对象类型: table
- 所有者: com.qvsu.quartz（调度域）
- 业务含义: 定时任务定义
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 20（其中带注释 20 个）
- 结论级别: 事实

## TBL-sys_job_log - sys_job_log

- ID: TBL-sys_job_log
- 对象类型: table
- 所有者: com.qvsu.quartz（调度域）
- 业务含义: 定时任务执行日志
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`
- 字段数: 8（其中带注释 8 个）
- 结论级别: 事实

## TBL-sys_logininfor - sys_logininfor

- ID: TBL-sys_logininfor
- 对象类型: table
- 所有者: com.qvsu.framework（框架层）
- 业务含义: 登录日志
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 9（其中带注释 9 个）
- 结论级别: 事实

## TBL-sys_menu - sys_menu

- ID: TBL-sys_menu
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 菜单与按钮权限树（权限码来源）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 16（其中带注释 16 个）
- 结论级别: 事实

## TBL-sys_notice - sys_notice

- ID: TBL-sys_notice
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 通知公告
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 10（其中带注释 10 个）
- 结论级别: 事实

## TBL-sys_oper_log - sys_oper_log

- ID: TBL-sys_oper_log
- 对象类型: table
- 所有者: com.qvsu.framework（框架层）
- 业务含义: 操作审计日志（AOP 写入）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 17（其中带注释 17 个）
- 结论级别: 事实

## TBL-sys_post - sys_post

- ID: TBL-sys_post
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 岗位定义
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 10（其中带注释 10 个）
- 结论级别: 事实

## TBL-sys_role - sys_role

- ID: TBL-sys_role
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 角色定义与数据范围
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 12（其中带注释 12 个）
- 结论级别: 事实

## TBL-sys_role_dept - sys_role_dept

- ID: TBL-sys_role_dept
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 角色与部门数据范围关联
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 2（其中带注释 2 个）
- 结论级别: 事实

## TBL-sys_role_menu - sys_role_menu

- ID: TBL-sys_role_menu
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 角色与菜单关联
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 2（其中带注释 2 个）
- 结论级别: 事实

## TBL-sys_user - sys_user

- ID: TBL-sys_user
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 系统用户主数据
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 21（其中带注释 21 个）
- 结论级别: 事实

## TBL-sys_user_online - sys_user_online

- ID: TBL-sys_user_online
- 对象类型: table
- 所有者: com.qvsu.framework（框架层）
- 业务含义: 在线用户会话（Shiro 会话持久化）
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 11（其中带注释 11 个）
- 结论级别: 事实

## TBL-sys_user_post - sys_user_post

- ID: TBL-sys_user_post
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 用户与岗位关联
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 2（其中带注释 2 个）
- 结论级别: 事实

## TBL-sys_user_role - sys_user_role

- ID: TBL-sys_user_role
- 对象类型: table
- 所有者: com.qvsu.system（系统管理域）
- 业务含义: 用户与角色关联
- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象
- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行
- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行
- DAO/Mapper/Entity: 见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列
- DDL/SQL证据: `deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`
- 字段数: 2（其中带注释 2 个）
- 结论级别: 事实
