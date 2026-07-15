package com.driveguard.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for GET /api/settings and PUT /api/settings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsResponse {

    private Long id;

    // Camera
    private int cameraIndex;

    // AI Detection
    private double earThreshold;
    private double marThreshold;
    private int drowsyFrames;
    private int sleepingFrames;

    // Alarm
    private boolean alarmEnabled;
    private int alarmVolume;
}
