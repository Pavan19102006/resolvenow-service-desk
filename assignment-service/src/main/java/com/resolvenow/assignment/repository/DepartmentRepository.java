package com.resolvenow.assignment.repository;

import com.resolvenow.assignment.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Department} entities.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * Finds a department by its unique name.
     *
     * @param name the department name
     * @return an Optional containing the department if found
     */
    Optional<Department> findByName(String name);
}
