# 传统网关链路验收：appKey/sign/nonce 签名 -> /open/** -> 转发上游 -> OpenResult 包裹
# 用法：& .\scripts\reverse\smoke-open-gateway.ps1 [-Base http://127.0.0.1:18080] [-Path /open/selftest/httpbin/get]
param(
    [string]$Base = "http://127.0.0.1:18080",
    [string]$Path = "/open/selftest/httpbin/get",
    [string]$AppKey = "ak_selftest_demo",
    [string]$AppSecret = "sk_selftest_demo_1234567890abcdef",
    [hashtable]$Biz = @{ demo = "1"; category = "get" },
    [string]$Method = "GET"
)

function Get-HmacSha256Hex([string]$Data, [string]$Key) {
    $h = New-Object System.Security.Cryptography.HMACSHA256
    $h.Key = [System.Text.Encoding]::UTF8.GetBytes($Key)
    $d = $h.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Data))
    -join ($d | ForEach-Object { $_.ToString("x2") })
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds().ToString()
$nonce = [guid]::NewGuid().ToString("N")

# 签名原文：appKey/timestamp/nonce + 业务参数，按 key 字典序，key=value 用 & 连接，尾部追加 appSecret
$pairs = [ordered]@{ appKey = $AppKey; timestamp = $ts; nonce = $nonce }
foreach ($k in ($Biz.Keys | Sort-Object)) { $pairs[$k] = $Biz[$k] }
$plain = (($pairs.GetEnumerator() | Where-Object { $_.Value } | Sort-Object Key |
        ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&") + "&appSecret=$AppSecret"
$sign = Get-HmacSha256Hex $plain $AppSecret

$url = "$Base$Path"
if ($Method -eq "GET" -and $Biz.Count -gt 0) {
    $q = ($Biz.GetEnumerator() | Sort-Object Key | ForEach-Object { "$($_.Key)=$([uri]::EscapeDataString($_.Value))" }) -join "&"
    $url = "$url`?$q"
}

$headers = @{
    "X-App-Key"   = $AppKey
    "X-Timestamp" = $ts
    "X-Nonce"     = $nonce
    "X-Sign"      = $sign
}

Write-Host "== 请求 =="
Write-Host "URL      : $url"
Write-Host "签名原文 : $plain"
Write-Host "X-Sign   : $sign"

$req = [System.Net.HttpWebRequest]::Create($url)
$req.Proxy = $null
$req.Method = $Method
$req.Timeout = 20000
foreach ($k in $headers.Keys) { $req.Headers.Add($k, $headers[$k]) }

try {
    $resp = $req.GetResponse()
    $code = [int]$resp.StatusCode
    $body = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    $resp.Close()
}
catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    $body = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}

Write-Host "== 响应 =="
Write-Host "HTTP        : $code"
Write-Host "X-Trace-Id  : $($resp.Headers['X-Trace-Id'])"
Write-Host "Body        : $body"
