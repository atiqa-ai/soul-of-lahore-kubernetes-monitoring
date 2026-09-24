#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# start.sh - builds (if needed) and starts the Soul of Lahore stack.
#
# Usage:  ./start.sh       (from Git Bash / WSL / Linux)
#         .\start.ps1      (PowerShell equivalent)
#
# Containers use restart: unless-stopped, so they stay up across reboots as
# long as they were running when you shut down the PC.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env.local ]; then
  echo "[start] .env.local not found - creating it from .env.example."
  echo "[start] >> Edit .env.local and add your Supabase values before deploying."
  cp .env.example .env.local
fi

echo "[start] Starting containers (first run builds the image) ..."
docker compose --env-file .env.local up -d

echo ""
echo "[start] Soul of Lahore:  http://localhost:3000"
echo "[start] Health check:    http://localhost:3000/api/health"
echo "[start] Portainer (GUI): http://localhost:9000"
echo ""
echo "[start] Check status:    docker compose ps"
echo "[start] View logs:       docker compose logs -f soul-of-lahore"