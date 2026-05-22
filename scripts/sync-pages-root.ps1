# Copia frontend → raíz para GitHub Pages (branch main)
$root = Split-Path $PSScriptRoot -Parent
Copy-Item "$root\frontend\index.html" "$root\index.html" -Force
if (Test-Path "$root\css") { Remove-Item "$root\css" -Recurse -Force }
if (Test-Path "$root\js") { Remove-Item "$root\js" -Recurse -Force }
Copy-Item "$root\frontend\css" "$root\css" -Recurse
Copy-Item "$root\frontend\js" "$root\js" -Recurse
Write-Host "OK: index.html, css/ y js/ sincronizados en la raiz."
