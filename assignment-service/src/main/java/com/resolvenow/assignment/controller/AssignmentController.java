package com.resolvenow.assignment.controller;

import com.resolvenow.assignment.dto.AssignmentRequest;
import com.resolvenow.assignment.dto.AssignmentResponse;
import com.resolvenow.assignment.service.AssignmentServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing complaint assignments to departments.
 */
@RestController
@RequestMapping("/assignments")
public class AssignmentController {

    private final AssignmentServiceImpl assignmentService;

    public AssignmentController(AssignmentServiceImpl assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse response = assignmentService.createAssignment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByComplaintId(@PathVariable Long complaintId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByComplaintId(complaintId));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByDepartment(department));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssignmentResponse> updateAssignmentStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(assignmentService.updateAssignmentStatus(id, status));
    }
}
