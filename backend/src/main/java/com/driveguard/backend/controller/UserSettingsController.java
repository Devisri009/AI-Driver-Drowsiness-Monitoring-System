package com.driveguard.backend.controller;

import com.driveguard.backend.dto.UserSettingsRequest;
import com.driveguard.backend.dto.UserSettingsResponse;
import com.driveguard.backend.service.UserSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "User Settings", description = "Endpoints for reading and updating AI monitoring settings")
public class UserSettingsController {

    private final UserSettingsService settingsService;

    // ── Helper ────────────────────────────────────────────────────────────────
    private String currentEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (principal instanceof UserDetails ud) ? ud.getUsername() : principal.toString();
    }

    // ── GET /api/settings ─────────────────────────────────────────────────────
    @GetMapping
    @Operation(
        summary = "Get user settings",
        description = "Returns the authenticated user's AI monitoring settings. " +
                      "Default values are created automatically if none exist yet."
    )
    @ApiResponse(responseCode = "200", description = "Settings returned successfully")
    public ResponseEntity<UserSettingsResponse> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings(currentEmail()));
    }

    // ── PUT /api/settings ─────────────────────────────────────────────────────
    @PutMapping
    @Operation(
        summary = "Update user settings",
        description = "Validates and persists new AI monitoring settings for the authenticated user."
    )
    @ApiResponse(responseCode = "200", description = "Settings updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    public ResponseEntity<UserSettingsResponse> updateSettings(
            @Valid @RequestBody UserSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(currentEmail(), request));
    }
}
