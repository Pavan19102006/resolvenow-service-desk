package com.resolvenow.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvenow.auth.dto.AuthRequest;
import com.resolvenow.auth.entity.User;
import com.resolvenow.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Nested
    @DisplayName("POST /auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Should register a new user successfully")
        void registerUser_Success() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("testuser");
            request.setPassword("password123");
            request.setEmail("test@example.com");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("testuser"))
                    .andExpect(jsonPath("$.message").value("User registered successfully"));
        }

        @Test
        @DisplayName("Should fail when username is blank")
        void registerUser_BlankUsername_ShouldReturn400() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("");
            request.setPassword("password123");
            request.setEmail("test@example.com");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors").exists());
        }

        @Test
        @DisplayName("Should fail when password is too short")
        void registerUser_ShortPassword_ShouldReturn400() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("testuser");
            request.setPassword("abc");
            request.setEmail("test@example.com");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail when username already exists")
        void registerUser_DuplicateUsername_ShouldReturn409() throws Exception {
            // First registration
            AuthRequest request = new AuthRequest();
            request.setUsername("duplicate");
            request.setPassword("password123");
            request.setEmail("first@example.com");

            mockMvc.perform(post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)));

            // Duplicate registration
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should fail with invalid email format")
        void registerUser_InvalidEmail_ShouldReturn400() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("testuser");
            request.setPassword("password123");
            request.setEmail("not-an-email");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should register with ADMIN role")
        void registerUser_WithAdminRole() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("admin");
            request.setPassword("admin123");
            request.setEmail("admin@example.com");
            request.setRole("ADMIN");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("POST /auth/login")
    class LoginTests {

        @BeforeEach
        void registerUser() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("loginuser");
            request.setPassword("password123");
            request.setEmail("login@example.com");

            mockMvc.perform(post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)));
        }

        @Test
        @DisplayName("Should login successfully and return JWT token")
        void login_Success() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("loginuser");
            request.setPassword("password123");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.username").value("loginuser"))
                    .andExpect(jsonPath("$.message").value("Login successful"));
        }

        @Test
        @DisplayName("Should fail with wrong password")
        void login_WrongPassword_ShouldReturn401() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("loginuser");
            request.setPassword("wrongpassword");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should fail with non-existent username")
        void login_NonExistentUser_ShouldReturn401() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setUsername("nouser");
            request.setPassword("password123");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should fail with empty request body")
        void login_EmptyBody_ShouldReturn400() throws Exception {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /auth/validate")
    class ValidateTests {

        @Test
        @DisplayName("Should validate a valid token")
        void validateToken_ValidToken() throws Exception {
            // Register and login to get token
            AuthRequest reg = new AuthRequest();
            reg.setUsername("validateuser");
            reg.setPassword("password123");
            reg.setEmail("val@example.com");

            mockMvc.perform(post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(reg)));

            String loginResponse = mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reg)))
                    .andReturn().getResponse().getContentAsString();

            String token = objectMapper.readTree(loginResponse).get("token").asText();

            mockMvc.perform(get("/auth/validate").param("token", token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("valid"))
                    .andExpect(jsonPath("$.username").value("validateuser"));
        }

        @Test
        @DisplayName("Should reject an invalid token")
        void validateToken_InvalidToken() throws Exception {
            mockMvc.perform(get("/auth/validate").param("token", "invalid.token.here"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value("invalid"));
        }
    }
}
