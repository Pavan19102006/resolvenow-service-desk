package com.resolvenow.assignment.service;

import com.resolvenow.assignment.dto.AssignmentRequest;
import com.resolvenow.assignment.dto.AssignmentResponse;
import com.resolvenow.assignment.dto.NotificationRequest;
import com.resolvenow.assignment.entity.Assignment;
import com.resolvenow.assignment.exception.ResourceNotFoundException;
import com.resolvenow.assignment.repository.AssignmentRepository;
import com.resolvenow.assignment.repository.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Service implementation for managing complaint-to-department assignments.
 * Communicates with Notification Service to alert users on assignment events.
 */
@Service
public class AssignmentServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(AssignmentServiceImpl.class);

    private final AssignmentRepository assignmentRepository;
    private final DepartmentRepository departmentRepository;
    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;
    private final Random random = new Random();

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository,
                                  DepartmentRepository departmentRepository,
                                  RestTemplate restTemplate,
                                  @org.springframework.beans.factory.annotation.Value("${services.notification.url:http://NOTIFICATION-SERVICE/notifications}") String notificationServiceUrl) {
        this.assignmentRepository = assignmentRepository;
        this.departmentRepository = departmentRepository;
        this.restTemplate = restTemplate;
        this.notificationServiceUrl = notificationServiceUrl;
    }

    public AssignmentResponse createAssignment(AssignmentRequest request) {
        Assignment assignment = new Assignment();
        assignment.setComplaintId(request.getComplaintId());
        assignment.setDepartment(request.getDepartment());
        assignment.setAssignedTo("Agent-" + request.getDepartment().substring(0, Math.min(3, request.getDepartment().length())).toUpperCase()
                + "-" + String.format("%03d", random.nextInt(1000)));
        assignment.setStatus("ASSIGNED");

        Assignment saved = assignmentRepository.save(assignment);
        log.info("Assignment created: complaint #{} assigned to {} ({})", saved.getComplaintId(), saved.getDepartment(), saved.getAssignedTo());

        // Notify user via Notification Service
        try {
            NotificationRequest notification = new NotificationRequest(
                    1L, saved.getComplaintId(),
                    "Your complaint #" + saved.getComplaintId() + " has been assigned to department: " + saved.getDepartment(),
                    "ASSIGNMENT"
            );
            restTemplate.postForObject(notificationServiceUrl, notification, Object.class);
            log.info("Notification sent for assignment of complaint #{}", saved.getComplaintId());
        } catch (Exception e) {
            log.warn("Failed to send notification for complaint #{}: {}", saved.getComplaintId(), e.getMessage());
        }

        return AssignmentResponse.fromEntity(saved);
    }

    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        return AssignmentResponse.fromEntity(assignment);
    }

    public List<AssignmentResponse> getAssignmentsByComplaintId(Long complaintId) {
        return assignmentRepository.findByComplaintId(complaintId).stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getAssignmentsByDepartment(String department) {
        return assignmentRepository.findByDepartment(department).stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AssignmentResponse updateAssignmentStatus(Long id, String status) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        assignment.setStatus(status);
        assignment.setUpdatedAt(LocalDateTime.now());
        Assignment saved = assignmentRepository.save(assignment);

        try {
            NotificationRequest notification = new NotificationRequest(
                    1L, saved.getComplaintId(),
                    "Assignment for complaint #" + saved.getComplaintId() + " status updated to: " + status,
                    "STATUS_UPDATE"
            );
            restTemplate.postForObject(notificationServiceUrl, notification, Object.class);
        } catch (Exception e) {
            log.warn("Failed to send status update notification: {}", e.getMessage());
        }

        return AssignmentResponse.fromEntity(saved);
    }
}
