#!/bin/bash

# Detect Java 17
if [ -x "/opt/homebrew/opt/openjdk@17/bin/java" ]; then
    JAVA_CMD="/opt/homebrew/opt/openjdk@17/bin/java"
elif [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVA_CMD="$JAVA_HOME/bin/java"
else
    JAVA_CMD="java"
fi

JAVA_OPTS="-Djava.net.preferIPv4Stack=true"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

echo "Using Java: $($JAVA_CMD -version 2>&1 | head -n 1)"
echo "JVM Options: $JAVA_OPTS"
echo "Logs directory: $LOG_DIR"

echo "----------------------------------------"
echo "1. Starting Eureka Server (Port 8761)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$DIR/eureka-server/target/eureka-server-1.0.0.jar" > "$LOG_DIR/eureka-server.log" 2>&1 &
echo $! > "$LOG_DIR/eureka-server.pid"

# Wait for Eureka to start
echo "Waiting for Eureka Server to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8761/eureka/apps > /dev/null 2>&1; then
        echo "Eureka Server is UP!"
        break
    fi
    sleep 1
done

resolve_jar() {
    local dir=$1
    local name=$2
    if [ -f "$dir/target/${name}-1.0.0-exec.jar" ]; then
        echo "$dir/target/${name}-1.0.0-exec.jar"
    else
        echo "$dir/target/${name}-1.0.0.jar"
    fi
}

echo "----------------------------------------"
echo "2. Starting Auth Service (Port 8081)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$(resolve_jar "$DIR/auth-service" auth-service)" > "$LOG_DIR/auth-service.log" 2>&1 &
echo $! > "$LOG_DIR/auth-service.pid"

echo "3. Starting Complaint Service (Port 8082)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$(resolve_jar "$DIR/complaint-service" complaint-service)" > "$LOG_DIR/complaint-service.log" 2>&1 &
echo $! > "$LOG_DIR/complaint-service.pid"

echo "4. Starting Assignment Service (Port 8083)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$(resolve_jar "$DIR/assignment-service" assignment-service)" > "$LOG_DIR/assignment-service.log" 2>&1 &
echo $! > "$LOG_DIR/assignment-service.pid"

echo "5. Starting Notification Service (Port 8084)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$(resolve_jar "$DIR/notification-service" notification-service)" > "$LOG_DIR/notification-service.log" 2>&1 &
echo $! > "$LOG_DIR/notification-service.pid"

echo "6. Starting API Gateway (Port 8080)..."
nohup "$JAVA_CMD" $JAVA_OPTS -jar "$(resolve_jar "$DIR/api-gateway" api-gateway)" > "$LOG_DIR/api-gateway.log" 2>&1 &
echo $! > "$LOG_DIR/api-gateway.pid"

echo "----------------------------------------"
echo "All 6 services launched!"
echo "Check Eureka dashboard at: http://localhost:8761"
echo "API Gateway running at:    http://localhost:8080"
echo "To stop all services:      ./stop-all.sh"
echo "----------------------------------------"
