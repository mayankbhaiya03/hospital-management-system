package com.hms.service;

import com.hms.dto.PaymentDTO;
import com.hms.model.Payment;
import com.hms.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByPatient(Long patientId) {
        return paymentRepository.findByAppointmentPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaymentDTO getPaymentByAppointment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for this appointment"));
        return convertToDTO(payment);
    }

    @Transactional
    public PaymentDTO processPayment(Long appointmentId, PaymentDTO dto) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for this appointment"));

        payment.setStatus("PAID");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "ONLINE");
        payment.setRazorpayOrderId(dto.getRazorpayOrderId());
        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());

        payment = paymentRepository.save(payment);
        return convertToDTO(payment);
    }

    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        if (payment.getAppointment() != null) {
            dto.setAppointmentId(payment.getAppointment().getId());
            if (payment.getAppointment().getPatient() != null && payment.getAppointment().getPatient().getUser() != null) {
                dto.setPatientName(payment.getAppointment().getPatient().getUser().getFullName());
            }
            if (payment.getAppointment().getDoctor() != null && payment.getAppointment().getDoctor().getUser() != null) {
                dto.setDoctorName("Dr. " + payment.getAppointment().getDoctor().getUser().getFullName());
            }
        }
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus());
        dto.setRazorpayOrderId(payment.getRazorpayOrderId());
        dto.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        return dto;
    }
}
