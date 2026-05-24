package com.hms.controller;

import com.hms.dto.OperationTheaterDTO;
import com.hms.service.OperationTheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operation-theaters")
public class OperationTheaterController {

    @Autowired
    private OperationTheaterService otService;

    @GetMapping
    public ResponseEntity<List<OperationTheaterDTO>> getAllOperationTheaters() {
        return ResponseEntity.ok(otService.getAllOperationTheaters());
    }

    @GetMapping("/available")
    public ResponseEntity<List<OperationTheaterDTO>> getAvailableOperationTheaters() {
        return ResponseEntity.ok(otService.getAvailableOperationTheaters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOperationTheaterById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(otService.getOperationTheaterById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateOperationTheater(@RequestBody OperationTheaterDTO otDTO) {
        try {
            return ResponseEntity.ok(otService.createOrUpdateOperationTheater(otDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOperationTheaterStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(otService.updateOperationTheaterStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOperationTheater(@PathVariable Long id) {
        try {
            otService.deleteOperationTheater(id);
            return ResponseEntity.ok("Operation Theater deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
