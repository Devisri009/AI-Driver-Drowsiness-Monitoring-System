package com.driveguard.backend.service;

import com.driveguard.backend.entity.DriverStatus;
import com.driveguard.backend.entity.SessionStatus;
import com.driveguard.backend.entity.Severity;
import com.driveguard.backend.model.LiveMetrics;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionTrackingService {

    private final ConcurrentHashMap<Long, ActiveSession> activeSessions = new ConcurrentHashMap<>();

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
        activeSessions.putIfAbsent(userId, new ActiveSession(userId));
    }

    public void recordMetrics(Long userId, LiveMetrics metrics) {
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
        activeSessions.remove(userId);
    }

    public ActiveSession getActiveSession(Long userId) {
        return activeSessions.get(userId);
    }
}
