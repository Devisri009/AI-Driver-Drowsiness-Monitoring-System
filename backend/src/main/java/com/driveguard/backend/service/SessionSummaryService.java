package com.driveguard.backend.service;

import com.driveguard.backend.dto.SessionSummaryDto;
import java.util.List;

public interface SessionSummaryService {
    List<SessionSummaryDto> getSessionSummaries(String email);
}
