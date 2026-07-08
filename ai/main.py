import cv2
from config import CAMERA_INDEX
from detector.face_detector import FaceDetector

def main():
    print("DriveGuard AI Module Started")
    print(f"Initializing webcam using CAMERA_INDEX: {CAMERA_INDEX}")

    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        print("Unable to access webcam.")
        return

    # Initialize FaceDetector
    detector = FaceDetector()

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

    # Clean up on exit
    cap.release()
    detector.close()
    cv2.destroyAllWindows()
    print("Webcam released. Application exited cleanly.")

if __name__ == "__main__":
    main()
