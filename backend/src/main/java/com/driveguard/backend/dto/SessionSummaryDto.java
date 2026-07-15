package com.driveguard.backend.dto;

import com.driveguard.backend.entity.DriverStatus;
import com.driveguard.backend.entity.EndReason;
import com.driveguard.backend.entity.OverallSafety;
import com.driveguard.backend.entity.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionSummaryDto {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationSeconds;
    private Integer totalBlinks;
    private Integer totalYawns;
    private Double averageEar;
    private Double averageMar;
    private Double minimumEar;
    private Double maximumMar;
    private Integer totalAlerts;
    private Integer mediumAlerts;
    private Integer highAlerts;
    private Integer totalAlarmActivations;
    private DriverStatus worstDriverStatus;
    private OverallSafety overallSafety;
    private SessionStatus status;
    private EndReason endReason;
}
