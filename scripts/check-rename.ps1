<#
.SYNOPSIS
  scripts/check-rename.sh 的 Windows 等价实现：换骨残留扫描。

.DESCRIPTION
  与 bash 版使用**同一套判据**。两套实现的判据不一致时，会出现「CI 挂而本机通过」
  或反过来——本境第一次推送 CI 就正好撞上这个坑，因此这里刻意与 bash 版逐条对齐：

    1) 旧包名：以 `com.` 开头的标识符，后面紧跟非标识符字符
    2) 旧配置前缀：**只在 yml/yaml/properties 里**、且**行首**就是键名
       （因此注释行与 Java 里的文字描述不算「配置键」）
    3) 旧产物名 / 旧镜像名 / 旧容器名

  扫描对象是**纳入版本控制的文件**（`git ls-files`），不是磁盘上的所有文件：
  这样构建产物、隔离目录、`docs/` 历史证据、压缩包里的二进制都不会污染结论。

  例外（路径含以下子串时跳过）：本脚本自身、兼容期样例配置。

.EXAMPLE
  & .\scripts\check-rename.ps1
#>
param()

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

$oldPkgRe = '(^|[^A-Za-z0-9_.])com\.qvsu([^A-Za-z0-9_]|$)'
$oldPrefixRe = '^qvsu:'
$oldArtifactRe = 'qvsu-openapi\.jar|openapi-app|qvsu_open_api'

$allowSubstr = @('scripts/check-rename', 'application-prefixcompat.yml')

$skipPathRe = '^(docs/|openspec/|pages/|\.git/)'
$skipDirRe = '(^|/)(target|node_modules|\.reverse-work2?|\.smoke-out)/'
$skipExtRe = '\.(png|jpg|jpeg|gif|ico|zip|jar|pdf|woff2?|ttf|eot|otf)$'
$configExtRe = '\.(ya?ml|properties)$'

$tracked = & git ls-files
$files = @()
foreach ($f in $tracked) {
    if ($f -match $skipPathRe) { continue }
    if ($f -match $skipDirRe) { continue }
    if ($f -match $skipExtRe) { continue }
    $allowed = $false
    foreach ($a in $allowSubstr) { if ($f.Contains($a)) { $allowed = $true; break } }
    if ($allowed) { continue }
    $files += $f
}

Write-Host "扫描纳入版本控制的文件：$($files.Count) 个"

$fail = 0

function Report-Hits([string]$Title, $Hits) {
    Write-Host "== $Title =="
    if (-not $Hits -or @($Hits).Count -eq 0) {
        Write-Host "  无残留"
        return $true
    }
    @($Hits) | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
    if (@($Hits).Count -gt 20) { Write-Host "  ...（共 $(@($Hits).Count) 处）" }
    return $false
}

$hits = $files | Select-String -Pattern $oldPkgRe | ForEach-Object { "$($_.Path):$($_.LineNumber):$($_.Line.Trim())" }
if (-not (Report-Hits "1/3 扫描旧包名（锚定标识符边界）" $hits)) {
    Write-Host "换骨未完成：仍存在旧包名引用" -ForegroundColor Red
    $fail = 1
}

$configFiles = @($files | Where-Object { $_ -match $configExtRe })
$hits = $configFiles | Select-String -Pattern $oldPrefixRe | ForEach-Object { "$($_.Path):$($_.LineNumber):$($_.Line.Trim())" }
if (-not (Report-Hits "2/3 扫描旧配置前缀（仅配置文件的行首键名）" $hits)) {
    Write-Host "换骨未完成：仍存在旧配置前缀" -ForegroundColor Red
    $fail = 1
}

$hits = $files | Select-String -Pattern $oldArtifactRe | ForEach-Object { "$($_.Path):$($_.LineNumber):$($_.Line.Trim())" }
if (-not (Report-Hits "3/3 扫描旧制品/镜像/容器标识" $hits)) {
    Write-Host "换骨未完成：仍存在旧制品/镜像标识" -ForegroundColor Red
    $fail = 1
}

Write-Host ""
Write-Host "  有意保留（不是漏改）："
Write-Host "    - 模块目录名 open-api/qvsu-openapi/         第 02 境明确不拆模块、不改目录结构"
Write-Host "    - 定时任务 Bean 名 qvsuTask                 数据库 sys_job.invoke_target 存了字符串（19 行）"
Write-Host "    - 资源前缀 /qvsu.png 与 /qvsu/**            与 ResourcesConfig 的前缀常量成对，只改一处会 404 或绕过鉴权"
Write-Host "    - docs/ 与 openspec/ 下的旧标识             历史证据：记录的是换骨前的路径与行号"
Write-Host "    - application-prefixcompat.yml 的旧前缀段    兼容期验证样例，它「必须」只含旧前缀"
Write-Host "    - pages/architecture.html 的旧包名          架构演示稿，已就地标注新旧对应关系"

if ($fail -eq 0) {
    Write-Host ""
    Write-Host "换骨残留检查通过"
    exit 0
}
exit 1
