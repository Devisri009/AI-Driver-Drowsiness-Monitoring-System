import time
import requests
import threading
from datetime import datetime

class LiveMetricsClient:
    def __init__(self, base_url, jwt_token):
        """
        Initializes the LiveMetricsClient.
        
        Args:
            base_url (str): The base URL of the Spring Boot backend.
            jwt_token (str): The JWT token for authentication.
        """
        self.base_url = base_url.rstrip('/')
        self.jwt_token = jwt_token
        self.last_sent_time = 0.0

    def send_metrics(self, driver_status, ear, mar, blink_count, yawn_count, alarm_status):
        """
        Sends live metrics to the backend. Ensures it only executes every 2 seconds.
        Runs asynchronously in a background thread to prevent UI freezing.
        """
        current_time = time.time()
        if current_time - self.last_sent_time < 2.0:
            return

        self.last_sent_time = current_time

        # Run POST request in a background thread to prevent freezing the webcam UI/AI loop
        thread = threading.Thread(
            target=self._post_metrics_worker,
            args=(driver_status, ear, mar, blink_count, yawn_count, alarm_status)
        )
        thread.daemon = True
        thread.start()

    def _post_metrics_worker(self, driver_status, ear, mar, blink_count, yawn_count, alarm_status):
        url = f"{self.base_url}/monitoring/live"
        headers = {
            "Content-Type": "application/json"
        }
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"

        payload = {
            "driverStatus": driver_status,
            "ear": float(ear) if ear is not None else 0.0,
            "mar": float(mar) if mar is not None else 0.0,
            "blinkCount": int(blink_count),
            "yawnCount": int(yawn_count),
            "alarmStatus": alarm_status,
            "lastUpdated": datetime.now().isoformat()
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=2)
            response.raise_for_status()
        except Exception as e:
            print(f"[LIVE METRICS CLIENT] Communication failed: {e}")
