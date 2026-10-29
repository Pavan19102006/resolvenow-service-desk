package com.resolvenow.assignment.config;

import com.resolvenow.assignment.entity.Department;
import com.resolvenow.assignment.repository.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initializes default departments on application startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DepartmentRepository departmentRepository;

    public DataInitializer(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public void run(String... args) {
        createDepartmentIfNotExists("GENERAL_SUPPORT", "General customer support");
        createDepartmentIfNotExists("ESCALATION", "Escalated high-priority issues");
        createDepartmentIfNotExists("SELF_SERVICE", "Low-priority self-service");
        createDepartmentIfNotExists("TECHNICAL", "Technical support");
        createDepartmentIfNotExists("BILLING", "Billing and payment issues");
        log.info("Default departments initialized successfully");
    }

    private void createDepartmentIfNotExists(String name, String description) {
        if (departmentRepository.findByName(name).isEmpty()) {
            Department dept = new Department();
            dept.setName(name);
            dept.setDescription(description);
            departmentRepository.save(dept);
            log.info("Created department: {}", name);
        }
    }
}
