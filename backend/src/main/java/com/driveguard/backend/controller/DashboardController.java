package com.driveguard.backend.controller;

import com.driveguard.backend.dto.DashboardSummaryResponse;
import com.driveguard.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for retrieving dashboard summaries and alerts analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get Dashboard Summary", description = "Retrieves the main summary dashboard statistics for the driver")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard summary details")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        String email = getAuthenticatedEmail();
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(email);
        return ResponseEntity.ok(summary);
    }

    private String getAuthenticatedEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
