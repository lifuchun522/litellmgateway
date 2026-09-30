<#
.SYNOPSIS
  换骨回归冒烟（Windows 等价实现）：采集当前接口行为并与 baseline/ 里的黄金快照逐项比对。

.DESCRIPTION
  第 01 境确认工程没有 OpenAI 兼容入口（/v1/* 不存在），所以基线快照存的是
  「归一化后的真实行为」——HTTP 状态码 + Location 头，而不是响应正文
  （正文明文里含每次请求都变的 CSRF token，直接 diff 必然假阳性）。

.PARAMETER Base
  被测地址，默认 http://127.0.0.1:5656

.PARAMETER Capture
  只采集、不比对，并把结果写入 -BaselineDir（用于生成黄金基线）。

.EXAMPLE
  # 1) 在换骨前的基线分支上生成黄金快照
  & .\scripts\smoke.ps1 -BaselineDir baseline -Capture
  # 2) 换骨后跑回归
  & .\scripts\smoke.ps1
#>
param(
    [string]$Base = "http://127.0.0.1:5656",
    [string]$BaselineDir = "baseline",
    [string]$OutDir = ".smoke-out",
    [switch]$Capture
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# 本机常设 HTTP_PROXY；必须显式绕过，否则本机请求会被送进代理并统一返回 503
function Get-Probe([string]$Name, [string]$Method, [string]$Path, [string]$BodyFile) {
    $url = "$Base$Path"
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Proxy = $null
    $req.AllowAutoRedirect = $false
    $req.Method = $Method
    $req.Timeout = 20000
    if ($BodyFile -and (Test-Path $BodyFile)) {
        $req.ContentType = "application/json"
        $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $BodyFile).Path)
        $req.ContentLength = $bytes.Length
        $s = $req.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()
    }
    try {
        $resp = $req.GetResponse()
        $code = [int]$resp.StatusCode
        $loc = [string]$resp.Headers["Location"]
        $ct = [string]$resp.ContentType
        $resp.Close()
    }
    catch [System.Net.WebException] {
        $r = $_.Exception.Response
        $code = if ($r) { [int]$r.StatusCode } else { -1 }
        $loc = if ($r) { [string]$r.Headers["Location"] } else { "" }
        $ct = if ($r) { [string]$r.ContentType } else { "" }
    }
    # 归一化：去掉 host/port 等易变部分，只留路径
    $locPath = if ($loc) { ([uri]$loc).AbsolutePath } else { "" }
    $obj = [ordered]@{
        name       = $Name
        method     = $Method
        path       = $Path
        httpStatus = $code
        location   = $locPath
        contentType = if ($ct) { ($ct -split ';')[0].Trim() } else { "" }
    }
    $json = ($obj | ConvertTo-Json -Compress)
    Set-Content -LiteralPath (Join-Path $OutDir "$Name.json") -Value $json -Encoding utf8 -NoNewline
    return $obj
}

$probes = @(
    @("index", "GET", "/index", $null),
    @("login", "GET", "/login", $null),
    @("models", "GET", "/v1/models", $null),
    @("chat", "POST", "/v1/chat/completions", "baseline/chat-req.json"),
    @("open", "GET", "/open/", $null),
    @("nope", "GET", "/nosuchpath123", $null)
)

Write-Host "== 采集当前行为（$Base）=="
foreach ($p in $probes) {
    $o = Get-Probe $p[0] $p[1] $p[2] $p[3]
    Write-Host ("  {0,-8} {1} {2} -> {3} loc={4} ct={5}" -f $o.name, $o.method, $o.path, $o.httpStatus, $o.location, $o.contentType)
}

if ($Capture) {
    New-Item -ItemType Directory -Force -Path $BaselineDir | Out-Null
    Copy-Item -Path (Join-Path $OutDir "*.json") -Destination $BaselineDir -Force
    Write-Host ""
    Write-Host "已生成黄金基线：$BaselineDir"
    exit 0
}

Write-Host ""
Write-Host "== 与基线比对 =="
$fail = 0
# chat-req.json 是请求样例（输入），不是行为快照，必须排除，否则每轮都报假差异
foreach ($f in (Get-ChildItem -LiteralPath $BaselineDir -Filter *.json | Where-Object { $_.Name -ne "chat-req.json" })) {
    $cur = Join-Path $OutDir $f.Name
    if (-not (Test-Path $cur)) {
        Write-Host "  差异：基线有 $($f.Name)，当前采集缺失"; $fail = 1; continue
    }
    $a = (Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8).Trim()
    $b = (Get-Content -LiteralPath $cur -Raw -Encoding UTF8).Trim()
    if ($a -eq $b) {
        Write-Host "  一致：$($f.BaseName)"
    }
    else {
        Write-Host "  差异：$($f.BaseName)"
        Write-Host "    基线: $a"
        Write-Host "    当前: $b"
        $fail = 1
    }
}

Write-Host ""
if ($fail -eq 0) {
    Write-Host "换骨回归通过：接口行为与基线一致"
    exit 0
}
Write-Host "换骨回归失败：存在行为差异，按停止线要求回退，不许现场改代码"
exit 1
