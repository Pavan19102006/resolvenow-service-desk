package com.resolvenow.complaint.repository;

import com.resolvenow.complaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Complaint} entities.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    /**
     * Finds all complaints submitted by a specific user.
     *
     * @param userId the ID of the user
     * @return list of complaints belonging to the user
     */
    List<Complaint> findByUserId(Long userId);

    /**
     * Finds all complaints with a given status.
     *
     * @param status the complaint status (e.g., OPEN, IN_PROGRESS, RESOLVED)
     * @return list of complaints matching the status
     */
    List<Complaint> findByStatus(String status);
}
