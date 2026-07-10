package com.driveguard.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LiveMetrics {
    private String driverStatus;
    private double ear;
    private double mar;
    private int blinkCount;
    private int yawnCount;
    private String alarmStatus;
    private LocalDateTime lastUpdated;
}
