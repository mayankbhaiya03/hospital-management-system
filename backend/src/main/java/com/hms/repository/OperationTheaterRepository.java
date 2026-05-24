package com.hms.repository;

import com.hms.model.OperationTheater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OperationTheaterRepository extends JpaRepository<OperationTheater, Long> {
    List<OperationTheater> findByStatus(String status);
}
