package com.driveguard.backend.repository;

import com.driveguard.backend.entity.Alert;
import com.driveguard.backend.entity.Severity;
import com.driveguard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUser(User user);
    List<Alert> findByUserOrderByTimestampDesc(User user);
    long countByUser(User user);
    long countByUserAndTimestampAfter(User user, LocalDateTime timestamp);
    long countByUserAndSeverity(User user, Severity severity);
    Optional<Alert> findFirstByUserOrderByTimestampDesc(User user);
}

