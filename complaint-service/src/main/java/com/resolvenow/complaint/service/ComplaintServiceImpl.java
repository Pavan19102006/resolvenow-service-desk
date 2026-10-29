package com.resolvenow.complaint.service;

import com.resolvenow.complaint.dto.AssignmentRequest;
import com.resolvenow.complaint.dto.ComplaintRequest;
import com.resolvenow.complaint.dto.ComplaintResponse;
import com.resolvenow.complaint.entity.Complaint;
import com.resolvenow.complaint.exception.ResourceNotFoundException;
import com.resolvenow.complaint.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing customer complaints.
 * Integrates with the Assignment Service for automatic complaint assignment.
 */
@Service
public class ComplaintServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(ComplaintServiceImpl.class);
    private final String assignmentServiceUrl;
    private final ComplaintRepository complaintRepository;
    private final RestTemplate restTemplate;

    public ComplaintServiceImpl(ComplaintRepository complaintRepository,
                                RestTemplate restTemplate,
                                @org.springframework.beans.factory.annotation.Value("${services.assignment.url:http://ASSIGNMENT-SERVICE/assignments}") String assignmentServiceUrl) {
        this.complaintRepository = complaintRepository;
        this.restTemplate = restTemplate;
        this.assignmentServiceUrl = assignmentServiceUrl;
    }

    public ComplaintResponse createComplaint(ComplaintRequest request) {
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        complaint.setUserId(request.getUserId());

        Complaint savedComplaint = complaintRepository.save(complaint);
        ComplaintResponse response = ComplaintResponse.fromEntity(savedComplaint);

        // Auto-assign the complaint via Assignment Service
        try {
            AssignmentRequest assignmentRequest = new AssignmentRequest();
            assignmentRequest.setComplaintId(savedComplaint.getId());
            assignmentRequest.setPriority(savedComplaint.getPriority());
            assignmentRequest.setDepartment(determineDepartment(savedComplaint.getPriority()));

            Object assignmentResponse = restTemplate.postForObject(
                    assignmentServiceUrl, assignmentRequest, Object.class);
            response.setAssignment(assignmentResponse);
            log.info("Complaint {} successfully assigned", savedComplaint.getId());
        } catch (Exception e) {
            log.warn("Failed to auto-assign complaint {}: {}", savedComplaint.getId(), e.getMessage());
        }

        return response;
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return ComplaintResponse.fromEntity(complaint);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByUserId(Long userId) {
        return complaintRepository.findByUserId(userId).stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ComplaintResponse updateComplaintStatus(Long id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        List<String> validStatuses = List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Valid statuses: " + validStatuses);
        }

        complaint.setStatus(status.toUpperCase());
        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint updatedComplaint = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(updatedComplaint);
    }

    private String determineDepartment(String priority) {
        return switch (priority.toUpperCase()) {
            case "HIGH" -> "ESCALATION";
            case "LOW" -> "SELF_SERVICE";
            default -> "GENERAL_SUPPORT";
        };
    }
}
