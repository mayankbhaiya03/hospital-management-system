package com.hms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "operation_theaters")
public class OperationTheater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "OT-1", "OT-2"

    @Column(nullable = false)
    private String status; // "AVAILABLE", "OCCUPIED", "MAINTENANCE"

    @Column(name = "base_charges", nullable = false)
    private Double baseCharges;

    public OperationTheater() {}

    public OperationTheater(String name, String status, Double baseCharges) {
        this.name = name;
        this.status = status;
        this.baseCharges = baseCharges;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getBaseCharges() {
        return baseCharges;
    }

    public void setBaseCharges(Double baseCharges) {
        this.baseCharges = baseCharges;
    }
}
