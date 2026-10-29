package com.resolvenow.complaint.dto;

import com.resolvenow.complaint.entity.Complaint;

import java.time.LocalDateTime;

/**
 * DTO for outgoing complaint responses.
 */
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Object assignment;

    /**
     * Static factory method to create a ComplaintResponse from a Complaint entity.
     *
     * @param complaint the complaint entity
     * @return a populated ComplaintResponse
     */
    public static ComplaintResponse fromEntity(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setPriority(complaint.getPriority());
        response.setUserId(complaint.getUserId());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setUpdatedAt(complaint.getUpdatedAt());
        return response;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Object getAssignment() {
        return assignment;
    }

    public void setAssignment(Object assignment) {
        this.assignment = assignment;
    }
}
