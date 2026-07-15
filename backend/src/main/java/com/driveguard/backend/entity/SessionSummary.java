package com.driveguard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long durationSeconds;

    private Integer totalBlinks;

    private Integer totalYawns;

    private Double averageEar;

    private Double averageMar;

    private Double minimumEar;

    private Double maximumMar;

    private Integer totalAlerts;

    private Integer mediumAlerts;

    private Integer highAlerts;

    private Integer totalAlarmActivations;

    @Enumerated(EnumType.STRING)
    private DriverStatus worstDriverStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Enumerated(EnumType.STRING)
    private EndReason endReason;

    @Enumerated(EnumType.STRING)
    private OverallSafety overallSafety;
}
