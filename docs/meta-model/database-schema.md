# 逐字段数据库设计（Database Schema）

> 产物语言：zh-CN ｜ 本文件为 [`database-model.md`](./database-model.md) 中每个 `TBL-*` 提供字段级设计。

未知属性一律写 `unknown`，不省略列。字段注释来自源码 DDL 的 `COMMENT` 子句；源码未提供注释时写 `-`，列含义列为 `unknown`。

## TBL-open_api - open_api

对外开放的接口定义主数据。DLL 证据：`deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s_id | sId | B | unknown | YES | unknown | unknown | primary key | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| api_name | apiName | V | unknown | NO | unknown | unknown | api name | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| api_path | apiPath | V | unknown | NO | unknown | unknown | api path, e.g. /open/order/list | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| method | method | V | unknown | YES | `POST` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| target_url | targetUrl | V | unknown | NO | unknown | unknown | target url | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| timeout_ms | timeoutMs | I | unknown | YES | `5000` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| status | status | T | unknown | YES | `1` | unknown | 1=enabled 0=disabled | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| need_sign | needSign | T | unknown | YES | `1` | unknown | 1=sign required | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| description | description | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| req_example | reqExample | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| resp_example | respExample | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| create_time | createTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| update_time | updateTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_status | sStatus | T | unknown | YES | `1` | unknown | compat status | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_is_del | sIsDel | T | unknown | YES | `1` | unknown | compat delete flag | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_created_time | sCreatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat create time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_updated_time | sUpdatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat update time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |

> 本表有 7 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-open_api_doc - open_api_doc

接口文档内容与版本。DLL 证据：`deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s_id | sId | B | unknown | YES | unknown | unknown | primary key | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_id | appId | B | unknown | YES | unknown | PK/候选键（推断） | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| doc_title | docTitle | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| doc_version | docVersion | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| api_ids | apiIds | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| html_content | htmlContent | L | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| create_time | createTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| update_time | updateTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_status | sStatus | T | unknown | YES | `1` | unknown | compat status | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_is_del | sIsDel | T | unknown | YES | `1` | unknown | compat delete flag | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_created_time | sCreatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat create time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_updated_time | sUpdatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat update time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |

> 本表有 7 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-open_app - open_app

开放平台接入应用（第三方调用方）主数据。DLL 证据：`deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s_id | sId | B | unknown | YES | unknown | unknown | primary key | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_name | appName | V | unknown | NO | unknown | unknown | app name | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_key | appKey | V | unknown | NO | unknown | unknown | app key | unknown | 是（凭据类） | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_secret | appSecret | V | unknown | NO | unknown | unknown | app secret | unknown | 是（凭据类） | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| contact | contact | V | unknown | YES | unknown | unknown | contact | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| status | status | T | unknown | YES | `1` | unknown | 1=enabled 0=disabled | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| expire_time | expireTime | D | unknown | YES | unknown | unknown | expire time, NULL=never | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| remark | remark | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| create_time | createTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| update_time | updateTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_status | sStatus | T | unknown | YES | `1` | unknown | compat status | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_is_del | sIsDel | T | unknown | YES | `1` | unknown | compat delete flag | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_created_time | sCreatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat create time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_updated_time | sUpdatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat update time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |

> 本表有 3 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-open_app_api - open_app_api

应用与接口的授权绑定关系（多对多）。DLL 证据：`deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s_id | sId | B | unknown | YES | unknown | unknown | primary key | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_id | appId | B | unknown | NO | unknown | PK/候选键（推断） | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| api_id | apiId | B | unknown | NO | unknown | PK/候选键（推断） | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| create_time | createTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| update_time | updateTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_status | sStatus | T | unknown | YES | `1` | unknown | compat status | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_is_del | sIsDel | T | unknown | YES | `1` | unknown | compat delete flag | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_created_time | sCreatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat create time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_updated_time | sUpdatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat update time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |

> 本表有 4 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-open_call_log - open_call_log

开放接口调用流水日志（含请求头、耗时、结果）。DLL 证据：`deploy/local-docker/mysql/init/30-open-api.sql`、`deploy/local-docker/postgres/init/30-open-api.sql`、`sql/open_api.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s_id | sId | B | unknown | YES | unknown | unknown | primary key | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| trace_id | traceId | V | unknown | NO | unknown | unknown | trace id | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_key | appKey | V | unknown | YES | unknown | unknown | unknown | unknown | 是（凭据类） | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| app_name | appName | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| api_path | apiPath | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| method | method | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| req_headers | reqHeaders | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| req_body | reqBody | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| resp_code | respCode | I | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| resp_headers | respHeaders | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| resp_body | respBody | T | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| cost_ms | costMs | I | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| status | status | T | unknown | YES | unknown | unknown | 0=ok 1=auth-fail 2=proxy-fail | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| error_msg | errorMsg | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| client_ip | clientIp | V | unknown | YES | unknown | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| call_time | callTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| create_time | createTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| update_time | updateTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | unknown | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_status | sStatus | T | unknown | YES | `1` | unknown | compat status | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_is_del | sIsDel | T | unknown | YES | `1` | unknown | compat delete flag | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_created_time | sCreatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat create time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |
| s_updated_time | sUpdatedTime | D | unknown | YES | `CURRENT_TIMESTAMP` | unknown | compat update time | unknown | 否 | com.qvsu.open（开放平台域） | com.qvsu.open（开放平台域） | DDL | 事实 |

> 本表有 15 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_BLOB_TRIGGERS - QRTZ_BLOB_TRIGGERS

Quartz 调度器内部存储表（BLOB_TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| blob_data | blobData | b | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 4 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_CALENDARS - QRTZ_CALENDARS

Quartz 调度器内部存储表（CALENDARS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| calendar_name | calendarName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| calendar | calendar | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 3 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_CRON_TRIGGERS - QRTZ_CRON_TRIGGERS

Quartz 调度器内部存储表（CRON_TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| cron_expression | cronExpression | v | unknown | NO | unknown | unknown | cron表达式 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| time_zone_id | timeZoneId | v | unknown | YES | unknown | unknown | 时区 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 3 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_FIRED_TRIGGERS - QRTZ_FIRED_TRIGGERS

Quartz 调度器内部存储表（FIRED_TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| entry_id | entryId | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| instance_name | instanceName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| fired_time | firedTime | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| sched_time | schedTime | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| priority | priority | i | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| state | state | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_name | jobName | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_group | jobGroup | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| is_nonconcurrent | isNonconcurrent | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| requests_recovery | requestsRecovery | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 13 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_JOB_DETAILS - QRTZ_JOB_DETAILS

Quartz 调度器内部存储表（JOB_DETAILS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | 调度名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_name | jobName | v | unknown | NO | unknown | unknown | 任务名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_group | jobGroup | v | unknown | NO | unknown | unknown | 任务组名 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| description | description | v | unknown | YES | unknown | unknown | 相关介绍 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_class_name | jobClassName | v | unknown | NO | unknown | unknown | 执行任务类名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| is_durable | isDurable | v | unknown | NO | unknown | unknown | 是否持久化 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| is_nonconcurrent | isNonconcurrent | v | unknown | NO | unknown | unknown | 是否并发 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| is_update_data | isUpdateData | v | unknown | NO | unknown | unknown | 是否更新数据 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| requests_recovery | requestsRecovery | v | unknown | NO | unknown | unknown | 是否接受恢复执行 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_data | jobData | b | unknown | YES | unknown | unknown | 存放持久化job对象 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

## TBL-QRTZ_LOCKS - QRTZ_LOCKS

Quartz 调度器内部存储表（LOCKS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| lock_name | lockName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 2 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_PAUSED_TRIGGER_GRPS - QRTZ_PAUSED_TRIGGER_GRPS

Quartz 调度器内部存储表（PAUSED_TRIGGER_GRPS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 2 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_SCHEDULER_STATE - QRTZ_SCHEDULER_STATE

Quartz 调度器内部存储表（SCHEDULER_STATE）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| instance_name | instanceName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| last_checkin_time | lastCheckinTime | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| checkin_interval | checkinInterval | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 4 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_SIMPLE_TRIGGERS - QRTZ_SIMPLE_TRIGGERS

Quartz 调度器内部存储表（SIMPLE_TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| repeat_count | repeatCount | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| repeat_interval | repeatInterval | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| times_triggered | timesTriggered | b | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 6 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_SIMPROP_TRIGGERS - QRTZ_SIMPROP_TRIGGERS

Quartz 调度器内部存储表（SIMPROP_TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| str_prop_1 | strProp_1 | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| str_prop_2 | strProp_2 | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| str_prop_3 | strProp_3 | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| int_prop_1 | intProp_1 | i | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| int_prop_2 | intProp_2 | i | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| long_prop_1 | longProp_1 | b | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| long_prop_2 | longProp_2 | b | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| dec_prop_1 | decProp_1 | n | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| dec_prop_2 | decProp_2 | n | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| bool_prop_1 | boolProp_1 | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| bool_prop_2 | boolProp_2 | v | unknown | YES | unknown | unknown | unknown | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

> 本表有 14 个字段在源码 DDL 中无注释，其 Meaning 记为 `unknown`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。

## TBL-QRTZ_TRIGGERS - QRTZ_TRIGGERS

Quartz 调度器内部存储表（TRIGGERS）。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sched_name | schedName | v | unknown | NO | unknown | unknown | 调度名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_name | triggerName | v | unknown | NO | unknown | unknown | 触发器名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_group | triggerGroup | v | unknown | NO | unknown | unknown | 触发器组名 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_name | jobName | v | unknown | NO | unknown | unknown | 任务名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_group | jobGroup | v | unknown | NO | unknown | unknown | 任务组名 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| description | description | v | unknown | YES | unknown | unknown | 相关介绍 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| next_fire_time | nextFireTime | b | unknown | YES | unknown | unknown | 下次触发时间 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| prev_fire_time | prevFireTime | b | unknown | YES | unknown | unknown | 上次触发时间 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| priority | priority | i | unknown | YES | unknown | unknown | 优先级 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_state | triggerState | v | unknown | NO | unknown | unknown | 触发器状态 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| trigger_type | triggerType | v | unknown | NO | unknown | unknown | 触发器类型 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| start_time | startTime | b | unknown | NO | unknown | unknown | 开始时间 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| end_time | endTime | b | unknown | YES | unknown | unknown | 结束时间 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| calendar_name | calendarName | v | unknown | YES | unknown | unknown | 日程表名称 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| misfire_instr | misfireInstr | s | unknown | YES | unknown | unknown | 补偿执行策略 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |
| job_data | jobData | b | unknown | YES | unknown | unknown | 存放持久化job对象 | unknown | 否 | Quartz 框架内部（经 com.qvsu.quartz 配置） | Quartz 框架内部（经 com.qvsu.quartz 配置） | DDL | 事实 |

## TBL-sys_config - sys_config

系统参数配置（运行期可改的键值）。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| config_id | configId | i | unknown | NO | unknown | PK/候选键（推断） | 参数主键 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| config_name | configName | v | unknown | YES | `` | unknown | 参数名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| config_key | configKey | v | unknown | YES | `` | unknown | 参数键名 | unknown | 是（凭据类） | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| config_value | configValue | v | unknown | YES | `` | unknown | 参数键值 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| config_type | configType | c | unknown | YES | `N` | unknown | 系统内置（Y是 N否） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_dept - sys_dept

组织机构树。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dept_id | deptId | b | unknown | NO | unknown | PK/候选键（推断） | 部门id | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| parent_id | parentId | b | unknown | YES | `0` | unknown | 父部门id | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| ancestors | ancestors | v | unknown | YES | `` | unknown | 祖级列表 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dept_name | deptName | v | unknown | YES | `` | unknown | 部门名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| order_num | orderNum | i | unknown | YES | `0` | unknown | 显示顺序 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| leader | leader | v | unknown | YES | `null` | unknown | 负责人 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| phone | phone | v | unknown | YES | `null` | unknown | 联系电话 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| email | email | v | unknown | YES | `null` | unknown | 邮箱 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 部门状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| del_flag | delFlag | c | unknown | YES | `0` | unknown | 删除标志（0代表存在 2代表删除） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_dict_data - sys_dict_data

字典数据项。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dict_code | dictCode | b | unknown | NO | unknown | unknown | 字典编码 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_sort | dictSort | i | unknown | YES | `0` | unknown | 字典排序 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_label | dictLabel | v | unknown | YES | `` | unknown | 字典标签 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_value | dictValue | v | unknown | YES | `` | unknown | 字典键值 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_type | dictType | v | unknown | YES | `` | unknown | 字典类型 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| css_class | cssClass | v | unknown | YES | `null` | unknown | 样式属性（其他样式扩展） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| list_class | listClass | v | unknown | YES | `null` | unknown | 表格回显样式 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| is_default | isDefault | c | unknown | YES | `N` | unknown | 是否默认（Y是 N否） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_dict_type - sys_dict_type

字典类型。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dict_id | dictId | b | unknown | NO | unknown | unknown | 字典主键 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_name | dictName | v | unknown | YES | `` | unknown | 字典名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dict_type | dictType | v | unknown | YES | `` | unknown | 字典类型 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_job - sys_job

定时任务定义。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| job_id | jobId | b | unknown | NO | unknown | PK/候选键（推断） | 任务ID | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_name | jobName | v | unknown | YES | `` | unknown | 任务名称 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_group | jobGroup | v | unknown | YES | `DEFAULT` | unknown | 任务组名 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_type | jobType | v | unknown | YES | `1` | unknown | 调度类型（1=Bean调用 2=HTTP调用） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| invoke_target | invokeTarget | v | unknown | YES | `` | unknown | 调用目标字符串（Bean调用时使用） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| request_url | requestUrl | v | unknown | YES | `` | unknown | HTTP请求URL（HTTP调用时使用） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| request_method | requestMethod | v | unknown | YES | `GET` | unknown | HTTP请求方法（GET/POST/PUT/DELETE/PATCH） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| request_headers | requestHeaders | v | unknown | YES | `` | unknown | HTTP请求头（JSON格式） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| request_body | requestBody | t | unknown | YES | unknown | unknown | HTTP请求体 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| content_type | contentType | v | unknown | YES | `application/json` | unknown | HTTP Content-Type | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| timeout | timeout | i | unknown | YES | `5000` | unknown | HTTP超时时间（毫秒） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| cron_expression | cronExpression | v | unknown | YES | `` | unknown | cron执行表达式 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| misfire_policy | misfirePolicy | v | unknown | YES | `3` | unknown | 计划执行错误策略（1立即执行 2执行一次 3放弃执行） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| concurrent | concurrent | c | unknown | YES | `1` | unknown | 是否并发执行（0允许 1禁止） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 状态（0正常 1暂停） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `` | unknown | 备注信息 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |

## TBL-sys_job_log - sys_job_log

定时任务执行日志。DLL 证据：`deploy/local-docker/mysql/init/35-quartz.sql`、`deploy/local-docker/postgres/init/35-quartz.sql`、`sql/quartz.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| job_log_id | jobLogId | b | unknown | NO | unknown | unknown | 任务日志ID | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_name | jobName | v | unknown | NO | unknown | unknown | 任务名称 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_group | jobGroup | v | unknown | NO | unknown | unknown | 任务组名 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| invoke_target | invokeTarget | v | unknown | NO | unknown | unknown | 调用目标字符串 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| job_message | jobMessage | v | unknown | YES | unknown | unknown | 日志信息 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 执行状态（0正常 1失败） | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| exception_info | exceptionInfo | v | unknown | YES | `` | unknown | 异常信息 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.quartz（调度域） | com.qvsu.quartz（调度域） | DDL | 事实 |

## TBL-sys_logininfor - sys_logininfor

登录日志。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| info_id | infoId | b | unknown | NO | unknown | unknown | 访问ID | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| login_name | loginName | v | unknown | YES | `` | unknown | 登录账号 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| ipaddr | ipaddr | v | unknown | YES | `` | unknown | 登录IP地址 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| login_location | loginLocation | v | unknown | YES | `` | unknown | 登录地点 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| browser | browser | v | unknown | YES | `` | unknown | 浏览器类型 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| os | os | v | unknown | YES | `` | unknown | 操作系统 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 登录状态（0成功 1失败） | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| msg | msg | v | unknown | YES | `` | unknown | 提示消息 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| login_time | loginTime | d | unknown | YES | unknown | unknown | 访问时间 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |

## TBL-sys_menu - sys_menu

菜单与按钮权限树（权限码来源）。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| menu_id | menuId | b | unknown | NO | unknown | PK/候选键（推断） | 菜单ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| menu_name | menuName | v | unknown | NO | unknown | unknown | 菜单名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| parent_id | parentId | b | unknown | YES | `0` | unknown | 父菜单ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| order_num | orderNum | i | unknown | YES | `0` | unknown | 显示顺序 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| url | url | v | unknown | YES | `#` | unknown | 请求地址 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| target | target | v | unknown | YES | `` | unknown | 打开方式（menuItem页签 menuBlank新窗口） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| menu_type | menuType | c | unknown | YES | `` | unknown | 菜单类型（M目录 C菜单 F按钮） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| visible | visible | c | unknown | YES | `0` | unknown | 菜单状态（0显示 1隐藏） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| is_refresh | isRefresh | c | unknown | YES | `1` | unknown | 是否刷新（0刷新 1不刷新） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| perms | perms | v | unknown | YES | `null` | unknown | 权限标识 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| icon | icon | v | unknown | YES | `#` | unknown | 菜单图标 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_notice - sys_notice

通知公告。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| notice_id | noticeId | i | unknown | NO | unknown | PK/候选键（推断） | 公告ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| notice_title | noticeTitle | v | unknown | NO | unknown | unknown | 公告标题 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| notice_type | noticeType | c | unknown | NO | unknown | unknown | 公告类型（1通知 2公告） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| notice_content | noticeContent | l | unknown | YES | `null` | unknown | 公告内容 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 公告状态（0正常 1关闭） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_oper_log - sys_oper_log

操作审计日志（AOP 写入）。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| oper_id | operId | b | unknown | NO | unknown | unknown | 日志主键 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| title | title | v | unknown | YES | `` | unknown | 模块标题 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| business_type | businessType | i | unknown | YES | `0` | unknown | 业务类型（0其它 1新增 2修改 3删除） | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| method | method | v | unknown | YES | `` | unknown | 方法名称 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| request_method | requestMethod | v | unknown | YES | `` | unknown | 请求方式 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| operator_type | operatorType | i | unknown | YES | `0` | unknown | 操作类别（0其它 1后台用户 2手机端用户） | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_name | operName | v | unknown | YES | `` | unknown | 操作人员 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| dept_name | deptName | v | unknown | YES | `` | unknown | 部门名称 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_url | operUrl | v | unknown | YES | `` | unknown | 请求URL | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_ip | operIp | v | unknown | YES | `` | unknown | 主机地址 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_location | operLocation | v | unknown | YES | `` | unknown | 操作地点 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_param | operParam | v | unknown | YES | `` | unknown | 请求参数 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| json_result | jsonResult | v | unknown | YES | `` | unknown | 返回参数 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| status | status | i | unknown | YES | `0` | unknown | 操作状态（0正常 1异常） | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| error_msg | errorMsg | v | unknown | YES | `` | unknown | 错误消息 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| oper_time | operTime | d | unknown | YES | unknown | unknown | 操作时间 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| cost_time | costTime | b | unknown | YES | `0` | unknown | 消耗时间 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |

## TBL-sys_post - sys_post

岗位定义。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| post_id | postId | b | unknown | NO | unknown | PK/候选键（推断） | 岗位ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| post_code | postCode | v | unknown | NO | unknown | unknown | 岗位编码 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| post_name | postName | v | unknown | NO | unknown | unknown | 岗位名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| post_sort | postSort | i | unknown | NO | unknown | unknown | 显示顺序 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | NO | unknown | unknown | 状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_role - sys_role

角色定义与数据范围。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| role_id | roleId | b | unknown | NO | unknown | PK/候选键（推断） | 角色ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| role_name | roleName | v | unknown | NO | unknown | unknown | 角色名称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| role_key | roleKey | v | unknown | NO | unknown | unknown | 角色权限字符串 | unknown | 是（凭据类） | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| role_sort | roleSort | i | unknown | NO | unknown | unknown | 显示顺序 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| data_scope | dataScope | c | unknown | YES | `1` | unknown | 数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | NO | unknown | unknown | 角色状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| del_flag | delFlag | c | unknown | YES | `0` | unknown | 删除标志（0代表存在 2代表删除） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_role_dept - sys_role_dept

角色与部门数据范围关联。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| role_id | roleId | b | unknown | NO | unknown | PK/候选键（推断） | 角色ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dept_id | deptId | b | unknown | NO | unknown | PK/候选键（推断） | 部门ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_role_menu - sys_role_menu

角色与菜单关联。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| role_id | roleId | b | unknown | NO | unknown | PK/候选键（推断） | 角色ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| menu_id | menuId | b | unknown | NO | unknown | PK/候选键（推断） | 菜单ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_user - sys_user

系统用户主数据。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| user_id | userId | b | unknown | NO | unknown | PK/候选键（推断） | 用户ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| dept_id | deptId | b | unknown | YES | `null` | PK/候选键（推断） | 部门ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| login_name | loginName | v | unknown | NO | unknown | unknown | 登录账号 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| user_name | userName | v | unknown | YES | `` | unknown | 用户昵称 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| user_type | userType | v | unknown | YES | `00` | unknown | 用户类型（00系统用户 01注册用户） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| email | email | v | unknown | YES | `` | unknown | 用户邮箱 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| phonenumber | phonenumber | v | unknown | YES | `` | unknown | 手机号码 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| sex | sex | c | unknown | YES | `0` | unknown | 用户性别（0男 1女 2未知） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| avatar | avatar | v | unknown | YES | `` | unknown | 头像路径 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| password | password | v | unknown | YES | `` | unknown | 密码 | unknown | 是（凭据类） | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| salt | salt | v | unknown | YES | `` | unknown | 盐加密 | unknown | 是（凭据类） | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| status | status | c | unknown | YES | `0` | unknown | 账号状态（0正常 1停用） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| del_flag | delFlag | c | unknown | YES | `0` | unknown | 删除标志（0代表存在 2代表删除） | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| login_ip | loginIp | v | unknown | YES | `` | unknown | 最后登录IP | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| login_date | loginDate | d | unknown | YES | unknown | unknown | 最后登录时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| pwd_update_date | pwdUpdateDate | d | unknown | YES | unknown | unknown | 密码最后更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_by | createBy | v | unknown | YES | `` | unknown | 创建者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| create_time | createTime | d | unknown | YES | unknown | unknown | 创建时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_by | updateBy | v | unknown | YES | `` | unknown | 更新者 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| update_time | updateTime | d | unknown | YES | unknown | unknown | 更新时间 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| remark | remark | v | unknown | YES | `null` | unknown | 备注 | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_user_online - sys_user_online

在线用户会话（Shiro 会话持久化）。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sessionId | sessionId | v | unknown | YES | `` | unknown | 用户会话id | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| login_name | loginName | v | unknown | YES | `` | unknown | 登录账号 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| dept_name | deptName | v | unknown | YES | `` | unknown | 部门名称 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| ipaddr | ipaddr | v | unknown | YES | `` | unknown | 登录IP地址 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| login_location | loginLocation | v | unknown | YES | `` | unknown | 登录地点 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| browser | browser | v | unknown | YES | `` | unknown | 浏览器类型 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| os | os | v | unknown | YES | `` | unknown | 操作系统 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| status | status | v | unknown | YES | `` | unknown | 在线状态on_line在线off_line离线 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| start_timestamp | startTimestamp | d | unknown | YES | unknown | unknown | session创建时间 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| last_access_time | lastAccessTime | d | unknown | YES | unknown | unknown | session最后访问时间 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |
| expire_time | expireTime | i | unknown | YES | `0` | unknown | 超时时间，单位为分钟 | unknown | 否 | com.qvsu.framework（框架层） | com.qvsu.framework（框架层） | DDL | 事实 |

## TBL-sys_user_post - sys_user_post

用户与岗位关联。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| user_id | userId | b | unknown | NO | unknown | PK/候选键（推断） | 用户ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| post_id | postId | b | unknown | NO | unknown | PK/候选键（推断） | 岗位ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |

## TBL-sys_user_role - sys_user_role

用户与角色关联。DLL 证据：`deploy/local-docker/mysql/init/10-qvsu.sql`、`deploy/local-docker/postgres/init/10-qvsu.sql`。

| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| user_id | userId | b | unknown | NO | unknown | PK/候选键（推断） | 用户ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
| role_id | roleId | b | unknown | NO | unknown | PK/候选键（推断） | 角色ID | unknown | 否 | com.qvsu.system（系统管理域） | com.qvsu.system（系统管理域） | DDL | 事实 |
