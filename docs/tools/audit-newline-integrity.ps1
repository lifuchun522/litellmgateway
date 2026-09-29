# audit-newline-integrity.ps1
# Measures, for every meta-model markdown file, how many newlines survive the
# validator's ANSI/GBK decode. A file where the decoded LF count is lower than the
# raw LF count has line structure that the validator cannot see, which silently
# breaks its line-anchored rules (per-field and per-ID regexes).
param([Parameter(Mandatory = $true)][string]$Dir)

$gbk = [System.Text.Encoding]::GetEncoding(936)
$rows = @()
foreach ($f in Get-ChildItem -LiteralPath $Dir -Recurse -File -Filter '*.md') {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $rawLf = @($bytes | Where-Object { $_ -eq 10 }).Count
    $decoded = $gbk.GetString($bytes)
    $decLf = ($decoded.ToCharArray() | Where-Object { $_ -eq [char]10 }).Count
    $rows += [pscustomobject]@{
        File      = $f.Name
        RawLf     = $rawLf
        DecodedLf = $decLf
        Lost      = ($rawLf - $decLf)
    }
}
$rows = $rows | Sort-Object Lost -Descending
Write-Output ("{0,-34} {1,7} {2,10} {3,6}" -f 'File', 'RawLF', 'DecodedLF', 'Lost')
foreach ($r in $rows) { Write-Output ("{0,-34} {1,7} {2,10} {3,6}" -f $r.File, $r.RawLf, $r.DecodedLf, $r.Lost) }
$total = ($rows | Measure-Object -Property Lost -Sum).Sum
Write-Output ''
Write-Output "files scanned: $($rows.Count)   files with lost newlines: $(@($rows | Where-Object { $_.Lost -gt 0 }).Count)   total lost: $total"
