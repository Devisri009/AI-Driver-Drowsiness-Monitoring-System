import cv2
import mediapipe as mp

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

    def process(self, frame):
        """
        Processes the input frame to detect a face.
        If detected, draws the Face Mesh landmarks on the frame.
        Adds status text ("Face Detected" in green or "No Face Detected" in red) on the frame.
        """
        # Convert BGR frame to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        face_detected = False

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
