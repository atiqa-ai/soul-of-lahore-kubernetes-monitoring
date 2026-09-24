# ---------------------------------------------------------------------------
# start.ps1 - builds (if needed) and starts the Soul of Lahore stack.
#
# Usage:  .\start.ps1   (PowerShell / Windows Terminal)
#         ./start.sh    (Git Bash / WSL equivalent)
#
# Containers use restart: unless-stopped, so they stay up across reboots as
# long as they were running when you shut down the PC.
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$envFile = Join-Path $PSScriptRoot '.env.local'
if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Host "[start] .env.local not found - creating it from .env.example." -ForegroundColor Yellow
    Write-Host "[start] >> Edit .env.local and add your Supabase values before deploying." -ForegroundColor Yellow
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot '.env.example') -Destination $envFile
}

Write-Host "[start] Starting containers (first run builds the image) ..."
docker compose --env-file .env.local up -d

Write-Host ""
Write-Host "[start] Soul of Lahore:  http://localhost:3000"
Write-Host "[start] Health check:    http://localhost:3000/api/health"
Write-Host "[start] Portainer (GUI): http://localhost:9000"
Write-Host ""
Write-Host "[start] Check status:    docker compose ps"
Write-Host "[start] View logs:       docker compose logs -f soul-of-lahore"