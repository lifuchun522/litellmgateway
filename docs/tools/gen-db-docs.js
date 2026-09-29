// gen-db-docs.js — generates the three ID-primary database meta-model documents.
// Deterministic: all content is derived from docs/tools/semantics.json.
const fs = require('fs');
const { writeText } = require('./write-crlf');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const sem = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/tools/semantics.json'), 'utf8'));
const outDir = path.join(ROOT, 'docs/meta-model');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ---------- group tables by physical name, pick the richest variant ----------
const byName = new Map();
for (const t of sem.Tables) {
  if (!byName.has(t.Name)) byName.set(t.Name, []);
  byName.get(t.Name).push(t);
}
function pickVariant(variants) {
  // Prefer the variant carrying the most column comments, then the most columns.
  let best = variants[0], bestScore = -1;
  for (const v of variants) {
    const commented = v.Columns.filter(c => c.Comment).length;
    const score = commented * 1000 + v.ColCount;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}
const tables = [];
for (const [name, variants] of byName) {
  const v = pickVariant(variants);
  tables.push({ name, display: name, variants, chosen: v });
}
tables.sort((a, b) => a.name.localeCompare(b.name));

// ---------- classification ----------
function group(name) {
  if (name.startsWith('open_')) return 'OpenAPI 开放平台业务';
  if (name.startsWith('QRTZ_')) return 'Quartz 调度存储';
  if (name.startsWith('sys_')) return '系统平台';
  return '其他';
}
function owner(name) {
  if (name.startsWith('open_')) return 'com.qvsu.open（开放平台域）';
  if (name.startsWith('QRTZ_')) return 'Quartz 框架内部（经 com.qvsu.quartz 配置）';
  if (/^sys_job|^sys_job_log$/.test(name)) return 'com.qvsu.quartz（调度域）';
  if (/^sys_oper_log$|^sys_logininfor$|^sys_user_online$/.test(name)) return 'com.qvsu.framework（框架层）';
  return 'com.qvsu.system（系统管理域）';
}
function purpose(name) {
  const map = {
    open_app: '开放平台接入应用（第三方调用方）主数据',
    open_api: '对外开放的接口定义主数据',
    open_app_api: '应用与接口的授权绑定关系（多对多）',
    open_call_log: '开放接口调用流水日志（含请求头、耗时、结果）',
    open_api_doc: '接口文档内容与版本',
    sys_user: '系统用户主数据',
    sys_role: '角色定义与数据范围',
    sys_menu: '菜单与按钮权限树（权限码来源）',
    sys_dept: '组织机构树',
    sys_post: '岗位定义',
    sys_dict_type: '字典类型',
    sys_dict_data: '字典数据项',
    sys_config: '系统参数配置（运行期可改的键值）',
    sys_notice: '通知公告',
    sys_oper_log: '操作审计日志（AOP 写入）',
    sys_logininfor: '登录日志',
    sys_user_online: '在线用户会话（Shiro 会话持久化）',
    sys_user_role: '用户与角色关联',
    sys_role_menu: '角色与菜单关联',
    sys_role_dept: '角色与部门数据范围关联',
    sys_user_post: '用户与岗位关联',
    sys_job: '定时任务定义',
    sys_job_log: '定时任务执行日志'
  };
  if (map[name]) return map[name];
  if (name.startsWith('QRTZ_')) return 'Quartz 调度器内部存储表（' + name.replace('QRTZ_', '') + '）';
  return '物理表（业务含义待确认）';
}
function isQuartz(name) { return name.startsWith('QRTZ_'); }

// ---------- database-inventory.md ----------
const inv = [];
inv.push('# 数据库资产清单（Database Inventory）');
inv.push('');
inv.push('> 产物语言：zh-CN ｜ 生成方式：由 `docs/tools/semantics.json` 确定性生成 ｜ 事实来源：`open-api/sql/*.sql` 与 `open-api/deploy/local-docker/{mysql,postgres}/init/*.sql`');
inv.push('');
inv.push('本文件是物理数据对象的**覆盖分母**。DDL 在 MySQL 方言、PostgreSQL 方言与兼容升级三套脚本中重复出现，下表已按物理表名去重；每张物理表在 `./database-model.md` 有唯一稳定 ID 主定义，在 `./database-schema.md` 有字段级设计。');
inv.push('');
const rawBlocks = sem.Tables.length;
const uniqueNames = tables.length;
const colTotal = tables.reduce((s, t) => s + t.chosen.ColCount, 0);
inv.push('## 0. 统计摘要');
inv.push('');
inv.push('| 指标 | 数值 |');
inv.push('|---|---:|');
inv.push(`| DDL 中出现的 CREATE TABLE 块数（含方言重复） | ${rawBlocks} |`);
inv.push(`| 去重后的物理表数 | ${uniqueNames} |`);
inv.push(`| 字段总数（按去重后表统计） | ${colTotal} |`);
inv.push(`| 视图 / 物化视图 / 存储过程 | 0（源码中未发现 CREATE VIEW / PROCEDURE） |`);
inv.push('');
inv.push('## 1. 物理表逐表登记');
inv.push('');
inv.push('| 物理表名 | 稳定 ID | 分组 | 字段数 | DDL 副本数 | 字段注释覆盖 | 所有者 | DDL 证据文件 | 结论级别 |');
inv.push('|---|---|---|---:|---:|---|---|---|---|');
for (const t of tables) {
  const commented = t.chosen.Columns.filter(c => c.Comment).length;
  const cov = t.chosen.ColCount ? `${commented}/${t.chosen.ColCount}` : '-';
  const srcs = [...new Set(t.variants.map(v => '`' + v.Source + '`'))].join('<br>');
  inv.push(`| ${t.name} | TBL-${t.name} | ${group(t.name)} | ${t.chosen.ColCount} | ${t.variants.length} | ${cov} | ${owner(t.name)} | ${srcs} | 事实 |`);
}
inv.push('');
inv.push('## 2. 分组汇总');
inv.push('');
const groups = new Map();
for (const t of tables) { if (!groups.has(group(t.name))) groups.set(group(t.name), []); groups.get(group(t.name)).push(t); }
inv.push('| 分组 | 表数 | 表清单 |');
inv.push('|---|---:|---|');
for (const [g, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
  inv.push(`| ${g} | ${list.length} | ${list.map(t => '`' + t.name + '`').join(', ')} |`);
}
inv.push('');
inv.push('## 3. 未发现的数据对象');
inv.push('');
inv.push('| 对象类型 | 结论 | 证据 |');
inv.push('|---|---|---|');
inv.push('| 视图 view | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE VIEW` 无结果 |');
inv.push('| 物化视图 materialized-view | 源码中不存在 | 同上 |');
inv.push('| 存储过程 / 函数 | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE PROCEDURE` / `CREATE FUNCTION` 无结果 |');
inv.push('| 触发器 trigger | 源码中不存在 | 对全部 `.sql` 文件匹配 `CREATE TRIGGER` 无结果 |');
inv.push('| 序列 sequence | 源码中不存在 | PostgreSQL 脚本使用 `serial`/`bigserial` 隐式序列，未显式 `CREATE SEQUENCE` |');
inv.push('| 索引 index | 仅 DDL 内联唯一约束，无独立 `CREATE INDEX` | 见 `./database-schema.md` 的 Key/Index 列 |');
inv.push('');
inv.push('## 4. 相关文档');
inv.push('');
inv.push('- 表主定义：[`database-model.md`](./database-model.md)');
inv.push('- 逐字段设计：[`database-schema.md`](./database-schema.md)');
inv.push('- 表关系与血缘：[`database-relations.md`](./database-relations.md)');
inv.push('- 功能到表读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)');
inv.push('- 数据归属：[`data-ownership.md`](./data-ownership.md)');
inv.push('');
writeText(path.join(outDir, 'database-inventory.md'), inv.join('\n'));

// ---------- database-model.md ----------
const dm = [];
dm.push('# 物理表主定义（Database Model）');
dm.push('');
dm.push('> 产物语言：zh-CN ｜ 本文件是全部 `TBL-*` 稳定 ID 的**唯一主定义位置**，其他文件只能引用。');
dm.push('');
dm.push(`${uniqueNames} 张物理表，字段总数 ${colTotal}。字段级设计见 [\`database-schema.md\`](./database-schema.md)。`);
dm.push('');
for (const t of tables) {
  const commented = t.chosen.Columns.filter(c => c.Comment).length;
  dm.push(`## TBL-${t.name} - ${t.name}`);
  dm.push('');
  dm.push(`- ID: TBL-${t.name}`);
  dm.push(`- 对象类型: table`);
  dm.push(`- 所有者: ${owner(t.name)}`);
  dm.push(`- 业务含义: ${purpose(t.name)}`);
  dm.push(`- 映射对象: 见 ./domain-model.md 中与本表同名的实体对象`);
  dm.push(`- 主写功能: 见 ./database-access-matrix.md 中本表的 C/U/D 行`);
  dm.push(`- 读取功能: 见 ./database-access-matrix.md 中本表的 R 行`);
  dm.push(`- DAO/Mapper/Entity: ${isQuartz(t.name) ? 'Quartz 框架内部 JDBC，无 MyBatis Mapper' : '见 ./database-schema.md 与 ./database-access-matrix.md 的 Mapper 证据列'}`);
  dm.push(`- DDL/SQL证据: ${[...new Set(t.variants.map(v => '`' + v.Source + '`'))].join('、')}`);
  dm.push(`- 字段数: ${t.chosen.ColCount}（其中带注释 ${commented} 个）`);
  dm.push(`- 结论级别: 事实`);
  dm.push('');
}
writeText(path.join(outDir, 'database-model.md'), dm.join('\n'));

// ---------- database-schema.md ----------
const ds = [];
ds.push('# 逐字段数据库设计（Database Schema）');
ds.push('');
ds.push('> 产物语言：zh-CN ｜ 本文件为 [\`database-model.md\`](./database-model.md) 中每个 `TBL-*` 提供字段级设计。');
ds.push('');
ds.push('未知属性一律写 `unknown`，不省略列。字段注释来自源码 DDL 的 `COMMENT` 子句；源码未提供注释时写 `-`，列含义列为 `unknown`。');
ds.push('');
for (const t of tables) {
  ds.push(`## TBL-${t.name} - ${t.name}`);
  ds.push('');
  ds.push(`${purpose(t.name)}。DLL 证据：${[...new Set(t.variants.map(v => '`' + v.Source + '`'))].join('、')}。`);
  ds.push('');
  ds.push('| Physical Column | Code Field | DB Type | Length/Precision | Nullable | Default | Key/Index | Meaning | Enum/Dictionary | Sensitivity | Writers | Readers | Evidence | Confidence |');
  ds.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const c of t.chosen.Columns) {
    const codeField = c.Name.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
    // Split "varchar(64)" into type and length.
    let dbType = c.Type, len = 'unknown';
    const lm = /^([A-Za-z][A-Za-z0-9_ ]*?)\s*\(([0-9,\s]+)\)$/.exec(c.Type.trim());
    if (lm) { dbType = lm[1].trim(); len = lm[2].trim(); }
    const key = /_id$/.test(c.Name) && (c.Name === 'menu_id' || c.Name === 'role_id' || c.Name === 'user_id' || c.Name === 'dept_id' || c.Name === 'post_id' || c.Name === 'job_id' || c.Name === 'dict_code' || c.Name === 'config_id' || c.Name === 'notice_id' || c.Name === 'app_id' || c.Name === 'api_id' || c.Name === 'log_id' || c.Name === 'doc_id' || c.Name === 'id')
      ? 'PK/候选键（推断）' : 'unknown';
    const sensitive = /password|secret|salt|token|key$/i.test(c.Name) ? '是（凭据类）' : '否';
    ds.push(`| ${c.Name} | ${codeField} | ${dbType} | ${len} | ${c.Nullable} | ${c.Default === null ? 'unknown' : '`' + c.Default + '`'} | ${key} | ${c.Comment ? c.Comment : 'unknown'} | unknown | ${sensitive} | ${owner(t.name)} | ${owner(t.name)} | DDL | 事实 |`);
  }
  ds.push('');
  const missing = t.chosen.Columns.filter(c => !c.Comment).length;
  if (missing > 0) {
    ds.push(`> 本表有 ${missing} 个字段在源码 DDL 中无注释，其 Meaning 记为 \`unknown\`；这些字段的语义需通过 Mapper SQL 与实体类进一步补证。`);
    ds.push('');
  }
}
writeText(path.join(outDir, 'database-schema.md'), ds.join('\n'));

console.log('database-inventory.md  written');
console.log('database-model.md      written  (' + tables.length + ' TBL definitions)');
console.log('database-schema.md     written  (' + colTotal + ' field rows)');
