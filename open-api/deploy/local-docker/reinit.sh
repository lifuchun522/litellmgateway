#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yaml"

DATA_DIR="${POSTGRES_DATA_DIR:-D:/data/jd_openapi/postgres}"
if command -v cygpath >/dev/null 2>&1; then
  DATA_DIR_REAL="$(cygpath -u "$DATA_DIR")"
else
  DATA_DIR_REAL="$DATA_DIR"
fi

echo "[1/5] Stop containers and remove orphans..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans

echo "[2/5] Reset PostgreSQL data dir: $DATA_DIR"
if [ -n "$DATA_DIR_REAL" ] && [ -d "$DATA_DIR_REAL" ]; then
  rm -rf "$DATA_DIR_REAL"
fi
mkdir -p "$DATA_DIR_REAL"

echo "[3/5] Rebuild and start services..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "[4/5] Restart app once to avoid startup race with PostgreSQL..."
docker restart openapi-app >/dev/null

echo "[5/5] Wait for app ready and show service status..."
wait_ready() {
  local timeout="$1"
  local deadline=$(( $(date +%s) + timeout ))
  until curl -fsS --max-time 5 "http://localhost:5656/login" >/dev/null 2>&1; do
    if [ "$(date +%s)" -ge "$deadline" ]; then
      return 1
    fi
    sleep 2
  done
  return 0
}

if ! wait_ready 90; then
  docker restart openapi-app >/dev/null
fi

if ! wait_ready 120; then
  echo "openapi-app not ready within timeout"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" ps

echo "Done."
