package com.hms.dto;

public class OperationTheaterDTO {
    private Long id;
    private String name;
    private String status; // "AVAILABLE", "OCCUPIED", "MAINTENANCE"
    private Double baseCharges;

    public OperationTheaterDTO() {}

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
