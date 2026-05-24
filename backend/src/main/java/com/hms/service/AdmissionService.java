package com.hms.service;

import com.hms.dto.AdmissionDTO;
import com.hms.model.Admission;
import com.hms.model.Bed;
import com.hms.model.Patient;
import com.hms.repository.AdmissionRepository;
import com.hms.repository.BedRepository;
import com.hms.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdmissionService {

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BedRepository bedRepository;

    public List<AdmissionDTO> getAllAdmissions() {
        return admissionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AdmissionDTO> getAdmissionsByPatient(Long patientId) {
        return admissionRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AdmissionDTO getAdmissionById(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with id: " + id));
        return convertToDTO(admission);
    }

    @Transactional
    public AdmissionDTO admitPatient(AdmissionDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + dto.getPatientId()));

        Bed bed = null;
        if (dto.getBedId() != null) {
            bed = bedRepository.findById(dto.getBedId())
                    .orElseThrow(() -> new RuntimeException("Bed not found with id: " + dto.getBedId()));
            if ("OCCUPIED".equalsIgnoreCase(bed.getStatus())) {
                throw new RuntimeException("Selected bed " + bed.getBedNumber() + " is already occupied.");
            }
            bed.setStatus("OCCUPIED");
            bed = bedRepository.save(bed);
        }

        Admission admission = new Admission(
                patient,
                bed,
                dto.getAdmissionDate() != null ? dto.getAdmissionDate() : LocalDateTime.now(),
                "ADMITTED",
                dto.getDiagnosis(),
                dto.getTreatmentPlan(),
                dto.getRecoveryStatus() != null ? dto.getRecoveryStatus() : "UNDER_OBSERVATION"
        );
        admission.setIcuRecommended(dto.getIcuRecommended() != null ? dto.getIcuRecommended() : false);

        admission = admissionRepository.save(admission);
        return convertToDTO(admission);
    }

    @Transactional
    public AdmissionDTO updateAdmission(Long id, AdmissionDTO dto) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with id: " + id));

        if (dto.getDiagnosis() != null) {
            admission.setDiagnosis(dto.getDiagnosis());
        }
        if (dto.getTreatmentPlan() != null) {
            admission.setTreatmentPlan(dto.getTreatmentPlan());
        }
        if (dto.getRecoveryStatus() != null) {
            admission.setRecoveryStatus(dto.getRecoveryStatus());
        }
        if (dto.getIcuRecommended() != null) {
            admission.setIcuRecommended(dto.getIcuRecommended());
        }

        // Manage bed swapping if bedId changed and admission is active
        if (dto.getBedId() != null && "ADMITTED".equalsIgnoreCase(admission.getStatus())) {
            Long currentBedId = admission.getBed() != null ? admission.getBed().getId() : null;
            if (!dto.getBedId().equals(currentBedId)) {
                // Free old bed
                if (admission.getBed() != null) {
                    Bed oldBed = admission.getBed();
                    oldBed.setStatus("AVAILABLE");
                    bedRepository.save(oldBed);
                }
                // Allocate new bed
                Bed newBed = bedRepository.findById(dto.getBedId())
                        .orElseThrow(() -> new RuntimeException("Bed not found with id: " + dto.getBedId()));
                if ("OCCUPIED".equalsIgnoreCase(newBed.getStatus())) {
                    throw new RuntimeException("New bed " + newBed.getBedNumber() + " is occupied.");
                }
                newBed.setStatus("OCCUPIED");
                bedRepository.save(newBed);
                admission.setBed(newBed);
            }
        }

        admission = admissionRepository.save(admission);
        return convertToDTO(admission);
    }

    @Transactional
    public AdmissionDTO dischargePatient(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with id: " + id));

        if ("DISCHARGED".equalsIgnoreCase(admission.getStatus())) {
            throw new RuntimeException("Patient is already discharged.");
        }

        admission.setStatus("DISCHARGED");
        admission.setDischargeDate(LocalDateTime.now());
        admission.setRecoveryStatus("STABLE");

        if (admission.getBed() != null) {
            Bed bed = admission.getBed();
            bed.setStatus("AVAILABLE");
            bedRepository.save(bed);
        }

        admission = admissionRepository.save(admission);
        return convertToDTO(admission);
    }

    private AdmissionDTO convertToDTO(Admission admission) {
        AdmissionDTO dto = new AdmissionDTO();
        dto.setId(admission.getId());
        if (admission.getPatient() != null) {
            dto.setPatientId(admission.getPatient().getId());
            if (admission.getPatient().getUser() != null) {
                dto.setPatientName(admission.getPatient().getUser().getFullName());
            }
        }
        if (admission.getBed() != null) {
            dto.setBedId(admission.getBed().getId());
            dto.setBedNumber(admission.getBed().getBedNumber());
            dto.setBedType(admission.getBed().getType());
        }
        dto.setAdmissionDate(admission.getAdmissionDate());
        dto.setDischargeDate(admission.getDischargeDate());
        dto.setStatus(admission.getStatus());
        dto.setDiagnosis(admission.getDiagnosis());
        dto.setTreatmentPlan(admission.getTreatmentPlan());
        dto.setRecoveryStatus(admission.getRecoveryStatus());
        dto.setIcuRecommended(admission.getIcuRecommended());
        return dto;
    }
}
