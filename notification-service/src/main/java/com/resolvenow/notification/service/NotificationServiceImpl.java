package com.resolvenow.notification.service;

import com.resolvenow.notification.dto.NotificationRequest;
import com.resolvenow.notification.dto.NotificationResponse;
import com.resolvenow.notification.entity.Notification;
import com.resolvenow.notification.exception.ResourceNotFoundException;
import com.resolvenow.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing user notifications.
 */
@Service
public class NotificationServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setComplaintId(request.getComplaintId());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());

        Notification saved = notificationRepository.save(notification);
        log.info("Notification sent to user {} for complaint {}: {}", saved.getUserId(), saved.getComplaintId(), saved.getMessage());
        return NotificationResponse.fromEntity(saved);
    }

    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        return NotificationResponse.fromEntity(notification);
    }

    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getNotificationsByComplaintId(Long complaintId) {
        return notificationRepository.findByComplaintId(complaintId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for user {}", unread.size(), userId);
    }
}
