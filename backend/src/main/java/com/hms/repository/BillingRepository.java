package com.hms.repository;

import com.hms.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByPatientId(Long patientId);
    Optional<Billing> findByAdmissionId(Long admissionId);
    Optional<Billing> findBySurgeryId(Long surgeryId);
}
