#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# build.sh - builds the Soul of Lahore Docker image.
#
# Usage:  ./build.sh        (from Git Bash / WSL / Linux)
#         .\build.ps1       (PowerShell equivalent)
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

# The build bakes NEXT_PUBLIC_* values into the client bundle, so .env.local
# is required. Auto-create it from the template if missing.
if [ ! -f .env.local ]; then
  echo "[build] .env.local not found - creating it from .env.example."
  echo "[build] >> Edit .env.local and add your Supabase values before deploying."
  cp .env.example .env.local
fi

echo "[build] Building image 'soul-of-lahore:latest' ..."
docker compose --env-file .env.local build

echo ""
echo "[build] Done. Image 'soul-of-lahore:latest' is ready."
echo "[build] Start the stack with: ./start.sh"