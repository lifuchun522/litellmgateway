// ontology-gap-report.js -- renders the cross-model reconciliation gap report from the
// single analysis produced by analyze-ontology.js. Keeping one analysis source prevents
// the two scripts from disagreeing on counts.
//
// ASCII-only on purpose: Node parses .js as latin-1.
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/tools/ontology-analysis.json'), 'utf8'));

const ADVICE = {
  'M2 未建模的 UI 级动作': '在 M2 补齐 UI 级 USER_ACTION 行为，或在 MU 改引业务级行为（二选一，保持一致）',
  'M2 命名不同（业务级行为）': '建立别名映射表并回写 MU / M7',
  'parameterRef 为字段名，非全局 ID': '在 M1 属性上建立字段名索引，使 parameterRef 可解析',
  'M5 角色/权限 ID 命名不同': '统一角色与权限 ID 命名空间（ROLE-* / 权限码）',
  'valueObjectRef 使用中文名，M1 值对象未分配 ID': '为 M1 值对象分配 VO-* ID 并回写引用',
  'interfaceRef 指向逆向元模型的 API-*（本体内无该命名空间）': '在 M7 头部声明 interfaceRef 的命名空间为逆向元模型，或改写为 M2 行为引用',
  'M1 编号未定义': '补齐 M1 聚合根编号',
  '其他': '逐条人工确认'
};

const byFile = {};
const byFileKind = {};
for (const u of a.unresolved) {
  byFile[u.file] = (byFile[u.file] || 0) + 1;
  const k = u.file + '|' + u.kind;
  byFileKind[k] = (byFileKind[k] || 0) + 1;
}

const L = [];
L.push('# 本体模型跨模型引用差异报告（Cross-Model Reconciliation Gap Report）');
L.push('');
L.push('> 由 `docs/tools/ontology-gap-report.js` 依据 `docs/tools/ontology-analysis.json` 渲染；');
L.push('> 分析数据由 `docs/tools/analyze-ontology.js` 产出，两者共用同一份解析结果，计数不会互相矛盾。');
L.push('');
L.push('## 1. 结论摘要');
L.push('');
L.push('七模型 YAML（M1/M2/M3/M5/M6/M7/MU）**全部可解析、结构完整**（python `yaml.safe_load` 逐个通过，`model_type` 分别为 OBJECT/BEHAVIOR/RULE/ACTOR/FLOW/REPORT/UI）。');
L.push('');
L.push('但**跨模型引用尚未闭环**：各模型由独立建模过程产出、ID 体系不同，因此存在系统性命名差异。');
L.push('');
L.push('| 指标 | 数值 |');
L.push('|---|---:|');
L.push(`| YAML 文件数 | ${a.files} |`);
L.push(`| 模型内已定义 ID 总数 | ${a.definedIds} |`);
L.push(`| 引用总数 | ${a.totalRefs} |`);
L.push(`| 已解析引用 | ${a.resolvedRefs} |`);
L.push(`| **未解析引用** | **${a.unresolvedRefs}** |`);
L.push(`| M2 行为总数 | ${a.m2Behaviors} |`);
L.push(`| 被 MU / M7 引用的 M2 行为 | ${a.m2Referenced} |`);
L.push(`| **未被任何 UI / 报表引用的 M2 行为** | **${a.m2Orphans.length}** |`);
L.push('');
L.push('这**不是解析失败**，而是需要区分性质的两类问题：');
L.push('');
L.push('1. **真实建模缺口（层级不一致）**：技能一致性门禁要求「M2 `triggerType=USER_ACTION` 行为须被至少一个 MU 操作功能点引用」。本项目的 M2 建成**业务级行为**（如 `SysUser_Add`），MU 却建到 **UI 级交互**（如 `SysUser_SaveForm`、`SysUser_OpenPage`、`SysUser_ResetQuery`）。两层之间存在层级差，故 MU 的部分 `behaviorRef` 在 M2 中本就不存在。');
L.push('2. **命名空间未对齐**：M7 的 `interfaceRef` 指向**逆向元模型**的 `API-*` 节点；`parameterRef` 使用字段名；M1 值对象使用中文名。这些在本体 YAML 内没有对应命名空间。');
L.push('');
L.push('## 2. 未解析引用的原因分布');
L.push('');
L.push('| 原因 | 条数 | 占比 | 处理建议 |');
L.push('|---|---:|---:|---|');
for (const [r, n] of Object.entries(a.byReason).sort((x, y) => y[1] - x[1])) {
  const pct = ((n / a.unresolvedRefs) * 100).toFixed(1) + '%';
  L.push(`| ${r} | ${n} | ${pct} | ${ADVICE[r] || '逐条人工确认'} |`);
}
L.push('');
L.push('## 3. 按文件与引用类型的未解析分布');
L.push('');
L.push('| 文件 | 引用类型 | 未解析数 |');
L.push('|---|---|---:|');
for (const [k, n] of Object.entries(byFileKind).sort((x, y) => y[1] - x[1])) {
  const [f, kind] = k.split('|');
  L.push(`| \`${f}\` | ${kind} | ${n} |`);
}
L.push('');
L.push('| 文件 | 合计 |');
L.push('|---|---:|');
for (const [f, n] of Object.entries(byFile).sort((x, y) => y[1] - x[1])) L.push(`| \`${f}\` | ${n} |`);
L.push('');
L.push('## 4. M2 行为被引用情况（技能门禁对账）');
L.push('');
if (a.m2Orphans.length) {
  L.push(`以下 **${a.m2Orphans.length}** 个 M2 行为未被任何 MU 界面或 M7 报表引用。按技能门禁，这些行为在 UI 层缺少落点，需要补充 MU 引用，或确认其为系统级触发（此时应从 USER_ACTION 改为相应触发类型）：`);
  L.push('');
  for (const o of a.m2Orphans) L.push(`- \`${o}\``);
} else {
  L.push('全部 M2 行为均被 MU 或 M7 引用，门禁满足。');
}
L.push('');
L.push('## 5. 与官方校验器的命名空间冲突（潜在风险，当前未触发）');
L.push('');
L.push('官方校验器的 ID 正则使用 `\\b` 词边界，而 `-` 也是词边界，因此形如 `AGG-SYS-USER-001` 的 ID **会被解析出** `SYS-USER-001`，`AGG-OPEN-API-001` 会被解析出 `API-001`。本项目中：');
L.push('');
L.push('| 项 | 值 |');
L.push('|---|---:|');
L.push(`| 与校验器前缀冲突的本体 ID 数 | ${a.validatorPrefixCollisions.length} |`);
L.push('| 当前是否影响校验结论 | **否** |');
L.push('');
L.push('**为什么不影响**：校验器只扫描 `-MetaModelPath`（本次为 `docs/meta-model`）下的 Markdown，而七模型 YAML 位于 `docs/ontology/yaml/`，不在扫描范围内。所有 25 个元模型文件都不含任何完整本体 ID（已核验为 0 处引用）。');
L.push('');
L.push('**何时会触发**：若将来把本体 YAML 或引用本体 ID 的文档放入 `docs/meta-model`，校验器会把这些碎片当作 `SYS-*` / `MENU-*` / `API-*` 引用并要求主定义，从而产生大量误报。规避办法是在**本体命名空间内不要使用 `SYS-`、`MENU-`、`API-` 等作为中段**，或保持本体目录与校验目录分离。');
L.push('');
L.push('## 6. 建议的收敛路径');
L.push('');
L.push('1. **建立共享 ID 注册表**：在 `docs/ontology/` 增加 `id-registry.md`，规定每类对象的 ID 格式与命名空间归属，七个模型共同遵守。');
L.push('2. **补 UI 级行为或改引业务级行为**：把 MU 中高频 UI 动作（`OpenPage` / `SaveForm` / `CloseForm` / `ResetQuery` / `QueryList` / `ExportExcel`）在 M2 补齐为 `USER_ACTION` 行为，或让 MU 直接引用业务级行为。二选一，但必须全量一致。');
L.push('3. **对齐逆向 ID**：在 M1 / M7 中显式声明与逆向元模型 ID（`OBJ-*`、`API-*`、`TBL-*`）的映射字段（如 `legacyObjectRef`、`legacyApiRef`），使本体与逆向结果可双向追溯。');
L.push('4. **字段名索引**：为 M1 属性建立字段名 → 属性 ID 索引，使 `parameterRef` 可解析。');
L.push('5. **复验**：收敛后重跑 `node docs/tools/analyze-ontology.js`，目标为「未解析引用 = 0」且「M2 孤儿行为 = 0」。');
L.push('');
L.push('## 7. 明确不掩盖的结论');
L.push('');
L.push(`本体模型当前**未通过技能的一致性门禁**：${a.unresolvedRefs} 条跨模型引用无法解析，${a.m2Orphans.length} 个 M2 行为未被 UI 引用。`);
L.push('');
L.push('模型本身可解析、结构完整、内容可用于后续开发与阅读，但**不能声明为"已闭环"**。本报告与 `PROGRESS.md` 的 `Q-*` 条目共同构成未决问题台账。');
L.push('');

fs.writeFileSync(path.join(ROOT, 'docs/ontology/03-cross-model-gaps.md'),
  L.map(s => s + '\r\n').join(''), 'utf8');

console.log('gap report written: docs/ontology/03-cross-model-gaps.md');
console.log('  unresolved refs : ' + a.unresolvedRefs);
console.log('  M2 orphans      : ' + a.m2Orphans.length + ' / ' + a.m2Behaviors);
console.log('  collisions      : ' + a.validatorPrefixCollisions.length + ' (latent, out of validator scope)');
