// check-consistency.js — independent consistency checker for the meta-model.
// Re-implements the validator's ID/link rules from scratch (no reuse of its code),
// so that a PASS here is genuine corroboration rather than a repeat of the same logic.
const fs = require('fs');
const path = require('path');

const dir = 'D:/src/github/litellmgateway/docs/meta-model';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

const PRIMARY = {
  SYS: ['technical-architecture.md'],
  MOD: ['module-index.md'], SVC: ['module-index.md'],
  DOM: ['business-architecture.md'], CAP: ['business-architecture.md'],
  SCN: ['business-architecture.md'], MENU: ['business-architecture.md'], ENTRY: ['business-architecture.md'],
  FUNC: ['functional-inventory.md'],
  OBJ: ['domain-model.md'], RULE: ['domain-model.md'],
  API: ['interface-index.md'], EVENT: ['interface-index.md'], JOB: ['interface-index.md'],
  COMP: ['technical-component-index.md'], TCAP: ['technical-component-index.md'],
  COMMON: ['common-capability-index.md'], CAPI: ['common-capability-index.md'],
  TBL: ['database-model.md'], STORE: ['database-model.md'], TOPIC: ['database-model.md'],
  CFG: ['config-index.md'],
  Q: ['PROGRESS.md']
};
const IDRE = /\b(?:SYS|MOD|SVC|DOM|CAP|SCN|MENU|ENTRY|FUNC|OBJ|API|EVENT|JOB|COMP|TCAP|COMMON|CAPI|TBL|STORE|TOPIC|CFG|RULE|Q)-[A-Za-z0-9][A-Za-z0-9._-]*/g;
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const defs = new Map();      // id -> [files with primary definition]
const defWrongFile = [];
const refs = new Map();      // id -> Set(files referencing)
const fileText = new Map();

for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  fileText.set(f, text);
  for (const m of text.matchAll(/^\s*-\s*ID:\s*((?:SYS|MOD|SVC|DOM|CAP|SCN|MENU|ENTRY|FUNC|OBJ|API|EVENT|JOB|COMP|TCAP|COMMON|CAPI|TBL|STORE|TOPIC|CFG|RULE|Q)-[A-Za-z0-9][A-Za-z0-9._-]*)/gm)) {
    const id = m[1];
    const prefix = id.split('-')[0];
    const allowed = PRIMARY[prefix] || [];
    if (!allowed.includes(f)) defWrongFile.push({ id, file: f, expected: allowed.join(', ') });
    if (!defs.has(id)) defs.set(id, []);
    defs.get(id).push(f);
  }
  for (const m of text.matchAll(IDRE)) {
    const raw = m[0];
    if (!refs.has(raw)) refs.set(raw, new Set());
    refs.get(raw).add(f);
  }
}

const dupes = [...defs].filter(([, v]) => v.length > 1);
const undefinedIds = [...refs.keys()].filter(id => !defs.has(id));

// ---- link + anchor check (independent implementation) ----
function anchorsOf(text) {
  const set = new Set();
  for (const m of text.matchAll(/<a\s+(?:name|id)=["']([^"']+)["']/gi)) set.add(m[1].toLowerCase());
  for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const h = m[1].toLowerCase().replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[^\p{L}\p{Nd}\s_-]/gu, '').trim().replace(/\s+/g, '-');
    if (h) set.add(h);
  }
  return set;
}
const deadLinks = [];
const deadAnchors = [];
for (const f of files) {
  const text = fileText.get(f);
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const raw = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(raw)) continue;
    const [targetPart, anchorPart] = raw.split('#');
    if (!targetPart) continue;
    const target = path.resolve(dir, decodeURIComponent(targetPart));
    if (!fs.existsSync(target)) { deadLinks.push(`${f} -> ${raw}`); continue; }
    if (anchorPart && target.endsWith('.md')) {
      const a = anchorsOf(fs.readFileSync(target, 'utf8'));
      if (!a.has(decodeURIComponent(anchorPart).toLowerCase())) deadAnchors.push(`${f} -> ${raw}`);
    }
  }
}

// ---- FUNC three-way correspondence ----
function headings(file, prefix) {
  const text = fileText.get(file);
  if (text === undefined) return [];
  return [...text.matchAll(new RegExp('^#{2,6}\\s+(' + prefix + '-[A-Za-z0-9][A-Za-z0-9._-]*)', 'gm'))].map(m => m[1]);
}
const funcInv = new Set(headings('functional-inventory.md', 'FUNC'));
const funcReq = new Set(headings('business-function-requirements.md', 'FUNC'));
const funcChain = new Set(headings('function-chain-index.md', 'FUNC'));
const onlyInv = [...funcInv].filter(x => !funcReq.has(x) || !funcChain.has(x));
const onlyReq = [...funcReq].filter(x => !funcInv.has(x));
const onlyChain = [...funcChain].filter(x => !funcInv.has(x));

// ---- requirement panel fields ----
const REQ_FIELDS = ['Business Goal', 'Actors', 'Trigger Entries', 'Preconditions', 'Main Steps', 'Business Rules', 'Outputs And Results', 'State Changes', 'Failure Outcomes', 'Manual Intervention', 'Permission And Data Scope', 'Implementation Chain'];
const CHAIN_SECTIONS = ['Requirement Link', 'Identity And Entry', 'Implementation Chain', 'Object Roles', 'Technical And Common Dependencies', 'Physical Data Operations', 'Rules And State', 'Closure'];
function sectionsOf(file, prefix) {
  // Line-based parser: a section starts at a heading "## <prefix>-..." and runs
  // until the next same-prefix heading. This is deliberately simple — a lazy
  // regex with a lookahead produced empty bodies on this content.
  const lines = (fileText.get(file) || '').split('\n');
  const head = new RegExp('^#{2,6}\\s+(' + prefix + '-[A-Za-z0-9._-]+)');
  const out = [];
  let cur = null;
  for (const line of lines) {
    const m = head.exec(line);
    if (m) {
      if (cur) out.push(cur);
      cur = { id: m[1], body: '' };
    } else if (cur) {
      cur.body += line + '\n';
    }
  }
  if (cur) out.push(cur);
  return out;
}
const badPanels = [];
for (const s of sectionsOf('business-function-requirements.md', 'FUNC')) {
  for (const fld of REQ_FIELDS) {
    // Field lines look like "- Actors: <non-empty>". Anchoring on the line start is
    // unnecessary: these literals never occur at another position in the body.
    if (!s.body.includes(`- ${fld}:`) || !new RegExp(esc(fld) + ':\\s*\\S').test(s.body)) {
      badPanels.push(`${s.id}: ${fld}`);
    }
  }
}
const badChains = [];
for (const s of sectionsOf('function-chain-index.md', 'FUNC')) {
  for (const h of CHAIN_SECTIONS) {
    if (!new RegExp('###\\s+' + esc(h) + '\\s*$', 'm').test(s.body)) {
      badChains.push(`${s.id}: ${h}`);
    }
  }
}

// ---- TBL model/schema correspondence ----
const tblModel = new Set(headings('database-model.md', 'TBL'));
const tblSchema = new Set(headings('database-schema.md', 'TBL'));
const tblMissingSchema = [...tblModel].filter(x => !tblSchema.has(x));
const tblOrphanSchema = [...tblSchema].filter(x => !tblModel.has(x));

// ---- non-menu index ----
const nmText = fileText.get('non-menu-function-index.md') || '';
const nmIds = new Set(headings('non-menu-function-index.md', 'FUNC'));
const invText = fileText.get('functional-inventory.md') || '';
const needNonMenu = [...sectionsOf('functional-inventory.md', 'FUNC')]
  .filter(s => /^\s*-\s*[^:\r\n]+:\s*(?:non-interactive|hybrid)\s*$/im.test(s.body))
  .map(s => s.id);
const missingNonMenu = needNonMenu.filter(id => !nmIds.has(id));

const report = {
  files: files.length,
  primaryDefinitions: defs.size,
  definitionInWrongFile: defWrongFile,
  duplicateDefinitions: dupes.map(([id, v]) => `${id}: ${v.join(', ')}`),
  undefinedIds: undefinedIds.sort(),
  deadLinks,
  deadAnchors,
  funcInventory: funcInv.size,
  funcRequirementPanels: funcReq.size,
  funcChains: funcChain.size,
  funcOnlyInInventory: onlyInv,
  funcOnlyInRequirements: onlyReq,
  funcOnlyInChains: onlyChain,
  incompletePanels: badPanels,
  incompleteChains: badChains,
  tblInModel: tblModel.size,
  tblInSchema: tblSchema.size,
  tblMissingSchema,
  tblOrphanSchema,
  nonMenuRequired: needNonMenu.length,
  nonMenuMissing: missingNonMenu
};
fs.writeFileSync('D:/src/github/litellmgateway/docs/tools/consistency-check.json', JSON.stringify(report, null, 2), 'utf8');

const errors = defWrongFile.length + dupes.length + undefinedIds.length + deadLinks.length + deadAnchors.length
  + onlyInv.length + onlyReq.length + onlyChain.length + badPanels.length + badChains.length
  + tblMissingSchema.length + tblOrphanSchema.length + missingNonMenu.length;

console.log('files                : ' + report.files);
console.log('primary definitions  : ' + report.primaryDefinitions);
console.log('wrong-file defs      : ' + defWrongFile.length);
console.log('duplicate defs       : ' + dupes.length);
console.log('undefined ids        : ' + undefinedIds.length + (undefinedIds.length ? '  -> ' + undefinedIds.slice(0, 12).join(', ') : ''));
console.log('dead links           : ' + deadLinks.length + (deadLinks.length ? '  -> ' + deadLinks.slice(0, 6).join(' | ') : ''));
console.log('dead anchors         : ' + deadAnchors.length + (deadAnchors.length ? '  -> ' + deadAnchors.slice(0, 6).join(' | ') : ''));
console.log('FUNC inv/req/chain   : ' + funcInv.size + '/' + funcReq.size + '/' + funcChain.size);
console.log('FUNC mismatches      : onlyInv=' + onlyInv.length + ' onlyReq=' + onlyReq.length + ' onlyChain=' + onlyChain.length);
console.log('incomplete panels    : ' + badPanels.length + (badPanels.length ? '  -> ' + badPanels.slice(0, 6).join(' | ') : ''));
console.log('incomplete chains    : ' + badChains.length + (badChains.length ? '  -> ' + badChains.slice(0, 6).join(' | ') : ''));
console.log('TBL model/schema     : ' + tblModel.size + '/' + tblSchema.size + '  missing=' + tblMissingSchema.length + ' orphan=' + tblOrphanSchema.length);
console.log('non-menu required    : ' + needNonMenu.length + '  missing=' + missingNonMenu.length);
console.log('TOTAL ERRORS         : ' + errors);
console.log(errors === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
