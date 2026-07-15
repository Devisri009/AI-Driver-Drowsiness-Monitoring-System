import cv2
import time
import signal
import sys
from config import CAMERA_INDEX
from utils.settings_client import initialize as init_settings_client
from detector.face_detector import FaceDetector
from stream.video_stream import video_streamer, start_streaming_server

SHOW_DEBUG_WINDOW = False

def get_jwt_token() -> str:
    """Read the JWT token from command-line arguments passed by Spring Boot."""
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print("[FATAL] No JWT token provided. Usage: python main.py <JWT_TOKEN>")
        sys.exit(1)
    token = sys.argv[1].strip()
    print(f"[AUTH] JWT token received. Prefix: {token[:20]}...")
    return token

def handle_signal(signum, frame):
    raise KeyboardInterrupt

signal.signal(signal.SIGINT, handle_signal)
signal.signal(signal.SIGTERM, handle_signal)
try:
    signal.signal(signal.SIGBREAK, handle_signal)
except AttributeError:
    pass

def main():
    print("DriveGuard AI Module Started")

    # Read the JWT token passed by Spring Boot via command-line argument
    jwt_token = get_jwt_token()

    # Initialize the settings client singleton with the runtime JWT
    # This MUST happen before FaceDetector is imported/instantiated
    init_settings_client(jwt_token)
    
    # Start video streaming server on http://127.0.0.1:5001
    print("Starting video streaming server on http://127.0.0.1:5001")
    start_streaming_server(host="127.0.0.1", port=5001)

    print(f"Initializing webcam using CAMERA_INDEX: {CAMERA_INDEX}")

    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        print("Unable to access webcam.")
        return

    detector = None
    try:
        # Initialize FaceDetector with runtime JWT token
        detector = FaceDetector(jwt_token=jwt_token)

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

        if SHOW_DEBUG_WINDOW:
            print("Webcam successfully initialized. Press 'Q' to exit.")
        else:
            print("Webcam successfully initialized. Press Ctrl+C to exit.")

        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame. Exiting...")
                break

            # Pass frame to FaceDetector
            face_detected, processed_frame = detector.process(frame)

            # Update the streaming server with the latest processed frame
            video_streamer.update_frame(processed_frame)

            if SHOW_DEBUG_WINDOW:
                # Display the live camera feed
                cv2.imshow("DriveGuard Camera", processed_frame)

                # Break the loop if 'Q'/'q' or ESC is pressed in the OpenCV window, or if the window is closed
                key = cv2.waitKey(10) & 0xFF
                if key == ord('q') or key == ord('Q') or key == 27:
                    break

                # Check terminal keyboard input (Windows fallback)
                try:
                    import msvcrt
                    if msvcrt.kbhit():
                        term_key = msvcrt.getch()
                        if term_key in [b'q', b'Q', b'\x1b']:
                            print("Exit signal received from terminal.")
                            break
                except Exception:
                    pass

                # Also exit if the user closes the window via the X button
                try:
                    if cv2.getWindowProperty("DriveGuard Camera", cv2.WND_PROP_VISIBLE) < 1:
                        break
                except Exception:
                    # If window property is not supported or window is already closed/destroyed
                    break
    except KeyboardInterrupt:
        print("Stopping DriveGuard AI...")
    finally:
        # Clean up on exit
        cap.release()
        if detector is not None:
            detector.close()
        cv2.destroyAllWindows()
        print("Webcam released. Application exited cleanly.")

if __name__ == "__main__":
    main()
