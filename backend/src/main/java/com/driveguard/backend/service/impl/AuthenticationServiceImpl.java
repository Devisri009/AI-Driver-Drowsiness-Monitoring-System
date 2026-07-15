package com.driveguard.backend.service.impl;

import com.driveguard.backend.dto.AuthenticationResponse;
import com.driveguard.backend.dto.LoginRequest;
import com.driveguard.backend.dto.RegisterRequest;
import com.driveguard.backend.entity.User;
import com.driveguard.backend.repository.UserRepository;
import com.driveguard.backend.service.AuthenticationService;
import com.driveguard.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthenticationResponse register(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return AuthenticationResponse.builder()
                    .message("Registration failed: Email already exists")
                    .token(null)
                    .build();
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        userRepository.save(user);

        return AuthenticationResponse.builder()
                .message("User registered successfully")
                .token(null) // Token generation not implemented yet
                .build();
    }

    @Override
    public AuthenticationResponse login(LoginRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        
        if (existingUser.isEmpty()) {
            return AuthenticationResponse.builder()
                    .message("Login failed: User not found")
                    .token(null)
                    .build();
        }
        
        User user = existingUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthenticationResponse.builder()
                    .message("Login failed: Incorrect password")
                    .token(null)
                    .build();
        }

        String jwtToken = jwtService.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .message("Login successful")
                .token(jwtToken)
                .build();
    }
}
