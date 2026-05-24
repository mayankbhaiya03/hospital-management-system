package com.hms.service;

import com.hms.dto.SurgeryDTO;
import com.hms.model.Doctor;
import com.hms.model.OperationTheater;
import com.hms.model.Patient;
import com.hms.model.Surgery;
import com.hms.repository.DoctorRepository;
import com.hms.repository.OperationTheaterRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.SurgeryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SurgeryService {

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private OperationTheaterRepository otRepository;

    public List<SurgeryDTO> getAllSurgeries() {
        return surgeryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SurgeryDTO> getSurgeriesByDoctor(Long doctorId) {
        return surgeryRepository.findBySurgeonId(doctorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SurgeryDTO> getSurgeriesByPatient(Long patientId) {
        return surgeryRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SurgeryDTO getSurgeryById(Long id) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id: " + id));
        return convertToDTO(surgery);
    }

    @Transactional
    public SurgeryDTO scheduleSurgery(SurgeryDTO dto) {
        Surgery surgery;
        if (dto.getId() != null) {
            surgery = surgeryRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Surgery not found with id: " + dto.getId()));
        } else {
            surgery = new Surgery();
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + dto.getPatientId()));
        surgery.setPatient(patient);

        Doctor surgeon = doctorRepository.findById(dto.getSurgeonId())
                .orElseThrow(() -> new RuntimeException("Surgeon not found with id: " + dto.getSurgeonId()));
        surgery.setSurgeon(surgeon);

        if (dto.getOperationTheaterId() != null) {
            OperationTheater ot = otRepository.findById(dto.getOperationTheaterId())
                    .orElseThrow(() -> new RuntimeException("Operation Theater not found with id: " + dto.getOperationTheaterId()));

            // If OT changed, free old OT and occupy new OT
            if (surgery.getOperationTheater() == null || !surgery.getOperationTheater().getId().equals(ot.getId())) {
                if (surgery.getOperationTheater() != null) {
                    OperationTheater oldOt = surgery.getOperationTheater();
                    oldOt.setStatus("AVAILABLE");
                    otRepository.save(oldOt);
                }
                if ("OCCUPIED".equalsIgnoreCase(ot.getStatus())) {
                    throw new RuntimeException("Operation Theater " + ot.getName() + " is already occupied.");
                }
                ot.setStatus("OCCUPIED");
                otRepository.save(ot);
                surgery.setOperationTheater(ot);
            }
        }

        surgery.setSurgeryDate(dto.getSurgeryDate() != null ? dto.getSurgeryDate() : LocalDateTime.now().plusDays(1));
        surgery.setType(dto.getType() != null ? dto.getType() : "General");
        
        // If OT is assigned now, transition from RECOMMENDED to SCHEDULED
        if (dto.getStatus() != null) {
            surgery.setStatus(dto.getStatus().toUpperCase());
        } else {
            surgery.setStatus(dto.getOperationTheaterId() != null ? "SCHEDULED" : "RECOMMENDED");
        }
        
        surgery.setSurgeryFee(dto.getSurgeryFee() != null ? dto.getSurgeryFee() : 5000.0);
        if (dto.getPreOpNotes() != null) surgery.setPreOpNotes(dto.getPreOpNotes());
        if (dto.getPostOpNotes() != null) surgery.setPostOpNotes(dto.getPostOpNotes());
        if (dto.getIcuRecommended() != null) surgery.setIcuRecommended(dto.getIcuRecommended());

        surgery = surgeryRepository.save(surgery);
        return convertToDTO(surgery);
    }

    @Transactional
    public SurgeryDTO updateSurgeryStatus(Long id, String status) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id: " + id));

        String oldStatus = surgery.getStatus();
        surgery.setStatus(status.toUpperCase());

        // Manage OT Status
        if ("COMPLETED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
            if (surgery.getOperationTheater() != null) {
                OperationTheater ot = surgery.getOperationTheater();
                ot.setStatus("AVAILABLE");
                otRepository.save(ot);
            }
        } else if ("IN_PROGRESS".equalsIgnoreCase(status) || "SCHEDULED".equalsIgnoreCase(status)) {
            if (surgery.getOperationTheater() != null) {
                OperationTheater ot = surgery.getOperationTheater();
                ot.setStatus("OCCUPIED");
                otRepository.save(ot);
            }
        }

        surgery = surgeryRepository.save(surgery);
        return convertToDTO(surgery);
    }

    @Transactional
    public SurgeryDTO updateSurgeryNotesAndFees(Long id, SurgeryDTO dto) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id: " + id));

        if (dto.getPreOpNotes() != null) {
            surgery.setPreOpNotes(dto.getPreOpNotes());
        }
        if (dto.getPostOpNotes() != null) {
            surgery.setPostOpNotes(dto.getPostOpNotes());
        }
        if (dto.getIcuRecommended() != null) {
            surgery.setIcuRecommended(dto.getIcuRecommended());
        }
        if (dto.getSurgeryFee() != null) {
            surgery.setSurgeryFee(dto.getSurgeryFee());
        }

        surgery = surgeryRepository.save(surgery);
        return convertToDTO(surgery);
    }

    private SurgeryDTO convertToDTO(Surgery surgery) {
        SurgeryDTO dto = new SurgeryDTO();
        dto.setId(surgery.getId());
        if (surgery.getPatient() != null) {
            dto.setPatientId(surgery.getPatient().getId());
            if (surgery.getPatient().getUser() != null) {
                dto.setPatientName(surgery.getPatient().getUser().getFullName());
            }
        }
        if (surgery.getSurgeon() != null) {
            dto.setSurgeonId(surgery.getSurgeon().getId());
            if (surgery.getSurgeon().getUser() != null) {
                dto.setSurgeonName("Dr. " + surgery.getSurgeon().getUser().getFullName());
            }
        }
        if (surgery.getOperationTheater() != null) {
            dto.setOperationTheaterId(surgery.getOperationTheater().getId());
            dto.setOperationTheaterName(surgery.getOperationTheater().getName());
        }
        dto.setSurgeryDate(surgery.getSurgeryDate());
        dto.setType(surgery.getType());
        dto.setStatus(surgery.getStatus());
        dto.setPreOpNotes(surgery.getPreOpNotes());
        dto.setPostOpNotes(surgery.getPostOpNotes());
        dto.setIcuRecommended(surgery.getIcuRecommended());
        dto.setSurgeryFee(surgery.getSurgeryFee());
        return dto;
    }
}
