# extract-semantics.ps1
# Second-stage extractor: pulls the structured facts that drive the semantic
# meta-model documents (menus, table DDL, controller endpoints, view templates).
#
# Usage (Windows PowerShell 5.1):
#   powershell -File docs/tools/extract-semantics.ps1 -SourcePath open-api -OutputPath docs/tools/semantics.json
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$sourceRoot = [System.IO.Path]::GetFullPath($SourcePath)

function Read-Text([string]$path) {
    return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}

function Write-JsonFile {
    param($Value, [string]$Path)
    $json = $Value | ConvertTo-Json -Depth 12
    $dir = [System.IO.Path]::GetDirectoryName($Path)
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($Path, $json, (New-Object System.Text.UTF8Encoding($false)))
}

# ---------- 1. Tables and columns from DDL -------------------------------------
$tables = New-Object System.Collections.ArrayList
$sqlFiles = @(Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Filter '*.sql')
foreach ($sf in $sqlFiles) {
    $rel = $sf.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
    $text = Read-Text $sf.FullName
    # Split into CREATE TABLE blocks by locating each CREATE TABLE and its matching close paren.
    foreach ($m in [regex]::Matches($text, '(?im)CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_."\[\]]+)\s*\(')) {
        $name = $m.Groups[1].Value.Trim('"', '[', ']', '`')
        $i = $m.Index + $m.Length
        $depth = 1
        $sb = New-Object System.Text.StringBuilder
        while ($i -lt $text.Length -and $depth -gt 0) {
            $ch = $text[$i]
            if ($ch -eq '(') { $depth++ }
            elseif ($ch -eq ')') { $depth--; if ($depth -eq 0) { break } }
            [void]$sb.Append($ch)
            $i++
        }
        $body = $sb.ToString()
        $columns = New-Object System.Collections.ArrayList
        $tableComment = $null
        foreach ($line in ($body -split "`n")) {
            $t = $line.Trim().TrimEnd(',')
            if ([string]::IsNullOrWhiteSpace($t)) { continue }
            $cm = [regex]::Match($t, '(?i)^COMMENT\s+ON\s+TABLE.*IS\s+(.+)$')
            if ($cm.Success) { $tableComment = $cm.Groups[1].Value.Trim().Trim("'"); continue }
            # column definition: name type [constraints]
            $colMatch = [regex]::Match($t, '^(?<name>"?[A-Za-z_][A-Za-z0-9_]*"?)\s+(?<type>[A-Za-z][A-Za-z0-9_ ]*?(?:\([0-9,\s]+\))?)\s*(?<rest>.*)$')
            if (-not $colMatch.Success) { continue }
            $colName = $colMatch.Groups['name'].Value.Trim('"')
            if ($colName -match '^(?i)(PRIMARY|UNIQUE|CONSTRAINT|FOREIGN|CHECK|KEY|INDEX|COMMENT)$') { continue }
            $colType = $colMatch.Groups['type'].Value.Trim()
            $rest = $colMatch.Groups['rest'].Value.Trim()
            $colComment = $null
            $ccm = [regex]::Match($rest, "(?i)COMMENT\s+'([^']*)'")
            if ($ccm.Success) { $colComment = $ccm.Groups[1].Value }
            $nullable = 'YES'
            if ($rest -match '(?i)NOT\s+NULL') { $nullable = 'NO' }
            $default = $null
            $dm = [regex]::Match($rest, "(?i)DEFAULT\s+('([^']*)'|[^\s,]+)")
            if ($dm.Success) { $default = $dm.Groups[1].Value.Trim("'") }
            [void]$columns.Add(@{
                    Name     = $colName
                    Type     = $colType
                    Nullable = $nullable
                    Default  = $default
                    Comment  = $colComment
                    RawLine  = $t
                })
        }
        [void]$tables.Add(@{
                Name     = $name
                Source   = $rel
                Comment  = $tableComment
                Columns  = @($columns)
                ColCount = $columns.Count
            })
    }
    # Standalone COMMENT ON TABLE statements (PostgreSQL style, outside the block).
    foreach ($cm in [regex]::Matches($text, "(?im)^\s*COMMENT\s+ON\s+TABLE\s+([A-Za-z0-9_.\""\[\]]+)\s+IS\s+'([^']*)'")) {
        $tn = $cm.Groups[1].Value.Trim('"', '[', ']')
        foreach ($tb in $tables) { if ($tb.Name -eq $tn -and -not $tb.Comment) { $tb.Comment = $cm.Groups[2].Value } }
    }
    foreach ($cm in [regex]::Matches($text, "(?im)^\s*COMMENT\s+ON\s+COLUMN\s+([A-Za-z0-9_.\""\[\]]+)\s+IS\s+'([^']*)'")) {
        $full = $cm.Groups[1].Value.Trim('"', '[', ']')
        $parts = $full -split '\.'
        if ($parts.Count -ge 2) {
            $tn = $parts[$parts.Count - 2]
            $cn = $parts[$parts.Count - 1]
            foreach ($tb in $tables) {
                if ($tb.Name -eq $tn) {
                    foreach ($col in $tb.Columns) { if ($col.Name -eq $cn -and -not $col.Comment) { $col.Comment = $cm.Groups[2].Value } }
                }
            }
        }
    }
}

# ---------- 2. Menu rows from INSERT statements --------------------------------
# RuoYi's sys_menu column order, used when the INSERT omits an explicit column list.
$sysMenuColumns = @('menu_id', 'menu_name', 'parent_id', 'order_num', 'url', 'target', 'menu_type', 'visible', 'status', 'perms', 'icon', 'create_by', 'create_time', 'update_by', 'update_time', 'remark')
$menus = New-Object System.Collections.ArrayList
foreach ($sf in $sqlFiles) {
    $rel = $sf.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
    $text = Read-Text $sf.FullName

    # Bare form: INSERT INTO sys_menu VALUES (...);  (column order is the DDL order)
    foreach ($m in [regex]::Matches($text, '(?is)INSERT\s+INTO\s+sys_menu\s+VALUES\s*(.+?);')) {
        foreach ($tuple in [regex]::Matches($m.Groups[1].Value, '\(([^()]*)\)')) {
            $vals = New-Object System.Collections.ArrayList
            foreach ($v in [regex]::Matches($tuple.Groups[1].Value, "'((?:[^']|'')*)'|(-?\d+(?:\.\d+)?)|(NULL)|([A-Za-z_][A-Za-z0-9_]*\(\))")) {
                if ($v.Groups[1].Success) { [void]$vals.Add($v.Groups[1].Value.Replace("''", "'")) }
                elseif ($v.Groups[2].Success) { [void]$vals.Add($v.Groups[2].Value) }
                elseif ($v.Groups[5].Success) { [void]$vals.Add($v.Groups[5].Value) }
                else { [void]$vals.Add($null) }
            }
            if ($vals.Count -eq 0) { continue }
            $row = @{ Source = $rel }
            for ($k = 0; $k -lt $sysMenuColumns.Count -and $k -lt $vals.Count; $k++) { $row[$sysMenuColumns[$k]] = $vals[$k] }
            [void]$menus.Add($row)
        }
    }

    foreach ($m in [regex]::Matches($text, '(?is)INSERT\s+INTO\s+sys_menu\s*\(([^)]*)\)\s*VALUES\s*(.+?);')) {
        $cols = @([regex]::Matches($m.Groups[1].Value, '([A-Za-z_][A-Za-z0-9_]*)') | ForEach-Object { $_.Groups[1].Value })
        # Each parenthesised value tuple on its own.
        foreach ($tuple in [regex]::Matches($m.Groups[2].Value, '\(([^()]*)\)')) {
            $vals = New-Object System.Collections.ArrayList
            foreach ($v in [regex]::Matches($tuple.Groups[1].Value, "'((?:[^']|'')*)'|(-?\d+)|(NULL)")) {
                if ($v.Groups[1].Success) { [void]$vals.Add($v.Groups[1].Value.Replace("''", "'")) }
                elseif ($v.Groups[2].Success) { [void]$vals.Add($v.Groups[2].Value) }
                else { [void]$vals.Add($null) }
            }
            if ($vals.Count -eq 0) { continue }
            $row = @{ Source = $rel }
            for ($k = 0; $k -lt $cols.Count -and $k -lt $vals.Count; $k++) { $row[$cols[$k]] = $vals[$k] }
            [void]$menus.Add($row)
        }
    }
}

# ---------- 3. Controller endpoints with permission codes ----------------------
$endpoints = New-Object System.Collections.ArrayList
$javaFiles = @(Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Filter '*.java')
foreach ($jf in $javaFiles) {
    $rel = $jf.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
    $content = Read-Text $jf.FullName
    if ($content -notmatch '@(?:RestController|Controller)') { continue }
    $classComment = $null
    $cc = [regex]::Match($content, '(?s)/\*\*(.*?)\*/\s*(?:@|public)')
    if ($cc.Success) {
        $lines = @([regex]::Matches($cc.Groups[1].Value, '(?m)^\s*\*\s?(.*)$') | ForEach-Object { $_.Groups[1].Value.Trim() } | Where-Object { $_ -and $_ -notmatch '^@' })
        if ($lines.Count -gt 0) { $classComment = $lines[0] }
    }
    $classPrefix = ''
    $rm = [regex]::Match($content, '@RequestMapping\s*\(\s*"([^"]*)"')
    if ($rm.Success) { $classPrefix = $rm.Groups[1].Value }
    $className = $null
    $cm = [regex]::Match($content, '(?m)^\s*(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)')
    if ($cm.Success) { $className = $cm.Groups[1].Value }

    # Walk method-level mappings in order, attaching the nearest preceding
    # permission annotation and javadoc summary.
    foreach ($m in [regex]::Matches($content, '@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)')) {
        $start = $m.Index
        $before = $content.Substring(0, $start)
        $argStart = $start + $m.Length
        $argText = ''
        if ($argStart -lt $content.Length -and $content[$argStart] -eq '(') {
            $depth = 1; $i = $argStart + 1
            $sb = New-Object System.Text.StringBuilder
            while ($i -lt $content.Length -and $depth -gt 0) {
                $ch = $content[$i]
                if ($ch -eq '(') { $depth++ }
                elseif ($ch -eq ')') { $depth--; if ($depth -eq 0) { break } }
                [void]$sb.Append($ch); $i++
            }
            $argText = $sb.ToString()
        }
        $paths = @([regex]::Matches($argText, '"([^"]*)"') | ForEach-Object { $_.Groups[1].Value })
        if ($paths.Count -eq 0) { continue }
        # Permission: nearest @RequiresPermissions above this mapping.
        $perm = $null
        $pmAll = [regex]::Matches($before, '@RequiresPermissions\s*\(([^)]*)\)')
        if ($pmAll.Count -gt 0) {
            $last = $pmAll[$pmAll.Count - 1]
            if (($start - $last.Index) -lt 400) {
                $pl = [regex]::Match($last.Groups[1].Value, '"([^"]+)"')
                if ($pl.Success) { $perm = $pl.Groups[1].Value }
            }
        }
        # Javadoc immediately above.
        $summary = $null
        $jd = [regex]::Match($before, '(?s)/\*\*(.*?)\*/\s*$')
        if ($jd.Success) {
            $ls = @([regex]::Matches($jd.Groups[1].Value, '(?m)^\s*\*\s?(.*)$') | ForEach-Object { $_.Groups[1].Value.Trim() } | Where-Object { $_ -and $_ -notmatch '^@' })
            if ($ls.Count -gt 0) { $summary = $ls[0] }
        }
        $httpMethod = switch ($m.Groups[1].Value) {
            'GetMapping' { 'GET' }
            'PostMapping' { 'POST' }
            'PutMapping' { 'PUT' }
            'DeleteMapping' { 'DELETE' }
            'PatchMapping' { 'PATCH' }
        }
        $after = $content.Substring($m.Index)
        $sig = [regex]::Match($after, '(?s)\)\s*(?:@[A-Za-z][A-Za-z0-9_.]*(?:\([^)]*\))?\s*)*(?:public|protected|private)\s+[\w<>\[\],.\s?]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(')
        $methodName = 'unknown'
        if ($sig.Success) { $methodName = $sig.Groups[1].Value }
        foreach ($pth in $paths) {
            $full = $classPrefix + $pth
            if (-not $full.StartsWith('/')) { $full = '/' + $full }
            $full = $full -replace '//+', '/'
            [void]$endpoints.Add(@{
                    Controller = $className
                    ClassDesc  = $classComment
                    Path       = $rel
                    HttpMethod = $httpMethod
                    ClassPrefix = $classPrefix
                    Token      = $pth
                    FullPath   = $full
                    Method     = $methodName
                    Permission = $perm
                    Summary    = $summary
                })
        }
    }
}

# ---------- 4. View templates --------------------------------------------------
$views = New-Object System.Collections.ArrayList
$tplRoot = Join-Path $sourceRoot 'qvsu-openapi\src\main\resources\templates'
if (Test-Path -LiteralPath $tplRoot) {
    foreach ($tf in @(Get-ChildItem -LiteralPath $tplRoot -Recurse -File)) {
        $rel = $tf.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
        $relTpl = $tf.FullName.Substring($tplRoot.Length + 1).Replace('\', '/')
        $content = Read-Text $tf.FullName
        $title = $null
        $tm = [regex]::Match($content, '<title>([^<]*)</title>')
        if ($tm.Success) { $title = $tm.Groups[1].Value.Trim() }
        $selector = $null
        $idm = [regex]::Match($content, 'data-id="([^"]*)"')
        if ($idm.Success) { $selector = $idm.Groups[1].Value }
        [void]$views.Add(@{
                Path       = $rel
                Template   = $relTpl
                Title      = $title
                DataId     = $selector
                Size       = $tf.Length
                IsDemo     = ($relTpl -like 'demo/*')
            })
    }
}

# ---------- 5. Front-end URL literals (JSP/FTL/ajax calls) --------------------
$frontendUrls = New-Object System.Collections.ArrayList
foreach ($tf in @(Get-ChildItem -LiteralPath $tplRoot -Recurse -File -ErrorAction SilentlyContinue)) {
    $content = Read-Text $tf.FullName
    $rel = $tf.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
    foreach ($m in [regex]::Matches($content, '(?:\$\.(?:get|post|ajax)|url\s*:|location\.href\s*=|action\s*=)\s*[\(:]?\s*["'']([^"''\s]+)["'']')) {
        [void]$frontendUrls.Add(@{ Path = $rel; Url = $m.Groups[1].Value })
    }
}

$result = [ordered]@{
    GeneratedAt   = (Get-Date).ToString('s')
    SourceRoot    = $sourceRoot
    Tables        = @($tables)
    Menus         = @($menus)
    Endpoints     = @($endpoints)
    Views         = @($views)
    FrontendUrls  = @($frontendUrls)
}

Write-JsonFile $result ([System.IO.Path]::GetFullPath($OutputPath))

# DDL ships in three dialect variants (mysql / postgres / compat-upgrade); the same
# physical table therefore appears up to three times. Report the unique set so the
# meta-model counts each physical table exactly once.
$uniqueTables = @($tables | ForEach-Object { $_.Name } | Sort-Object -Unique)
Write-Output "tables (raw blocks)   : $($tables.Count)"
Write-Output "tables (unique names) : $($uniqueTables.Count)"
Write-Output "table columns total   : $(($tables | ForEach-Object { $_.ColCount } | Measure-Object -Sum).Sum)"
Write-Output "menu rows             : $($menus.Count)"
Write-Output "controller endpoints  : $($endpoints.Count)"
Write-Output "endpoints w/ perm     : $(@($endpoints | Where-Object { $_.Permission }).Count)"
Write-Output "view templates        : $($views.Count)"
Write-Output "frontend url literals : $($frontendUrls.Count)"
Write-Output "written               : $OutputPath"
