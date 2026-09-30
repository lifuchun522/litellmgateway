<#
.SYNOPSIS
  scripts/check-rename.sh 的 Windows 等价实现：换骨残留扫描。

.DESCRIPTION
  检查三类字符串（第 02 境点名最容易翻车的三处）：
    1) 旧包名 com.qvsu
    2) 旧配置前缀 qvsu:（yml 顶层）
    3) 旧制品/镜像/容器标识（qvsu-openapi.jar / openapi-app / qvsu_open_api）

  排除项：
    .git / target / .reverse-work* / .smoke-out  —— 构建与隔离目录
    docs/ openspec/                              —— 第 01 境逆向产物记录的是换骨前路径，属历史证据
    open-api.zip                                 —— 0 号基线压缩包，哈希是锚点，必须原样
    check-rename.*                               —— 脚本自身要写旧包名

.EXAMPLE
  & .\scripts\check-rename.ps1
#>
param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

$exts = @('.java', '.xml', '.yml', '.yaml', '.properties', '.html', '.js', '.sh', '.ps1')
# 历史证据目录不参与扫描：docs/ 与 openspec/ 记的是换骨前的路径与行号，pages/ 是架构演示稿
# （其数据来自换骨前的元模型，已单独在该页标注新旧包名对应关系）
$skipDirs = @('\.git\', '\target\', '\.reverse-work', '\.reverse-work2\', '\.smoke-out\', '\docs\', '\openspec\', '\pages\')
$skipFiles = @('open-api.zip', 'check-rename.sh', 'check-rename.ps1')

$files = Get-ChildItem -Path $repoRoot -Recurse -File |
    Where-Object {
        $p = $_.FullName
        ($exts -contains $_.Extension.ToLower()) -and
        ($skipFiles -notcontains $_.Name) -and
        -not ($skipDirs | Where-Object { $p.Contains($_) })
    }

Write-Host "扫描文件数：$($files.Count)"

$checks = @(
    @{ Name = "1/3 旧包名 com.qvsu";            Pattern = 'com\.qvsu' },
    @{ Name = "2/3 旧配置前缀 qvsu:";            Pattern = '(?m)^qvsu:' },
    @{ Name = "3/3 旧制品/镜像/容器标识";         Pattern = 'qvsu-openapi\.jar|openapi-app|qvsu_open_api' }
)

$fail = 0
foreach ($c in $checks) {
    Write-Host "== $($c.Name) =="
    $hits = $files | Select-String -Pattern $c.Pattern
    if ($hits) {
        $fail = 1
        $hits | Select-Object -First 20 | ForEach-Object {
            Write-Host ("  {0}:{1}: {2}" -f $_.Path.Substring($repoRoot.Length + 1), $_.LineNumber, $_.Line.Trim())
        }
        if ($hits.Count -gt 20) { Write-Host "  ...（共 $($hits.Count) 处）" }
    }
    else {
        Write-Host "  无残留"
    }
}

Write-Host ""
Write-Host "说明：模块目录名 open-api/qvsu-openapi 与历史 SQL 文件名属有意保留（第 02 境不拆模块）。"

if ($fail -eq 0) {
    Write-Host "换骨残留检查通过"
    exit 0
}
Write-Host "换骨未完成：仍存在旧标识引用" -ForegroundColor Red
exit 1
