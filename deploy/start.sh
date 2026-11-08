#!/bin/sh
set -eu
node /app/backend/dist/manage.js indexes
PORT=8000 HOST=127.0.0.1 node /app/backend/dist/server.js &
api_pid=$!
cleanup() { kill "$api_pid" "${web_pid:-}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
# Make the database-backed API ready before exposing the storefront.
node --input-type=module -e '
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const res = await fetch("http://127.0.0.1:8000/health/ready", { signal: AbortSignal.timeout(5000) });
    if (res.ok) process.exit(0);
  } catch {}
  await new Promise((r) => setTimeout(r, 1000));
}
console.error("API did not become ready");
process.exit(1);
'
node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "${PORT:-10000}" &
web_pid=$!
while kill -0 "$api_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null; do sleep 3; done
exit 1
