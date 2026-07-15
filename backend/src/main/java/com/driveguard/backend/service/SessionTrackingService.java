package com.driveguard.backend.service;

import com.driveguard.backend.entity.DriverStatus;
import com.driveguard.backend.entity.EndReason;
import com.driveguard.backend.entity.OverallSafety;
import com.driveguard.backend.entity.SessionStatus;
import com.driveguard.backend.entity.SessionSummary;
import com.driveguard.backend.entity.Severity;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.model.LiveMetrics;
import com.driveguard.backend.repository.SessionSummaryRepository;
import com.driveguard.backend.repository.UserRepository;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(SessionTrackingService.class);

    private final ConcurrentHashMap<Long, ActiveSession> activeSessions = new ConcurrentHashMap<>();
    private final SessionSummaryRepository sessionSummaryRepository;
    private final UserRepository userRepository;

    public SessionTrackingService(SessionSummaryRepository sessionSummaryRepository, UserRepository userRepository) {
        this.sessionSummaryRepository = sessionSummaryRepository;
        this.userRepository = userRepository;
    }

    @Data
    public static class ActiveSession {
        private final Long userId;
        private final LocalDateTime startTime;
        private SessionStatus status;
        private String lastAlarmStatus;
        private final SessionStatistics statistics;

        public ActiveSession(Long userId) {
            this.userId = userId;
            this.startTime = LocalDateTime.now();
            this.status = SessionStatus.ACTIVE;
            this.lastAlarmStatus = "OFF";
            this.statistics = new SessionStatistics();
        }
    }

    @Data
    public static class SessionStatistics {
        private int totalBlinks;
        private int totalYawns;
        private double earSum;
        private double marSum;
        private int metricsCount;
        private double minimumEar;
        private double maximumMar;
        private int totalAlerts;
        private int mediumAlerts;
        private int highAlerts;
        private int totalAlarmActivations;
        private DriverStatus worstDriverStatus;

        public SessionStatistics() {
            this.minimumEar = Double.MAX_VALUE;
            this.maximumMar = Double.MIN_VALUE;
            this.worstDriverStatus = DriverStatus.ALERT;
        }
    }

    public void startSession(Long userId) {

        System.out.println("========== START SESSION ==========");
        System.out.println("User ID = " + userId);

        ActiveSession session = new ActiveSession(userId);
        ActiveSession existing = activeSessions.putIfAbsent(userId, session);

        System.out.println("Map Size = " + activeSessions.size());

        if (existing == null) {
            System.out.println("SESSION CREATED");
        } else {
            System.out.println("SESSION ALREADY EXISTS");
        }

        System.out.println("==================================");
    }

    public void recordMetrics(Long userId, LiveMetrics metrics) {

        System.out.println("recordMetrics() userId = " + userId);
        System.out.println("Session exists = " + activeSessions.containsKey(userId));

        ActiveSession session = activeSessions.get(userId);
        if (session == null || metrics == null) {
            return;
        }

        SessionStatistics stats = session.getStatistics();

        stats.setTotalBlinks(Math.max(stats.getTotalBlinks(), metrics.getBlinkCount()));
        stats.setTotalYawns(Math.max(stats.getTotalYawns(), metrics.getYawnCount()));
        stats.setEarSum(stats.getEarSum() + metrics.getEar());
        stats.setMarSum(stats.getMarSum() + metrics.getMar());
        stats.setMetricsCount(stats.getMetricsCount() + 1);
        stats.setMinimumEar(Math.min(stats.getMinimumEar(), metrics.getEar()));
        stats.setMaximumMar(Math.max(stats.getMaximumMar(), metrics.getMar()));

        if (metrics.getDriverStatus() != null) {
            try {
                DriverStatus status = DriverStatus.valueOf(metrics.getDriverStatus().toUpperCase());
                if (status.ordinal() > stats.getWorstDriverStatus().ordinal()) {
                    stats.setWorstDriverStatus(status);
                }
            } catch (IllegalArgumentException e) {
                // Ignore unrecognized status strings
            }
        }

        String currentAlarm = metrics.getAlarmStatus();
        if (currentAlarm != null) {
            if ("OFF".equalsIgnoreCase(session.getLastAlarmStatus()) && "ON".equalsIgnoreCase(currentAlarm)) {
                stats.setTotalAlarmActivations(stats.getTotalAlarmActivations() + 1);
            }
            session.setLastAlarmStatus(currentAlarm);
        }
    }

    public void recordAlert(Long userId, Severity severity) {
        ActiveSession session = activeSessions.get(userId);
        if (session == null) {
            return;
        }

        SessionStatistics stats = session.getStatistics();
        stats.setTotalAlerts(stats.getTotalAlerts() + 1);
        if (severity == Severity.MEDIUM) {
            stats.setMediumAlerts(stats.getMediumAlerts() + 1);
        } else if (severity == Severity.HIGH) {
            stats.setHighAlerts(stats.getHighAlerts() + 1);
        }
    }

    public void endSession(Long userId) {

        System.out.println("========== END SESSION ==========");
        System.out.println("User ID = " + userId);
        System.out.println("Session exists = " + activeSessions.containsKey(userId));

        ActiveSession session = activeSessions.get(userId);
        if (session == null) {
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            logger.error("Failed to persist session summary: User not found for ID = {}", userId);
            return;
        }

        LocalDateTime endTime = LocalDateTime.now();
        long durationSeconds = Duration.between(session.getStartTime(), endTime).getSeconds();

        SessionStatistics stats = session.getStatistics();
        double avgEar = stats.getMetricsCount() > 0 ? (stats.getEarSum() / stats.getMetricsCount()) : 0.0;
        double avgMar = stats.getMetricsCount() > 0 ? (stats.getMarSum() / stats.getMetricsCount()) : 0.0;
        double minEar = stats.getMetricsCount() > 0 ? stats.getMinimumEar() : 0.0;
        double maxMar = stats.getMetricsCount() > 0 ? stats.getMaximumMar() : 0.0;

        OverallSafety safety;
        if (stats.getWorstDriverStatus() == DriverStatus.SLEEPING || stats.getHighAlerts() >= 2) {
            safety = OverallSafety.UNSAFE;
        } else if (stats.getWorstDriverStatus() == DriverStatus.DROWSY || stats.getMediumAlerts() >= 2) {
            safety = OverallSafety.NEEDS_ATTENTION;
        } else {
            safety = OverallSafety.SAFE;
        }

        SessionSummary summary = SessionSummary.builder()
                .user(user)
                .startTime(session.getStartTime())
                .endTime(endTime)
                .durationSeconds(durationSeconds)
                .totalBlinks(stats.getTotalBlinks())
                .totalYawns(stats.getTotalYawns())
                .averageEar(avgEar)
                .averageMar(avgMar)
                .minimumEar(minEar)
                .maximumMar(maxMar)
                .totalAlerts(stats.getTotalAlerts())
                .mediumAlerts(stats.getMediumAlerts())
                .highAlerts(stats.getHighAlerts())
                .totalAlarmActivations(stats.getTotalAlarmActivations())
                .worstDriverStatus(stats.getWorstDriverStatus())
                .status(SessionStatus.COMPLETED)
                .endReason(EndReason.USER_STOPPED)
                .overallSafety(safety)
                .build();

        try {
            sessionSummaryRepository.save(summary);
            logger.info("Session persisted: User ID = {}, Duration = {}s, Total Alerts = {}, Overall Safety = {}",
                    userId, durationSeconds, stats.getTotalAlerts(), safety);
            activeSessions.remove(userId);
            logger.info("Session removed from runtime memory.");
        } catch (Exception e) {
            logger.error("Failed to persist session summary for user ID = {}", userId, e);
        }
    }

    public ActiveSession getActiveSession(Long userId) {
        return activeSessions.get(userId);
    }
}
