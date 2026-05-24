package com.hms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "beds")
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bed_number", unique = true, nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private String type; // "ICU", "GENERAL_WARD", "PRIVATE"

    @Column(nullable = false)
    private String status; // "AVAILABLE", "OCCUPIED", "MAINTENANCE"

    @Column(name = "daily_charges", nullable = false)
    private Double dailyCharges;

    public Bed() {}

    public Bed(String bedNumber, String type, String status, Double dailyCharges) {
        this.bedNumber = bedNumber;
        this.type = type;
        this.status = status;
        this.dailyCharges = dailyCharges;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
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

    public Double getDailyCharges() {
        return dailyCharges;
    }

    public void setDailyCharges(Double dailyCharges) {
        this.dailyCharges = dailyCharges;
    }
}
