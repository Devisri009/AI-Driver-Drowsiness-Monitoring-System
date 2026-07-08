package com.driveguard.backend.service.impl;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.DashboardSummaryResponse;
import com.driveguard.backend.entity.Alert;
import com.driveguard.backend.entity.Severity;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.repository.AlertRepository;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        long totalAlerts = alertRepository.countByUser(user);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long alertsToday = alertRepository.countByUserAndTimestampAfter(user, startOfDay);

        long highSeverityAlerts = alertRepository.countByUserAndSeverity(user, Severity.HIGH);
        long mediumSeverityAlerts = alertRepository.countByUserAndSeverity(user, Severity.MEDIUM);
        long lowSeverityAlerts = alertRepository.countByUserAndSeverity(user, Severity.LOW);

        Optional<Alert> latestAlert = alertRepository.findFirstByUserOrderByTimestampDesc(user);

        AlertResponse latestAlertResponse = latestAlert.map(this::mapToAlertResponse).orElse(null);

        return DashboardSummaryResponse.builder()
                .totalAlerts(totalAlerts)
                .alertsToday(alertsToday)
                .highSeverityAlerts(highSeverityAlerts)
                .mediumSeverityAlerts(mediumSeverityAlerts)
                .lowSeverityAlerts(lowSeverityAlerts)
                .latestAlert(latestAlertResponse)
                .build();
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

