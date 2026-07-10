package com.driveguard.backend.controller;

import com.driveguard.backend.model.LiveMetrics;
import com.driveguard.backend.service.LiveMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
@Tag(name = "Monitoring", description = "Endpoints for real-time driver metrics")
public class MonitoringController {

    private final LiveMetricsService liveMetricsService;

    @PostMapping("/live")
    @Operation(summary = "Update live metrics", description = "Updates the driver's current condition in memory")
    @ApiResponse(responseCode = "200", description = "Successfully updated live metrics")
    public ResponseEntity<Void> updateLiveMetrics(@RequestBody LiveMetrics metrics) {
        String email = getAuthenticatedEmail();
        liveMetricsService.updateMetrics(email, metrics);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/live")
    @Operation(summary = "Get live metrics", description = "Retrieves the driver's latest in-memory condition metrics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved live metrics")
    public ResponseEntity<LiveMetrics> getLiveMetrics() {
        String email = getAuthenticatedEmail();
        LiveMetrics metrics = liveMetricsService.getMetrics(email);
        return ResponseEntity.ok(metrics);
    }

    private String getAuthenticatedEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
