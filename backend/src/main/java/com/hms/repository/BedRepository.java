package com.hms.repository;

import com.hms.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByStatus(String status);
    List<Bed> findByTypeAndStatus(String type, String status);
}
