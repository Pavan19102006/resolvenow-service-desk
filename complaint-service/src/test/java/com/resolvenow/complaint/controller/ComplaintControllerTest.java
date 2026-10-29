package com.resolvenow.complaint.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvenow.complaint.dto.ComplaintRequest;
import com.resolvenow.complaint.entity.Complaint;
import com.resolvenow.complaint.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ComplaintControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ComplaintRepository complaintRepository;

    @MockBean
    private RestTemplate restTemplate;

    private Complaint sampleComplaint;

    @BeforeEach
    void setUp() {
        sampleComplaint = new Complaint();
        sampleComplaint.setId(1L);
        sampleComplaint.setTitle("Test Complaint Title");
        sampleComplaint.setDescription("Test complaint description with enough length");
        sampleComplaint.setStatus("OPEN");
        sampleComplaint.setPriority("MEDIUM");
        sampleComplaint.setUserId(1L);
        sampleComplaint.setCreatedAt(LocalDateTime.now());
        sampleComplaint.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("POST /complaints")
    class CreateComplaintTests {

        @Test
        @DisplayName("Should create complaint successfully")
        void createComplaint_Success() throws Exception {
            ComplaintRequest request = new ComplaintRequest();
            request.setTitle("Login Issue");
            request.setDescription("Cannot login to the portal, getting 500 error");
            request.setPriority("HIGH");
            request.setUserId(1L);

            when(complaintRepository.save(any(Complaint.class))).thenReturn(sampleComplaint);

            mockMvc.perform(post("/complaints")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.status").value("OPEN"));
        }

        @Test
        @DisplayName("Should fail when title is blank")
        void createComplaint_BlankTitle_ShouldReturn400() throws Exception {
            ComplaintRequest request = new ComplaintRequest();
            request.setTitle("");
            request.setDescription("Valid description with enough length");
            request.setUserId(1L);

            mockMvc.perform(post("/complaints")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors").exists());
        }

        @Test
        @DisplayName("Should fail when description is too short")
        void createComplaint_ShortDescription_ShouldReturn400() throws Exception {
            ComplaintRequest request = new ComplaintRequest();
            request.setTitle("Valid Title");
            request.setDescription("Short");
            request.setUserId(1L);

            mockMvc.perform(post("/complaints")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail when userId is null")
        void createComplaint_NullUserId_ShouldReturn400() throws Exception {
            ComplaintRequest request = new ComplaintRequest();
            request.setTitle("Valid Title Here");
            request.setDescription("Valid description with enough characters");

            mockMvc.perform(post("/complaints")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail with empty request body")
        void createComplaint_EmptyBody_ShouldReturn400() throws Exception {
            mockMvc.perform(post("/complaints")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /complaints")
    class GetComplaintTests {

        @Test
        @DisplayName("Should return all complaints")
        void getAllComplaints_Success() throws Exception {
            when(complaintRepository.findAll()).thenReturn(Arrays.asList(sampleComplaint));

            mockMvc.perform(get("/complaints"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @DisplayName("Should return empty list when no complaints")
        void getAllComplaints_Empty() throws Exception {
            when(complaintRepository.findAll()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/complaints"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }

        @Test
        @DisplayName("Should return complaint by ID")
        void getComplaintById_Success() throws Exception {
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(sampleComplaint));

            mockMvc.perform(get("/complaints/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.title").value("Test Complaint Title"));
        }

        @Test
        @DisplayName("Should return 404 for non-existent complaint")
        void getComplaintById_NotFound() throws Exception {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/complaints/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value("Complaint not found with id: 999"));
        }

        @Test
        @DisplayName("Should return complaints by user ID")
        void getComplaintsByUserId_Success() throws Exception {
            when(complaintRepository.findByUserId(1L)).thenReturn(Arrays.asList(sampleComplaint));

            mockMvc.perform(get("/complaints/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].userId").value(1));
        }
    }

    @Nested
    @DisplayName("PUT /complaints/{id}/status")
    class UpdateStatusTests {

        @Test
        @DisplayName("Should update complaint status to IN_PROGRESS")
        void updateStatus_Success() throws Exception {
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(sampleComplaint));
            when(complaintRepository.save(any(Complaint.class))).thenReturn(sampleComplaint);

            mockMvc.perform(put("/complaints/1/status").param("status", "IN_PROGRESS"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should fail for invalid status value")
        void updateStatus_InvalidStatus_ShouldReturn400() throws Exception {
            when(complaintRepository.findById(1L)).thenReturn(Optional.of(sampleComplaint));

            mockMvc.perform(put("/complaints/1/status").param("status", "INVALID_STATUS"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent complaint")
        void updateStatus_NotFound_ShouldReturn404() throws Exception {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(put("/complaints/999/status").param("status", "RESOLVED"))
                    .andExpect(status().isNotFound());
        }
    }
}
