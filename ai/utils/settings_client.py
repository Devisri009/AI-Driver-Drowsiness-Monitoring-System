"""
utils/settings_client.py
────────────────────────
Background settings synchroniser for the DriveGuard AI module.

Responsibilities
- Fetches user settings from GET /api/settings every 30 seconds.
- Caches the latest successful response in memory.
- Falls back to the previous cache if the backend is unreachable.
- Falls back to config.py defaults if no successful fetch has ever occurred.
- Never blocks the OpenCV processing thread (all HTTP work runs in a
  background daemon thread using threading.Timer for non-drifting repeats).
- Exposes a single module-level singleton: `settings_client`.

Usage (from any module)
    from utils.settings_client import settings_client

    ear  = settings_client.get("earThreshold")
    mar  = settings_client.get("marThreshold")
"""

import threading
import requests

# ── config.py fallback defaults ──────────────────────────────────────────────
# Imported lazily inside the class so that circular import issues are avoided
# and the fallback is always consistent with what config.py actually defines.
from config import (
    BACKEND_API_URL,
    EAR_THRESHOLD,
    YAWN_THRESHOLD,
    DROWSY_CONSECUTIVE_FRAMES,
    SLEEPING_CONSECUTIVE_FRAMES,
)

# Map backend field names → config.py defaults
_CONFIG_DEFAULTS = {
    "cameraIndex":    0,
    "earThreshold":   EAR_THRESHOLD,
    "marThreshold":   YAWN_THRESHOLD,
    "drowsyFrames":   DROWSY_CONSECUTIVE_FRAMES,
    "sleepingFrames": SLEEPING_CONSECUTIVE_FRAMES,
    "alarmEnabled":   True,
    "alarmVolume":    80,
}

_REFRESH_INTERVAL_SECONDS = 30


class SettingsClient:
    """
    Thread-safe, non-blocking settings cache.

    All HTTP calls execute inside a daemon thread so the OpenCV
    frame-processing loop is never stalled.
    """

    def __init__(self, base_url: str, jwt_token: str):
        self._base_url   = base_url.rstrip("/")
        self._jwt_token  = jwt_token

        # _cache holds the last successfully fetched settings dict.
        # None means no successful fetch has happened yet.
        self._cache: dict | None = None
        self._lock = threading.Lock()

        # Start the first fetch immediately, then schedule repeating refreshes.
        self._fetch_in_background()

    # ── Public API ────────────────────────────────────────────────────────────

    def get(self, field: str):
        """
        Return the cached value for *field*.

        Priority:
          1. Latest successfully fetched backend value
          2. config.py default (if no fetch has succeeded yet)
        """
        with self._lock:
            source = self._cache if self._cache is not None else _CONFIG_DEFAULTS
            return source.get(field, _CONFIG_DEFAULTS.get(field))

    def get_all(self) -> dict:
        """Return a snapshot of the current effective settings dict."""
        with self._lock:
            if self._cache is not None:
                return dict(self._cache)
            return dict(_CONFIG_DEFAULTS)

    # ── Internal machinery ────────────────────────────────────────────────────

    def _fetch_in_background(self):
        """Spawn a daemon thread to fetch settings, then schedule the next run."""
        t = threading.Thread(target=self._fetch_and_reschedule, daemon=True)
        t.start()

    def _fetch_and_reschedule(self):
        """Worker: fetch from backend, update cache, then schedule next cycle."""
        self._do_fetch()
        # Use threading.Timer so the interval is measured *after* the request
        # completes — no drift accumulation.
        timer = threading.Timer(_REFRESH_INTERVAL_SECONDS, self._fetch_and_reschedule)
        timer.daemon = True
        timer.start()

    def _do_fetch(self):
        """Perform the HTTP GET, update _cache, and print the appropriate log line."""
        url     = f"{self._base_url}/settings"
        headers = {"Content-Type": "application/json"}
        if self._jwt_token:
            headers["Authorization"] = f"Bearer {self._jwt_token}"

        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            data = response.json()

            with self._lock:
                self._cache = {
                    "cameraIndex":    int(data.get("cameraIndex",    _CONFIG_DEFAULTS["cameraIndex"])),
                    "earThreshold":   float(data.get("earThreshold", _CONFIG_DEFAULTS["earThreshold"])),
                    "marThreshold":   float(data.get("marThreshold", _CONFIG_DEFAULTS["marThreshold"])),
                    "drowsyFrames":   int(data.get("drowsyFrames",   _CONFIG_DEFAULTS["drowsyFrames"])),
                    "sleepingFrames": int(data.get("sleepingFrames", _CONFIG_DEFAULTS["sleepingFrames"])),
                    "alarmEnabled":   bool(data.get("alarmEnabled",  _CONFIG_DEFAULTS["alarmEnabled"])),
                    "alarmVolume":    int(data.get("alarmVolume",    _CONFIG_DEFAULTS["alarmVolume"])),
                }

            print("[SETTINGS] Updated from backend")

        except Exception as e:
            # Backend unreachable or returned an error.
            with self._lock:
                if self._cache is not None:
                    print(f"[SETTINGS] Using cached settings (backend error: {e})")
                else:
                    print(f"[SETTINGS] Using default configuration (backend error: {e})")


# ── Module-level singleton ────────────────────────────────────────────────────
# The singleton is initialized lazily via initialize() so the runtime JWT
# obtained from sys.argv in main.py can be injected before any fetch occurs.
# Other modules import `settings_client` by name; after initialize() is called
# the name points to a fully configured SettingsClient instance.

settings_client: SettingsClient | None = None


def initialize(jwt_token: str) -> None:
    """Must be called once from main.py before FaceDetector is instantiated."""
    global settings_client
    settings_client = SettingsClient(
        base_url=BACKEND_API_URL,
        jwt_token=jwt_token,
    )
