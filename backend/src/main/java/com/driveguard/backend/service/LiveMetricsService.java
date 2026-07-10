package com.driveguard.backend.service;

import com.driveguard.backend.model.LiveMetrics;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class LiveMetricsService {
    // Thread-safe map to store the latest metrics for each authenticated user email
    private final ConcurrentHashMap<String, LiveMetrics> userMetrics = new ConcurrentHashMap<>();

    /**
     * Updates the latest live metrics for the user.
     */
    public void updateMetrics(String email, LiveMetrics metrics) {
        userMetrics.put(email, metrics);
    }

    /**
     * Retrieves the latest live metrics for the user.
     */
    public LiveMetrics getMetrics(String email) {
        return userMetrics.get(email);
    }
}
