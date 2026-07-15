package com.driveguard.backend.service.impl;

import com.driveguard.backend.dto.ProfileResponse;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.driveguard.backend.dto.UpdateProfileRequest;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public ProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    @Override
    public ProfileResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        user.setFullName(request.getName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        return ProfileResponse.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getFullName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .build();
    }
}
