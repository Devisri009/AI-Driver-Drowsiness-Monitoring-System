package com.driveguard.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {
    private long totalAlerts;
    private long alertsToday;
    private long highSeverityAlerts;
    private long mediumSeverityAlerts;
    private long lowSeverityAlerts;
    private AlertResponse latestAlert;
}
