package com.hms.controller;

import com.hms.dto.BillingDTO;
import com.hms.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @GetMapping
    public ResponseEntity<List<BillingDTO>> getAllBills() {
        return ResponseEntity.ok(billingService.getAllBills());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillingDTO>> getBillsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(billingService.getBillsByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBillById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(billingService.getBillById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/calculate")
    public ResponseEntity<?> calculateEstimatedBill(
            @RequestParam Long patientId,
            @RequestParam(required = false) Long admissionId,
            @RequestParam(required = false) Long surgeryId,
            @RequestParam(required = false) Double otherCharges) {
        try {
            return ResponseEntity.ok(billingService.calculateEstimatedBill(patientId, admissionId, surgeryId, otherCharges));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBill(@RequestBody BillingDTO billingDTO) {
        try {
            return ResponseEntity.ok(billingService.createBill(billingDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestBody BillingDTO billingDTO) {
        try {
            return ResponseEntity.ok(billingService.processPayment(id, billingDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
