// analyze-ontology.js -- single source of truth for cross-model reference analysis.
// Replaces the earlier resolver/gap-report pair, whose two regexes disagreed and
// produced inconsistent counts.
//
// Also detects the prefix-collision trap in the validator's ID regex: because "-" is a
// word boundary, an ID like AGG-SYS-USER-001 also matches "SYS-USER-001", so the
// validator's vocabulary is polluted by ontology IDs. This script reports which
// ontology IDs would collide with validator prefixes.
//
// ASCII-only on purpose: Node parses .js as latin-1.
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const yamlDir = path.join(ROOT, 'docs/ontology/yaml');
const files = fs.readdirSync(yamlDir).filter(f => f.endsWith('.yaml')).sort();
const text = {};
for (const f of files) text[f] = fs.readFileSync(path.join(yamlDir, f), 'utf8');

// ---- every identifier defined anywhere in the models -------------------------
const defined = new Map(); // id -> file
for (const f of files) {
  for (const m of text[f].matchAll(/^\s*-?\s*id\s*:\s*([A-Za-z0-9_][A-Za-z0-9_.:-]*)/gm)) {
    if (!defined.has(m[1])) defined.set(m[1], f);
  }
}

// ---- every reference, using ONE consistent regex -----------------------------
const REF_RE = /^\s*([a-zA-Z]+Ref)\s*:\s*(.+?)\s*$/gm;
const refs = [];
for (const f of files) {
  for (const m of text[f].matchAll(REF_RE)) {
    const kind = m[1];
    let raw = m[2].trim();
    if (raw.startsWith('[')) {
      // inline list: split on commas
      for (const item of raw.replace(/^\[|\]$/g, '').split(',')) {
        const v = item.trim().replace(/^['"]|['"]$/g, '');
        if (v) refs.push({ file: f, kind, ref: v });
      }
      continue;
    }
    raw = raw.replace(/^['"]|['"]$/g, '');
    if (!raw || raw === 'null') continue;
    refs.push({ file: f, kind, ref: raw });
  }
}

// ---- classify ----------------------------------------------------------------
function classify(u) {
  const r = u.ref;
  const tail = r.split(':').pop().trim();
  if (defined.has(r) || defined.has(tail)) return 'RESOLVED';
  if (/^[A-Za-z]+-[A-Za-z0-9]+-[A-Za-z0-9]+-[0-9]+$/.test(r) && !defined.has(r)) return 'M1 编号未定义';
  if (/^API-/.test(r)) return 'interfaceRef 指向逆向元模型的 API-*（本体内无该命名空间）';
  if (/^OBJ-/.test(r)) return 'objectRef 指向逆向元模型的 OBJ-*（M1 使用 AGG-* 编号）';
  if (/^[a-z][A-Za-z0-9]*$/.test(r)) return 'parameterRef 为字段名，非全局 ID';
  if (/^[\u4e00-\u9fff]/.test(r)) return 'valueObjectRef 使用中文名，M1 值对象未分配 ID';
  if (/^[A-Za-z]+_[A-Za-z]+$/.test(r)) {
    if (/(OpenPage|SaveForm|CloseForm|QueryList|ResetQuery|ExportExcel|QueryDetail|ImportTemplate|ImportData|OpenResetPwd|RefreshImage|ChangeMenuStyle|SwitchSkin|LockScreen|UpdateInfo|UpdatePwd|UpdateAvatar|Logout)/.test(r)) {
      return 'M2 未建模的 UI 级动作';
    }
    return 'M2 命名不同（业务级行为）';
  }
  if (/^ROLE-|^PERM-|^CSI-/.test(r)) return 'M5 角色/权限 ID 命名不同';
  return '其他';
}

const byReason = {};
const unresolved = [];
for (const u of refs) {
  const why = classify(u);
  if (why === 'RESOLVED') continue;
  unresolved.push({ ...u, why });
  byReason[why] = (byReason[why] || 0) + 1;
}

// ---- M2 coverage by UI/report layer ------------------------------------------
const m2Ids = [...text['m2-behavior-model.yaml'].matchAll(/^\s*-?\s*id\s*:\s*([A-Za-z0-9_][A-Za-z0-9_.:-]*)/gm)].map(m => m[1]);
const referenced = new Set(refs.filter(r => r.kind === 'behaviorRef').map(r => r.ref));
const orphans = m2Ids.filter(id => !referenced.has(id));

// ---- validator prefix-collision check ----------------------------------------
const VALIDATOR_PREFIXES = ['SYS', 'MOD', 'SVC', 'DOM', 'CAP', 'SCN', 'MENU', 'ENTRY', 'FUNC', 'OBJ', 'API', 'EVENT', 'JOB', 'COMP', 'TCAP', 'COMMON', 'CAPI', 'TBL', 'STORE', 'TOPIC', 'CFG', 'RULE', 'Q'];
const collisions = [];
for (const id of defined.keys()) {
  for (const p of VALIDATOR_PREFIXES) {
    const idx = id.indexOf(p + '-');
    if (idx > 0) collisions.push({ id, matches: p, fragment: id.slice(idx) });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  files: files.length,
  definedIds: defined.size,
  totalRefs: refs.length,
  resolvedRefs: refs.length - unresolved.length,
  unresolvedRefs: unresolved.length,
  byReason,
  m2Behaviors: m2Ids.length,
  m2Referenced: m2Ids.length - orphans.length,
  m2Orphans: orphans,
  unresolved,
  validatorPrefixCollisions: collisions
};
fs.writeFileSync(path.join(ROOT, 'docs/tools/ontology-analysis.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log('yaml files              : ' + files.length);
console.log('defined ids             : ' + defined.size);
console.log('refs total              : ' + refs.length);
console.log('  resolved              : ' + report.resolvedRefs);
console.log('  unresolved            : ' + unresolved.length);
console.log('');
console.log('--- unresolved by reason ---');
for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log('  ' + String(n).padStart(4) + '  ' + r);
console.log('');
console.log('M2 behaviors            : ' + m2Ids.length + '   referenced by UI/report: ' + report.m2Referenced + '   orphans: ' + orphans.length);
console.log('');
console.log('--- validator prefix collisions (ontology ids that look like validator prefixes) ---');
console.log('  count: ' + collisions.length);
for (const c of collisions.slice(0, 8)) console.log('    ' + c.id + '  contains  ' + c.matches + '-  as  ' + c.fragment);
console.log('');
console.log('detail written: docs/tools/ontology-analysis.json');
