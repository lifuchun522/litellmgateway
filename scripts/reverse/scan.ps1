<#
.SYNOPSIS
  只读扫描 open-api.zip，产出与 scripts/reverse/scan.sh 等价的清单文件。
.DESCRIPTION
  不改动 open-api.zip 与被逆向工程中的任何文件；中间解压落在 .reverse-work2/（已 gitignore）。
.EXAMPLE
  pwsh -File scripts/reverse/scan.ps1 -Zip open-api.zip -Out docs/reverse/scan-output
#>
param(
    [string]$Zip = "open-api.zip",
    [string]$Out = "docs/reverse/scan-output",
    [string]$Work = ".reverse-work2"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

New-Item -ItemType Directory -Force -Path $Out | Out-Null
if (Test-Path $Work) { Remove-Item $Work -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Work | Out-Null

# 1. 冻结压缩包指纹
$hash = (Get-FileHash -LiteralPath $Zip -Algorithm SHA256).Hash
Set-Content -LiteralPath (Join-Path $Out "zip.sha256") -Value $hash -Encoding ascii -NoNewline

# 2. 定位真实项目根（用 zip 条目名，避免依赖解压工具）
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $Zip).Path)
try {
    $pomEntry = $archive.Entries | Where-Object { $_.FullName -match '(^|/)pom\.xml$' } | Select-Object -First 1
    if (-not $pomEntry) { throw "未找到 pom.xml，无法定位项目根" }
    $rootRel = ($pomEntry.FullName -replace '/pom\.xml$', '')
    Set-Content -LiteralPath (Join-Path $Out "root.txt") -Value $rootRel -Encoding utf8 -NoNewline

    # 解压（只读来源，解压到隔离目录）
    [System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $Zip).Path, (Resolve-Path $Work).Path)
}
finally { $archive.Dispose() }

$root = Join-Path $Work $rootRel
if (-not (Test-Path $root)) { throw "解压后项目根不存在：$root" }
$rootFull = (Resolve-Path $root).Path

# 3. 根包名与包分布
$javaFiles = Get-ChildItem -LiteralPath (Join-Path $rootFull "src") -Recurse -Filter *.java -File
$javaFiles |
    ForEach-Object { Select-String -LiteralPath $_.FullName -Pattern '^\s*package\s+([a-zA-Z0-9_.]+)' |
        Select-Object -First 1 | ForEach-Object { $_.Matches[0].Groups[1].Value } } |
    Where-Object { $_ } | Group-Object | Sort-Object Count -Descending |
    ForEach-Object { "{0,6} {1}" -f $_.Count, $_.Name } |
    Set-Content -LiteralPath (Join-Path $Out "packages.txt") -Encoding utf8

# 4. 接口候选（Controller 注解）
$pattern = '@(RestController|Controller|RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping)'
$cands = $javaFiles | ForEach-Object {
    $rel = $_.FullName.Substring($rootFull.Length + 1).Replace('\', '/')
    Select-String -LiteralPath $_.FullName -Pattern $pattern | ForEach-Object {
        "{0}:{1}:{2}" -f $rel, $_.LineNumber, $_.Line.Trim()
    }
}
Set-Content -LiteralPath (Join-Path $Out "endpoints.raw.txt") -Value $cands -Encoding utf8

# 5. 依赖树（离线优先，失败不阻断）
$depOut = Join-Path $Out "dependency-tree.txt"
Push-Location $rootFull
try {
    & mvn -q -o dependency:tree "-DoutputFile=$depOut" -DappendOutput=false 2>&1 | Out-Null
    if (-not (Test-Path $depOut) -or -not (Get-Item $depOut).Length) {
        & mvn -q dependency:tree "-DoutputFile=$depOut" -DappendOutput=false 2>&1 | Out-Null
    }
    if (-not (Test-Path $depOut) -or -not (Get-Item $depOut).Length) {
        "（依赖树未取到：需要联网或本地仓库缓存）" | Set-Content -LiteralPath $depOut -Encoding utf8
    }
}
finally { Pop-Location }

# 6. 配置 / SQL / 容器化资产（排除 target/ 等构建产物与扫描产物自身，否则清单会被灌水）
$assetRe = '^(application.*\.ya?ml|application.*\.properties|.*\.sql|Dockerfile.*|docker-compose.*\.ya?ml)$'
$parentFull = (Resolve-Path (Join-Path $rootFull "..")).Path
$assets = Get-ChildItem -LiteralPath $parentFull -Recurse -File |
    Where-Object { $_.FullName -notmatch '[\\/](target|node_modules|\.git|scan-output)[\\/]' -and $_.Name -match $assetRe } |
    ForEach-Object { $_.FullName.Substring($parentFull.Length + 1).Replace('\', '/') } | Sort-Object
Set-Content -LiteralPath (Join-Path $Out "assets.txt") -Value $assets -Encoding utf8

# 7. 源码规模
Set-Content -LiteralPath (Join-Path $Out "java-file-count.txt") -Encoding ascii -NoNewline `
    -Value ($javaFiles | Where-Object { $_.FullName -match 'src[\\/]main[\\/]java' }).Count
$tpl = Join-Path $rootFull "src/main/resources/templates"
$tplCount = if (Test-Path $tpl) { (Get-ChildItem -LiteralPath $tpl -Recurse -Filter *.html -File).Count } else { 0 }
Set-Content -LiteralPath (Join-Path $Out "template-count.txt") -Encoding ascii -NoNewline -Value $tplCount

# 产物完整性校验
$required = 'zip.sha256', 'root.txt', 'packages.txt', 'endpoints.raw.txt', 'assets.txt', 'java-file-count.txt', 'template-count.txt'
foreach ($f in $required) {
    $p = Join-Path $Out $f
    if (-not (Test-Path $p) -or -not (Get-Item $p).Length) { throw "产物缺失或为空：$p" }
}

Write-Host "== scan done =="
Write-Host "zip.sha256    : $hash"
Write-Host "root          : $rootRel"
Write-Host "java files    : $(Get-Content (Join-Path $Out 'java-file-count.txt'))"
Write-Host "templates     : $(Get-Content (Join-Path $Out 'template-count.txt'))"
Write-Host "endpoint cands: $((Get-Content (Join-Path $Out 'endpoints.raw.txt')).Count)"
Write-Host "assets        : $((Get-Content (Join-Path $Out 'assets.txt')).Count)"
