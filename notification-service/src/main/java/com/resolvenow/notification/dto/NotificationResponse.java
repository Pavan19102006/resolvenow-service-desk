package com.resolvenow.notification.dto;

import com.resolvenow.notification.entity.Notification;

import java.time.LocalDateTime;

/**
 * DTO for outgoing notification responses.
 */
public class NotificationResponse {

    private Long id;
    private Long userId;
    private Long complaintId;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;

    /**
     * No-arg constructor for serialization.
     */
    public NotificationResponse() {
    }

    /**
     * Static factory method that creates a {@link NotificationResponse} from a
     * {@link Notification} entity.
     *
     * @param notification the notification entity
     * @return a new NotificationResponse populated from the entity
     */
    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setComplaintId(notification.getComplaintId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
