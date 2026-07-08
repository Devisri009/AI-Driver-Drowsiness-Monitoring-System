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

import java.util.List;
import java.util.stream.Collectors;

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

        return mapToAlertResponse(savedAlert);
    }

    @Override
    public List<AlertResponse> getAlerts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<Alert> alerts = alertRepository.findByUserOrderByTimestampDesc(user);

        return alerts.stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    private AlertResponse mapToAlertResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .eyeAspectRatio(alert.getEyeAspectRatio())
                .confidence(alert.getConfidence())
                .driverStatus(alert.getDriverStatus())
                .timestamp(alert.getTimestamp())
                .build();
    }
}
