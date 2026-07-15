package com.driveguard.backend.service;

import com.driveguard.backend.model.LiveMetrics;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class LiveMetricsService {

    private final ConcurrentHashMap<String, LiveMetrics> userMetrics = new ConcurrentHashMap<>();

    public void updateMetrics(String email, LiveMetrics metrics) {
        System.out.println("===== POST METRICS =====");
        System.out.println("Email: " + email);
        System.out.println("Driver Status: " + metrics.getDriverStatus());
        System.out.println("========================");

        userMetrics.put(email, metrics);
    }

    public LiveMetrics getMetrics(String email) {
        System.out.println("===== GET METRICS =====");
        System.out.println("Email: " + email);
        System.out.println("=======================");

        return userMetrics.get(email);
    }
}