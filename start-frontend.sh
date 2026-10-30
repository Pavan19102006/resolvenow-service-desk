#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
FRONTEND_DIR="$DIR/frontend"

echo "=================================================="
echo "Starting ResolveNow Service Desk Web Frontend"
echo "=================================================="

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi

echo "Backend Default Target: https://resolvenow-service-desk.onrender.com"
echo "Launching Vite dev server on http://localhost:3000 ..."
echo "Press Ctrl+C to stop the frontend server."
echo "=================================================="

cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 --port 3000

