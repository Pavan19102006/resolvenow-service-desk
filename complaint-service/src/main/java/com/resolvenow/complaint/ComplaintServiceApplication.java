package com.resolvenow.complaint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Main application class for the Complaint Service.
 * Provides REST API for logging and tracking customer grievances.
 */
@SpringBootApplication
public class ComplaintServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplaintServiceApplication.class, args);
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
