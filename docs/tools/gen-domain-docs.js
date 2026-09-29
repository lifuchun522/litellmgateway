// gen-domain-docs.js — generates domain-model.md (OBJ-* primary definitions)
// and database-access-matrix.md (function/DAO -> physical table R/C/U/D).
const fs = require('fs');
const { writeText } = require('./write-crlf');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const outDir = path.join(ROOT, 'docs/meta-model');
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); }
const assets = readJson(path.join(ROOT, 'docs/tools/assets.json'));
const sem = readJson(path.join(ROOT, 'docs/tools/semantics.json'));

// ---------------------------------------------------------------- object catalog
// category, owner module, physical table, purpose
const O = [
  // common core
  { id: 'OBJ-AjaxResult', name: 'AjaxResult', cat: 'DTO', cls: 'com/qvsu/common/core/domain/AjaxResult.java', tbl: null, note: '统一 Ajax 响应包装（继承 HashMap，含 code/msg/data）' },
  { id: 'OBJ-R', name: 'R', cat: 'DTO', cls: 'com/qvsu/common/core/domain/R.java', tbl: null, note: '泛型统一返回对象（含 code/msg/data 三字段）' },
  { id: 'OBJ-BaseEntity', name: 'BaseEntity', cat: 'value-object', cls: 'com/qvsu/common/core/domain/BaseEntity.java', tbl: null, note: '实体公共基类（searchValue/createBy/createTime/updateBy/updateTime/remark/params 共 7 字段）' },
  { id: 'OBJ-OptBaseEntity', name: 'OptBaseEntity', cat: 'value-object', cls: 'com/qvsu/common/core/domain/OptBaseEntity.java', tbl: null, note: '开放平台实体公共基类（14 字段，含审计与逻辑删除字段）' },
  { id: 'OBJ-TreeEntity', name: 'TreeEntity', cat: 'value-object', cls: 'com/qvsu/common/core/domain/TreeEntity.java', tbl: null, note: '树形实体基类（parentName/parentId/orderNum/ancestors）' },
  { id: 'OBJ-CxSelect', name: 'CxSelect', cat: 'DTO', cls: 'com/qvsu/common/core/domain/CxSelect.java', tbl: null, note: '前端级联下拉数据结构（name/value/children）' },
  { id: 'OBJ-Ztree', name: 'Ztree', cat: 'DTO', cls: 'com/qvsu/common/core/domain/Ztree.java', tbl: null, note: 'ZTree 树控件节点结构' },
  { id: 'OBJ-TableDataInfo', name: 'TableDataInfo', cat: 'DTO', cls: 'com/qvsu/common/core/page/TableDataInfo.java', tbl: null, note: '分页响应结构（total/rows/code/msg），由 PageHelper 驱动' },
  // system entities
  { id: 'OBJ-SysUser', name: 'SysUser', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysUser.java', tbl: 'sys_user', note: '用户实体（22 字段），聚合根，携带角色/岗位集合与部门引用', agg: true },
  { id: 'OBJ-SysRole', name: 'SysRole', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysRole.java', tbl: 'sys_role', note: '角色实体（10 字段），含数据范围 dataScope 与菜单勾选集合', agg: true },
  { id: 'OBJ-SysMenu', name: 'SysMenu', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysMenu.java', tbl: 'sys_menu', note: '菜单实体（12 字段），菜单树节点，权限码载体', agg: true },
  { id: 'OBJ-SysDept', name: 'SysDept', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysDept.java', tbl: 'sys_dept', note: '部门实体（12 字段），继承 TreeEntity，组织机构树节点', agg: true },
  { id: 'OBJ-SysPost', name: 'SysPost', cat: 'entity', cls: 'com/qvsu/system/domain/SysPost.java', tbl: 'sys_post', note: '岗位实体（5 字段）' },
  { id: 'OBJ-SysDictType', name: 'SysDictType', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysDictType.java', tbl: 'sys_dict_type', note: '字典类型实体（4 字段）' },
  { id: 'OBJ-SysDictData', name: 'SysDictData', cat: 'entity', cls: 'com/qvsu/common/core/domain/entity/SysDictData.java', tbl: 'sys_dict_data', note: '字典数据实体（9 字段）' },
  { id: 'OBJ-SysConfig', name: 'SysConfig', cat: 'entity', cls: 'com/qvsu/system/domain/SysConfig.java', tbl: 'sys_config', note: '参数配置实体（5 字段）' },
  { id: 'OBJ-SysNotice', name: 'SysNotice', cat: 'entity', cls: 'com/qvsu/system/domain/SysNotice.java', tbl: 'sys_notice', note: '通知公告实体（5 字段）' },
  { id: 'OBJ-SysOperLog', name: 'SysOperLog', cat: 'entity', cls: 'com/qvsu/system/domain/SysOperLog.java', tbl: 'sys_oper_log', note: '操作审计日志实体（18 字段），由 AOP 切面写入' },
  { id: 'OBJ-SysLogininfor', name: 'SysLogininfor', cat: 'entity', cls: 'com/qvsu/system/domain/SysLogininfor.java', tbl: 'sys_logininfor', note: '登录日志实体（9 字段）' },
  { id: 'OBJ-SysUserOnline', name: 'SysUserOnline', cat: 'entity', cls: 'com/qvsu/system/domain/SysUserOnline.java', tbl: 'sys_user_online', note: '在线用户会话实体（10 字段），Shiro 会话持久化载体' },
  // join entities
  { id: 'OBJ-SysUserRole', name: 'SysUserRole', cat: 'entity', cls: 'com/qvsu/system/domain/SysUserRole.java', tbl: 'sys_user_role', note: '用户-角色关联实体（2 字段）' },
  { id: 'OBJ-SysRoleMenu', name: 'SysRoleMenu', cat: 'entity', cls: 'com/qvsu/system/domain/SysRoleMenu.java', tbl: 'sys_role_menu', note: '角色-菜单关联实体（2 字段）' },
  { id: 'OBJ-SysRoleDept', name: 'SysRoleDept', cat: 'entity', cls: 'com/qvsu/system/domain/SysRoleDept.java', tbl: 'sys_role_dept', note: '角色-部门数据范围关联实体（2 字段）' },
  { id: 'OBJ-SysUserPost', name: 'SysUserPost', cat: 'entity', cls: 'com/qvsu/system/domain/SysUserPost.java', tbl: 'sys_user_post', note: '用户-岗位关联实体（2 字段）' },
  // quartz
  { id: 'OBJ-SysJob', name: 'SysJob', cat: 'entity', cls: 'com/qvsu/quartz/domain/SysJob.java', tbl: 'sys_job', note: '定时任务定义实体（10 字段），含 cronExpression 与调用目标' },
  { id: 'OBJ-SysJobLog', name: 'SysJobLog', cat: 'entity', cls: 'com/qvsu/quartz/domain/SysJobLog.java', tbl: 'sys_job_log', note: '定时任务执行日志实体（9 字段）' },
  // open domain
  { id: 'OBJ-OpenApp', name: 'OpenApp', cat: 'entity', cls: 'com/qvsu/open/domain/OpenApp.java', tbl: 'open_app', note: '开放平台接入应用实体（7 字段），聚合根，含应用密钥', agg: true },
  { id: 'OBJ-OpenApi', name: 'OpenApi', cat: 'entity', cls: 'com/qvsu/open/domain/OpenApi.java', tbl: 'open_api', note: '对外开放接口定义实体（10 字段），聚合根', agg: true },
  { id: 'OBJ-OpenAppApi', name: 'OpenAppApi', cat: 'entity', cls: 'com/qvsu/open/domain/OpenAppApi.java', tbl: 'open_app_api', note: '应用-接口授权关联实体（2 字段），多对多关系载体' },
  { id: 'OBJ-OpenCallLog', name: 'OpenCallLog', cat: 'entity', cls: 'com/qvsu/open/domain/OpenCallLog.java', tbl: 'open_call_log', note: '开放接口调用日志实体（13 字段），网关写入' },
  { id: 'OBJ-OpenApiDoc', name: 'OpenApiDoc', cat: 'entity', cls: 'com/qvsu/open/domain/OpenApiDoc.java', tbl: 'open_api_doc', note: '接口文档实体（5 字段）' },
  // open model (non-persistent)
  { id: 'OBJ-OpenAuthContext', name: 'OpenAuthContext', cat: 'value-object', cls: 'com/qvsu/open/model/OpenAuthContext.java', tbl: null, note: '网关鉴权上下文（承载调用方应用、凭据解析结果），非持久化' },
  { id: 'OBJ-OpenResult', name: 'OpenResult', cat: 'DTO', cls: 'com/qvsu/open/model/OpenResult.java', tbl: null, note: '开放平台统一返回结构，非持久化' }
];

const objByTable = new Map();
for (const o of O) if (o.tbl) objByTable.set(o.tbl, o);

// ---------------------------------------------------------------- domain-model.md
const L = [];
L.push('# 领域对象模型（Domain Model）');
L.push('');
L.push('> 产物语言：zh-CN ｜ 本文件是全部 `OBJ-*` 稳定 ID 的**唯一主定义位置**。');
L.push('');
L.push(`共 ${O.length} 个对象，全部来自 ` + '`open-api/qvsu-openapi/src/main/java` 下的 `domain` 与 `model` 包，以及 `common/core/domain` 的基类与响应结构。');
L.push('');
L.push('## 0. 对象分类汇总');
L.push('');
const catCount = new Map();
for (const o of O) catCount.set(o.cat, (catCount.get(o.cat) || 0) + 1);
L.push('| 类别 | 数量 | 对象 |');
L.push('|---|---:|---|');
for (const [c, n] of [...catCount].sort((a, b) => b[1] - a[1])) {
  L.push(`| ${c} | ${n} | ${O.filter(o => o.cat === c).map(o => o.name).join(', ')} |`);
}
L.push('');
L.push('## 1. 对象与物理表映射');
L.push('');
L.push('| 对象 | 类别 | 物理表 | 聚合根 |');
L.push('|---|---|---|---|');
for (const o of O) {
  L.push(`| ${o.name} | ${o.cat} | ${o.tbl ? '`' + o.tbl + '`' : '（无，非持久化）'} | ${o.agg ? '是' : '否'} |`);
}
L.push('');
L.push('## 2. 对象主定义');
L.push('');
for (const o of O) {
  L.push(`## ${o.id} - ${o.name}`);
  L.push('');
  L.push(`- ID: ${o.id}`);
  L.push(`- 类别: ${o.cat}`);
  L.push(`- 所有者: ${o.tbl && o.tbl.startsWith('open_') ? 'com.qvsu.open（开放平台域）' : o.tbl && o.tbl.startsWith('sys_job') ? 'com.qvsu.quartz（调度域）' : 'com.qvsu.system / com.qvsu.common（系统与公共域）'}`);
  L.push(`- 业务或契约含义: ${o.note}`);
  L.push(`- 字段摘要或字段表: ${o.tbl ? '字段设计见 [`database-schema.md`](./database-schema.md) 中 `TBL-' + o.tbl + '` 一节' : '非持久化对象，无对应物理字段表'}`);
  L.push(`- 生命周期/状态: ${o.tbl ? '由对应 Mapper 在事务内创建、更新与逻辑删除' : '随单次请求创建与销毁'}`);
  L.push(`- 映射物理表/接口: ${o.tbl ? '`' + o.tbl + '`（主定义见 [`database-model.md`](./database-model.md)）' : '无物理表，作为请求/响应或上下文载体'}`);
  L.push(`- 核心功能: 见 [\`functional-inventory.md\`](./functional-inventory.md) 与 [\`database-access-matrix.md\`](./database-access-matrix.md)`);
  L.push(`- 外部消费者: ${o.tbl === 'open_app' || o.tbl === 'open_api' || o.tbl === 'open_call_log' || o.tbl === 'open_api_doc' || o.tbl === 'open_app_api' ? '开放平台第三方调用方（经网关）与管理页面' : '后台管理页面与框架内部组件'}`);
  L.push(`- 代码落点: \`open-api/qvsu-openapi/src/main/java/${o.cls}\``);
  L.push('');
}
L.push('## 3. 对象继承关系');
L.push('');
L.push('| 派生对象 | 基类 | 说明 |');
L.push('|---|---|---|');
for (const o of O) {
  if (o.cls.includes('/entity/') || /Sys(Job|Post|Config|Notice|OperLog|Logininfor|UserOnline)|Open(App|Api|CallLog|ApiDoc)/.test(o.name)) {
    const base = /SysDept/.test(o.name) ? 'TreeEntity' : /Open(App|Api|CallLog|ApiDoc|AppApi)/.test(o.name) ? 'OptBaseEntity' : 'BaseEntity';
    if (base !== o.name) L.push(`| ${o.name} | ${base} | 继承公共审计字段 |`);
  }
}
L.push('');
L.push('## 4. 无实体映射的物理表');
L.push('');
L.push('以下物理表由框架或 SQL 直接管理，无对应 Java 实体类，属于**已知缺口**，其字段语义只能由 DDL 与 SQL 证据支撑：');
L.push('');
const allTables = [...new Set(sem.Tables.map(t => t.Name))].sort();
const noEntity = allTables.filter(t => !objByTable.has(t));
L.push('| 物理表 | 原因 | 证据 |');
L.push('|---|---|---|');
for (const t of noEntity) {
  const reason = t.startsWith('QRTZ_') ? 'Quartz 框架内部 JDBC 直连，无 MyBatis 实体' : '关联表/由 SQL 直接维护，源码中未建独立实体';
  L.push(`| \`${t}\` | ${reason} | 全量扫描 \`src/main/java\` 无同名或近似实体类 |`);
}
L.push('');
L.push('## 5. 相关文档');
L.push('');
L.push('- 表主定义：[`database-model.md`](./database-model.md)');
L.push('- 字段设计：[`database-schema.md`](./database-schema.md)');
L.push('- 读写矩阵：[`database-access-matrix.md`](./database-access-matrix.md)');
L.push('- 数据归属：[`data-ownership.md`](./data-ownership.md)');
L.push('');
writeText(path.join(outDir, 'domain-model.md'), L.join('\n'));

// ---------------------------------------------------------------- database-access-matrix.md
// Derived from the function catalog embedded in gen-core-docs.js; recomputed here
// by re-parsing functional-inventory.md so both stay consistent.
const fiText = fs.readFileSync(path.join(outDir, 'functional-inventory.md'), 'utf8');
const fnRows = [...fiText.matchAll(/^\| (FUNC-[A-Za-z0-9._-]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)]
  .map(m => ({ id: m[1], name: m[2].trim(), type: m[3].trim(), module: m[8].trim() }));
// Re-read the chain index for the authoritative per-function table operations.
const chainText = fs.readFileSync(path.join(outDir, 'function-chain-index.md'), 'utf8');
const chainBlocks = [...chainText.matchAll(/^## (FUNC-[A-Za-z0-9._-]+) - (.+)$/gm)];
const ops = new Map();
for (let i = 0; i < chainBlocks.length; i++) {
  const start = chainBlocks[i].index;
  const end = i + 1 < chainBlocks.length ? chainBlocks[i + 1].index : chainText.length;
  const block = chainText.slice(start, end);
  const rows = [...block.matchAll(/^\| (\w+) \| (是|-) \| (是|-) \| (是|-) \| (是|-) \|/gm)]
    .map(m => ({ table: m[1], R: m[2] === '是', C: m[3] === '是', U: m[4] === '是', D: m[5] === '是' }));
  ops.set(chainBlocks[i][1], { name: chainBlocks[i][2], rows });
}

const M = [];
M.push('# 功能到物理表读写矩阵（Database Access Matrix）');
M.push('');
M.push('> 产物语言：zh-CN ｜ 本文件不含 ID 主定义，`FUNC-*` 主定义见 [`functional-inventory.md`](./functional-inventory.md)，`TBL-*` 主定义见 [`database-model.md`](./database-model.md)。');
M.push('');
M.push('R=读取，C=新增，U=更新，D=删除。矩阵按功能维度聚合，数据源为各功能的实现主链（[`function-chain-index.md`](./function-chain-index.md)）。');
M.push('');
M.push('## 1. 功能 × 物理表矩阵');
M.push('');
M.push('| 功能 | 功能名 | 物理表 | R | C | U | D |');
M.push('|---|---|---|---|---|---|---|');
for (const [id, v] of ops) {
  if (!v.rows.length) {
    M.push(`| ${id} | ${v.name} | （无） | - | - | - | - |`);
    continue;
  }
  for (const r of v.rows) {
    M.push(`| ${id} | ${v.name} | \`${r.table}\` | ${r.R ? '是' : '-'} | ${r.C ? '是' : '-'} | ${r.U ? '是' : '-'} | ${r.D ? '是' : '-'} |`);
  }
}
M.push('');
M.push('## 2. 物理表 × 功能矩阵（反向索引）');
M.push('');
M.push('| 物理表 | 写入功能 | 读取功能 | 写入功能数 | 读取功能数 |');
M.push('|---|---|---|---:|---:|');
const byTable = new Map();
for (const [id, v] of ops) {
  for (const r of v.rows) {
    if (!byTable.has(r.table)) byTable.set(r.table, { w: [], rd: [] });
    const e = byTable.get(r.table);
    if (r.C || r.U || r.D) e.w.push(id);
    if (r.R) e.rd.push(id);
  }
}
for (const [t, e] of [...byTable].sort()) {
  M.push(`| \`${t}\` | ${e.w.join(', ') || '-'} | ${e.rd.join(', ') || '-'} | ${e.w.length} | ${e.rd.length} |`);
}
M.push('');
M.push('## 3. 无功能写入的物理表');
M.push('');
M.push('| 物理表 | 说明 |');
M.push('|---|---|');
for (const t of allTables) {
  if (!byTable.has(t)) {
    const why = t.startsWith('QRTZ_') ? 'Quartz 调度器内部表，由框架 JDBC 维护，不由业务功能直接写入' : '仅由初始化 SQL 种子脚本写入，运行期无业务功能写入';
    M.push(`| \`${t}\` | ${why} |`);
  }
}
M.push('');
M.push('## 4. Mapper 语句到表映射');
M.push('');
M.push('| Mapper 文件 | 命名空间 | 语句 ID | 类型 |');
M.push('|---|---|---|---|');
for (const d of assets.DaoMethods) {
  M.push(`| \`${d.Path}\` | ${d.Namespace || '-'} | ${d.Id} | ${d.Kind} |`);
}
M.push('');
M.push('## 5. 相关文档');
M.push('');
M.push('- 表关系与血缘：[`database-relations.md`](./database-relations.md)');
M.push('- 数据归属与冲突：[`data-ownership.md`](./data-ownership.md)');
M.push('- 逐字段设计：[`database-schema.md`](./database-schema.md)');
M.push('');
writeText(path.join(outDir, 'database-access-matrix.md'), M.join('\n'));

console.log('domain-model.md            written (' + O.length + ' OBJ definitions)');
console.log('database-access-matrix.md  written (' + ops.size + ' functions, ' + byTable.size + ' tables touched)');
console.log('tables without entity      : ' + noEntity.length);
