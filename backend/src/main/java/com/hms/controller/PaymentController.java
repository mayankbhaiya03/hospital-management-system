package com.hms.controller;

import com.hms.dto.PaymentDTO;
import com.hms.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPatient(patientId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId) {
        try {
            return ResponseEntity.ok(paymentService.getPaymentByAppointment(appointmentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/appointment/{appointmentId}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long appointmentId, @RequestBody PaymentDTO paymentDTO) {
        try {
            return ResponseEntity.ok(paymentService.processPayment(appointmentId, paymentDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
