package com.hms.service;

import com.hms.dto.BedDTO;
import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BedService {

    @Autowired
    private BedRepository bedRepository;

    public List<BedDTO> getAllBeds() {
        return bedRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BedDTO> getAvailableBeds() {
        return bedRepository.findByStatus("AVAILABLE").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        return convertToDTO(bed);
    }

    @Transactional
    public BedDTO createOrUpdateBed(BedDTO dto) {
        Bed bed;
        if (dto.getId() != null) {
            bed = bedRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Bed not found with id: " + dto.getId()));
        } else {
            bed = new Bed();
        }

        bed.setBedNumber(dto.getBedNumber());
        bed.setType(dto.getType() != null ? dto.getType() : "GENERAL_WARD");
        bed.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");
        bed.setDailyCharges(dto.getDailyCharges() != null ? dto.getDailyCharges() : 500.0);

        bed = bedRepository.save(bed);
        return convertToDTO(bed);
    }

    @Transactional
    public BedDTO updateBedStatus(Long id, String status) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        bed.setStatus(status);
        bed = bedRepository.save(bed);
        return convertToDTO(bed);
    }

    @Autowired
    private AdmissionRepository admissionRepository;

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));

        // Find admissions referencing this bed and set their bed reference to null
        List<Admission> admissions = admissionRepository.findByBedId(id);
        for (Admission admission : admissions) {
            admission.setBed(null);
            admissionRepository.save(admission);
        }

        bedRepository.delete(bed);
    }

    private BedDTO convertToDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setType(bed.getType());
        dto.setStatus(bed.getStatus());
        dto.setDailyCharges(bed.getDailyCharges());
        return dto;
    }
}
