package com.resolvenow.assignment.dto;

/**
 * DTO for sending notification requests to the Notification Service.
 */
public class NotificationRequest {

    private Long userId;
    private Long complaintId;
    private String message;
    private String type;

    public NotificationRequest() {
    }

    public NotificationRequest(Long userId, Long complaintId, String message, String type) {
        this.userId = userId;
        this.complaintId = complaintId;
        this.message = message;
        this.type = type;
    }

    // --- Getters and Setters ---

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
