package com.resolvenow.assignment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvenow.assignment.dto.AssignmentRequest;
import com.resolvenow.assignment.entity.Assignment;
import com.resolvenow.assignment.repository.AssignmentRepository;
import com.resolvenow.assignment.repository.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssignmentRepository assignmentRepository;

    @MockBean
    private DepartmentRepository departmentRepository;

    @MockBean
    private RestTemplate restTemplate;

    @Test
    void createAssignment_ShouldReturn201() throws Exception {
        AssignmentRequest request = new AssignmentRequest();
        request.setComplaintId(1L);
        request.setDepartment("GENERAL_SUPPORT");
        request.setPriority("MEDIUM");

        Assignment saved = new Assignment();
        saved.setId(1L);
        saved.setComplaintId(1L);
        saved.setDepartment("GENERAL_SUPPORT");
        saved.setAssignedTo("Agent-GEN-042");
        saved.setStatus("ASSIGNED");
        saved.setAssignedAt(LocalDateTime.now());

        when(assignmentRepository.save(any(Assignment.class))).thenReturn(saved);

        mockMvc.perform(post("/assignments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.department").value("GENERAL_SUPPORT"))
                .andExpect(jsonPath("$.status").value("ASSIGNED"));
    }

    @Test
    void getAssignmentById_ShouldReturn200() throws Exception {
        Assignment assignment = new Assignment();
        assignment.setId(1L);
        assignment.setComplaintId(1L);
        assignment.setDepartment("TECHNICAL");
        assignment.setAssignedTo("Agent-TEC-101");
        assignment.setStatus("ASSIGNED");
        assignment.setAssignedAt(LocalDateTime.now());

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));

        mockMvc.perform(get("/assignments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department").value("TECHNICAL"));
    }
}
