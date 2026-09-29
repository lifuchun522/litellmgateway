# 数据库资产清单（Database Inventory）

> 产物语言：zh-CN ｜ 生成方式：由 `docs/tools/semantics.json` 确定性生成 ｜ 事实来源：`open-api/sql/*.sql` 与 `open-api/deploy/local-docker/{mysql,postgres}/init/*.sql`

本文件是物理数据对象的**覆盖分母**。DDL 在 MySQL 方言、PostgreSQL 方言与兼容升级三套脚本中重复出现，下表已按物理表名去重；每张物理表在 `./database-model.md` 有唯一稳定 ID 主定义，在 `./database-schema.md` 有字段级设计。

## 0. 统计摘要

| 指标 | 数值 |
|---|---:|
| DDL 中出现的 CREATE TABLE 块数（含方言重复） | 86 |
| 去重后的物理表数 | 34 |
| 字段总数（按去重后表统计） | 342 |
| 视图 / 物化视图 / 存储过程 | 0（源码中未发现 CREATE VIEW / PROCEDURE） |

## 1. 物理表逐表登记

| 物理表名 | 稳定 ID | 分组 | 字段数 | DDL 副本数 | 字段注释覆盖 | 所有者 | DDL 证据文件 | 结论级别 |
|---|---|---|---:|---:|---|---|---|---|
| open_api | TBL-open_api | OpenAPI 开放平台业务 | 17 | 3 | 10/17 | com.qvsu.open（开放平台域） | `deploy/local-docker/mysql/init/30-open-api.sql`<br>`deploy/local-docker/postgres/init/30-open-api.sql`<br>`sql/open_api.sql` | 事实 |
| open_api_doc | TBL-open_api_doc | OpenAPI 开放平台业务 | 12 | 3 | 5/12 | com.qvsu.open（开放平台域） | `deploy/local-docker/mysql/init/30-open-api.sql`<br>`deploy/local-docker/postgres/init/30-open-api.sql`<br>`sql/open_api.sql` | 事实 |
| open_app | TBL-open_app | OpenAPI 开放平台业务 | 14 | 3 | 11/14 | com.qvsu.open（开放平台域） | `deploy/local-docker/mysql/init/30-open-api.sql`<br>`deploy/local-docker/postgres/init/30-open-api.sql`<br>`sql/open_api.sql` | 事实 |
| open_app_api | TBL-open_app_api | OpenAPI 开放平台业务 | 9 | 3 | 5/9 | com.qvsu.open（开放平台域） | `deploy/local-docker/mysql/init/30-open-api.sql`<br>`deploy/local-docker/postgres/init/30-open-api.sql`<br>`sql/open_api.sql` | 事实 |
| open_call_log | TBL-open_call_log | OpenAPI 开放平台业务 | 22 | 3 | 7/22 | com.qvsu.open（开放平台域） | `deploy/local-docker/mysql/init/30-open-api.sql`<br>`deploy/local-docker/postgres/init/30-open-api.sql`<br>`sql/open_api.sql` | 事实 |
| QRTZ_BLOB_TRIGGERS | TBL-QRTZ_BLOB_TRIGGERS | Quartz 调度存储 | 4 | 3 | 0/4 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_CALENDARS | TBL-QRTZ_CALENDARS | Quartz 调度存储 | 3 | 3 | 0/3 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_CRON_TRIGGERS | TBL-QRTZ_CRON_TRIGGERS | Quartz 调度存储 | 5 | 3 | 2/5 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_FIRED_TRIGGERS | TBL-QRTZ_FIRED_TRIGGERS | Quartz 调度存储 | 13 | 3 | 0/13 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_JOB_DETAILS | TBL-QRTZ_JOB_DETAILS | Quartz 调度存储 | 10 | 3 | 10/10 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_LOCKS | TBL-QRTZ_LOCKS | Quartz 调度存储 | 2 | 3 | 0/2 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_PAUSED_TRIGGER_GRPS | TBL-QRTZ_PAUSED_TRIGGER_GRPS | Quartz 调度存储 | 2 | 3 | 0/2 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_SCHEDULER_STATE | TBL-QRTZ_SCHEDULER_STATE | Quartz 调度存储 | 4 | 3 | 0/4 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_SIMPLE_TRIGGERS | TBL-QRTZ_SIMPLE_TRIGGERS | Quartz 调度存储 | 6 | 3 | 0/6 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_SIMPROP_TRIGGERS | TBL-QRTZ_SIMPROP_TRIGGERS | Quartz 调度存储 | 14 | 3 | 0/14 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| QRTZ_TRIGGERS | TBL-QRTZ_TRIGGERS | Quartz 调度存储 | 16 | 3 | 16/16 | Quartz 框架内部（经 com.qvsu.quartz 配置） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| sys_config | TBL-sys_config | 系统平台 | 10 | 2 | 10/10 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_dept | TBL-sys_dept | 系统平台 | 14 | 2 | 14/14 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_dict_data | TBL-sys_dict_data | 系统平台 | 14 | 2 | 14/14 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_dict_type | TBL-sys_dict_type | 系统平台 | 9 | 2 | 9/9 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_job | TBL-sys_job | 系统平台 | 20 | 3 | 20/20 | com.qvsu.quartz（调度域） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| sys_job_log | TBL-sys_job_log | 系统平台 | 8 | 3 | 8/8 | com.qvsu.quartz（调度域） | `deploy/local-docker/mysql/init/35-quartz.sql`<br>`deploy/local-docker/postgres/init/35-quartz.sql`<br>`sql/quartz.sql` | 事实 |
| sys_logininfor | TBL-sys_logininfor | 系统平台 | 9 | 2 | 9/9 | com.qvsu.framework（框架层） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_menu | TBL-sys_menu | 系统平台 | 16 | 2 | 16/16 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_notice | TBL-sys_notice | 系统平台 | 10 | 2 | 10/10 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_oper_log | TBL-sys_oper_log | 系统平台 | 17 | 2 | 17/17 | com.qvsu.framework（框架层） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_post | TBL-sys_post | 系统平台 | 10 | 2 | 10/10 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_role | TBL-sys_role | 系统平台 | 12 | 2 | 12/12 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_role_dept | TBL-sys_role_dept | 系统平台 | 2 | 2 | 2/2 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_role_menu | TBL-sys_role_menu | 系统平台 | 2 | 2 | 2/2 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_user | TBL-sys_user | 系统平台 | 21 | 2 | 21/21 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_user_online | TBL-sys_user_online | 系统平台 | 11 | 2 | 11/11 | com.qvsu.framework（框架层） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_user_post | TBL-sys_user_post | 系统平台 | 2 | 2 | 2/2 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |
| sys_user_role | TBL-sys_user_role | 系统平台 | 2 | 2 | 2/2 | com.qvsu.system（系统管理域） | `deploy/local-docker/mysql/init/10-qvsu.sql`<br>`deploy/local-docker/postgres/init/10-qvsu.sql` | 事实 |

## 2. 分组汇总

| 分组 | 表数 | 表清单 |
|---|---:|---|
| 系统平台 | 18 | `sys_config`, `sys_dept`, `sys_dict_data`, `sys_dict_type`, `sys_job`, `sys_job_log`, `sys_logininfor`, `sys_menu`, `sys_notice`, `sys_oper_log`, `sys_post`, `sys_role`, `sys_role_dept`, `sys_role_menu`, `sys_user`, `sys_user_online`, `sys_user_post`, `sys_user_role` |
| Quartz 调度存储 | 11 | `QRTZ_BLOB_TRIGGERS`, `QRTZ_CALENDARS`, `QRTZ_CRON_TRIGGERS`, `QRTZ_FIRED_TRIGGERS`, `QRTZ_JOB_DETAILS`, `QRTZ_LOCKS`, `QRTZ_PAUSED_TRIGGER_GRPS`, `QRTZ_SCHEDULER_STATE`, `QRTZ_SIMPLE_TRIGGERS`, `QRTZ_SIMPROP_TRIGGERS`, `QRTZ_TRIGGERS` |
| OpenAPI 开放平台业务 | 5 | `open_api`, `open_api_doc`, `open_app`, `open_app_api`, `open_call_log` |

## 3. 未发现的数据对象

| 对象类型 | 结论 | 证据 |
|---|---|---|
| 视图 view | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE VIEW` 无结果 |
| 物化视图 materialized-view | 源码中不存在 | 同上 |
| 存储过程 / 函数 | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE PROCEDURE` / `CREATE FUNCTION` 无结果 |
| 触发器 trigger | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE TRIGGER` 无结果 |
| 序列 sequence | 源码中不存在 | PostgreSQL 脚本使用 `serial`/`bigserial` 隐式序列，未显式 `CREATE SEQUENCE` |
| 索引 index | 仅 DDL 内联唯一约束，无独立 `CREATE INDEX` | 见 `./database-schema.md` 的 Key/Index 列 |

## 4. 相关文档

- 表主定义：[`database-model.md`](./database-model.md)
- 逐字段设计：[`database-schema.md`](./database-schema.md)
- 表关系与血缘：[`database-relations.md`](./database-relations.md)
- 功能到表读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)
- 数据归属：[`data-ownership.md`](./data-ownership.md)
