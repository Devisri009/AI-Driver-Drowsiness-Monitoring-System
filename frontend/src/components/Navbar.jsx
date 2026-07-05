import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

export const Navbar = () => {
  const { activeAlert, isMonitoring, currentUser, alerts } = useContext(AppContext);

  // Status Indicator
  let statusText = 'SYSTEM SECURE';
  let statusColor = 'var(--success)';
  let statusBg = 'var(--success-light)';
  let isPulsing = false;

  if (activeAlert) {
    statusText = 'CRITICAL DROWSINESS ALERT';
    statusColor = 'var(--danger)';
    statusBg = 'var(--danger-light)';
    isPulsing = true;
  } else if (isMonitoring) {
    statusText = `MONITORING ACTIVE`;
    statusColor = 'var(--primary)';
    statusBg = 'var(--primary-light)';
  } else {
    statusText = `MONITORING INACTIVE`;
    statusColor = 'var(--text-sub)';
    statusBg = '#e5e7eb';
  }

  // Count alerts in last hour
  const recentAlertsCount = alerts.filter(a => {
    const elapsed = Date.now() - new Date(a.timestamp).getTime();
    return elapsed < 1000 * 60 * 60; // 1 hour
  }).length;

  return (
    <header style={styles.navbar}>
      <div style={styles.left}>
        <h2 style={styles.title}>Welcome back, {currentUser?.name || 'Driver'}</h2>
      </div>

      <div style={styles.right}>
        {/* Safety Status Pill */}
        <div style={{
          ...styles.statusPill,
          backgroundColor: statusBg,
          color: statusColor,
          borderColor: statusColor,
          animation: isPulsing ? 'pulse-danger 1.5s infinite' : 'none'
        }}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: statusColor
          }} />
          <span style={styles.statusText}>{statusText}</span>
        </div>

        {/* Alerts Pill */}
        {recentAlertsCount > 0 && (
          <div style={styles.notificationBadge} title={`${recentAlertsCount} alerts logged in past hour`}>
            <Icons.Alerts size={18} color="var(--danger)" />
            <span style={styles.badgeText}>{recentAlertsCount} Recent Alerts</span>
          </div>
        )}

        <div style={styles.divider} />

        <div style={styles.timeDisplay}>
          <Icons.Rest size={16} color="var(--text-sub)" />
          <span style={styles.timeText}>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 'var(--sidebar-width)',
    height: 'var(--navbar-height)',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.75rem',
    zIndex: 99,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
  },
  left: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    border: '1px solid transparent',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
    transition: 'all var(--transition-fast)'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  statusText: {
    lineHeight: '1'
  },
  notificationBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.85rem',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '9999px',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  badgeText: {
    lineHeight: '1'
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--border)'
  },
  timeDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  timeText: {
    fontSize: '0.9rem',
    color: 'var(--text-sub)',
    fontWeight: '500'
  }
};
