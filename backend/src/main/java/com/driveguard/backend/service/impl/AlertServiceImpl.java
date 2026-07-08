package com.driveguard.backend.service.impl;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.CreateAlertRequest;
import com.driveguard.backend.entity.Alert;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.repository.AlertRepository;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    @Override
    public AlertResponse createAlert(String email, CreateAlertRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Alert alert = Alert.builder()
                .alertType(request.getAlertType())
                .severity(request.getSeverity())
                .message(request.getMessage())
                .eyeAspectRatio(request.getEyeAspectRatio())
                .confidence(request.getConfidence())
                .driverStatus(request.getDriverStatus())
                .user(user)
                .build();

        Alert savedAlert = alertRepository.save(alert);

        return AlertResponse.builder()
                .id(savedAlert.getId())
                .alertType(savedAlert.getAlertType())
                .severity(savedAlert.getSeverity())
                .message(savedAlert.getMessage())
                .eyeAspectRatio(savedAlert.getEyeAspectRatio())
                .confidence(savedAlert.getConfidence())
                .driverStatus(savedAlert.getDriverStatus())
                .timestamp(savedAlert.getTimestamp())
                .build();
    }
}
