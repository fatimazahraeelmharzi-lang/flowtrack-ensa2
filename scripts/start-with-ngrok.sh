#!/usr/bin/env bash
# Quick helper: start the Node server and an ngrok tunnel, then print the public URL
# Requirements: ngrok (https://ngrok.com), curl, python3

set -euo pipefail

PORT=${PORT:-3005}

cleanup() {
  if [ -n "${NGROK_PID-}" ] && kill -0 "$NGROK_PID" 2>/dev/null; then
    kill "$NGROK_PID" || true
  fi
  if [ -n "${SERVER_PID-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" || true
  fi
}
trap cleanup EXIT

# start the server
npm start &
SERVER_PID=$!

# give server time to start
sleep 1

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is not installed. Install it from https://ngrok.com/download and configure your authtoken."
  exit 1
fi

# start ngrok in background
ngrok http "$PORT" --log=stdout &
NGROK_PID=$!

# wait for ngrok's local API and fetch the public url
for i in {1..20}; do
  sleep 0.5
  url=$(curl -s http://127.0.0.1:4040/api/tunnels || true)
  if [ -n "$url" ] && [ "$url" != "null" ]; then
    public=$(python3 - <<'PY'
import sys, json
try:
    t = json.load(sys.stdin)
    print(t['tunnels'][0]['public_url'])
except Exception:
    sys.exit(1)
PY
<<<"$url") || public=""
    if [ -n "$public" ]; then
      echo "Public URL: $public"
      echo "Set 'window.API_BASE_URL' in 'js/config.js' to this URL (or open the frontend and set it in devtools)."
      echo "Server PID: $SERVER_PID, ngrok PID: $NGROK_PID"
      echo "Note: this tunnel is temporary — for a permanent public site, deploy to Render as described in DEPLOY.md."
      exit 0
    fi
  fi
done

echo "Failed to obtain ngrok public URL. Check ngrok logs or run 'ngrok http $PORT' manually." 
exit 1
