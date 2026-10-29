package com.resolvenow.notification.repository;

import com.resolvenow.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Notification} entities.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Finds all notifications for a given user.
     *
     * @param userId the user ID
     * @return list of notifications belonging to the user
     */
    List<Notification> findByUserId(Long userId);

    /**
     * Finds all unread notifications for a given user.
     *
     * @param userId the user ID
     * @return list of unread notifications belonging to the user
     */
    List<Notification> findByUserIdAndReadFalse(Long userId);

    /**
     * Finds all notifications associated with a given complaint.
     *
     * @param complaintId the complaint ID
     * @return list of notifications for the complaint
     */
    List<Notification> findByComplaintId(Long complaintId);
}
