package com.resolvenow.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway application entry point.
 * Routes all incoming requests to downstream microservices via Spring Cloud Gateway.
 * Integrates with Eureka for service discovery and applies JWT authentication filtering.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
