package com.hms.service;

import com.hms.dto.OperationTheaterDTO;
import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OperationTheaterService {

    @Autowired
    private OperationTheaterRepository otRepository;

    public List<OperationTheaterDTO> getAllOperationTheaters() {
        return otRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OperationTheaterDTO> getAvailableOperationTheaters() {
        return otRepository.findByStatus("AVAILABLE").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OperationTheaterDTO getOperationTheaterById(Long id) {
        OperationTheater ot = otRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operation Theater not found with id: " + id));
        return convertToDTO(ot);
    }

    @Transactional
    public OperationTheaterDTO createOrUpdateOperationTheater(OperationTheaterDTO dto) {
        OperationTheater ot;
        if (dto.getId() != null) {
            ot = otRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Operation Theater not found with id: " + dto.getId()));
        } else {
            ot = new OperationTheater();
        }

        ot.setName(dto.getName());
        ot.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");
        ot.setBaseCharges(dto.getBaseCharges() != null ? dto.getBaseCharges() : 1500.0);

        ot = otRepository.save(ot);
        return convertToDTO(ot);
    }

    @Transactional
    public OperationTheaterDTO updateOperationTheaterStatus(Long id, String status) {
        OperationTheater ot = otRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operation Theater not found with id: " + id));
        ot.setStatus(status);
        ot = otRepository.save(ot);
        return convertToDTO(ot);
    }

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Transactional
    public void deleteOperationTheater(Long id) {
        OperationTheater ot = otRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operation Theater not found with id: " + id));

        // Find surgeries referencing this OT and set their OT reference to null
        List<Surgery> surgeries = surgeryRepository.findByOperationTheaterId(id);
        for (Surgery surgery : surgeries) {
            surgery.setOperationTheater(null);
            surgeryRepository.save(surgery);
        }

        otRepository.delete(ot);
    }

    private OperationTheaterDTO convertToDTO(OperationTheater ot) {
        OperationTheaterDTO dto = new OperationTheaterDTO();
        dto.setId(ot.getId());
        dto.setName(ot.getName());
        dto.setStatus(ot.getStatus());
        dto.setBaseCharges(ot.getBaseCharges());
        return dto;
    }
}
