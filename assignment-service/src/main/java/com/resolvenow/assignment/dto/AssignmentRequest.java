package com.resolvenow.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating assignments with bean validation.
 */
public class AssignmentRequest {

    @NotNull(message = "Complaint ID is required")
    private Long complaintId;

    @NotBlank(message = "Department is required")
    private String department;

    private String priority;

    public AssignmentRequest() {}

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
