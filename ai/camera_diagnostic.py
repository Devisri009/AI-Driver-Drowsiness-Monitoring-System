import cv2
import time
import sys

def run_diagnostic():
    print("==================================================")
    print("       DRIVEGUARD CAMERA DIAGNOSTIC UTILITY       ")
    print("==================================================")
    print(f"Python Version: {sys.version}")
    print(f"OpenCV Version: {cv2.__version__}")
    print("==================================================")
    
    backends = {
        "Default (Auto)": cv2.CAP_ANY,
        "DirectShow (DSHOW)": cv2.CAP_DSHOW,
        "Media Foundation (MSMF)": cv2.CAP_MSMF
    }
    
    results = []
    
    # Scan camera indices 0 to 4
    for index in range(5):
        print(f"\nScanning Camera Index {index}...")
        for backend_name, backend_flag in backends.items():
            print(f"  Testing Backend: {backend_name} ... ", end="", flush=True)
            start_time = time.time()
            
            try:
                cap = cv2.VideoCapture(index, backend_flag)
                opened = cap.isOpened()
                init_time = time.time() - start_time
                
                if not opened:
                    print(f"FAILED to open (took {init_time:.2f}s)")
                    results.append({
                        "index": index,
                        "backend_requested": backend_name,
                        "status": "Failed to Open",
                        "init_time": init_time,
                        "backend_actual": "N/A",
                        "frames_read": "0/5",
                        "resolution": "N/A"
                    })
                    cap.release()
                    continue
                
                # Retrieve actual backend name
                try:
                    actual_backend = cap.getBackendName()
                except AttributeError:
                    actual_backend = "Unknown"
                
                # Attempt to read 5 frames to check stability
                success_reads = 0
                width = 0
                height = 0
                
                # Give a small warm-up time before reading
                time.sleep(0.5)
                
                for _ in range(5):
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        success_reads += 1
                        if width == 0:
                            height, width, _ = frame.shape
                    time.sleep(0.1)
                
                res_str = f"{width}x{height}" if success_reads > 0 else "N/A"
                print(f"SUCCESS (Actual Backend: {actual_backend}, Frames: {success_reads}/5, Resolution: {res_str}, Init: {init_time:.2f}s)")
                
                results.append({
                    "index": index,
                    "backend_requested": backend_name,
                    "status": "Opened Successfully",
                    "init_time": init_time,
                    "backend_actual": actual_backend,
                    "frames_read": f"{success_reads}/5",
                    "resolution": res_str
                })
                
                cap.release()
                
            except Exception as e:
                print(f"ERROR: {str(e)}")
                results.append({
                    "index": index,
                    "backend_requested": backend_name,
                    "status": f"Error: {type(e).__name__}",
                    "init_time": time.time() - start_time,
                    "backend_actual": "N/A",
                    "frames_read": "0/5",
                    "resolution": "N/A"
                })
    
    print("\n" + "="*80)
    print("                               DIAGNOSTIC SUMMARY                               ")
    print("="*80)
    print(f"{'Index':<6} | {'Requested Backend':<25} | {'Actual Backend':<15} | {'Status':<20} | {'Frames':<8} | {'Resolution':<12}")
    print("-" * 92)
    for r in results:
        print(f"{r['index']:<6} | {r['backend_requested']:<25} | {r['backend_actual']:<15} | {r['status']:<20} | {r['frames_read']:<8} | {r['resolution']:<12}")
    print("="*80)

if __name__ == "__main__":
    run_diagnostic()
