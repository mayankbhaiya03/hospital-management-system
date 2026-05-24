package com.hms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "surgeries")
public class Surgery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "surgeon_id", referencedColumnName = "id", nullable = false)
    private Doctor surgeon;

    @ManyToOne
    @JoinColumn(name = "operation_theater_id", referencedColumnName = "id")
    private OperationTheater operationTheater;

    @Column(name = "surgery_date", nullable = false)
    private LocalDateTime surgeryDate;

    @Column(nullable = false)
    private String type; // e.g., "Cardiology", "Orthopedic", "General"

    @Column(nullable = false)
    private String status; // "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"

    @Lob
    @Column(name = "pre_op_notes", columnDefinition = "TEXT")
    private String preOpNotes;

    @Lob
    @Column(name = "post_op_notes", columnDefinition = "TEXT")
    private String postOpNotes;

    @Column(name = "icu_recommended")
    private Boolean icuRecommended = false;

    @Column(name = "surgery_fee")
    private Double surgeryFee;

    public Surgery() {}

    public Surgery(Patient patient, Doctor surgeon, OperationTheater operationTheater, LocalDateTime surgeryDate, String type, String status, Double surgeryFee) {
        this.patient = patient;
        this.surgeon = surgeon;
        this.operationTheater = operationTheater;
        this.surgeryDate = surgeryDate;
        this.type = type;
        this.status = status;
        this.surgeryFee = surgeryFee;
        this.icuRecommended = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getSurgeon() {
        return surgeon;
    }

    public void setSurgeon(Doctor surgeon) {
        this.surgeon = surgeon;
    }

    public OperationTheater getOperationTheater() {
        return operationTheater;
    }

    public void setOperationTheater(OperationTheater operationTheater) {
        this.operationTheater = operationTheater;
    }

    public LocalDateTime getSurgeryDate() {
        return surgeryDate;
    }

    public void setSurgeryDate(LocalDateTime surgeryDate) {
        this.surgeryDate = surgeryDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPreOpNotes() {
        return preOpNotes;
    }

    public void setPreOpNotes(String preOpNotes) {
        this.preOpNotes = preOpNotes;
    }

    public String getPostOpNotes() {
        return postOpNotes;
    }

    public void setPostOpNotes(String postOpNotes) {
        this.postOpNotes = postOpNotes;
    }

    public Boolean getIcuRecommended() {
        return icuRecommended;
    }

    public void setIcuRecommended(Boolean icuRecommended) {
        this.icuRecommended = icuRecommended;
    }

    public Double getSurgeryFee() {
        return surgeryFee;
    }

    public void setSurgeryFee(Double surgeryFee) {
        this.surgeryFee = surgeryFee;
    }
}
