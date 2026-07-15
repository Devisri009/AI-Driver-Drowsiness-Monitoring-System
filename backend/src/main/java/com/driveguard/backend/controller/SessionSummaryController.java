package com.driveguard.backend.controller;

import com.driveguard.backend.dto.SessionSummaryDto;
import com.driveguard.backend.service.SessionSummaryService;
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

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Tag(name = "Sessions", description = "Endpoints for retrieving driver session summaries")
public class SessionSummaryController {

    private final SessionSummaryService sessionSummaryService;

    @GetMapping("/summaries")
    @Operation(summary = "Get Session Summaries", description = "Retrieves all completed driving session summaries for the authenticated user, ordered from newest to oldest")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved session summaries")
    public ResponseEntity<List<SessionSummaryDto>> getSessionSummaries() {
        String email = getAuthenticatedEmail();
        List<SessionSummaryDto> summaries = sessionSummaryService.getSessionSummaries(email);
        return ResponseEntity.ok(summaries);
    }

    private String getAuthenticatedEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
