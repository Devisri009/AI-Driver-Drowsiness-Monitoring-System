import React, { useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

export const RecommendationCard = () => {
  const { activeAlert, clearActiveAlert } = useContext(AppContext);
  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  useEffect(() => {
    if (activeAlert) {
      // Start audio warning buzzer
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          alarmIntervalRef.current = setInterval(() => {
            if (ctx.state === 'suspended') {
              ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, ctx.currentTime); // Pitch A5/G5

            // Piercing double pulse
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }, 600);
        }
      } catch (err) {
        console.warn('AudioContext failed to start:', err);
      }
    }

    return () => {
      // Clean up alarm sound
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [activeAlert]);

  if (!activeAlert) return null;

  const recommendations = [
    {
      id: 'break',
      title: 'Take a Short Break',
      desc: 'Pull over safely at the nearest rest stop or service area immediately and rest for at least 15-20 minutes.',
      icon: <Icons.Rest size={28} color="var(--danger)" />,
      badge: 'Immediate Action'
    },
    {
      id: 'water',
      title: 'Drink Cold Water',
      desc: 'Rehydrate with cold water. Dehydration is a leading cause of sudden drop in fatigue thresholds.',
      icon: <Icons.Water size={28} color="#2563eb" />,
      badge: 'Hydration'
    },
    {
      id: 'coffee',
      title: 'Coffee or Energy Tea',
      desc: 'Consume a caffeinated beverage (coffee or strong tea) to boost alertness levels temporarily.',
      icon: <Icons.Coffee size={28} color="#b45309" />,
      badge: 'Stimulant'
    },
    {
      id: 'music',
      title: 'Play Energetic Music',
      desc: 'Increase cabin audio volume and stream high-tempo music with open windows to stimulate sensory receptors.',
      icon: <Icons.Music size={28} color="#0d9488" />,
      badge: 'Sensory Boost'
    }
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Warning Alert Banner */}
        <div style={styles.header}>
          <div style={styles.warningBadge}>
            <Icons.Warning size={32} color="#ffffff" />
          </div>
          <div>
            <h2 style={styles.title}>CRITICAL DRIVER DROWSINESS ALERT</h2>
            <p style={styles.subtitle}>
              Driver: <strong>{activeAlert.driverName}</strong> | Type: {activeAlert.alertType} | Level: {activeAlert.riskLevel}
            </p>
          </div>
        </div>

        <div style={styles.body}>
          <p style={styles.instruction}>
            Our AI Safety Agent has detected dangerous drowsiness indicators (PERCLOS exceeding safety limit). Please command the driver to follow these recommendations immediately:
          </p>

          {/* Recommendations Grid */}
          <div style={styles.grid}>
            {recommendations.map(rec => (
              <div key={rec.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconContainer}>{rec.icon}</div>
                  <span style={{
                    ...styles.recBadge,
                    backgroundColor: rec.id === 'break' ? 'var(--danger-light)' : '#f1f5f9',
                    color: rec.id === 'break' ? 'var(--danger)' : 'var(--text-sub)'
                  }}>{rec.badge}</span>
                </div>
                <h4 style={styles.cardTitle}>{rec.title}</h4>
                <p style={styles.cardDesc}>{rec.desc}</p>
              </div>
            ))}
          </div>

          <div style={styles.hazardAction}>
            <Icons.Warning size={20} color="var(--warning)" />
            <span>Recommended Protocol: Activate vehicle hazard lights, adjust air conditioning, and dispatch alternate driver if necessary.</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={styles.footer}>
          <button style={styles.dismissBtn} onClick={clearActiveAlert}>
            <Icons.Check size={20} color="#ffffff" />
            <span>Acknowledge Alert & Mute Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem'
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '3px solid var(--danger)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '850px',
    overflow: 'hidden',
    animation: 'pulse-bg-danger-active 2.5s infinite'
  },
  header: {
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  warningBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse-danger 1.5s infinite'
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: '800',
    letterSpacing: '0.025em',
    color: '#ffffff',
    margin: 0
  },
  subtitle: {
    fontSize: '0.9rem',
    opacity: '0.9',
    marginTop: '0.25rem'
  },
  body: {
    padding: '1.75rem'
  },
  instruction: {
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    marginBottom: '1.25rem',
    lineHeight: '1.6'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.5rem'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    padding: '1.25rem',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: '0.75rem',
    width: '100%',
    justifyContent: 'space-between'
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px'
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.375rem'
  },
  cardDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-sub)',
    lineHeight: '1.4'
  },
  hazardAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--warning-light)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#92400e',
    fontSize: '0.85rem',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  footer: {
    padding: '1.25rem 1.75rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'center'
  },
  dismissBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.875rem 2.5rem',
    backgroundColor: 'var(--success)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
    transition: 'all 0.2s'
  }
};
