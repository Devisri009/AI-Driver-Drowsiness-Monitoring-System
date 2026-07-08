package com.driveguard.backend.service;

import com.driveguard.backend.dto.AuthenticationResponse;
import com.driveguard.backend.dto.LoginRequest;
import com.driveguard.backend.dto.RegisterRequest;

public interface AuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse login(LoginRequest request);
}
