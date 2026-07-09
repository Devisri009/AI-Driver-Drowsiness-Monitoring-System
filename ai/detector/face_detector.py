import cv2
import mediapipe as mp
from config import EAR_THRESHOLD, DROWSY_CONSECUTIVE_FRAMES, SLEEPING_CONSECUTIVE_FRAMES
from utils.face_landmarks import LEFT_EYE_INDICES, RIGHT_EYE_INDICES, LEFT_EYE_EAR_INDICES, RIGHT_EYE_EAR_INDICES, MOUTH_INDICES
from utils.ear import calculate_ear

class FaceDetector:
    def __init__(self, min_detection_confidence=0.5, min_tracking_confidence=0.5):
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

    def process(self, frame):
        """
        Processes the input frame to detect a face.
        If detected, draws the Face Mesh landmarks on the frame.
        Extracts and highlights left and right eye landmarks.
        Calculates Eye Aspect Ratio (EAR) for both eyes and computes their average.
        Adds status text ("Face Detected", "Left Eye Detected", "Right Eye Detected",
        and live average EAR in green, or "No Face Detected" in red) on the frame.
        """
        # Convert BGR frame to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        face_detected = False
        left_eye_detected = False
        right_eye_detected = False
        average_ear = None

        if results.multi_face_landmarks:
            face_detected = True
            for face_landmarks in results.multi_face_landmarks:
                # 1. Draw tesselation (refined mesh structure)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_TESSELATION,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
                )
                
                # 2. Draw contours (eyes, brows, mouth, face boundary)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_CONTOURS,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_contours_style()
                )

                # 3. Draw irises (refined landmarks)
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_IRISES,
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
                mouth_detected = False
                try:
                    for idx in MOUTH_INDICES:
                        landmark = face_landmarks.landmark[idx]
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        cv2.circle(frame, (cx, cy), 2, (255, 0, 0), -1)
                    mouth_detected = True
                except IndexError:
                    mouth_detected = False

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

                # 6. Blink detection using EAR threshold
                if average_ear < EAR_THRESHOLD:
                    # Eye has just closed - mark as closed
                    if not self.eye_closed:
                        self.eye_closed = True
                else:
                    # Eye has reopened after being closed - count as one blink
                    if self.eye_closed:
                        self.blink_count += 1
                        self.eye_closed = False

                # 7. Driver status detection using consecutive closed-eye frame count
                if average_ear < EAR_THRESHOLD:
                    self.closed_eye_frames += 1
                    if self.closed_eye_frames >= SLEEPING_CONSECUTIVE_FRAMES:
                        self.driver_status = "SLEEPING"
                    elif self.closed_eye_frames >= DROWSY_CONSECUTIVE_FRAMES:
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

        return face_detected, frame

    def close(self):
        self.face_mesh.close()
