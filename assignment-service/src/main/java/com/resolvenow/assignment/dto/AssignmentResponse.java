package com.resolvenow.assignment.dto;

import com.resolvenow.assignment.entity.Assignment;

import java.time.LocalDateTime;

/**
 * DTO for outgoing assignment responses.
 */
public class AssignmentResponse {

    private Long id;
    private Long complaintId;
    private String department;
    private String assignedTo;
    private String status;
    private LocalDateTime assignedAt;

    public AssignmentResponse() {
    }

    /**
     * Static factory method to create an AssignmentResponse from an Assignment entity.
     *
     * @param assignment the Assignment entity
     * @return a populated AssignmentResponse
     */
    public static AssignmentResponse fromEntity(Assignment assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setComplaintId(assignment.getComplaintId());
        response.setDepartment(assignment.getDepartment());
        response.setAssignedTo(assignment.getAssignedTo());
        response.setStatus(assignment.getStatus());
        response.setAssignedAt(assignment.getAssignedAt());
        return response;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
