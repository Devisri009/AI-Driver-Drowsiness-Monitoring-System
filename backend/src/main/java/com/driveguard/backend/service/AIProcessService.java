package com.driveguard.backend.service;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class AIProcessService {

    private static final Logger logger = LoggerFactory.getLogger(AIProcessService.class);

    @Value("${driveguard.ai.python}")
    private String pythonExecutable;

    @Value("${driveguard.ai.project-dir}")
    private String aiProjectDir;

    private Process aiProcess;

    public synchronized boolean isRunning() {
        if (aiProcess != null) {
            if (aiProcess.isAlive()) {
                return true;
            } else {
                logger.warn("AI process has exited unexpectedly. Clearing process reference.");
                aiProcess = null; // Clear dead process reference
            }
        }
        return false;
    }

    public synchronized void startProcess(String jwtToken) throws IOException {
        if (isRunning()) {
            logger.info("AI process is already running.");
            return;
        }

        logger.info("Starting AI process using {} in {}", pythonExecutable, aiProjectDir);
        
        ProcessBuilder pb = new ProcessBuilder(pythonExecutable, "main.py", jwtToken);
        pb.directory(new File(aiProjectDir));
        pb.redirectErrorStream(true);
        // Inherit IO so we can see the python output in the Spring Boot console for debugging
        pb.redirectOutput(ProcessBuilder.Redirect.INHERIT);

        aiProcess = pb.start();
        logger.info("AI process started successfully with PID: {}", aiProcess.pid());
    }

    public synchronized void stopProcess() {
        if (!isRunning()) {
            logger.info("No AI process is currently running to stop.");
            return;
        }

        logger.info("Stopping AI process (PID: {})...", aiProcess.pid());
        aiProcess.destroy();
        
        try {
            // Wait briefly for graceful shutdown
            if (!aiProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                logger.warn("AI process did not terminate gracefully. Forcing termination...");
                aiProcess.destroyForcibly();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            aiProcess.destroyForcibly();
        }

        aiProcess = null;
        logger.info("AI process stopped successfully.");
    }

    @PreDestroy
    public void cleanupOnShutdown() {
        logger.info("Spring Boot is shutting down. Cleaning up AI process...");
        stopProcess();
    }
}
