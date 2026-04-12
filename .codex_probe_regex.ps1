$p='C:\Users\User\OneDrive\Documents\Playground\apip-web\lib\lessonRunnerApi.ts'
$s=[IO.File]::ReadAllText($p).Replace("`r`n","`n")
$t=[regex]::Replace($s,'const SUPPLEMENTAL_LESSON_CODES = \[[^\n]+\];','CONST_TEST',1)
Write-Output ($t.Contains('CONST_TEST'))
