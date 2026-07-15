package com.driveguard.backend.repository;

import com.driveguard.backend.entity.User;
import com.driveguard.backend.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    /** Find settings by the owning user. */
    Optional<UserSettings> findByUser(User user);
}
