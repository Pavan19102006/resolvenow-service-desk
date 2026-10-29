package com.resolvenow.assignment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Main application class for the Assignment Service.
 * Provides complaint-to-department assignment functionality
 * and integrates with the Notification Service via service discovery.
 */
@SpringBootApplication
public class AssignmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssignmentServiceApplication.class, args);
    }

    /**
     * Creates a load-balanced RestTemplate bean for inter-service communication.
     *
     * @return a RestTemplate instance with client-side load balancing
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
