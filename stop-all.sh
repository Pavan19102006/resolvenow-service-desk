#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
LOG_DIR="$DIR/logs"

echo "Stopping all ResolveNow microservices..."

for pid_file in "$LOG_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        SERVICE=$(basename "$pid_file" .pid)
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "Stopped $SERVICE (PID $PID)"
        fi
        rm -f "$pid_file"
    fi
done

# Clean up any remaining processes on the ports just in case
lsof -ti:8761,8080,8081,8082,8083,8084 | xargs kill -9 2>/dev/null

echo "All services stopped."

