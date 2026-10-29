package com.resolvenow.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating notifications with bean validation.
 */
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long complaintId;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Notification type is required")
    private String type;

    public NotificationRequest() {}

    public NotificationRequest(Long userId, Long complaintId, String message, String type) {
        this.userId = userId;
        this.complaintId = complaintId;
        this.message = message;
        this.type = type;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
