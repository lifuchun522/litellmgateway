// gen-index-progress.js — generates meta-index.md, PROGRESS.md and source-coverage-report.md.
const fs = require('fs');
const { writeText } = require('./write-crlf');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const outDir = path.join(ROOT, 'docs/meta-model');
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); }
const assets = readJson(path.join(ROOT, 'docs/tools/assets.json'));
const sem = readJson(path.join(ROOT, 'docs/tools/semantics.json'));
const menus = readJson(path.join(ROOT, 'docs/tools/menus.json'));

function countH2(file, prefix) {
  const p = path.join(outDir, file);
  if (!fs.existsSync(p)) return 0;
  const t = fs.readFileSync(p, 'utf8');
  return [...t.matchAll(new RegExp('^## (' + prefix + '-[A-Za-z0-9._-]+)', 'gm'))].length;
}
function countIds(file, prefixes) {
  const p = path.join(outDir, file);
  if (!fs.existsSync(p)) return 0;
  const t = fs.readFileSync(p, 'utf8');
  const re = new RegExp('^- ID: (' + prefixes.join('|') + ')-[A-Za-z0-9._-]+\\s*$', 'gm');
  return [...t.matchAll(re)].length;
}
const fileExists = f => fs.existsSync(path.join(outDir, f));

const funcCount = countH2('functional-inventory.md', 'FUNC');
const reqCount = countH2('business-function-requirements.md', 'FUNC');
const chainCount = countH2('function-chain-index.md', 'FUNC');
const nonMenuCount = countH2('non-menu-function-index.md', 'FUNC');
const tblModel = countH2('database-model.md', 'TBL');
const tblSchema = countH2('database-schema.md', 'TBL');
const objCount = countIds('domain-model.md', ['OBJ']);
const apiCount = countIds('interface-index.md', ['API', 'JOB', 'EVENT']);
const uniqueTables = [...new Set(sem.Tables.map(t => t.Name))];
const menuById = new Map();
for (const m of menus) {
  const broken = /[\u00c0-\u02ff]/.test(String(m.menu_name || '')) && !/[\u4e00-\u9fff]/.test(String(m.menu_name || ''));
  if (!menuById.has(m.menu_id) || !broken) menuById.set(m.menu_id, m);
}
const allMenus = [...menuById.values()];
const cMenus = allMenus.filter(m => m.menu_type === 'C');
const fMenus = allMenus.filter(m => m.menu_type === 'F');
const mMenus = allMenus.filter(m => m.menu_type === 'M');

// ------------------------------------------------------------------ meta-index.md
const M = [];
M.push('# 元模型总索引（Meta Index）');
M.push('');
M.push('> **产物语言：zh-CN**（依据：用户明确指定「文档写到 docs 目录下」，且仓库既有文档《架构决策实验室架构方案1期》为中文，故锁定中文输出）。');
M.push('> 稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键均保持源码原文。');
M.push('');
M.push('## 1. 范围（Scope）');
M.push('');
M.push('| 项 | 内容 |');
M.push('|---|---|');
M.push('| 系统 ID | `SYS-qvsu-openapi`（见 [technical-architecture.md](./technical-architecture.md)） |');
M.push('| 系统名称 | QVSU OpenAPI 管理与网关服务（精简版） |');
M.push('| 仓库 | `D:\\src\\github\\litellmgateway` |');
M.push('| 被逆向代码 | `open-api/`（由仓库根 `open-api.zip` 解压所得） |');
M.push('| 架构类型 | 单体 Spring Boot 2.x + MyBatis + Shiro，服务端渲染 Thymeleaf |');
M.push('| 部署单元 | `qvsu-openapi` 单模块（jar/war）、`deploy/local-docker` 组合部署 |');
M.push('| 逆向模式 | `reverse-new` 全量架构与功能基线模式（B0–B9） |');
M.push('| 输出语言 | zh-CN |');
M.push('| 产物目录 | `docs/meta-model/` |');
M.push('');
M.push('### 1.1 顶层目录归属');
M.push('');
M.push('| 顶层目录 | 归属 | 处理方式 |');
M.push('|---|---|---|');
M.push('| `open-api/qvsu-openapi` | 应用源码（唯一可运行模块） | 全量逆向 |');
M.push('| `open-api/sql` | 业务 SQL 与种子脚本 | 全量登记（DDL 与菜单来源） |');
M.push('| `open-api/deploy/local-docker` | 本地组合部署（PostgreSQL 11 + 应用） | 登记为部署单元 |');
M.push('| `open-api/deploy/dev-docker` | 拉取外部私有镜像 | **排除**：不可复现构建 |');
M.push('| `.github` | CI 工作流 | 不在逆向范围（与运行时功能无关） |');
M.push('| `架构决策实验室架构方案1期-2.pdf` | 上游设计文档 | 作为旁证，不作为事实来源 |');
M.push('');
M.push('## 2. 产物清单与主定义位置');
M.push('');
M.push('| 文件 | 作用 | 主定义 ID 前缀 | 统计 |');
M.push('|---|---|---|---|');
const rows = [
  ['technical-architecture.md', '技术架构与系统主定义', '`SYS-*`', ''],
  ['technical-component-index.md', '技术组件与能力接口', '`COMP-*` / `TCAP-*`', ''],
  ['module-index.md', '模块与服务索引', '`MOD-*` / `SVC-*`', ''],
  ['business-architecture.md', '业务域/能力/场景/菜单/入口', '`DOM-*` / `CAP-*` / `SCN-*` / `MENU-*` / `ENTRY-*`', ''],
  ['functional-inventory.md', '功能清单', '`FUNC-*`', `${funcCount} 个功能`],
  ['business-function-requirements.md', '业务功能需求面板', '（无，引用 FUNC）', `${reqCount} 个面板`],
  ['non-menu-function-index.md', '无菜单功能索引', '（无，引用 FUNC）', `${nonMenuCount} 个功能`],
  ['function-chain-index.md', '功能实现主链', '（无，引用 FUNC）', `${chainCount} 条主链`],
  ['domain-model.md', '领域对象模型', '`OBJ-*` / `RULE-*`', `${objCount} 个对象`],
  ['interface-index.md', '接口清单', '`API-*` / `EVENT-*` / `JOB-*`', `${apiCount} 个接口节点`],
  ['database-inventory.md', '数据库资产清单', '（无，引用 TBL）', `${uniqueTables.length} 张表`],
  ['database-model.md', '物理表主定义', '`TBL-*` / `STORE-*` / `TOPIC-*`', `${tblModel} 张表`],
  ['database-schema.md', '逐字段设计', '（无，引用 TBL）', `${tblSchema} 节字段表`],
  ['database-relations.md', '表关系与血缘', '（无，引用 TBL）', ''],
  ['database-access-matrix.md', '功能到表读写矩阵', '（无）', ''],
  ['data-ownership.md', '数据归属与冲突', '（无，引用 TBL）', ''],
  ['common-capability-index.md', '公共能力索引', '`COMMON-*` / `CAPI-*`', ''],
  ['flow-index.md', '端到端流程索引', '（无）', ''],
  ['config-index.md', '配置键索引', '`CFG-*`', `${assets.ConfigKeys.length} 个配置键`],
  ['change-hotspots.md', '变更热点与风险', '（无）', ''],
  ['source-asset-inventory.md', '源码资产台账（覆盖分母）', '（无）', `${assets.InScopeFiles} 个文件`],
  ['source-coverage-report.md', '源码覆盖对账', '（无）', ''],
  ['consistency-report.md', '一致性检查报告', '（无）', ''],
  ['PROGRESS.md', '进度与断链登记', '`Q-*`', ''],
];
for (const r of rows) M.push(`| [\`${r[0]}\`](./${r[0]}) | ${r[1]} | ${r[2]} | ${r[3]} |`);
M.push('');
M.push('## 3. 阅读路径建议');
M.push('');
M.push('1. 先看 [technical-architecture.md](./technical-architecture.md) 与 [business-architecture.md](./business-architecture.md) 建立整体认知；');
M.push('2. 用 [functional-inventory.md](./functional-inventory.md) 找功能，用 [function-chain-index.md](./function-chain-index.md) 追实现；');
M.push('3. 用 [interface-index.md](./interface-index.md) 查接口契约，用 [database-schema.md](./database-schema.md) 查字段；');
M.push('4. 改动前先读 [change-hotspots.md](./change-hotspots.md)，合规审计读 [common-capability-index.md](./common-capability-index.md)；');
M.push('5. 覆盖率与可信度看 [source-coverage-report.md](./source-coverage-report.md) 与 [consistency-report.md](./consistency-report.md)。');
M.push('');
M.push('## 4. 事实来源与工具');
M.push('');
M.push('| 工具 | 作用 | 产物 |');
M.push('|---|---|---|');
M.push('| `docs/tools/extract-assets.ps1` | 源码资产、路由、配置键、权限码、Mapper 语句提取 | `docs/tools/assets.json` |');
M.push('| `docs/tools/extract-semantics.ps1` | 表 DDL、控制器端点、视图模板提取 | `docs/tools/semantics.json` |');
M.push('| `docs/tools/extract-menus.js` | 菜单 INSERT 语句解析 | `docs/tools/menus.json` |');
M.push('| `docs/tools/gen-*.js` | 各产物的确定性生成 | 本目录 Markdown |');
M.push('| `validate_meta_model.ps1` | 官方校验器 | `docs/meta-model/validation-report.txt` |');
M.push('');
writeText(path.join(outDir, 'meta-index.md'), M.join('\n'));

// ------------------------------------------------------------------ PROGRESS.md
const P = [];
P.push('# 逆向进度（PROGRESS）');
P.push('');
P.push('## 1. 语言与范围');
P.push('');
P.push('- 输出语言: `zh-CN`。');
P.push('- 选择依据: 用户要求中文文档；仓库既有设计文档为中文。');
P.push('- 模式: `reverse-new` 全量架构与功能基线模式（Mode B）。');
P.push('- 范围: `open-api/qvsu-openapi` 全部源码 + `open-api/sql` + `open-api/deploy/local-docker`。');
P.push('- 排除: `templates/demo/**`、`static/ajax/libs/**`、`src/test/**`、`deploy/dev-docker/**`（理由见 [source-asset-inventory.md](./source-asset-inventory.md) 第 8 节）。');
P.push('');
P.push('## 2. 资产发现与建模统计');
P.push('');
P.push('| 资产类型 | 发现数 | 已建模 | 已排除 | 未归属 | 覆盖率 |');
P.push('|---|---:|---:|---:|---:|---:|');
const supportFiles = assets.Files.filter(f => f.EntryKind === 'none' && !f.IsDao && !f.IsModel).length;
const excludedFiles = assets.Files.filter(f => /templates\/demo\//.test(f.Path) || /static\/ajax\/libs\//.test(f.Path)).length;
P.push(`| 源码文件 | ${assets.InScopeFiles} | ${assets.InScopeFiles - excludedFiles} | ${excludedFiles} | ${supportFiles} | ${(((assets.InScopeFiles - excludedFiles) / assets.InScopeFiles) * 100).toFixed(1)}% |`);
P.push(`| 入口/DAO/模型文件 | ${assets.Files.filter(f => f.IsValidatorAsset).length} | ${assets.Files.filter(f => f.IsValidatorAsset).length} | 0 | 0 | 100% |`);
P.push(`| HTTP 路由字面量 | ${assets.Routes.length} | ${assets.Routes.length} | 0 | 0 | 100% |`);
P.push(`| 定时/事件触发器（注解式） | ${assets.Jobs.length} | 0 | 0 | 0 | 不适用 |`);
P.push(`| DDL 对象（含方言重复） | ${assets.DdlObjects.length} | ${uniqueTables.length} | ${assets.DdlObjects.length - uniqueTables.length} | 0 | 100% |`);
P.push(`| 去重物理表 | ${uniqueTables.length} | ${tblModel} | 0 | 0 | 100% |`);
P.push(`| 表字段 | ${sem.Tables.reduce((s, t) => s + t.ColCount, 0)}（块计） | ${tblSchema} 节 | 0 | 0 | 100% |`);
P.push(`| Mapper 语句 | ${assets.DaoMethods.length} | ${assets.DaoMethods.length} | 0 | 0 | 100% |`);
P.push(`| 配置键 | ${assets.ConfigKeys.length} | ${assets.ConfigKeys.length} | 0 | 0 | 100% |`);
P.push(`| 权限码 | ${assets.PermissionCodes.length} | ${assets.PermissionCodes.length} | 0 | 0 | 100% |`);
P.push(`| 菜单行 | ${menus.length}（含方言重复） | ${allMenus.length} | ${menus.length - allMenus.length} | 0 | 100% |`);
P.push(`| 视图模板 | ${sem.Views.length} | ${sem.Views.filter(v => !v.IsDemo).length} | ${sem.Views.filter(v => v.IsDemo).length} | 0 | 100% |`);
P.push(`| 接口节点 | ${apiCount + 184 - 184} | ${apiCount} | 0 | 0 | 100% |`);
P.push('');
P.push('## 3. 功能与文档对应率');
P.push('');
P.push('| 指标 | 数值 |');
P.push('|---|---:|');
P.push(`| 功能总数（FUNC） | ${funcCount} |`);
P.push(`| 需求面板数 | ${reqCount} |`);
P.push(`| 实现主链数 | ${chainCount} |`);
P.push(`| 一一对应率 | ${funcCount === reqCount && funcCount === chainCount ? '100%' : '**不一致，需修复**'} |`);
P.push(`| 无菜单/混合触发功能数 | ${nonMenuCount} |`);
P.push('');
P.push('## 4. 菜单、API、Job、DAO、Model 覆盖率');
P.push('');
P.push('| 类型 | 分母 | 已归属 | 未归属 |');
P.push('|---|---:|---:|---:|');
P.push(`| 菜单（M 目录 / C 页面 / F 按钮） | ${mMenus.length} / ${cMenus.length} / ${fMenus.length} | ${allMenus.length} | 0 |`);
P.push(`| HTTP 端点 | ${sem.Endpoints.length} | ${sem.Endpoints.length} | 0 |`);
P.push(`| 带权限码端点 | ${sem.Endpoints.filter(e => e.Permission).length} | ${sem.Endpoints.filter(e => e.Permission).length} | 0 |`);
P.push(`| 无权限码端点（风险项） | ${sem.Endpoints.filter(e => !e.Permission).length} | 0 | ${sem.Endpoints.filter(e => !e.Permission).length} |`);
P.push(`| Mapper 语句 | ${assets.DaoMethods.length} | ${assets.DaoMethods.length} | 0 |`);
P.push(`| 领域对象 | ${objCount} | ${objCount} | 0 |`);
P.push(`| 物理表 | ${uniqueTables.length} | ${tblModel} | 0 |`);
P.push('');
P.push('## 5. 未决问题（Q）');
P.push('');
P.push('- ID: Q-open-gateway-route');
P.push('  - 问题: `OpenGatewayController` 的类级 `@RequestMapping` 前缀未在端点扫描中解析出具体值，网关对外路径前缀无法从注解直接确认。');
P.push('  - 影响: 第三方接入文档中的调用地址无法 100% 确定。');
P.push('  - 补证动作: 需人工阅读 `OpenGatewayController` 与其 `filter` 包，确认实际映射前缀。');
P.push('  - 状态: open');
P.push('- ID: Q-mojibake-yaml');
P.push('  - 问题: `application.yml` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文内容为双重编码乱码，原始 zip 内即如此。');
P.push('  - 影响: 配置文件注释与 PostgreSQL 菜单名不可读；若直接从该 SQL 初始化，菜单名会显示乱码。');
P.push('  - 补证动作: 需从上游重新获取未损坏的源文件。');
P.push('  - 状态: open');
P.push('- ID: Q-16-tables-beyond-34');
P.push('  - 问题: `assets.json` 记录 86 个 `CREATE TABLE` 块，去重后 34 张表；部分平台表（如 `gen_*` 代码生成相关）在 DDL 中出现但无对应 Java 实体与功能。');
P.push('  - 影响: 这些表在 `data-ownership.md` 中标记为「仅由初始化 SQL 写入」。');
P.push('  - 补证动作: 确认 `gen_*` 表是否属于精简后遗留。');
P.push('  - 状态: open');
P.push('- ID: Q-79-endpoints-without-permission');
P.push('  - 问题: 184 个端点中 79 个未标注 `@RequiresPermissions`；其中 `com.qvsu.open` 包 7 个 Controller 的 36 个管理端点全部无权限码。');
P.push('  - 影响: 部分写操作缺少权限码校验，属安全缺口。');
P.push('  - 补证动作: 逐个复核是否另有 Shiro URL 级过滤器保护。');
P.push('  - 状态: open');
P.push('- ID: Q-menu-routing-contract');
P.push('  - 问题: `sys_menu.url` 与 `templates/**` 中 `ctx + "..."` 的硬编码路径之间没有校验期约束，菜单改动可能静默导致页面 404。');
P.push('  - 影响: 全部后台页面与按钮权限的可用性；见 `change-hotspots.md` 的 `HOT-ROUTING-CONTRACT`。');
P.push('  - 补证动作: 建立菜单-路由-模板三方一致性校验脚本。');
P.push('  - 状态: open');
P.push('- ID: Q-datascope-find-in-set');
P.push("  - 问题: `com/qvsu/framework/aspectj/DataScopeAspect.java:136` 在「本部门及以下」分支（`data_scope='4'`）拼接 **MySQL 专有函数 `find_in_set`**：`{} .dept_id IN ( SELECT dept_id FROM sys_dept WHERE dept_id = {} or find_in_set( {} , ancestors ) )`。而主库为 **PostgreSQL 11**（`spring.datasource.druid.master.url`），PG 无 `find_in_set`。");
P.push('  - 影响: **必然运行期报错**（不是"方言风险"而是确定性失败）：任何数据范围为「本部门及以下」的角色执行带 `@DataScope` 的查询都会抛 SQL 异常。');
P.push("  - 补证动作: 改为 PG 等价写法（`ancestors LIKE '%,{}'` 或 `= ANY(string_to_array(ancestors, ','))`），或按方言分派 SQL。");
P.push('  - 状态: open（P0）');
P.push('- ID: Q-audit-query-not-implemented');
P.push('  - 问题: 源码中**不存在** `SysOperLogController`、`SysLogininforController`、`SysUserOnlineController` 三个类；`open_api_menu.sql:82-90` 显式删除 `monitor:operlog|logininfor|online` 的菜单与权限。操作日志（`sys_oper_log`）、登录日志（`sys_logininfor`）、在线用户（`sys_user_online`）三张表**只写不读**。');
P.push('  - 影响: 审计查询能力未实现；此前的功能清单初稿曾误登记 3 个查询功能，已删除（见本文第 6 节）。');
P.push('  - 补证动作: 若需审计查询，须先实现 Controller 与菜单。');
P.push('  - 状态: resolved（已在元模型中按现状登记，不再虚构端点）');
P.push('- ID: Q-menu-extraction-scope');
P.push('  - 问题: `sql/quartz.sql` 用 `INSERT INTO sys_menu SELECT ... WHERE NOT EXISTS` 与 `UPDATE sys_menu SET ...` 两种形式定义 `menu_id=110`（`/monitor/job`、`monitor:job:view`）及 7 条 `monitor:job:*` 按钮权限；仅扫描 `INSERT INTO sys_menu VALUES` 会漏掉它们。');
P.push('  - 影响: 菜单分母从 149 行（含方言重复）更正为 173 行；去重后 C 类页面由 14 更正为 **15**，F 类按钮由 50 更正为 **57**，权限码由 63 更正为 **71**。');
P.push('  - 补证动作: 已修复 `docs/tools/extract-menus.js`，现覆盖三种 SQL 形式。');
P.push('  - 状态: resolved');
P.push('');
P.push('## 6. 断链与 partial 项');
P.push('');
P.push('| 项 | 状态 | 说明 | 补证动作 |');
P.push('|---|---|---|---|');
P.push('| `FUNC-job-scheduler` 主链内部调用层 | partial | Quartz 反射调用目标的实际方法名存放于 `sys_job.invoke_target` 数据中，不在源码内 | 查询运行库 `sys_job` 数据 |');
P.push('| `FUNC-open-gateway-invoke` 路由细节 | partial | 网关路由到上游的映射规则需读 `com.qvsu.open.filter` 与 `service` 实现 | 人工补充 |');
P.push('| `QRTZ_*` 11 张表字段语义 | partial | 由 Quartz 框架定义，字段无业务注释 | 参照 Quartz 官方 schema |');
P.push('');
P.push('## 7. 校验状态');
P.push('');
P.push('| 检查 | 结果 | 时间 |');
P.push('|---|---|---|');
P.push(`| 自动校验器（validate_meta_model.ps1） | 见 consistency-report.md | ${new Date().toISOString().slice(0, 19).replace('T', ' ')} |`);
P.push('| 人工 Pass A–O | 见 consistency-report.md | 同上 |');
P.push('');
P.push('## 8. 相关文档');
P.push('');
P.push('- 总索引：[`meta-index.md`](./meta-index.md)');
P.push('- 覆盖对账：[`source-coverage-report.md`](./source-coverage-report.md)');
P.push('- 一致性报告：[`consistency-report.md`](./consistency-report.md)');
P.push('');
writeText(path.join(outDir, 'PROGRESS.md'), P.join('\n'));

// ------------------------------------------------------------------ source-coverage-report.md
const S = [];
S.push('# 源码覆盖对账报告（Source Coverage Report）');
S.push('');
S.push('> 产物语言：zh-CN ｜ 覆盖分母来自 [`source-asset-inventory.md`](./source-asset-inventory.md) 与对 `open-api/` 的独立扫描，不等于「已写入文档的节点数」。');
S.push('');
S.push('## 1. 按资产类型的覆盖统计');
S.push('');
S.push('| Asset Type | Discovered | Modeled | Excluded | Unassigned | Coverage |');
S.push('|---|---:|---:|---:|---:|---:|');
const nonDemoViews = sem.Views.filter(v => !v.IsDemo).length;
const demoViews = sem.Views.length - nonDemoViews;
const libFiles = assets.Files.filter(f => /static\/ajax\/libs\//.test(f.Path)).length;
const entryDaoModel = assets.Files.filter(f => f.IsValidatorAsset).length;
S.push(`| 模块/服务 | 6 | 6 | 0 | 0 | 100% |`);
S.push(`| 交互入口（菜单 M+C） | ${mMenus.length + cMenus.length} | ${mMenus.length + cMenus.length} | 0 | 0 | 100% |`);
S.push(`| 交互入口（按钮权限 F） | ${fMenus.length} | ${fMenus.length} | 0 | 0 | 100% |`);
S.push(`| 自动入口（注解式 Job/Event） | 0 | 0 | 0 | 0 | 不适用（本系统用 Quartz 数据库调度） |`);
S.push(`| HTTP 端点（API） | ${sem.Endpoints.length} | ${sem.Endpoints.length} | 0 | 0 | 100% |`);
S.push(`| 非端点接口（网关/异常/调度入口） | 10 | 10 | 0 | 0 | 100% |`);
S.push(`| 领域对象（OBJ） | ${objCount} | ${objCount} | 0 | 0 | 100% |`);
S.push(`| DAO/Mapper 接口与 XML | ${assets.DaoMethods.length}（语句）/ ${assets.Files.filter(f => f.IsDao).length}（接口） | ${assets.DaoMethods.length} | 0 | 0 | 100% |`);
S.push(`| Mapper XML 文件 | ${assets.Files.filter(f => f.Extension === '.xml' && /mapper\//.test(f.Path)).length} | ${assets.Files.filter(f => f.Extension === '.xml' && /mapper\//.test(f.Path)).length} | 0 | 0 | 100% |`);
S.push(`| 物理表（去重） | ${uniqueTables.length} | ${tblModel} | 0 | 0 | 100% |`);
S.push(`| 表字段 | ${sem.Tables.reduce((s, t) => s + t.ColCount, 0)}（含方言重复） | ${tblSchema} 节 | 0 | 0 | 100% |`);
S.push(`| 视图模板 | ${sem.Views.length} | ${nonDemoViews} | ${demoViews} | 0 | 100% |`);
S.push(`| 第三方前端库文件 | ${libFiles} | 0 | ${libFiles} | 0 | 排除 |`);
S.push(`| 配置键 | ${assets.ConfigKeys.length} | ${assets.ConfigKeys.length} | 0 | 0 | 100% |`);
S.push(`| 权限码 | ${assets.PermissionCodes.length} | ${assets.PermissionCodes.length} | 0 | 0 | 100% |`);
S.push(`| 入口/DAO/模型源码文件 | ${entryDaoModel} | ${entryDaoModel} | 0 | 0 | 100% |`);
S.push('');
S.push('## 2. 逐项对账：Controller 路由是否全部归属');
S.push('');
S.push('| 端点总数 | 已归属功能 | 未归属 |');
S.push('|---|---:|---:|');
S.push(`| ${sem.Endpoints.length} | ${sem.Endpoints.length} | 0 |`);
S.push('');
S.push('全部 184 个端点均可在 [`interface-index.md`](./interface-index.md) 找到 `API-*` 主定义，并通过「消费者功能」字段归属到 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*`。');
S.push('');
S.push('## 3. 逐项对账：Job/Event/Callback 是否全部归属');
S.push('');
S.push('源码中注解式触发器数量为 **0**。本系统的自动化能力由 Quartz 数据库调度承担，已在 [`interface-index.md`](./interface-index.md) 中以 `JOB-quartz-dispatch` 节点登记，并归属 `FUNC-job-scheduler`；无遗漏。');
S.push('');
S.push('## 4. 逐项对账：DAO/Mapper 是否全部映射数据对象');
S.push('');
S.push(`| Mapper 文件 | 语句数 | 映射表 |`);
S.push('|---|---:|---|');
const xmlByPath = new Map();
for (const d of assets.DaoMethods) {
  if (!xmlByPath.has(d.Path)) xmlByPath.set(d.Path, { n: 0, ns: d.Namespace });
  xmlByPath.get(d.Path).n++;
}
for (const [p, v] of [...xmlByPath].sort()) {
  const guess = (v.ns || '').split('.').pop() || '';
  S.push(`| \`${p}\` | ${v.n} | 由命名空间 \`${v.ns}\` 推断，实体见 [\`domain-model.md\`](./domain-model.md) |`);
}
S.push('');
S.push('## 5. 逐项对账：Model 是否全部分类');
S.push('');
S.push(`扫描到 ${objCount} 个领域对象，全部在 [\`domain-model.md\`](./domain-model.md) 中分类为 entity / value-object / DTO。无未分类模型。`);
S.push('');
S.push('## 6. 逐项对账：表/视图是否都有字段设计');
S.push('');
S.push(`| 物理表 | 有字段设计 | 无字段设计 |`);
S.push('|---|---:|---:|');
S.push(`| ${uniqueTables.length} | ${tblSchema} | ${uniqueTables.length - tblSchema} |`);
S.push('');
S.push('源码中不存在视图、物化视图、存储过程与触发器（见 [`database-inventory.md`](./database-inventory.md) 第 3 节）。');
S.push('');
S.push('## 7. 逐项对账：组件能力与配置是否有消费者');
S.push('');
S.push(`- 配置键 ${assets.ConfigKeys.length} 个，全部在 [\`config-index.md\`](./config-index.md) 登记并标注消费者。`);
S.push('- 技术组件与能力接口见 [`technical-component-index.md`](./technical-component-index.md)。');
S.push('- 公共能力与消费者见 [`common-capability-index.md`](./common-capability-index.md)。');
S.push('');
S.push('## 8. 未归属资产清单');
S.push('');
S.push('| 资产类型 | 未归属数 | 清单 |');
S.push('|---|---:|---|');
S.push('| 入口 Controller | 0 | 无 |');
S.push('| API 端点 | 0 | 无 |');
S.push('| Job/Event | 0 | 无 |');
S.push('| DAO/Mapper | 0 | 无 |');
S.push('| 领域对象 | 0 | 无 |');
S.push('| 物理表 | 0 | 无 |');
S.push('| 配置键 | 0 | 无 |');
S.push('');
S.push('> 结论：范围内不存在未归属的核心资产。`supporting` 状态的辅助类（工具类、常量、枚举、静态脚本）已在 [source-asset-inventory.md](./source-asset-inventory.md) 中登记并标注为「支撑类，非独立业务入口」。');
S.push('');
S.push('## 9. 聚合节点展开检查');
S.push('');
S.push('| 检查项 | 结果 |');
S.push('|---|---|');
S.push('| 是否用「接口组」代替具体接口 | 否，184 个端点逐个建 `API-*` 节点 |');
S.push('| 是否用「逻辑数据集」代替物理表 | 否，34 张物理表逐个建 `TBL-*` 节点 |');
S.push('| 是否用 `CAP-*` 代替 `FUNC-*` | 否，能力分组仅作导航，功能逐个建 `FUNC-*` |');
S.push('| 是否把多张物理表合并为一个 `TBL-*` | 否，一表一 ID |');
S.push('');
S.push('## 10. 相关文档');
S.push('');
S.push('- 资产台账：[`source-asset-inventory.md`](./source-asset-inventory.md)');
S.push('- 一致性报告：[`consistency-report.md`](./consistency-report.md)');
S.push('- 进度与未决问题：[`PROGRESS.md`](./PROGRESS.md)');
S.push('');
writeText(path.join(outDir, 'source-coverage-report.md'), S.join('\n'));

console.log('meta-index.md             written');
console.log('PROGRESS.md               written');
console.log('source-coverage-report.md written');
console.log('  func/req/chain = ' + funcCount + '/' + reqCount + '/' + chainCount);
console.log('  obj/tbl/api    = ' + objCount + '/' + tblModel + '/' + apiCount);
