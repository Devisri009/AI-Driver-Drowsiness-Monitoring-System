package com.driveguard.backend.service;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.CreateAlertRequest;

public interface AlertService {
    AlertResponse createAlert(String email, CreateAlertRequest request);
}
