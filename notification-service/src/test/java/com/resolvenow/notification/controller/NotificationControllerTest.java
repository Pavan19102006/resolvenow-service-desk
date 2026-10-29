package com.resolvenow.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvenow.notification.dto.NotificationRequest;
import com.resolvenow.notification.dto.NotificationResponse;
import com.resolvenow.notification.entity.Notification;
import com.resolvenow.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link NotificationController}.
 * Uses MockMvc with a mocked NotificationRepository.
 */
@SpringBootTest
@AutoConfigureMockMvc
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationRepository notificationRepository;

    /**
     * Tests that creating a notification returns HTTP 201 Created.
     */
    @Test
    void testCreateNotification_returns201() throws Exception {
        Notification savedNotification = new Notification();
        savedNotification.setId(1L);
        savedNotification.setUserId(100L);
        savedNotification.setComplaintId(200L);
        savedNotification.setMessage("Your complaint has been assigned");
        savedNotification.setType("ASSIGNMENT");
        savedNotification.setRead(false);
        savedNotification.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.save(any(Notification.class))).thenReturn(savedNotification);

        NotificationRequest request = new NotificationRequest();
        request.setUserId(100L);
        request.setComplaintId(200L);
        request.setMessage("Your complaint has been assigned");
        request.setType("ASSIGNMENT");

        mockMvc.perform(post("/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(100))
                .andExpect(jsonPath("$.complaintId").value(200))
                .andExpect(jsonPath("$.message").value("Your complaint has been assigned"))
                .andExpect(jsonPath("$.type").value("ASSIGNMENT"))
                .andExpect(jsonPath("$.read").value(false));
    }

    /**
     * Tests that retrieving notifications by user ID returns HTTP 200 OK.
     */
    @Test
    void testGetNotificationsByUserId_returns200() throws Exception {
        Notification notification1 = new Notification();
        notification1.setId(1L);
        notification1.setUserId(100L);
        notification1.setComplaintId(200L);
        notification1.setMessage("Complaint assigned");
        notification1.setType("ASSIGNMENT");
        notification1.setRead(false);
        notification1.setCreatedAt(LocalDateTime.now());

        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUserId(100L);
        notification2.setComplaintId(201L);
        notification2.setMessage("Status updated");
        notification2.setType("STATUS_UPDATE");
        notification2.setRead(true);
        notification2.setCreatedAt(LocalDateTime.now());

        List<Notification> notifications = Arrays.asList(notification1, notification2);
        when(notificationRepository.findByUserId(100L)).thenReturn(notifications);

        mockMvc.perform(get("/notifications/user/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value(100))
                .andExpect(jsonPath("$[1].userId").value(100));
    }

    /**
     * Tests that marking a notification as read returns HTTP 200 OK.
     */
    @Test
    void testMarkAsRead_returns200() throws Exception {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId(100L);
        notification.setComplaintId(200L);
        notification.setMessage("Complaint assigned");
        notification.setType("ASSIGNMENT");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification updatedNotification = new Notification();
        updatedNotification.setId(1L);
        updatedNotification.setUserId(100L);
        updatedNotification.setComplaintId(200L);
        updatedNotification.setMessage("Complaint assigned");
        updatedNotification.setType("ASSIGNMENT");
        updatedNotification.setRead(true);
        updatedNotification.setCreatedAt(notification.getCreatedAt());

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(updatedNotification);

        mockMvc.perform(put("/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.read").value(true));
    }
}
