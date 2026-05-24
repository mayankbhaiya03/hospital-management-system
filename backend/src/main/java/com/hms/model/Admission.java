package com.hms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "bed_id", referencedColumnName = "id")
    private Bed bed;

    @Column(name = "admission_date", nullable = false)
    private LocalDateTime admissionDate;

    @Column(name = "discharge_date")
    private LocalDateTime dischargeDate;

    @Column(nullable = false)
    private String status; // "ADMITTED", "DISCHARGED"

    @Lob
    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Lob
    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "recovery_status")
    private String recoveryStatus; // "STABLE", "CRITICAL", "UNDER_OBSERVATION"

    @Column(name = "icu_recommended")
    private Boolean icuRecommended = false;

    public Admission() {}

    public Admission(Patient patient, Bed bed, LocalDateTime admissionDate, String status, String diagnosis, String treatmentPlan, String recoveryStatus) {
        this.patient = patient;
        this.bed = bed;
        this.admissionDate = admissionDate;
        this.status = status;
        this.diagnosis = diagnosis;
        this.treatmentPlan = treatmentPlan;
        this.recoveryStatus = recoveryStatus;
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

    public Bed getBed() {
        return bed;
    }

    public void setBed(Bed bed) {
        this.bed = bed;
    }

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public LocalDateTime getDischargeDate() {
        return dischargeDate;
    }

    public void setDischargeDate(LocalDateTime dischargeDate) {
        this.dischargeDate = dischargeDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public String getRecoveryStatus() {
        return recoveryStatus;
    }

    public void setRecoveryStatus(String recoveryStatus) {
        this.recoveryStatus = recoveryStatus;
    }

    public Boolean getIcuRecommended() {
        return icuRecommended;
    }

    public void setIcuRecommended(Boolean icuRecommended) {
        this.icuRecommended = icuRecommended;
    }
}
