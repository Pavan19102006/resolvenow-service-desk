package com.resolvenow.complaint.dto;

/**
 * DTO for requesting an assignment from the Assignment Service.
 */
public class AssignmentRequest {

    private Long complaintId;
    private String department;
    private String priority;

    // --- Getters and Setters ---

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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
