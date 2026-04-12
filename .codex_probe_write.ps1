$p='C:\Users\User\OneDrive\Documents\Playground\apip-web\lib\lessonRunnerApi.ts'
$s=[IO.File]::ReadAllText($p)
[IO.File]::WriteAllText($p,$s,(New-Object System.Text.UTF8Encoding($false)))
Write-Output 'rewrite-ok'
