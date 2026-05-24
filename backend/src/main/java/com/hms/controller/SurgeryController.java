package com.hms.controller;

import com.hms.dto.SurgeryDTO;
import com.hms.service.SurgeryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surgeries")
public class SurgeryController {

    @Autowired
    private SurgeryService surgeryService;

    @GetMapping
    public ResponseEntity<List<SurgeryDTO>> getAllSurgeries() {
        return ResponseEntity.ok(surgeryService.getAllSurgeries());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<SurgeryDTO>> getSurgeriesByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(surgeryService.getSurgeriesByDoctor(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<SurgeryDTO>> getSurgeriesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(surgeryService.getSurgeriesByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSurgeryById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(surgeryService.getSurgeryById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> scheduleSurgery(@RequestBody SurgeryDTO surgeryDTO) {
        try {
            return ResponseEntity.ok(surgeryService.scheduleSurgery(surgeryDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateSurgeryStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(surgeryService.updateSurgeryStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/clinical")
    public ResponseEntity<?> updateSurgeryNotesAndFees(@PathVariable Long id, @RequestBody SurgeryDTO surgeryDTO) {
        try {
            return ResponseEntity.ok(surgeryService.updateSurgeryNotesAndFees(id, surgeryDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
