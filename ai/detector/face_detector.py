import cv2
import time
import mediapipe as mp
from config import ALARM_SOUND_PATH, BACKEND_API_URL, YAWN_CONSECUTIVE_FRAMES
import utils.settings_client as settings_module
from utils.face_landmarks import LEFT_EYE_INDICES, RIGHT_EYE_INDICES, LEFT_EYE_EAR_INDICES, RIGHT_EYE_EAR_INDICES, MOUTH_INDICES, MOUTH_MAR_INDICES
from utils.ear import calculate_ear
from utils.mar import calculate_mar
from utils.alarm import AlarmPlayer
from utils.api_client import BackendApiClient
from utils.live_metrics_client import LiveMetricsClient

ALERT_COOLDOWN_SECONDS = 30

class FaceDetector:
    def __init__(self, jwt_token, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

        # Blink detection state
        self.blink_count = 0
        self.eye_closed = False

        # Driver status detection state
        self.closed_eye_frames = 0
        self.driver_status = "ALERT"

        # Yawn detection state
        self.yawn_count = 0
        self.mouth_open = False
        self.open_mouth_frames = 0

        # Alarm player initialization
        self.alarm_player = AlarmPlayer(ALARM_SOUND_PATH)

        # API client and status tracking initialization
        self.api_client = BackendApiClient(BACKEND_API_URL, jwt_token)
        self.live_metrics_client = LiveMetricsClient(BACKEND_API_URL, jwt_token)
        self.prev_driver_status = "ALERT"
        self.last_drowsy_alert_time = 0
        self.last_sleeping_alert_time = 0

    def process(self, frame):
        """
        Processes the input frame to detect a face.
        If detected, draws the Face Mesh landmarks on the frame.
        Extracts and highlights left and right eye landmarks.
        Calculates Eye Aspect Ratio (EAR) for both eyes and computes their average.
        Adds status text ("Face Detected", "Left Eye Detected", "Right Eye Detected",
        and live average EAR in green, or "No Face Detected" in red) on the frame.
        """
        # ── Snapshot live settings once per frame (single lock acquisition) ────
        # cfg is a plain dict; reading from it in the rest of this method
        # never touches the settings_client lock again.
        cfg = settings_module.settings_client.get_all()
        # YAWN_CONSECUTIVE_FRAMES is not a backend-managed field; keep it from
        # config.py so the backend settings surface stays minimal.
        cfg["yawnConsecutiveFrames"] = YAWN_CONSECUTIVE_FRAMES

        # Convert BGR frame to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        face_detected = False
        left_eye_detected = False
        right_eye_detected = False
        mouth_detected = False
        average_ear = 0.0
        average_mar = 0.0

        multi_face_landmarks = getattr(results, 'multi_face_landmarks', None)
        if multi_face_landmarks:
            face_detected = True
            for face_landmarks in multi_face_landmarks:
                # 1. Draw tesselation (refined mesh structure)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_TESSELATION,  # type: ignore
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
                )
                
                # 2. Draw contours (eyes, brows, mouth, face boundary)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_CONTOURS,  # type: ignore
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_contours_style()
                )

                # 3. Draw irises (refined landmarks)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_IRISES,  # type: ignore
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_iris_connections_style()
                )

                # 4. Highlight left and right eye landmarks with green circles
                h, w, _ = frame.shape
                try:
                    for idx in LEFT_EYE_INDICES:
                        landmark = face_landmarks.landmark[idx]
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        cv2.circle(frame, (cx, cy), 2, (0, 255, 0), -1)
                    left_eye_detected = True
                except IndexError:
                    left_eye_detected = False

                try:
                    for idx in RIGHT_EYE_INDICES:
                        landmark = face_landmarks.landmark[idx]
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        cv2.circle(frame, (cx, cy), 2, (0, 255, 0), -1)
                    right_eye_detected = True
                except IndexError:
                    right_eye_detected = False

                # 4b. Highlight mouth landmarks with blue circles
                try:
                    for idx in MOUTH_INDICES:
                        landmark = face_landmarks.landmark[idx]
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        cv2.circle(frame, (cx, cy), 2, (255, 0, 0), -1)
                    mouth_detected = True
                except IndexError:
                    mouth_detected = False

                # 4c. Extract MAR 8-point landmarks and calculate MAR
                try:
                    mouth_mar_pts = [face_landmarks.landmark[idx] for idx in MOUTH_MAR_INDICES]
                    average_mar = calculate_mar(mouth_mar_pts)
                except IndexError:
                    average_mar = 0.0

                # 4d. Yawn detection using MAR threshold and consecutive frame count
                if average_mar is not None and average_mar > cfg["marThreshold"]:
                    self.open_mouth_frames += 1
                    if self.open_mouth_frames >= cfg["yawnConsecutiveFrames"] and not self.mouth_open:
                        self.yawn_count += 1
                        self.mouth_open = True
                else:
                    self.open_mouth_frames = 0
                    self.mouth_open = False

                # 5. Extract specific EAR 6-point landmarks and calculate EAR for each eye
                try:
                    left_eye_pts = [face_landmarks.landmark[idx] for idx in LEFT_EYE_EAR_INDICES]
                    left_ear = calculate_ear(left_eye_pts)
                except IndexError:
                    left_ear = 0.0

                try:
                    right_eye_pts = [face_landmarks.landmark[idx] for idx in RIGHT_EYE_EAR_INDICES]
                    right_ear = calculate_ear(right_eye_pts)
                except IndexError:
                    right_ear = 0.0

                average_ear = (left_ear + right_ear) / 2.0

                # 6. Blink detection using EAR threshold (live from settings)
                if average_ear < cfg["earThreshold"]:
                    # Eye has just closed - mark as closed
                    if not self.eye_closed:
                        self.eye_closed = True
                else:
                    # Eye has reopened after being closed - count as one blink
                    if self.eye_closed:
                        self.blink_count += 1
                        self.eye_closed = False

                # 7. Driver status detection using consecutive closed-eye frame count
                if average_ear < cfg["earThreshold"]:
                    self.closed_eye_frames += 1
                    if self.closed_eye_frames >= cfg["sleepingFrames"]:
                        self.driver_status = "SLEEPING"
                    elif self.closed_eye_frames >= cfg["drowsyFrames"]:
                        self.driver_status = "DROWSY"
                    else:
                        self.driver_status = "ALERT"
                else:
                    self.closed_eye_frames = 0
                    self.driver_status = "ALERT"

        # Draw status text
        if face_detected:
            cv2.putText(
                frame, 
                "Face Detected", 
                (30, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                1.0, 
                (0, 255, 0), 
                2, 
                cv2.LINE_AA
            )
            if left_eye_detected:
                cv2.putText(
                    frame, 
                    "Left Eye Detected", 
                    (30, 90), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    1.0, 
                    (0, 255, 0), 
                    2, 
                    cv2.LINE_AA
                )
            if right_eye_detected:
                cv2.putText(
                    frame, 
                    "Right Eye Detected", 
                    (30, 130), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    1.0, 
                    (0, 255, 0), 
                    2, 
                    cv2.LINE_AA
                )
            if average_ear is not None:
                cv2.putText(
                    frame, 
                    f"EAR: {average_ear:.2f}", 
                    (30, 170), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    1.0, 
                    (0, 255, 0), 
                    2, 
                    cv2.LINE_AA
                )
                cv2.putText(
                    frame,
                    f"Blink Count: {self.blink_count}",
                    (30, 210),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.0,
                    (0, 255, 0),
                    2,
                    cv2.LINE_AA
                )
                status_color = {"ALERT": (0, 255, 0), "DROWSY": (0, 165, 255), "SLEEPING": (0, 0, 255)}.get(self.driver_status, (0, 255, 0))
                cv2.putText(
                    frame,
                    f"Driver Status: {self.driver_status}",
                    (30, 250),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.0,
                    status_color,
                    2,
                    cv2.LINE_AA
                )
                if mouth_detected:
                    cv2.putText(
                        frame,
                        "Mouth Detected",
                        (30, 290),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.0,
                        (255, 0, 0),
                        2,
                        cv2.LINE_AA
                    )
                    if average_mar is not None:
                        cv2.putText(
                            frame,
                            f"MAR: {average_mar:.2f}",
                            (30, 330),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1.0,
                            (255, 0, 0),
                            2,
                            cv2.LINE_AA
                        )
                        cv2.putText(
                            frame,
                            f"Yawn Count: {self.yawn_count}",
                            (30, 370),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1.0,
                            (255, 0, 0),
                            2,
                            cv2.LINE_AA
                        )
                        # Render Alarm status line below the Yawn Count
                        alarm_text = "Alarm: ON" if self.alarm_player.is_playing() else "Alarm: OFF"
                        alarm_color = (0, 0, 255) if self.alarm_player.is_playing() else (0, 255, 0) # Red (BGR) or Green (BGR)
                        cv2.putText(
                            frame,
                            alarm_text,
                            (30, 410),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1.0,
                            alarm_color,
                            2,
                            cv2.LINE_AA
                        )
        else:
            cv2.putText(
                frame, 
                "No Face Detected", 
                (30, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                1.0, 
                (0, 0, 255), 
                2, 
                cv2.LINE_AA
            )

        # Control the alarm sound based on driver status and alarmEnabled setting
        if self.driver_status in ["DROWSY", "SLEEPING"] and cfg["alarmEnabled"]:
            self.alarm_player.start()
        else:
            self.alarm_player.stop()

        # Send alert to backend on specific status transitions
        current_time = time.time()
        if self.prev_driver_status == "ALERT" and self.driver_status == "DROWSY":
            if current_time - self.last_drowsy_alert_time >= ALERT_COOLDOWN_SECONDS:
                try:
                    ear_val = average_ear if average_ear is not None else 0.0
                    self.api_client.send_alert(
                        alert_type="DROWSINESS",
                        severity="MEDIUM",
                        driver_status="DROWSY",
                        message="Drowsiness detected",
                        eye_aspect_ratio=ear_val,
                        confidence=100.0
                    )
                    self.last_drowsy_alert_time = current_time
                    print("[API] Sent Alert: DROWSY (Severity: MEDIUM)")
                except Exception as e:
                    print(f"[API ERROR] Failed to send alert: {e}")
        elif self.prev_driver_status == "DROWSY" and self.driver_status == "DROWSY":
            if current_time - self.last_drowsy_alert_time >= ALERT_COOLDOWN_SECONDS:
                try:
                    ear_val = average_ear if average_ear is not None else 0.0
                    self.api_client.send_alert(
                        alert_type="DROWSINESS",
                        severity="HIGH",
                        driver_status="DROWSY",
                        message="Driver remains drowsy",
                        eye_aspect_ratio=ear_val,
                        confidence=100.0
                    )
                    self.last_drowsy_alert_time = current_time
                    print("[API] Sent Alert: DROWSY (Severity: HIGH) [Continuous]")
                except Exception as e:
                    print(f"[API ERROR] Failed to send alert: {e}")
        elif self.prev_driver_status == "DROWSY" and self.driver_status == "SLEEPING":
            if current_time - self.last_sleeping_alert_time >= ALERT_COOLDOWN_SECONDS:
                try:
                    ear_val = average_ear if average_ear is not None else 0.0
                    self.api_client.send_alert(
                        alert_type="DROWSINESS",
                        severity="HIGH",
                        driver_status="SLEEPING",
                        message="Driver sleeping detected",
                        eye_aspect_ratio=ear_val,
                        confidence=100.0
                    )
                    self.last_sleeping_alert_time = current_time
                    print("[API] Sent Alert: SLEEPING (Severity: HIGH)")
                except Exception as e:
                    print(f"[API ERROR] Failed to send alert: {e}")
        elif self.prev_driver_status == "SLEEPING" and self.driver_status == "SLEEPING":
            if current_time - self.last_sleeping_alert_time >= ALERT_COOLDOWN_SECONDS:
                try:
                    ear_val = average_ear if average_ear is not None else 0.0
                    self.api_client.send_alert(
                        alert_type="DROWSINESS",
                        severity="HIGH",
                        driver_status="SLEEPING",
                        message="Driver still sleeping",
                        eye_aspect_ratio=ear_val,
                        confidence=100.0
                    )
                    self.last_sleeping_alert_time = current_time
                    print("[API] Sent Alert: SLEEPING (Severity: HIGH) [Continuous]")
                except Exception as e:
                    print(f"[API ERROR] Failed to send alert: {e}")

        # Update previous status for next frame comparison
        self.prev_driver_status = self.driver_status

        # Send live metrics to backend every 2 seconds
        alarm_status_str = "ON" if self.alarm_player.is_playing() else "OFF"
        self.live_metrics_client.send_metrics(
            driver_status=self.driver_status,
            ear=average_ear if average_ear is not None else 0.0,
            mar=average_mar if average_mar is not None else 0.0,
            blink_count=self.blink_count,
            yawn_count=self.yawn_count,
            alarm_status=alarm_status_str
        )

        return face_detected, frame

    def close(self):
        self.face_mesh.close()
        self.alarm_player.stop()
