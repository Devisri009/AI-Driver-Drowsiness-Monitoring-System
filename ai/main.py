import cv2
import time
from config import CAMERA_INDEX
from detector.face_detector import FaceDetector

def main():
    print("DriveGuard AI Module Started")
    print(f"Initializing webcam using CAMERA_INDEX: {CAMERA_INDEX}")

    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        print("Unable to access webcam.")
        return

    try:
        # Initialize FaceDetector
        detector = FaceDetector()

        # Warm up camera and try to grab a frame with retry logic
        print("Warming up camera...")
        warmed_up = False
        for attempt in range(5):
            ret, frame = cap.read()
            if ret and frame is not None:
                warmed_up = True
                break
            print(f"Webcam warm-up attempt {attempt + 1}/5 failed. Retrying in 0.5s...")
            time.sleep(0.5)

        if not warmed_up:
            print("Failed to grab initial frame after warm-up. Exiting...")
            return

        print("Webcam successfully initialized. Press 'Q' to exit.")

        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame. Exiting...")
                break

            # Pass frame to FaceDetector
            face_detected, processed_frame = detector.process(frame)

            # Display the live camera feed
            cv2.imshow("DriveGuard Camera", processed_frame)

            # Break the loop if 'Q' or 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        # Clean up on exit
        cap.release()
        if 'detector' in locals():
            detector.close()
        cv2.destroyAllWindows()
        print("Webcam released. Application exited cleanly.")

if __name__ == "__main__":
    main()
