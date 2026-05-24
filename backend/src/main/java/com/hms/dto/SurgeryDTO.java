package com.hms.dto;

import java.time.LocalDateTime;

public class SurgeryDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long surgeonId;
    private String surgeonName;
    private Long operationTheaterId;
    private String operationTheaterName;
    private LocalDateTime surgeryDate;
    private String type; // e.g., "Cardiology", "Orthopedic"
    private String status; // "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    private String preOpNotes;
    private String postOpNotes;
    private Boolean icuRecommended;
    private Double surgeryFee;

    public SurgeryDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getSurgeonId() {
        return surgeonId;
    }

    public void setSurgeonId(Long surgeonId) {
        this.surgeonId = surgeonId;
    }

    public String getSurgeonName() {
        return surgeonName;
    }

    public void setSurgeonName(String surgeonName) {
        this.surgeonName = surgeonName;
    }

    public Long getOperationTheaterId() {
        return operationTheaterId;
    }

    public void setOperationTheaterId(Long operationTheaterId) {
        this.operationTheaterId = operationTheaterId;
    }

    public String getOperationTheaterName() {
        return operationTheaterName;
    }

    public void setOperationTheaterName(String operationTheaterName) {
        this.operationTheaterName = operationTheaterName;
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
