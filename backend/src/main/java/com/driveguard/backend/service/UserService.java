package com.driveguard.backend.service;

import com.driveguard.backend.dto.ProfileResponse;

import com.driveguard.backend.dto.UpdateProfileRequest;

public interface UserService {
    ProfileResponse getUserProfile(String email);
    ProfileResponse updateUserProfile(String email, UpdateProfileRequest request);
}
