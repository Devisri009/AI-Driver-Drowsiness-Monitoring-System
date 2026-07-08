package com.driveguard.backend.controller;

import com.driveguard.backend.dto.AlertResponse;
import com.driveguard.backend.dto.CreateAlertRequest;
import com.driveguard.backend.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Alerts", description = "Endpoints for recording and retrieving driver drowsiness alerts")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    @Operation(summary = "Create alert", description = "Records a new drowsiness or distraction alert for the driver")
    @ApiResponse(responseCode = "201", description = "Alert successfully created")
    public ResponseEntity<AlertResponse> createAlert(@jakarta.validation.Valid @RequestBody CreateAlertRequest request) {
        String email = getAuthenticatedEmail();
        AlertResponse response = alertService.createAlert(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all alerts", description = "Retrieves a list of all alerts for the authenticated user")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved alerts")
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        String email = getAuthenticatedEmail();
        List<AlertResponse> alerts = alertService.getAlerts(email);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert by ID", description = "Fetches a specific alert details by its ID")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved alert details")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        AlertResponse alert = alertService.getAlertById(email, id);
        return ResponseEntity.ok(alert);
    }

    private String getAuthenticatedEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
