package com.driveguard.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for PUT /api/settings.
 * All validation ranges mirror the Python AI module's supported values.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsRequest {

    // ── Camera ────────────────────────────────────────────────────────────────
    @Min(value = 0, message = "Camera index must be 0 or greater")
    private int cameraIndex;

    // ── AI Detection ─────────────────────────────────────────────────────────
    @DecimalMin(value = "0.10", message = "EAR threshold must be at least 0.10")
    @DecimalMax(value = "0.50", message = "EAR threshold must be at most 0.50")
    private double earThreshold;

    @DecimalMin(value = "0.20", message = "MAR threshold must be at least 0.20")
    @DecimalMax(value = "1.20", message = "MAR threshold must be at most 1.20")
    private double marThreshold;

    @Min(value = 1, message = "Drowsy frames must be a positive integer")
    private int drowsyFrames;

    @Min(value = 1, message = "Sleeping frames must be a positive integer")
    private int sleepingFrames;

    // ── Alarm ─────────────────────────────────────────────────────────────────
    private boolean alarmEnabled;

    @Min(value = 0, message = "Alarm volume must be at least 0")
    @Max(value = 100, message = "Alarm volume must be at most 100")
    private int alarmVolume;
}
