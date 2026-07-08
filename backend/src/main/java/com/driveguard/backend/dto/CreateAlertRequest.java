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
    @jakarta.validation.constraints.NotNull(message = "Alert type is required")
    private AlertType alertType;
    
    @jakarta.validation.constraints.NotNull(message = "Severity is required")
    private Severity severity;
    
    private String message;
    
    @jakarta.validation.constraints.Positive(message = "Eye aspect ratio must be positive")
    private double eyeAspectRatio;
    
    @jakarta.validation.constraints.Min(value = 0, message = "Confidence must be at least 0")
    @jakarta.validation.constraints.Max(value = 100, message = "Confidence must be at most 100")
    private Double confidence;
    
    @jakarta.validation.constraints.NotNull(message = "Driver status is required")
    private DriverStatus driverStatus;
}
