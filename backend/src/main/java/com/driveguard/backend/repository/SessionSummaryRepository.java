package com.driveguard.backend.repository;

import com.driveguard.backend.entity.SessionSummary;
import com.driveguard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionSummaryRepository extends JpaRepository<SessionSummary, Long> {
    List<SessionSummary> findByUserOrderByEndTimeDesc(User user);
}
