package com.hms.service;

import com.hms.dto.DoctorDTO;
import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return convertToDTO(doctor);
    }

    @Transactional
    public DoctorDTO createDoctor(DoctorDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User(
                dto.getUsername(),
                dto.getPassword() != null ? dto.getPassword() : "doc123", // Default password if empty
                "DOCTOR",
                dto.getFullName(),
                dto.getEmail(),
                dto.getPhone()
        );
        user = userRepository.save(user);

        Doctor doctor = new Doctor(
                user,
                dto.getSpecialization(),
                dto.getDepartment(),
                dto.getExperience(),
                dto.getConsultationFee(),
                dto.getAvailabilityStatus() != null ? dto.getAvailabilityStatus() : "AVAILABLE"
        );
        doctor = doctorRepository.save(doctor);

        return convertToDTO(doctor);
    }

    @Transactional
    public DoctorDTO updateDoctor(Long id, DoctorDTO dto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User user = doctor.getUser();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        userRepository.save(user);

        doctor.setSpecialization(dto.getSpecialization());
        doctor.setDepartment(dto.getDepartment());
        doctor.setExperience(dto.getExperience());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAvailabilityStatus(dto.getAvailabilityStatus());
        doctor = doctorRepository.save(doctor);

        return convertToDTO(doctor);
    }

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private OperationTheaterRepository otRepository;

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // 1. Find all appointments of this doctor.
        // For each appointment, delete the associated payment, then delete the appointment.
        List<Appointment> appointments = appointmentRepository.findByDoctorId(id);
        for (Appointment appointment : appointments) {
            paymentRepository.findByAppointmentId(appointment.getId()).ifPresent(paymentRepository::delete);
            appointmentRepository.delete(appointment);
        }

        // 2. Find all surgeries of this doctor.
        // For each surgery: set surgery reference to null in any Billing records, free OT, then delete surgery.
        List<Surgery> surgeries = surgeryRepository.findBySurgeonId(id);
        for (Surgery surgery : surgeries) {
            billingRepository.findBySurgeryId(surgery.getId()).ifPresent(billing -> {
                billing.setSurgery(null);
                billingRepository.save(billing);
            });
            if (surgery.getOperationTheater() != null) {
                OperationTheater ot = surgery.getOperationTheater();
                ot.setStatus("AVAILABLE");
                otRepository.save(ot);
            }
            surgeryRepository.delete(surgery);
        }

        // 3. Delete the doctor (which cascade deletes the user)
        doctorRepository.delete(doctor);
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        if (doctor.getUser() != null) {
            dto.setUserId(doctor.getUser().getId());
            dto.setUsername(doctor.getUser().getUsername());
            dto.setFullName(doctor.getUser().getFullName());
            dto.setEmail(doctor.getUser().getEmail());
            dto.setPhone(doctor.getUser().getPhone());
        }
        dto.setSpecialization(doctor.getSpecialization());
        dto.setDepartment(doctor.getDepartment());
        dto.setExperience(doctor.getExperience());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setAvailabilityStatus(doctor.getAvailabilityStatus());
        return dto;
    }
}
