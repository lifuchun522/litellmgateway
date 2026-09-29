// write-crlf.js -- shared writer for every generated meta-model document.
//
// All meta-model markdown is written as UTF-8 with CRLF line endings on purpose.
//
// Why: the official validator (validate_meta_model.ps1) reads files with
// `Get-Content -Raw`, which Windows PowerShell 5.1 decodes using the ANSI code page
// (GBK on this machine). A GBK trail byte may be 0x0A, so an arbitrary UTF-8 byte
// sequence such as <E6><8D><A2><0A> decodes as a single character and swallows the
// newline after it. Measured on this corpus before the fix: 3410 of 24648 newlines
// were invisible to the validator, silently breaking its line-anchored rules (the
// per-field and per-ID regexes) and producing phantom failures.
//
// 0x0D is never a valid GBK trail byte, so CRLF keeps line structure intact through
// that decode. Byte content is otherwise unchanged.
//
// This file is deliberately ASCII-only: Node parses .js as latin-1, so multibyte
// characters inside comments cause "Invalid or unexpected token" syntax errors.
const fs = require('fs');

function toCrlf(text) {
  return String(text).replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

function writeText(file, text) {
  fs.writeFileSync(file, toCrlf(text), 'utf8');
}

module.exports = { toCrlf, writeText };
