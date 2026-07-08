package com.driveguard.backend.service;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.CreateAlertRequest;

import java.util.List;

public interface AlertService {
    AlertResponse createAlert(String email, CreateAlertRequest request);
    List<AlertResponse> getAlerts(String email);
}
