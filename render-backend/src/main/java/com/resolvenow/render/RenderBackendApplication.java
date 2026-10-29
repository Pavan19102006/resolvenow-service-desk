package com.resolvenow.render;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;

/**
 * Consolidated microservices runtime for Render Free Tier hosting.
 * Hosts Auth, Complaint, Assignment, and Notification services in a single
 * memory-efficient JVM (under 150MB RAM) while preserving complete modularity.
 */
@SpringBootApplication(scanBasePackages = {
        "com.resolvenow.auth",
        "com.resolvenow.complaint",
        "com.resolvenow.assignment",
        "com.resolvenow.notification",
        "com.resolvenow.render"
})
@EntityScan(basePackages = {
        "com.resolvenow.auth.entity",
        "com.resolvenow.complaint.entity",
        "com.resolvenow.assignment.entity",
        "com.resolvenow.notification.entity"
})
@EnableJpaRepositories(basePackages = {
        "com.resolvenow.auth.repository",
        "com.resolvenow.complaint.repository",
        "com.resolvenow.assignment.repository",
        "com.resolvenow.notification.repository"
})
@EnableWebSecurity
public class RenderBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RenderBackendApplication.class, args);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
