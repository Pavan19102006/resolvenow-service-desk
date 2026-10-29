# Stage 1: Build all Maven modules
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy pom files first for dependency caching
COPY pom.xml .
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY complaint-service/pom.xml complaint-service/
COPY assignment-service/pom.xml assignment-service/
COPY notification-service/pom.xml notification-service/

# Copy all source code
COPY eureka-server/src eureka-server/src
COPY api-gateway/src api-gateway/src
COPY auth-service/src auth-service/src
COPY complaint-service/src complaint-service/src
COPY assignment-service/src assignment-service/src
COPY notification-service/src notification-service/src

# Package all services (skipping tests during Docker image build)
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JARs from builder stage
COPY --from=builder /build/eureka-server/target/eureka-server-1.0.0.jar /app/eureka-server.jar
COPY --from=builder /build/api-gateway/target/api-gateway-1.0.0.jar /app/api-gateway.jar
COPY --from=builder /build/auth-service/target/auth-service-1.0.0.jar /app/auth-service.jar
COPY --from=builder /build/complaint-service/target/complaint-service-1.0.0.jar /app/complaint-service.jar
COPY --from=builder /build/assignment-service/target/assignment-service-1.0.0.jar /app/assignment-service.jar
COPY --from=builder /build/notification-service/target/notification-service-1.0.0.jar /app/notification-service.jar

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose Render default port
EXPOSE 8080 10000

ENTRYPOINT ["/app/entrypoint.sh"]
