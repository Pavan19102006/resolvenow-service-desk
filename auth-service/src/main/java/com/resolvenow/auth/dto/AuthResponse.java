package com.resolvenow.auth.dto;

/**
 * DTO for authentication responses.
 */
public class AuthResponse {

    private String token;
    private String username;
    private String message;

    /**
     * All-args constructor.
     *
     * @param token    the JWT token (may be null for registration responses)
     * @param username the authenticated username
     * @param message  a descriptive message about the operation result
     */
    public AuthResponse(String token, String username, String message) {
        this.token = token;
        this.username = username;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getMessage() {
        return message;
    }
}
