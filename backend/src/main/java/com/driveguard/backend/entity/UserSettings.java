package com.driveguard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stores per-user AI monitoring configuration.
 * One UserSettings row exists per User (created lazily on first GET).
 */
@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** One-to-one with User — FK stored in user_settings.user_id */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Camera ────────────────────────────────────────────────────────────────
    /** Index of the camera device (0 = default webcam). */
    @Builder.Default
    @Column(nullable = false)
    private int cameraIndex = 0;

    // ── AI Detection ─────────────────────────────────────────────────────────
    /** Eye Aspect Ratio threshold — below this triggers drowsiness. */
    @Builder.Default
    @Column(nullable = false)
    private double earThreshold = 0.25;

    /** Mouth Aspect Ratio threshold — above this triggers yawn detection. */
    @Builder.Default
    @Column(nullable = false)
    private double marThreshold = 0.65;

    /** Consecutive frames EAR must be below earThreshold to trigger DROWSY. */
    @Builder.Default
    @Column(nullable = false)
    private int drowsyFrames = 20;

    /** Consecutive frames EAR must be below earThreshold to trigger SLEEPING. */
    @Builder.Default
    @Column(nullable = false)
    private int sleepingFrames = 40;

    // ── Alarm ─────────────────────────────────────────────────────────────────
    /** Whether the audible alarm is active. */
    @Builder.Default
    @Column(nullable = false)
    private boolean alarmEnabled = true;

    /** Alarm volume: 0 (mute) – 100 (max). */
    @Builder.Default
    @Column(nullable = false)
    private int alarmVolume = 80;
}
