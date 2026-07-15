package com.driveguard.backend.service.impl;

import com.driveguard.backend.dto.SessionSummaryDto;
import com.driveguard.backend.entity.SessionSummary;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.repository.SessionSummaryRepository;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.service.SessionSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionSummaryServiceImpl implements SessionSummaryService {

    private final SessionSummaryRepository sessionSummaryRepository;
    private final UserRepository userRepository;

    @Override
    public List<SessionSummaryDto> getSessionSummaries(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<SessionSummary> summaries = sessionSummaryRepository.findByUserOrderByEndTimeDesc(user);

        return summaries.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private SessionSummaryDto mapToDto(SessionSummary summary) {
        return SessionSummaryDto.builder()
                .id(summary.getId())
                .startTime(summary.getStartTime())
                .endTime(summary.getEndTime())
                .durationSeconds(summary.getDurationSeconds())
                .totalBlinks(summary.getTotalBlinks())
                .totalYawns(summary.getTotalYawns())
                .averageEar(summary.getAverageEar())
                .averageMar(summary.getAverageMar())
                .minimumEar(summary.getMinimumEar())
                .maximumMar(summary.getMaximumMar())
                .totalAlerts(summary.getTotalAlerts())
                .mediumAlerts(summary.getMediumAlerts())
                .highAlerts(summary.getHighAlerts())
                .totalAlarmActivations(summary.getTotalAlarmActivations())
                .worstDriverStatus(summary.getWorstDriverStatus())
                .overallSafety(summary.getOverallSafety())
                .status(summary.getStatus())
                .endReason(summary.getEndReason())
                .build();
    }
}
