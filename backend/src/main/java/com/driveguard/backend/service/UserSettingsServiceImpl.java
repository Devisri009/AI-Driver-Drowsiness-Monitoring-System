package com.driveguard.backend.service;

import com.driveguard.backend.dto.UserSettingsRequest;
import com.driveguard.backend.dto.UserSettingsResponse;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.entity.UserSettings;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    /**
     * Converts a UserSettings entity to its response DTO.
     */
    private UserSettingsResponse toResponse(UserSettings s) {
        return UserSettingsResponse.builder()
                .id(s.getId())
                .cameraIndex(s.getCameraIndex())
                .earThreshold(s.getEarThreshold())
                .marThreshold(s.getMarThreshold())
                .drowsyFrames(s.getDrowsyFrames())
                .sleepingFrames(s.getSleepingFrames())
                .alarmEnabled(s.isAlarmEnabled())
                .alarmVolume(s.getAlarmVolume())
                .build();
    }

    /**
     * Finds or lazily creates default settings for the given user.
     */
    private UserSettings getOrCreateSettings(User user) {
        return settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserSettings defaults = UserSettings.builder()
                            .user(user)
                            .build(); // all defaults are set in the entity
                    return settingsRepository.save(defaults);
                });
    }

    // ── Interface implementations ─────────────────────────────────────────────

    @Override
    @Transactional
    public UserSettingsResponse getSettings(String email) {
        User user = requireUser(email);
        UserSettings settings = getOrCreateSettings(user);
        return toResponse(settings);
    }

    @Override
    @Transactional
    public UserSettingsResponse updateSettings(String email, UserSettingsRequest request) {
        User user = requireUser(email);
        UserSettings settings = getOrCreateSettings(user);

        settings.setCameraIndex(request.getCameraIndex());
        settings.setEarThreshold(request.getEarThreshold());
        settings.setMarThreshold(request.getMarThreshold());
        settings.setDrowsyFrames(request.getDrowsyFrames());
        settings.setSleepingFrames(request.getSleepingFrames());
        settings.setAlarmEnabled(request.isAlarmEnabled());
        settings.setAlarmVolume(request.getAlarmVolume());

        UserSettings saved = settingsRepository.save(settings);
        return toResponse(saved);
    }
}
