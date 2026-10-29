package com.resolvenow.assignment.repository;

import com.resolvenow.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Assignment} entities.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Finds all assignments for a given complaint ID.
     *
     * @param complaintId the complaint identifier
     * @return list of assignments for the complaint
     */
    List<Assignment> findByComplaintId(Long complaintId);

    /**
     * Finds all assignments for a given department.
     *
     * @param department the department name
     * @return list of assignments for the department
     */
    List<Assignment> findByDepartment(String department);
}
