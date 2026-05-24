package com.hms.service;

import com.hms.dto.PatientDTO;
import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return convertToDTO(patient);
    }

    @Transactional
    public PatientDTO createPatient(PatientDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User(
                dto.getUsername(),
                "pat123", // Default password for receptionist/admin created patient
                "PATIENT",
                dto.getFullName(),
                dto.getEmail(),
                dto.getPhone()
        );
        user = userRepository.save(user);

        Patient patient = new Patient(
                user,
                dto.getDateOfBirth(),
                dto.getGender(),
                dto.getBloodGroup(),
                dto.getAddress(),
                dto.getMedicalHistory() != null ? dto.getMedicalHistory() : "No previous medical history recorded."
        );
        patient = patientRepository.save(patient);

        return convertToDTO(patient);
    }

    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User user = patient.getUser();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        userRepository.save(user);

        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setAddress(dto.getAddress());
        patient.setMedicalHistory(dto.getMedicalHistory());
        patient = patientRepository.save(patient);

        return convertToDTO(patient);
    }

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private OperationTheaterRepository otRepository;

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // 1. Delete all Billings for this patient
        billingRepository.findByPatientId(id).forEach(billingRepository::delete);

        // 2. Find all Surgeries for this patient
        List<Surgery> surgeries = surgeryRepository.findByPatientId(id);
        for (Surgery surgery : surgeries) {
            // Free the Operation Theater if assigned
            if (surgery.getOperationTheater() != null) {
                OperationTheater ot = surgery.getOperationTheater();
                ot.setStatus("AVAILABLE");
                otRepository.save(ot);
            }
            surgeryRepository.delete(surgery);
        }

        // 3. Find all Admissions for this patient
        List<Admission> admissions = admissionRepository.findByPatientId(id);
        for (Admission admission : admissions) {
            // Free the Bed if assigned
            if (admission.getBed() != null) {
                Bed bed = admission.getBed();
                bed.setStatus("AVAILABLE");
                bedRepository.save(bed);
            }
            admissionRepository.delete(admission);
        }

        // 4. Find all Appointments for this patient
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        for (Appointment appointment : appointments) {
            // Remove linked payment if it exists
            paymentRepository.findByAppointmentId(appointment.getId()).ifPresent(paymentRepository::delete);
            appointmentRepository.delete(appointment);
        }

        // 5. Delete the patient itself (which cascade deletes the user)
        patientRepository.delete(patient);
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        if (patient.getUser() != null) {
            dto.setUserId(patient.getUser().getId());
            dto.setUsername(patient.getUser().getUsername());
            dto.setFullName(patient.getUser().getFullName());
            dto.setEmail(patient.getUser().getEmail());
            dto.setPhone(patient.getUser().getPhone());
        }
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setAddress(patient.getAddress());
        dto.setMedicalHistory(patient.getMedicalHistory());
        return dto;
    }
}
