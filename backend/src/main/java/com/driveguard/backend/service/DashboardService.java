package com.driveguard.backend.service;

import com.driveguard.backend.dto.DashboardSummaryResponse;

public interface DashboardService {
    DashboardSummaryResponse getDashboardSummary(String email);
}
