package com.driveguard.backend.controller;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.CreateAlertRequest;
import com.driveguard.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertResponse> createAlert(@RequestBody CreateAlertRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        AlertResponse response = alertService.createAlert(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
