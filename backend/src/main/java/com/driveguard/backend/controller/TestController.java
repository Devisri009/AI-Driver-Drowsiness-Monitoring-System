package com.driveguard.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublic() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Public API is working.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/private")
    public ResponseEntity<Map<String, String>> getPrivate() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "JWT Authentication Successful");
        response.put("user", username);
        return ResponseEntity.ok(response);
    }
}
