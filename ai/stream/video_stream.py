import cv2
import time
import threading

from flask import Flask, Response
from flask_cors import CORS


class VideoStreamer:
    """
    Exposes update_frame(frame) and generate_frames() to store and stream processed frames.
    Uses a thread lock to ensure thread safety while minimizing the locked duration.
    """
    def __init__(self):
        self.latest_frame = None
        self.lock = threading.Lock()

    def update_frame(self, frame):
        """
        Stores a copy of the latest processed frame.
        """
        # Store a copy of the frame to prevent mutation or lifetime issues from the main thread
        copied_frame = frame.copy() if frame is not None else None
        
        # Acquire lock only to assign the reference
        with self.lock:
            self.latest_frame = copied_frame

    def generate_frames(self):
        """
        Continuously yields JPEG-encoded frames in multipart MJPEG format.
        """
        while True:
            # Acquire lock briefly to copy the reference of the latest frame
            with self.lock:
                frame_to_encode = self.latest_frame

            # If no frame has been received yet, wait briefly and try again
            if frame_to_encode is None:
                time.sleep(0.01)  # 10 ms wait
                continue

            # Perform JPEG encoding outside the lock to minimize hold time
            ret, jpeg_buffer = cv2.imencode(".jpg", frame_to_encode)
            if not ret:
                time.sleep(0.01)
                continue

            frame_bytes = jpeg_buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Control frame rate (approx. 30 FPS) to save CPU
            time.sleep(0.03)

# Global VideoStreamer instance
video_streamer = VideoStreamer()

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/video_feed": {
            "origins": ["http://localhost:5173"]
        }
    }
)

@app.route('/video_feed', methods=['GET', 'HEAD'])
def video_feed():
    """
    MJPEG video feed streaming endpoint.
    """
    return Response(
        video_streamer.generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

# Protected server startup variables
_server_lock = threading.Lock()
_server_started = False

def start_streaming_server(host="127.0.0.1", port=5001):
    """
    Starts the Flask app in a daemon thread. Protected so it only starts once.
    """
    global _server_started
    
    with _server_lock:
        if _server_started:
            return None
        _server_started = True

    def run_app():
        app.run(
            host=host,
            port=port,
            debug=False,
            use_reloader=False,
            threaded=True
        )

    server_thread = threading.Thread(target=run_app, daemon=True)
    server_thread.start()
    return server_thread
