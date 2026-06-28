#!/bin/sh
set -e

DIST_DIR="/usr/share/nginx/html"
ENV_FILE="$DIST_DIR/env-config.js"

echo "Injecting runtime environment variables..."

sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" "$ENV_FILE"
sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL:-}|g" "$ENV_FILE"

echo "Environment injection complete:"
cat "$ENV_FILE"

exec nginx -g "daemon off;"
