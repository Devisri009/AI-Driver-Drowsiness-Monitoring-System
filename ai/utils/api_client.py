import requests

class BackendApiClient:
    def __init__(self, base_url, jwt_token):
        """
        Initializes the BackendApiClient.
        
        Args:
            base_url (str): The base URL of the Spring Boot backend.
            jwt_token (str): The JWT token for authentication.
        """
        self.base_url = base_url.rstrip('/')
        self.jwt_token = jwt_token

    def send_alert(self, alert_type, severity, driver_status, message, eye_aspect_ratio, confidence=100.0):
        """
        Sends an alert to the backend.
        
        Args:
            alert_type (str): Type of the alert (e.g., "DROWSINESS").
            severity (str): Severity of the alert (e.g., "MEDIUM", "HIGH").
            driver_status (str): Current driver status (e.g., "DROWSY", "SLEEPING").
            message (str): Descriptive alert message.
            eye_aspect_ratio (float): Current Eye Aspect Ratio (EAR).
            confidence (float, optional): Detection confidence percentage. Defaults to 100.0.
            
        Returns:
            dict or None: Response JSON from the backend if successful, None otherwise.
        """
        url = f"{self.base_url}/alerts"
        headers = {
            "Content-Type": "application/json"
        }
        
        # Add authorization header if token is provided
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
            
        payload = {
            "alertType": alert_type,
            "severity": severity,
            "driverStatus": driver_status,
            "message": message,
            "eyeAspectRatio": float(eye_aspect_ratio),
            "confidence": float(confidence)
        }
        # Send post request, timeout in 5 seconds to prevent freezing the AI thread
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=5
        )

        response.raise_for_status()
        return response.json()
