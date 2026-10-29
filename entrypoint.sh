#!/bin/sh

echo "=================================================="
echo "Starting ResolveNow Microservices Platform on Render"
echo "=================================================="

# Detect PostgreSQL DATABASE_URL if provided by Render
if [ -n "$DATABASE_URL" ]; then
    echo "Configuring PostgreSQL connection from Render DATABASE_URL..."
    # Convert postgres:// to postgresql://
    CLEAN_URL=$(echo "$DATABASE_URL" | sed 's/^postgres:\/\//postgresql:\/\//')
    
    # If the URL doesn't start with jdbc:, prepend jdbc:
    case "$CLEAN_URL" in
        jdbc:*) JDBC_URL="$CLEAN_URL" ;;
        *)      JDBC_URL="jdbc:$CLEAN_URL" ;;
    esac
    
    export SPRING_DATASOURCE_URL="$JDBC_URL"
    echo "JDBC URL configured."
fi

# Optimized JVM memory settings for Render free tier (512 MB total RAM)
JVM_OPTS="-XX:+UseSerialGC -Xss256k -Xms24m -Xmx48m -Djava.net.preferIPv4Stack=true"

echo "1. Starting Eureka Server (Port 8761)..."
java $JVM_OPTS -jar /app/eureka-server.jar > /tmp/eureka.log 2>&1 &
EUREKA_PID=$!

echo "Waiting for Eureka Server to initialize..."
for i in $(seq 1 30); do
    if wget -q -O - http://localhost:8761/eureka/apps >/dev/null 2>&1; then
        echo "Eureka Server is READY!"
        break
    fi
    sleep 1
done

echo "2. Starting Microservices (Auth, Complaint, Assignment, Notification)..."
java $JVM_OPTS -jar /app/auth-service.jar > /tmp/auth.log 2>&1 &
java $JVM_OPTS -jar /app/complaint-service.jar > /tmp/complaint.log 2>&1 &
java $JVM_OPTS -jar /app/assignment-service.jar > /tmp/assignment.log 2>&1 &
java $JVM_OPTS -jar /app/notification-service.jar > /tmp/notification.log 2>&1 &

echo "Waiting 5 seconds for services to register..."
sleep 5

echo "3. Starting API Gateway on Port ${PORT:-8080}..."
exec java $JVM_OPTS -Dserver.port=${PORT:-8080} -jar /app/api-gateway.jar
