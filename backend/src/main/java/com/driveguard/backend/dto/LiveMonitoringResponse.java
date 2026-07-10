package com.driveguard.backend.dto;

import com.driveguard.backend.entity.AlertType;
import com.driveguard.backend.entity.DriverStatus;
import com.driveguard.backend.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LiveMonitoringResponse {
    private DriverStatus driverStatus;
    private double latestEAR;
    private double latestMAR;
    private LocalDateTime lastAlertTime;
    private AlertType latestAlertType;
    private Severity latestSeverity;
    private String latestMessage;
}
