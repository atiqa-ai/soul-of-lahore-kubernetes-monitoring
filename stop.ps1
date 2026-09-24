# ---------------------------------------------------------------------------
# stop.ps1 - stops and removes the Soul of Lahore containers.
#
# Usage:  .\stop.ps1   (PowerShell / Windows Terminal)
#         ./stop.sh    (Git Bash / WSL equivalent)
#
# Persistent volumes (e.g. Portainer data) are preserved.
# NOTE: use this only when you explicitly want to stop the app. To keep the
# auto-start behaviour, just leave the containers running and shut down the PC.
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

Write-Host "[stop] Stopping and removing containers ..."
docker compose down

Write-Host "[stop] Done. Start it again with .\start.ps1"