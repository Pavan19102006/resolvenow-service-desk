#!/bin/sh

echo "=================================================="
echo "Starting ResolveNow Microservices Platform on Render"
echo "=================================================="

# Parse Render DATABASE_URL into standard Spring DataSource properties
if [ -n "$DATABASE_URL" ]; then
    echo "Parsing PostgreSQL DATABASE_URL..."
    NO_PROTO="${DATABASE_URL#*://}"
    USER_PASS="${NO_PROTO%%@*}"
    HOST_DB="${NO_PROTO#*@}"

    DB_USER="${USER_PASS%%:*}"
    DB_PASS="${USER_PASS#*:}"

    DB_HOST="${HOST_DB%%/*}"
    DB_NAME="${HOST_DB#*/}"

    export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}/${DB_NAME}"
    export SPRING_DATASOURCE_USERNAME="${DB_USER}"
    export SPRING_DATASOURCE_PASSWORD="${DB_PASS}"
    echo "PostgreSQL configured: ${SPRING_DATASOURCE_URL} (User: ${SPRING_DATASOURCE_USERNAME})"
else
    echo "No DATABASE_URL found, using default datasource."
fi

# JVM memory settings optimized for Render 512MB RAM
JVM_OPTS="-XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss256k -Djava.net.preferIPv4Stack=true"

echo "1. Starting Backend Microservices (Port 8081)..."
java $JVM_OPTS -Xms32m -Xmx160m -Dserver.port=8081 -jar /app/render-backend.jar > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "Waiting for Backend to initialize..."
for i in $(seq 1 30); do
    if wget -q -O - http://127.0.0.1:8081/actuator/health >/dev/null 2>&1 || nc -z 127.0.0.1 8081; then
        echo "Backend Microservices are READY on Port 8081!"
        break
    fi
    sleep 1
done

# If backend died, print log for debugging
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start! Dumping /tmp/backend.log:"
    cat /tmp/backend.log
fi

# Configure API Gateway to route to localhost:8081
export AUTH_SERVICE_URL="http://127.0.0.1:8081"
export COMPLAINT_SERVICE_URL="http://127.0.0.1:8081"
export ASSIGNMENT_SERVICE_URL="http://127.0.0.1:8081"
export NOTIFICATION_SERVICE_URL="http://127.0.0.1:8081"
export EUREKA_CLIENT_ENABLED="false"

echo "2. Starting API Gateway on Render Port ${PORT:-8080}..."
exec java $JVM_OPTS -Xms24m -Xmx90m -Dserver.port=${PORT:-8080} -jar /app/api-gateway.jar
