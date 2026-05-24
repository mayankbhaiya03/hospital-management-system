package com.hms.service;

import com.hms.dto.BillingDTO;
import com.hms.model.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private OperationTheaterRepository otRepository;

    public List<BillingDTO> getAllBills() {
        return billingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BillingDTO> getBillsByPatient(Long patientId) {
        return billingRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BillingDTO getBillById(Long id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        return convertToDTO(billing);
    }

    public BillingDTO calculateEstimatedBill(Long patientId, Long admissionId, Long surgeryId, Double otherCharges) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        double consultationFees = 0.0;
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        for (Appointment app : appointments) {
            if ("COMPLETED".equalsIgnoreCase(app.getStatus())) {
                if (app.getDoctor() != null && app.getDoctor().getConsultationFee() != null) {
                    consultationFees += app.getDoctor().getConsultationFee();
                } else {
                    consultationFees += 500.0; // fallback default
                }
            }
        }

        double roomCharges = 0.0;
        if (admissionId != null) {
            Admission admission = admissionRepository.findById(admissionId)
                    .orElseThrow(() -> new RuntimeException("Admission not found with id: " + admissionId));
            if (admission.getBed() != null) {
                LocalDateTime start = admission.getAdmissionDate();
                LocalDateTime end = admission.getDischargeDate() != null ? admission.getDischargeDate() : LocalDateTime.now();
                long days = Duration.between(start, end).toDays();
                if (days <= 0) {
                    days = 1; // minimum 1 day charges
                }
                roomCharges = days * admission.getBed().getDailyCharges();
            }
        }

        double surgeryFees = 0.0;
        if (surgeryId != null) {
            Surgery surgery = surgeryRepository.findById(surgeryId)
                    .orElseThrow(() -> new RuntimeException("Surgery not found with id: " + surgeryId));
            if (surgery.getSurgeryFee() != null) {
                surgeryFees = surgery.getSurgeryFee();
            }
        }

        double finalOtherCharges = otherCharges != null ? otherCharges : 1500.0;
        double total = consultationFees + roomCharges + surgeryFees + finalOtherCharges;

        BillingDTO dto = new BillingDTO();
        dto.setPatientId(patientId);
        dto.setPatientName(patient.getUser() != null ? patient.getUser().getFullName() : "Patient");
        dto.setAdmissionId(admissionId);
        dto.setSurgeryId(surgeryId);
        dto.setConsultationFees(consultationFees);
        dto.setRoomCharges(roomCharges);
        dto.setSurgeryFees(surgeryFees);
        dto.setOtherCharges(finalOtherCharges);
        dto.setTotalAmount(total);
        dto.setStatus("PENDING");

        return dto;
    }

    @Transactional
    public BillingDTO createBill(BillingDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + dto.getPatientId()));

        Admission admission = null;
        if (dto.getAdmissionId() != null) {
            admission = admissionRepository.findById(dto.getAdmissionId()).orElse(null);
        }

        Surgery surgery = null;
        if (dto.getSurgeryId() != null) {
            surgery = surgeryRepository.findById(dto.getSurgeryId()).orElse(null);
        }

        // Recalculate to verify totalAmount is accurate
        BillingDTO estimates = calculateEstimatedBill(dto.getPatientId(), dto.getAdmissionId(), dto.getSurgeryId(), dto.getOtherCharges());

        Billing billing = new Billing(
                patient,
                admission,
                surgery,
                estimates.getConsultationFees(),
                estimates.getRoomCharges(),
                estimates.getSurgeryFees(),
                estimates.getOtherCharges(),
                estimates.getTotalAmount(),
                "PENDING"
        );

        billing = billingRepository.save(billing);
        return convertToDTO(billing);
    }

    @Transactional
    public BillingDTO processPayment(Long billId, BillingDTO paymentInfo) {
        Billing billing = billingRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));

        if ("PAID".equalsIgnoreCase(billing.getStatus())) {
            throw new RuntimeException("Bill is already paid.");
        }

        billing.setStatus("PAID");
        billing.setPaymentDate(LocalDateTime.now());
        billing.setPaymentMethod(paymentInfo.getPaymentMethod() != null ? paymentInfo.getPaymentMethod() : "ONLINE");
        billing.setRazorpayOrderId(paymentInfo.getRazorpayOrderId());
        billing.setRazorpayPaymentId(paymentInfo.getRazorpayPaymentId());

        // If paid and has admission, make sure it is discharged
        if (billing.getAdmission() != null && "ADMITTED".equalsIgnoreCase(billing.getAdmission().getStatus())) {
            Admission admission = billing.getAdmission();
            admission.setStatus("DISCHARGED");
            admission.setDischargeDate(LocalDateTime.now());
            admission.setRecoveryStatus("STABLE");
            if (admission.getBed() != null) {
                Bed bed = admission.getBed();
                bed.setStatus("AVAILABLE");
                bedRepository.save(bed);
            }
            admissionRepository.save(admission);
        }

        // If paid and has surgery, update status to COMPLETED if not already
        if (billing.getSurgery() != null && !"COMPLETED".equalsIgnoreCase(billing.getSurgery().getStatus())) {
            Surgery surgery = billing.getSurgery();
            surgery.setStatus("COMPLETED");
            if (surgery.getOperationTheater() != null) {
                OperationTheater ot = surgery.getOperationTheater();
                ot.setStatus("AVAILABLE");
                otRepository.save(ot);
            }
            surgeryRepository.save(surgery);
        }

        billing = billingRepository.save(billing);
        return convertToDTO(billing);
    }

    @Autowired
    private BedRepository bedRepository;

    private BillingDTO convertToDTO(Billing billing) {
        BillingDTO dto = new BillingDTO();
        dto.setId(billing.getId());
        if (billing.getPatient() != null) {
            dto.setPatientId(billing.getPatient().getId());
            if (billing.getPatient().getUser() != null) {
                dto.setPatientName(billing.getPatient().getUser().getFullName());
            }
        }
        if (billing.getAdmission() != null) {
            dto.setAdmissionId(billing.getAdmission().getId());
        }
        if (billing.getSurgery() != null) {
            dto.setSurgeryId(billing.getSurgery().getId());
        }
        dto.setConsultationFees(billing.getConsultationFees());
        dto.setRoomCharges(billing.getRoomCharges());
        dto.setSurgeryFees(billing.getSurgeryFees());
        dto.setOtherCharges(billing.getOtherCharges());
        dto.setTotalAmount(billing.getTotalAmount());
        dto.setStatus(billing.getStatus());
        dto.setPaymentDate(billing.getPaymentDate());
        dto.setPaymentMethod(billing.getPaymentMethod());
        dto.setRazorpayOrderId(billing.getRazorpayOrderId());
        dto.setRazorpayPaymentId(billing.getRazorpayPaymentId());
        return dto;
    }
}
