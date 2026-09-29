// extract-menus.js — parses sys_menu INSERT statements from every .sql file under open-api.
//
// Why this must cover all SQL files: the open-api/ copies and the deploy/ docker-init copies
// are not identical. `sql/quartz.sql` contributes menu_id=110 (/monitor/job) plus seven
// monitor:job:* button permissions that appear in no other file, so scanning only the
// open-api/sql directory silently under-counts the real menu set.
//
// Note: values are read from the whole parenthesised value list rather than from
// `\(([^()]*)\)` tuple matches, because a row containing a function call such as SYSDATE()
// truncates the tuple match and yields an empty capture.
const fs = require('fs');
const path = require('path');

const root = 'D:/src/github/litellmgateway/open-api';
const outFile = 'D:/src/github/litellmgateway/docs/tools/menus.json';

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const cols = ['menu_id', 'menu_name', 'parent_id', 'order_num', 'url', 'target', 'menu_type', 'visible', 'status', 'perms', 'icon', 'create_by', 'create_time', 'update_by', 'update_time', 'remark'];
const rows = [];
for (const f of walk(root, []).filter(x => x.endsWith('.sql'))) {
  const text = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');

  // Form 1: INSERT INTO sys_menu VALUES (col, col, ...);   -- column order = DDL order
  for (const stmt of text.split(';')) {
    if (!/INSERT\s+INTO\s+sys_menu\s+VALUES/i.test(stmt)) continue;
    const after = stmt.slice(stmt.search(/INSERT\s+INTO\s+sys_menu\s+VALUES/i) + 'INSERT INTO sys_menu VALUES'.length);
    const open = after.indexOf('(');
    const close = after.lastIndexOf(')');
    if (open < 0 || close < open) continue;
    const inner = after.slice(open + 1, close);
    const vals = [];
    for (const v of inner.matchAll(/'((?:[^']|'')*)'|(-?\d+(?:\.\d+)?)|(NULL)|([A-Za-z_][A-Za-z0-9_]*\s*\(\))/g)) {
      if (v[1] !== undefined) vals.push(v[1].replace(/''/g, "'"));
      else if (v[2] !== undefined) vals.push(v[2]);
      else if (v[5] !== undefined) vals.push(v[5]);
      else vals.push(null);
    }
    if (!vals.length) continue;
    const row = { Source: rel, Form: 'VALUES' };
    cols.forEach((c, i) => { if (i < vals.length) row[c] = vals[i]; });
    rows.push(row);
  }

  // Form 2: INSERT INTO sys_menu SELECT <values> ... WHERE NOT EXISTS (...)  -- used by sql/quartz.sql
  for (const m of text.matchAll(/INSERT\s+INTO\s+sys_menu\s+SELECT\s+([\s\S]*?)\s+WHERE\s+NOT\s+EXISTS/gi)) {
    const inner = m[1];
    const vals = [];
    for (const v of inner.matchAll(/'((?:[^']|'')*)'|(-?\d+(?:\.\d+)?)|(NULL)|([A-Za-z_][A-Za-z0-9_]*\s*\(\))/g)) {
      if (v[1] !== undefined) vals.push(v[1].replace(/''/g, "'"));
      else if (v[2] !== undefined) vals.push(v[2]);
      else if (v[5] !== undefined) vals.push(v[5]);
      else vals.push(null);
    }
    if (!vals.length) continue;
    const row = { Source: rel, Form: 'SELECT' };
    cols.forEach((c, i) => { if (i < vals.length) row[c] = vals[i]; });
    rows.push(row);
  }

  // Form 3: UPDATE sys_menu SET ... WHERE menu_id = N  -- corrects a previously inserted row
  for (const m of text.matchAll(/UPDATE\s+sys_menu\s+SET\s+([\s\S]*?)\s+WHERE\s+menu_id\s*=\s*'?(\d+)'?/gi)) {
    const sets = m[1];
    const id = m[2];
    const patch = { Source: rel, Form: 'UPDATE', menu_id: id };
    for (const s of sets.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*=\s*'((?:[^']|'')*)'/g)) {
      patch[s[1]] = s[2].replace(/''/g, "'");
    }
    for (const s of sets.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)/g)) {
      if (patch[s[1]] === undefined) patch[s[1]] = s[2];
    }
    rows.push(patch);
  }
}
fs.writeFileSync(outFile, JSON.stringify(rows, null, 2) + '\n', 'utf8');

// Merge rows per menu_id: later UPDATE rows patch earlier INSERT rows.
const byId = new Map();
for (const r of rows) {
  const broken = /[\u00c0-\u02ff]/.test(String(r.menu_name || '')) && !/[\u4e00-\u9fff]/.test(String(r.menu_name || ''));
  const cur = byId.get(r.menu_id);
  if (!cur) { byId.set(r.menu_id, Object.assign({}, r)); continue; }
  if (r.Form === 'UPDATE') { Object.assign(cur, r); continue; }
  if (broken && !/[\u00c0-\u02ff]/.test(String(cur.menu_name || ''))) continue;
  if (!broken) byId.set(r.menu_id, Object.assign({}, r));
}
const uniq = [...byId.values()];
const C = uniq.filter(m => m.menu_type === 'C');
const M = uniq.filter(m => m.menu_type === 'M');
const F = uniq.filter(m => m.menu_type === 'F');
console.log('rows (with dialect duplicates) : ' + rows.length);
console.log('unique menu_id                 : ' + uniq.length);
console.log('  M directories                : ' + M.length + '  -> ' + M.map(m => m.menu_id).join(','));
console.log('  C pages                      : ' + C.length + '  -> ' + C.map(m => m.menu_id).join(','));
console.log('  F buttons                    : ' + F.length);
console.log('contributing sql files         : ' + [...new Set(rows.map(r => r.Source))].length);
console.log('unique permission codes        : ' + [...new Set(uniq.map(m => m.perms).filter(Boolean))].length);
