package com.driveguard.backend.dto;

import com.driveguard.backend.entity.AlertType;
import com.driveguard.backend.entity.DriverStatus;
import com.driveguard.backend.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAlertRequest {
    private AlertType alertType;
    private Severity severity;
    private String message;
    private double eyeAspectRatio;
    private Double confidence;
    private DriverStatus driverStatus;
}
