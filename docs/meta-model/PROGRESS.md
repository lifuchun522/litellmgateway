# 逆向进度（PROGRESS）

## 1. 语言与范围

- 输出语言: `zh-CN`。
- 选择依据: 用户要求中文文档；仓库既有设计文档为中文。
- 模式: `reverse-new` 全量架构与功能基线模式（Mode B）。
- 范围: `open-api/qvsu-openapi` 全部源码 + `open-api/sql` + `open-api/deploy/local-docker`。
- 排除: `templates/demo/**`、`static/ajax/libs/**`、`src/test/**`、`deploy/dev-docker/**`（理由见 [source-asset-inventory.md](./source-asset-inventory.md) 第 8 节）。

## 2. 资产发现与建模统计

| 资产类型 | 发现数 | 已建模 | 已排除 | 未归属 | 覆盖率 |
|---|---:|---:|---:|---:|---:|
| 源码文件 | 409 | 335 | 74 | 349 | 81.9% |
| 入口/DAO/模型文件 | 60 | 60 | 0 | 0 | 100% |
| HTTP 路由字面量 | 184 | 184 | 0 | 0 | 100% |
| 定时/事件触发器（注解式） | 0 | 0 | 0 | 0 | 不适用 |
| DDL 对象（含方言重复） | 86 | 34 | 52 | 0 | 100% |
| 去重物理表 | 34 | 34 | 0 | 0 | 100% |
| 表字段 | 865（块计） | 34 节 | 0 | 0 | 100% |
| Mapper 语句 | 144 | 144 | 0 | 0 | 100% |
| 配置键 | 29 | 29 | 0 | 0 | 100% |
| 权限码 | 55 | 55 | 0 | 0 | 100% |
| 菜单行 | 173（含方言重复） | 74 | 99 | 0 | 100% |
| 视图模板 | 144 | 71 | 73 | 0 | 100% |
| 接口节点 | 192 | 192 | 0 | 0 | 100% |

## 3. 功能与文档对应率

| 指标 | 数值 |
|---|---:|
| 功能总数（FUNC） | 29 |
| 需求面板数 | 29 |
| 实现主链数 | 29 |
| 一一对应率 | 100% |
| 无菜单/混合触发功能数 | 6 |

## 4. 菜单、API、Job、DAO、Model 覆盖率

| 类型 | 分母 | 已归属 | 未归属 |
|---|---:|---:|---:|
| 菜单（M 目录 / C 页面 / F 按钮） | 2 / 15 / 57 | 74 | 0 |
| HTTP 端点 | 184 | 184 | 0 |
| 带权限码端点 | 105 | 105 | 0 |
| 无权限码端点（风险项） | 79 | 0 | 79 |
| Mapper 语句 | 144 | 144 | 0 |
| 领域对象 | 33 | 33 | 0 |
| 物理表 | 34 | 34 | 0 |

## 5. 未决问题（Q）

- ID: Q-open-gateway-route
  - 问题: `OpenGatewayController` 的类级 `@RequestMapping` 前缀未在端点扫描中解析出具体值，网关对外路径前缀无法从注解直接确认。
  - 影响: 第三方接入文档中的调用地址无法 100% 确定。
  - 补证动作: 需人工阅读 `OpenGatewayController` 与其 `filter` 包，确认实际映射前缀。
  - 状态: open
- ID: Q-mojibake-yaml
  - 问题: `application.yml` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文内容为双重编码乱码，原始 zip 内即如此。
  - 影响: 配置文件注释与 PostgreSQL 菜单名不可读；若直接从该 SQL 初始化，菜单名会显示乱码。
  - 补证动作: 需从上游重新获取未损坏的源文件。
  - 状态: open
- ID: Q-16-tables-beyond-34
  - 问题: `assets.json` 记录 86 个 `CREATE TABLE` 块，去重后 34 张表；部分平台表（如 `gen_*` 代码生成相关）在 DDL 中出现但无对应 Java 实体与功能。
  - 影响: 这些表在 `data-ownership.md` 中标记为「仅由初始化 SQL 写入」。
  - 补证动作: 确认 `gen_*` 表是否属于精简后遗留。
  - 状态: open
- ID: Q-79-endpoints-without-permission
  - 问题: 184 个端点中 79 个未标注 `@RequiresPermissions`；其中 `com.qvsu.open` 包 7 个 Controller 的 36 个管理端点全部无权限码。
  - 影响: 部分写操作缺少权限码校验，属安全缺口。
  - 补证动作: 逐个复核是否另有 Shiro URL 级过滤器保护。
  - 状态: open
- ID: Q-menu-routing-contract
  - 问题: `sys_menu.url` 与 `templates/**` 中 `ctx + "..."` 的硬编码路径之间没有校验期约束，菜单改动可能静默导致页面 404。
  - 影响: 全部后台页面与按钮权限的可用性；见 `change-hotspots.md` 的 `HOT-ROUTING-CONTRACT`。
  - 补证动作: 建立菜单-路由-模板三方一致性校验脚本。
  - 状态: open
- ID: Q-datascope-find-in-set
  - 问题: `com/qvsu/framework/aspectj/DataScopeAspect.java:136` 在「本部门及以下」分支（`data_scope='4'`）拼接 **MySQL 专有函数 `find_in_set`**：`{} .dept_id IN ( SELECT dept_id FROM sys_dept WHERE dept_id = {} or find_in_set( {} , ancestors ) )`。而主库为 **PostgreSQL 11**（`spring.datasource.druid.master.url`），PG 无 `find_in_set`。
  - 影响: **必然运行期报错**（不是"方言风险"而是确定性失败）：任何数据范围为「本部门及以下」的角色执行带 `@DataScope` 的查询都会抛 SQL 异常。
  - 补证动作: 改为 PG 等价写法（`ancestors LIKE '%,{}'` 或 `= ANY(string_to_array(ancestors, ','))`），或按方言分派 SQL。
  - 状态: open（P0）
- ID: Q-audit-query-not-implemented
  - 问题: 源码中**不存在** `SysOperLogController`、`SysLogininforController`、`SysUserOnlineController` 三个类；`open_api_menu.sql:82-90` 显式删除 `monitor:operlog|logininfor|online` 的菜单与权限。操作日志（`sys_oper_log`）、登录日志（`sys_logininfor`）、在线用户（`sys_user_online`）三张表**只写不读**。
  - 影响: 审计查询能力未实现；此前的功能清单初稿曾误登记 3 个查询功能，已删除（见本文第 6 节）。
  - 补证动作: 若需审计查询，须先实现 Controller 与菜单。
  - 状态: resolved（已在元模型中按现状登记，不再虚构端点）
- ID: Q-menu-extraction-scope
  - 问题: `sql/quartz.sql` 用 `INSERT INTO sys_menu SELECT ... WHERE NOT EXISTS` 与 `UPDATE sys_menu SET ...` 两种形式定义 `menu_id=110`（`/monitor/job`、`monitor:job:view`）及 7 条 `monitor:job:*` 按钮权限；仅扫描 `INSERT INTO sys_menu VALUES` 会漏掉它们。
  - 影响: 菜单分母从 149 行（含方言重复）更正为 173 行；去重后 C 类页面由 14 更正为 **15**，F 类按钮由 50 更正为 **57**，权限码由 63 更正为 **71**。
  - 补证动作: 已修复 `docs/tools/extract-menus.js`，现覆盖三种 SQL 形式。
  - 状态: resolved

## 6. 断链与 partial 项

| 项 | 状态 | 说明 | 补证动作 |
|---|---|---|---|
| `FUNC-job-scheduler` 主链内部调用层 | partial | Quartz 反射调用目标的实际方法名存放于 `sys_job.invoke_target` 数据中，不在源码内 | 查询运行库 `sys_job` 数据 |
| `FUNC-open-gateway-invoke` 路由细节 | partial | 网关路由到上游的映射规则需读 `com.qvsu.open.filter` 与 `service` 实现 | 人工补充 |
| `QRTZ_*` 11 张表字段语义 | partial | 由 Quartz 框架定义，字段无业务注释 | 参照 Quartz 官方 schema |

## 7. 校验状态

| 检查 | 结果 | 时间 |
|---|---|---|
| 自动校验器（validate_meta_model.ps1） | 见 consistency-report.md | 2026-09-29 08:02:00 |
| 人工 Pass A–O | 见 consistency-report.md | 同上 |

## 8. 相关文档

- 总索引：[`meta-index.md`](./meta-index.md)
- 覆盖对账：[`source-coverage-report.md`](./source-coverage-report.md)
- 一致性报告：[`consistency-report.md`](./consistency-report.md)
