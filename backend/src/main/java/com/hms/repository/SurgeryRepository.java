package com.hms.repository;

import com.hms.model.Surgery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SurgeryRepository extends JpaRepository<Surgery, Long> {
    List<Surgery> findByPatientId(Long patientId);
    List<Surgery> findBySurgeonId(Long surgeonId);
    List<Surgery> findByStatus(String status);
    List<Surgery> findByOperationTheaterId(Long operationTheaterId);
}
