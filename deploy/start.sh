#!/bin/sh
set -eu
/opt/venv/bin/python -m backend.manage indexes
/opt/venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
api_pid=$!
cleanup() { kill "$api_pid" "${web_pid:-}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
# Make the database-backed API ready before exposing the storefront.
/opt/venv/bin/python - <<'PY'
import time, urllib.request
for attempt in range(60):
    try:
        with urllib.request.urlopen('http://127.0.0.1:8000/health/ready', timeout=5) as response:
            if response.status == 200: break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit('Python API did not become ready')
PY
node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "${PORT:-10000}" &
web_pid=$!
while kill -0 "$api_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null; do sleep 3; done
exit 1
