// normalize-line-endings.js -- converts every generated markdown file to CRLF.
//
// Why: validate_meta_model.ps1 reads files with `Get-Content -Raw`, which Windows
// PowerShell 5.1 decodes using the ANSI code page (GBK here). A GBK trail byte can be
// 0x0A, so arbitrary UTF-8 sequences such as <E6><8D><A2><0A> decode as ONE character
// and swallow the following newline. Measured on this corpus: 3410 of 24648 newlines
// were invisible to the validator, which silently broke its line-anchored rules
// (per-field and per-ID regexes) and produced phantom failures.
//
// 0x0D is never a valid GBK trail byte, so terminating every line with CRLF keeps the
// line structure intact through that decode. Content is unchanged; only line endings are.
//
// NOTE: this file is deliberately ASCII-only. Node parses .js as latin-1, so multibyte
// characters inside comments cause "Invalid or unexpected token" syntax errors.
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const targets = [
  path.join(ROOT, 'docs/meta-model'),
  path.join(ROOT, 'docs/ontology'),
  path.join(ROOT, 'docs')
];

let converted = 0, scanned = 0;
for (const dir of targets) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const p = path.join(dir, name);
    if (!fs.statSync(p).isFile()) continue;
    scanned++;
    const text = fs.readFileSync(p, 'utf8');
    const crlf = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    if (crlf !== text) {
      fs.writeFileSync(p, crlf, 'utf8');
      converted++;
    }
  }
}
console.log('scanned  : ' + scanned + ' markdown files');
console.log('converted: ' + converted + ' to CRLF');
