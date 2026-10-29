#!/bin/sh

echo "=================================================="
echo "Starting ResolveNow Microservices Platform on Render"
echo "=================================================="

# Detect PostgreSQL DATABASE_URL if provided by Render
if [ -n "$DATABASE_URL" ]; then
    echo "Configuring PostgreSQL connection from Render DATABASE_URL..."
    CLEAN_URL=$(echo "$DATABASE_URL" | sed 's/^postgres:\/\//postgresql:\/\//')
    
    case "$CLEAN_URL" in
        jdbc:*) JDBC_URL="$CLEAN_URL" ;;
        *)      JDBC_URL="jdbc:$CLEAN_URL" ;;
    esac
    
    export SPRING_DATASOURCE_URL="$JDBC_URL"
    echo "PostgreSQL JDBC configured."
fi

# JVM memory settings optimized for Render 512MB RAM
JVM_OPTS="-XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss256k -Djava.net.preferIPv4Stack=true"

echo "1. Starting Backend Microservices (Port 8081)..."
java $JVM_OPTS -Xms32m -Xmx160m -Dserver.port=8081 -jar /app/render-backend.jar > /tmp/backend.log 2>&1 &

echo "Waiting for Backend to initialize..."
for i in $(seq 1 30); do
    if wget -q -O - http://127.0.0.1:8081/actuator/health >/dev/null 2>&1 || nc -z 127.0.0.1 8081; then
        echo "Backend Microservices are READY on Port 8081!"
        break
    fi
    sleep 1
done

# Configure API Gateway to route to localhost:8081
export AUTH_SERVICE_URL="http://127.0.0.1:8081"
export COMPLAINT_SERVICE_URL="http://127.0.0.1:8081"
export ASSIGNMENT_SERVICE_URL="http://127.0.0.1:8081"
export NOTIFICATION_SERVICE_URL="http://127.0.0.1:8081"
export EUREKA_CLIENT_ENABLED="false"

echo "2. Starting API Gateway on Render Port ${PORT:-8080}..."
exec java $JVM_OPTS -Xms24m -Xmx90m -Dserver.port=${PORT:-8080} -jar /app/api-gateway.jar
