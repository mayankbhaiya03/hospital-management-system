package com.hms.controller;

import com.hms.dto.AdmissionDTO;
import com.hms.service.AdmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;

    @GetMapping
    public ResponseEntity<List<AdmissionDTO>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AdmissionDTO>> getAdmissionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(admissionService.getAdmissionsByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdmissionById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(admissionService.getAdmissionById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> admitPatient(@RequestBody AdmissionDTO admissionDTO) {
        try {
            return ResponseEntity.ok(admissionService.admitPatient(admissionDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmission(@PathVariable Long id, @RequestBody AdmissionDTO admissionDTO) {
        try {
            return ResponseEntity.ok(admissionService.updateAdmission(id, admissionDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/discharge")
    public ResponseEntity<?> dischargePatient(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(admissionService.dischargePatient(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
