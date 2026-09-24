# ---------------------------------------------------------------------------
# build.ps1 - builds the Soul of Lahore Docker image.
#
# Usage:  .\build.ps1   (PowerShell / Windows Terminal)
#         ./build.sh    (Git Bash / WSL equivalent)
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$envFile = Join-Path $PSScriptRoot '.env.local'
if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Host "[build] .env.local not found - creating it from .env.example." -ForegroundColor Yellow
    Write-Host "[build] >> Edit .env.local and add your Supabase values before deploying." -ForegroundColor Yellow
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot '.env.example') -Destination $envFile
}

Write-Host "[build] Building image 'soul-of-lahore:latest' ..."
docker compose --env-file .env.local build

Write-Host ""
Write-Host "[build] Done. Image 'soul-of-lahore:latest' is ready."
Write-Host "[build] Start the stack with: .\start.ps1"