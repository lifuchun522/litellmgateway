// extract-assets.js — single deterministic source-asset extractor for the codebase-reverse
// meta-model. Mirrors the discovery rules of the skill's validate_meta_model.ps1 so that
// source-asset-inventory.md covers 100% of validator-discovered assets.
//
// This replaces the earlier PowerShell extractor. Node is used deliberately: Windows
// PowerShell 5.1 mis-decodes UTF-8 (Get-Content -Raw), collapses single-element arrays in
// ConvertTo-Json, and the sandbox mangles backslash-heavy regular expressions in PS source.
//
// Usage:  node docs/tools/extract-assets.js [sourceRoot] [outDir]
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const sourceRoot = path.resolve(process.argv[2] || path.join(ROOT, 'open-api'));
const outDir = path.resolve(process.argv[3] || path.join(ROOT, 'docs/tools'));

// Same allow-list and exclusion pattern as the validator (validate_meta_model.ps1:320-321).
const ALLOWED = ['.java', '.kt', '.cs', '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.php', '.rb', '.xml', '.sql', '.yml', '.yaml', '.properties', '.gradle'];
const EXCLUDED = /(^|\/)(node_modules|vendor|build|dist|target|bin|obj|\.git|coverage)(\/|$)/i;

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const rel = p => path.relative(sourceRoot, p).split(path.sep).join('/');

// Reads the first "@Name(" argument including nested parentheses.
function annotationArg(content, name, from = 0) {
  const idx = content.indexOf('@' + name + '(', from);
  if (idx < 0) return { arg: null, index: -1 };
  let i = idx + name.length + 2;
  let depth = 1;
  let out = '';
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (depth === 0) break; }
    out += ch;
    i++;
  }
  return { arg: out, index: idx };
}
// Route literals: quoted strings starting with "/" or "word/" (validator rule).
function routeTokens(arg) {
  if (!arg) return [];
  const out = [];
  for (const m of arg.matchAll(/["']([^"']+)["']/g)) {
    if (/^(?:\/|[A-Za-z0-9_.-]+\/)/.test(m[1])) out.push(m[1]);
  }
  return out;
}

const files = [], routes = [], jobs = [], ddlObjects = [], sqlStatements = [];
const daoMethods = [], configKeys = [], permissionCodes = [], warnings = [];

const inScope = walk(sourceRoot, []).filter(p => {
  const r = rel(p);
  return ALLOWED.includes(path.extname(p).toLowerCase()) && !EXCLUDED.test(r);
});

for (const full of inScope) {
  const r = rel(full);
  let content;
  try { content = fs.readFileSync(full, 'utf8'); }
  catch { warnings.push('unreadable: ' + r); continue; }
  const ext = path.extname(full).toLowerCase();
  const base = path.basename(full);

  let entryKind = 'none';
  if (/@RestController/.test(content)) entryKind = 'RestController';
  else if (/@Controller/.test(content)) entryKind = 'Controller';
  else if (/@(?:XxlJob|Scheduled|KafkaListener|RabbitListener|JmsListener)/.test(content)) entryKind = 'Scheduled';

  const isDao = /(Dao|Mapper|Repository)\.(java|kt|cs|ts)$/i.test(base);
  const isModel = /(Entity|Model|DTO|VO|Command|Query|Event|Enum|Config)\.(java|kt|cs|ts)$/i.test(base);

  let module = 'other';
  let m;
  if ((m = /qvsu-openapi\/src\/main\/java\/com\/qvsu\/([a-zA-Z]+)\//.exec(r))) module = m[1];
  else if (r.includes('src/main/resources/templates')) module = 'views';
  else if (r.includes('src/main/resources/static')) module = 'static';
  else if (r.startsWith('sql/')) module = 'sql';
  else if (r.startsWith('deploy/')) module = 'deploy';

  let className = null, classKind = null;
  if (ext === '.java') {
    const cm = /^\s*(?:public\s+)?(?:final\s+)?(?:abstract\s+)?(class|interface|enum|@interface)\s+([A-Za-z_][A-Za-z0-9_]*)/m.exec(content);
    if (cm) { classKind = cm[1]; className = cm[2]; }
  }

  files.push({
    Path: r, Extension: ext, Module: module, Size: fs.statSync(full).size,
    ClassName: className, ClassKind: classKind, EntryKind: entryKind,
    IsDao: isDao, IsModel: isModel,
    IsValidatorAsset: isDao || isModel || entryKind !== 'none',
    Lines: content.split('\n').length
  });

  // ---- REST routes -------------------------------------------------------
  let firstMethodIndex = Infinity;
  for (const mn of ['GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping']) {
    const i = content.indexOf('@' + mn + '(');
    if (i >= 0 && i < firstMethodIndex) firstMethodIndex = i;
  }
  let classPrefix = '';
  let classRequestMappingIndex = -1;
  const rm = annotationArg(content, 'RequestMapping', 0);
  if (rm.index >= 0 && rm.index < firstMethodIndex) {
    classRequestMappingIndex = rm.index;
    const t = routeTokens(rm.arg);
    if (t.length) classPrefix = t[0];
  }
  for (const mn of ['GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping', 'RequestMapping']) {
    for (const mm of content.matchAll(new RegExp('@' + mn + '\\s*\\(', 'g'))) {
      if (mn === 'RequestMapping' && mm.index === classRequestMappingIndex) continue;
      if (classRequestMappingIndex >= 0 && mm.index < classRequestMappingIndex) continue;
      const a = annotationArg(content, mn, mm.index);
      const tokens = routeTokens(a.arg);
      if (!tokens.length) continue;
      const after = content.slice(mm.index);
      const sig = /\)\s*(?:@[A-Za-z][A-Za-z0-9_.]*(?:\([^)]*\))?\s*)*(?:public|protected|private)\s+[\w<>[\],.\s?]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(after);
      const method = sig ? sig[1] : 'unknown';
      const httpMethod = { GetMapping: 'GET', PostMapping: 'POST', PutMapping: 'PUT', DeleteMapping: 'DELETE', PatchMapping: 'PATCH' }[mn] || 'ANY';
      for (const t of tokens) {
        let full2 = classPrefix + t;
        if (!full2.startsWith('/')) full2 = '/' + full2;
        full2 = full2.replace(/\/{2,}/g, '/');
        routes.push({ Path: r, ClassName: className, Method: method, HttpMethod: httpMethod, Annotation: mn, Token: t, ClassPrefix: classPrefix, FullPath: full2 });
      }
    }
  }

  // ---- scheduled / event triggers ---------------------------------------
  for (const jn of ['XxlJob', 'KafkaListener', 'RabbitListener', 'JmsListener', 'Scheduled']) {
    for (const mm of content.matchAll(new RegExp('@' + jn + '\\s*\\(', 'g'))) {
      const a = annotationArg(content, jn, mm.index);
      const tm = /["']([^"']+)["']/.exec(a.arg || '');
      jobs.push({ Path: r, ClassName: className, Method: 'unknown', Kind: jn, Token: tm ? tm[1] : null, Argument: a.arg });
    }
  }

  // ---- permission codes -------------------------------------------------
  for (const pm of content.matchAll(/@(?:RequiresPermissions|PreAuthorize)\s*\(([^)]*)\)/g)) {
    for (const lit of pm[1].matchAll(/["']([^"']+)["']/g)) permissionCodes.push(lit[1]);
  }

  // ---- SQL --------------------------------------------------------------
  if (ext === '.sql') {
    for (const d of content.matchAll(/\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW|MATERIALIZED\s+VIEW)\s+([A-Za-z0-9_."`[\]]+)/gi)) {
      ddlObjects.push({ Path: r, Object: d[1].replace(/["`[\]]/g, ''), Raw: d[0] });
    }
    for (const s of content.matchAll(/^\s*(INSERT\s+INTO|ALTER\s+TABLE|CREATE\s+INDEX|DROP\s+TABLE|UPDATE|DELETE\s+FROM)\s+([A-Za-z0-9_."`[\]]+)/gim)) {
      sqlStatements.push({ Path: r, Verb: s[1].toUpperCase(), Target: s[2].replace(/["`[\]]/g, '') });
    }
  }

  // ---- MyBatis mapper XML ----------------------------------------------
  if (ext === '.xml' && r.includes('/mapper/')) {
    const ns = /namespace\s*=\s*"([^"]+)"/.exec(content);
    for (const s of content.matchAll(/<(select|insert|update|delete)\s+id\s*=\s*"([^"]+)"/g)) {
      daoMethods.push({ Path: r, Namespace: ns ? ns[1] : null, Kind: s[1], Id: s[2] });
    }
  }

  // ---- configuration ----------------------------------------------------
  if (ext === '.properties') {
    for (const k of content.matchAll(/^\s*([A-Za-z0-9_.-]+)\s*=/gm)) configKeys.push({ Path: r, Key: k[1], Value: '' });
  } else if (ext === '.yml' || ext === '.yaml') {
    const stack = [];
    for (const line of content.split('\n')) {
      if (/^\s*#/.test(line) || !line.trim()) continue;
      const km = /^(\s*)([A-Za-z0-9_.-]+):(\s+(.*))?$/.exec(line);
      if (!km) continue;
      const indent = km[1].length;
      const key = km[2];
      const inline = km[4];
      while (stack.length && stack[stack.length - 1].Indent >= indent) stack.pop();
      const fullKey = stack.length ? stack[stack.length - 1].Key + '.' + key : key;
      if (inline === undefined || !inline.trim()) stack.push({ Indent: indent, Key: fullKey });
      else configKeys.push({ Path: r, Key: fullKey, Value: inline.trim() });
    }
  }
}

// Manual de-duplication (order-preserving).
function uniqBy(items, keyFn) {
  const seen = new Set(), out = [];
  for (const it of items) {
    const k = keyFn(it);
    if (seen.has(k)) continue;
    seen.add(k); out.push(it);
  }
  return out;
}

const payload = {
  GeneratedAt: new Date().toISOString(),
  SourceRoot: sourceRoot,
  InScopeFiles: inScope.length,
  Files: files,
  Routes: routes,
  Jobs: jobs,
  DdlObjects: ddlObjects,
  SqlStatements: sqlStatements,
  DaoMethods: daoMethods,
  ConfigKeys: uniqBy(configKeys, c => c.Path + '|' + c.Key + '|' + c.Value),
  PermissionCodes: [...new Set(permissionCodes)].sort(),
  Warnings: warnings
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'assets.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log('in-scope files        : ' + inScope.length);
console.log('validator assets      : ' + files.filter(f => f.IsValidatorAsset).length + ' (entry/DAO/model)');
console.log('route tokens          : ' + routes.length);
console.log('distinct class prefixes: ' + [...new Set(routes.map(r => r.ClassPrefix).filter(Boolean))].length);
console.log('scheduled/event       : ' + jobs.length);
console.log('DDL objects           : ' + ddlObjects.length);
console.log('mapper statements     : ' + daoMethods.length);
console.log('config keys           : ' + payload.ConfigKeys.length);
console.log('permission codes      : ' + payload.PermissionCodes.length);
console.log('warnings              : ' + warnings.length);
console.log('written               : ' + path.join(outDir, 'assets.json'));
