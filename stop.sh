#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# stop.sh - stops and removes the Soul of Lahore containers.
#
# Usage:  ./stop.sh       (from Git Bash / WSL / Linux)
#         .\stop.ps1      (PowerShell equivalent)
#
# Persistent volumes (e.g. Portainer data) are preserved.
# NOTE: use this only when you explicitly want to stop the app. To keep the
# auto-start behaviour, just leave the containers running and shut down the PC.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "[stop] Stopping and removing containers ..."
docker compose down

echo "[stop] Done. Start it again with ./start.sh"