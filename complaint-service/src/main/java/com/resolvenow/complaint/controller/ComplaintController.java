package com.resolvenow.complaint.controller;

import com.resolvenow.complaint.dto.ComplaintRequest;
import com.resolvenow.complaint.dto.ComplaintResponse;
import com.resolvenow.complaint.service.ComplaintServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing customer complaints.
 */
@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintServiceImpl complaintService;

    public ComplaintController(ComplaintServiceImpl complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        ComplaintResponse response = complaintService.createComplaint(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.getComplaintsByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status));
    }
}
