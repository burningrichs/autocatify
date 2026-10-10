$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$vencord = Join-Path $root "Vencord"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git is not installed. Install it from https://git-scm.com" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is not installed. Install Node 22+ from https://nodejs.org" }

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm not found, enabling corepack..." -ForegroundColor Yellow
    try { corepack enable } catch { npm install -g pnpm }
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw "Could not set up pnpm" }

if (-not (Test-Path $vencord)) {
    Write-Host "Cloning Vencord..." -ForegroundColor Cyan
    git clone https://github.com/Vendicated/Vencord.git $vencord
}

$userplugins = Join-Path $vencord "src\userplugins"
New-Item -ItemType Directory -Force -Path $userplugins | Out-Null
Copy-Item -Recurse -Force (Join-Path $root "autocatify") (Join-Path $userplugins "autocatify")
Write-Host "Plugin copied into src\userplugins" -ForegroundColor Green

Set-Location $vencord
Write-Host "Installing dependencies (this can take a few minutes)..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }

Write-Host "Building Vencord..." -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) { throw "pnpm build failed" }

Write-Host ""
Write-Host "Build finished." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  - Discord desktop: close Discord, then run 'pnpm inject' inside $vencord"
Write-Host "  - Browser: load '$vencord\dist\chromium' as an unpacked extension"
Write-Host "  - Then enable AutoCatify in Discord: Settings > Vencord > Plugins"
