import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { api } from '../api/api';

const AI_STREAM_URL = 'http://127.0.0.1:5001/video_feed';

export const Monitoring = () => {
  const {
    isMonitoring,
    setIsMonitoring,
    logAlert,
    activeAlert,
    currentUser
  } = useContext(AppContext);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  // ── AI MJPEG Stream State ──
  const [streamAvailable, setStreamAvailable] = useState(false);
  const [streamLoading, setStreamLoading] = useState(true);
  const retryTimerRef = useRef(null);

  const [simMode, setSimMode] = useState('Normal'); // 'Normal', 'Drowsy', 'Distracted'
  const [fatigueScore, setFatigueScore] = useState(15); // percentage (0 - 100)
  const [eyeState, setEyeState] = useState('Open & Tracking');
  const [cameraError, setCameraError] = useState(null);

  // ── Live Backend Monitoring State ──
  const [liveData, setLiveData] = useState(null);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const fetchLiveMonitoring = async () => {
      try {
        const data = await api.getLiveMonitoring();
        if (isMounted) {
          setLiveData(data);
          setLiveError(null);
          setIsLiveLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLiveError(err.message || 'Failed to fetch live monitoring data');
          setIsLiveLoading(false);
        }
      }
    };

    setIsLiveLoading(true);
    fetchLiveMonitoring();
    intervalId = setInterval(fetchLiveMonitoring, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ── AI MJPEG Stream availability probe ──
  // Polls the /video_feed endpoint via a HEAD request every 3 s until
  // the stream is reachable, then stops polling. If the stream drops,
  // the img onError handler re-starts the probe so we auto-recover.
  const probeStream = useCallback(() => {
    setStreamLoading(true);
    fetch(AI_STREAM_URL, { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        setStreamAvailable(true);
        setStreamLoading(false);
      })
      .catch(() => {
        setStreamAvailable(false);
        setStreamLoading(false);
        // Schedule next retry in 3 s
        retryTimerRef.current = setTimeout(probeStream, 3000);
      });
  }, []);

  useEffect(() => {
    probeStream();
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [probeStream]);

  // Called by the <img> element when the MJPEG stream breaks mid-session
  const handleStreamError = useCallback(() => {
    setStreamAvailable(false);
    setStreamLoading(true);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(probeStream, 3000);
  }, [probeStream]);

  // Called when the <img> successfully loads the first frame
  const handleStreamLoad = useCallback(() => {
    setStreamAvailable(true);
    setStreamLoading(false);
  }, []);

  // Initialize webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.warn('Video play interrupted:', err));
      }
      setIsMonitoring(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      setCameraError('Webcam not detected or permission denied. Starting simulation fallback stream.');
      setIsMonitoring(true); // fall back to simulation screen
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
    setSimMode('Normal');
    setFatigueScore(15);
    setEyeState('Open & Tracking');
  };

  // Telemetry loop for canvas HUD overlays
  useEffect(() => {
    if (!isMonitoring) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let localFatigue = fatigueScore;
    let localSimMode = simMode;

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Define coordinates relative to standard dimensions (640x480)
      const width = canvas.width;
      const height = canvas.height;

      // Update fatigue values based on active simulation mode
      if (simMode === 'Drowsy') {
        localFatigue = Math.min(100, localFatigue + 0.8);
        setFatigueScore(Math.round(localFatigue));
        setEyeState('CLOSED (Micro-sleep Detected)');

        // Log critical alert if threshold exceeded
        if (localFatigue >= 78 && !activeAlert) {
          logAlert('Eyes Closed (Micro-sleep)', 'High');
        }
      } else if (simMode === 'Distracted') {
        localFatigue = Math.min(75, localFatigue + 0.5);
        setFatigueScore(Math.round(localFatigue));
        setEyeState('BLINKING IRREGULAR (Yawning)');

        // Log medium warning if threshold exceeded
        if (localFatigue >= 60 && !activeAlert) {
          logAlert('Frequent Yawning (Fatigue)', 'Medium');
        }
      } else {
        // Normal Mode - slowly cool down to nominal fatigue levels
        localFatigue = Math.max(12, localFatigue - 1.2);
        setFatigueScore(Math.round(localFatigue));
        setEyeState('Open & Tracking');
      }

      // DRAW HUD OVERLAYS
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      
      // Grid lines
      ctx.beginPath();
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Bounding Boxes / Facial landmarks
      let strokeColor = 'rgba(16, 185, 129, 0.85)'; // Green (Normal)
      if (simMode === 'Drowsy') {
        strokeColor = 'rgba(239, 68, 68, 0.85)'; // Red (Drowsy)
      } else if (simMode === 'Distracted') {
        strokeColor = 'rgba(245, 158, 11, 0.85)'; // Orange (Distracted)
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3.5;

      // Draw face boundary box
      ctx.strokeRect(width * 0.28, height * 0.2, width * 0.44, height * 0.55);

      // Corner technical brackets for Face Box
      const corners = [
        { x: width * 0.28, y: height * 0.2, dx: 15, dy: 15 },
        { x: width * 0.72, y: height * 0.2, dx: -15, dy: 15 },
        { x: width * 0.28, y: height * 0.75, dx: 15, dy: -15 },
        { x: width * 0.72, y: height * 0.75, dx: -15, dy: -15 }
      ];
      ctx.fillStyle = strokeColor;
      corners.forEach(c => {
        ctx.fillRect(c.x - 2, c.y - 2, c.dx, 4);
        ctx.fillRect(c.x - 2, c.y - 2, 4, c.dy);
      });

      // Draw eyes tracking rings
      const leftEye = { x: width * 0.43, y: height * 0.38 };
      const rightEye = { x: width * 0.57, y: height * 0.38 };

      if (simMode === 'Drowsy') {
        // Red X for closed eyes
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftEye.x - 10, leftEye.y - 10); ctx.lineTo(leftEye.x + 10, leftEye.y + 10);
        ctx.moveTo(leftEye.x + 10, leftEye.y - 10); ctx.lineTo(leftEye.x - 10, leftEye.y + 10);
        ctx.moveTo(rightEye.x - 10, rightEye.y - 10); ctx.lineTo(rightEye.x + 10, rightEye.y + 10);
        ctx.moveTo(rightEye.x + 10, rightEye.y - 10); ctx.lineTo(rightEye.x - 10, rightEye.y + 10);
        ctx.stroke();
      } else {
        // Circles for open eyes
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(leftEye.x, leftEye.y, 14, 0, 2 * Math.PI);
        ctx.arc(rightEye.x, rightEye.y, 14, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(leftEye.x, leftEye.y, 4, 0, 2 * Math.PI);
        ctx.arc(rightEye.x, rightEye.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Mouth Tracking
      const mouth = { x: width * 0.5, y: height * 0.58 };
      if (simMode === 'Distracted') {
        // Big yellow circle for yawn simulation
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(mouth.x, mouth.y, 16, 26, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouth.x, mouth.y, 10, 0, Math.PI);
        ctx.stroke();
      }

      // HUD Text Display
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText(`DRIVEGUARD AI CORE`, 15, 25);
      ctx.fillText(`FPS: 30 / FOCUS INDEX: ${simMode === 'Normal' ? '98.4%' : simMode === 'Distracted' ? '44.1%' : '12.0%'}`, 15, 42);
      ctx.fillText(`EAR (EYE ASPECT RATIO): ${simMode === 'Drowsy' ? '0.08 [FAIL]' : '0.29 [OK]'}`, 15, 59);

      // Warning text if alert active
      if (simMode !== 'Normal') {
        ctx.fillStyle = strokeColor;
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillText(`WARNING: DROWSINESS DETECTED`, 15, height - 25);
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMonitoring, simMode, activeAlert]); // remove monitoredDriverId dependency

  // Set sim parameters when mode changes
  const handleSimChange = (mode) => {
    setSimMode(mode);
    if (mode === 'Normal') {
      setFatigueScore(15);
      setEyeState('Open & Tracking');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Live Safety Monitoring</h1>
          <p style={styles.subtitle}>AI-powered webcam tracking for your safety on the road.</p>
        </div>
      </div>

      <div className="grid-cols-3">
        {/* Live AI Camera Panel (Span 2) */}
        <div className="card" style={{ ...styles.gridCol2, padding: '1.25rem' }}>
          <div style={styles.streamContainer}>
            {/* Loading pulse while probing the stream */}
            {streamLoading && (
              <div style={styles.streamOverlay}>
                <div style={styles.streamSpinner} />
                <span style={styles.streamOverlayText}>Connecting to AI Camera...</span>
              </div>
            )}

            {/* Fallback message when stream is confirmed unavailable */}
            {!streamLoading && !streamAvailable && (
              <div style={styles.streamUnavailable}>
                <Icons.Monitor size={48} color="rgba(255,255,255,0.3)" />
                <span style={styles.streamUnavailableText}>Waiting for AI Camera...</span>
                <span style={styles.streamUnavailableHint}>Start the Python AI module to see the live feed.</span>
              </div>
            )}

            {/* MJPEG live stream — rendered as a standard <img> */}
            {streamAvailable && (
              <img
                src={`${AI_STREAM_URL}?t=${Date.now()}`}
                alt="AI live camera feed"
                style={{
                  ...styles.mjpegImg,
                  display: streamAvailable ? 'block' : 'none'
                }}
                onLoad={handleStreamLoad}
                onError={handleStreamError}
              />
            )}
          </div>

          {/* Status Bar */}
          <div style={styles.monitorControlBar}>
            <div style={styles.indicatorPills}>
              <span style={{
                ...styles.operatorPill,
                borderColor: streamAvailable ? 'rgba(16,185,129,0.4)' : 'var(--border)'
              }}>
                AI Camera:&nbsp;
                <strong style={{ color: streamAvailable ? 'var(--success)' : 'var(--text-sub)' }}>
                  {streamLoading ? 'Connecting…' : streamAvailable ? 'Live' : 'Offline'}
                </strong>
              </span>
              <span style={styles.resolutionPill}>Real-time AI Analysis</span>
            </div>
          </div>
        </div>

        {/* Configurations panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Real-time Telemetry Telepresence details */}
          <div className="card">
            <h3 className="card-title">Driver Status</h3>
            <div style={styles.metricList}>
              <div style={styles.telemetryItem}>
                <span style={styles.telemetryLabel}>Readiness</span>
                <span className={`badge ${
                  !isMonitoring ? 'badge-info' :
                  simMode === 'Normal' ? 'badge-success' :
                  simMode === 'Distracted' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {!isMonitoring ? 'STANDBY' : simMode === 'Normal' ? 'ATTENTIVE' : simMode === 'Distracted' ? 'DISTRACTED' : 'DROWSY'}
                </span>
              </div>

              <div style={styles.telemetryItem}>
                <span style={styles.telemetryLabel}>Eye Status</span>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: simMode === 'Drowsy' ? 'var(--danger)' : 'var(--text-main)' }}>
                  {isMonitoring ? eyeState : 'N/A'}
                </span>
              </div>

              <div style={styles.telemetryItem}>
                <span style={styles.telemetryLabel}>Fatigue Level</span>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: fatigueScore > 75 ? 'var(--danger)' : 'var(--text-main)' }}>
                  {isMonitoring ? `${fatigueScore}%` : 'N/A'}
                </span>
              </div>

              {/* Progress bar representing fatigue levels */}
              {isMonitoring && (
                <div style={styles.progressContainer}>
                  <div style={{
                    ...styles.progressBar,
                    width: `${fatigueScore}%`,
                    backgroundColor: fatigueScore < 50 ? 'var(--success)' : fatigueScore < 75 ? 'var(--warning)' : 'var(--danger)'
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Live Backend Monitoring Panel */}
          <div className="card">
            <h3 className="card-title">Live Monitoring Data</h3>
            {isLiveLoading && !liveData ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                <div>Loading monitoring data...</div>
              </div>
            ) : liveError ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--danger)', backgroundColor: 'var(--danger-light)', borderRadius: '8px' }}>
                <Icons.Warning size={24} color="var(--danger)" style={{ margin: '0 auto 0.5rem' }} />
                <div>{liveError}</div>
              </div>
            ) : (!liveData || !liveData.driverStatus) ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                <div>No live monitoring data available.</div>
              </div>
            ) : (
              <div style={styles.metricList}>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>Driver Status</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: liveData.driverStatus === 'DROWSY' || liveData.driverStatus === 'SLEEPING' ? 'var(--danger)' : liveData.driverStatus === 'YAWNING' || liveData.driverStatus === 'DISTRACTED' ? 'var(--warning)' : 'var(--text-main)' }}>
                    {liveData.driverStatus}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>EAR</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    {liveData.ear != null ? liveData.ear.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>MAR</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    {liveData.mar != null ? liveData.mar.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>Blink Count</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    {liveData.blinkCount != null ? liveData.blinkCount : 'N/A'}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>Yawn Count</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    {liveData.yawnCount != null ? liveData.yawnCount : 'N/A'}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>Alarm Status</span>
                  <span className={`badge ${liveData.alarmStatus === 'ON' ? 'badge-danger' : 'badge-success'}`}>
                    {liveData.alarmStatus || 'N/A'}
                  </span>
                </div>
                <div style={styles.telemetryItem}>
                  <span style={styles.telemetryLabel}>Last Updated</span>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    {liveData.lastUpdated ? new Date(liveData.lastUpdated).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Simulator Panel for Demonstration */}
          {isMonitoring && (
            <div className="card" style={styles.simulatorCard}>
              <div className="d-flex align-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <Icons.Warning size={18} color="var(--primary)" />
                <h3 className="card-title" style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Test System</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
                Use these options to manually trigger drowsiness scenarios and see how DriveGuard responds.
              </p>
              <div style={styles.simButtonsContainer}>
                <button
                  style={{
                    ...styles.simBtn,
                    borderColor: simMode === 'Normal' ? 'var(--success)' : 'var(--border)',
                    backgroundColor: simMode === 'Normal' ? 'var(--success-light)' : 'transparent',
                    color: simMode === 'Normal' ? 'var(--success)' : 'var(--text-main)'
                  }}
                  onClick={() => handleSimChange('Normal')}
                >
                  🟢 Reset to Normal
                </button>
                <button
                  style={{
                    ...styles.simBtn,
                    borderColor: simMode === 'Distracted' ? 'var(--warning)' : 'var(--border)',
                    backgroundColor: simMode === 'Distracted' ? 'var(--warning-light)' : 'transparent',
                    color: simMode === 'Distracted' ? '#92400e' : 'var(--text-main)'
                  }}
                  onClick={() => handleSimChange('Distracted')}
                >
                  🟡 Simulate Yawning (Medium)
                </button>
                <button
                  style={{
                    ...styles.simBtn,
                    borderColor: simMode === 'Drowsy' ? 'var(--danger)' : 'var(--border)',
                    backgroundColor: simMode === 'Drowsy' ? 'var(--danger-light)' : 'transparent',
                    color: simMode === 'Drowsy' ? 'var(--danger)' : 'var(--text-main)'
                  }}
                  onClick={() => handleSimChange('Drowsy')}
                >
                  🔴 Simulate Micro-sleep (High)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0
  },
  subtitle: {
    fontSize: '0.925rem',
    color: 'var(--text-sub)',
    marginTop: '0.25rem'
  },
  gridCol2: {
    gridColumn: 'span 2'
  },
  streamContainer: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '450px'
  },
  // Responsive MJPEG stream image
  mjpegImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    borderRadius: '12px'
  },
  // Overlay shown while probing connectivity
  streamOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    width: '100%',
    minHeight: '450px'
  },
  streamSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.12)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite'
  },
  streamOverlayText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: '0.05em'
  },
  // Shown when stream is confirmed offline
  streamUnavailable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    minHeight: '450px'
  },
  streamUnavailableText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.05em'
  },
  streamUnavailableHint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.78rem',
    fontWeight: '500'
  },
  videoWrapper: {
    width: '100%',
    maxWidth: '640px',
    height: 'auto',
    position: 'relative',
    aspectRatio: '4/3',
    display: 'flex'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 10
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderBackgroundLines: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle, transparent 20%, #1e293b 20%, #1e293b 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #1e293b 20%, #1e293b 80%, transparent 80%, transparent) 25px 25px',
    backgroundSize: '50px 50px',
    opacity: '0.06'
  },
  faceTargetOutline: {
    position: 'absolute',
    width: '180px',
    height: '240px',
    border: '2px dashed rgba(255,255,255,0.15)',
    borderRadius: '50%',
    top: '25%',
    left: '35%'
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.75rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
    zIndex: 2,
    textAlign: 'center',
    padding: '1rem'
  },
  emptyMonitor: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  monitorControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.25rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  indicatorPills: {
    display: 'flex',
    gap: '0.5rem'
  },
  operatorPill: {
    fontSize: '0.8rem',
    backgroundColor: '#f8fafc',
    color: 'var(--text-main)',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontWeight: '500',
    border: '1px solid var(--border)'
  },
  resolutionPill: {
    fontSize: '0.8rem',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontWeight: '600',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  telemetryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem'
  },
  telemetryLabel: {
    color: 'var(--text-sub)',
    fontWeight: '500'
  },
  progressContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '0.25rem'
  },
  progressBar: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  simulatorCard: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.05)'
  },
  simButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  simBtn: {
    display: 'block',
    width: '100%',
    padding: '0.85rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1px solid',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    cursor: 'pointer'
  }
};
