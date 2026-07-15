package com.driveguard.backend.service;

import com.driveguard.backend.dto.UserSettingsRequest;
import com.driveguard.backend.dto.UserSettingsResponse;

public interface UserSettingsService {

    /**
     * Returns the settings for the given user email.
     * If no settings record exists yet, default values are created and persisted.
     */
    UserSettingsResponse getSettings(String email);

    /**
     * Updates (or creates) settings for the given user email.
     */
    UserSettingsResponse updateSettings(String email, UserSettingsRequest request);
}
