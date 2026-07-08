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

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertResponse> createAlert(@RequestBody CreateAlertRequest request) {
        String email = getAuthenticatedEmail();
        AlertResponse response = alertService.createAlert(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        String email = getAuthenticatedEmail();
        List<AlertResponse> alerts = alertService.getAlerts(email);
        return ResponseEntity.ok(alerts);
    }

    private String getAuthenticatedEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
