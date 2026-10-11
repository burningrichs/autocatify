$ErrorActionPreference = "Stop"

$root = $PSScriptRoot

Copy-Item -Recurse -Force (Join-Path $root "autocatify") (Join-Path $root "Vencord\src\userplugins\autocatify")

Set-Location (Join-Path $root "Vencord")
pnpm build
