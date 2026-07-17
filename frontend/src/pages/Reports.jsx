import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Icons } from '../components/Icons';
import { LoadingSpinner, ErrorCard, EmptyState } from '../components/UIFeedback';

// ─── Formatting Helpers ────────────────────────────────────────────────────

/**
 * Formats an ISO / LocalDateTime string into "15 Jul 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats an ISO / LocalDateTime string into "10:45 PM"
 */
const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Converts raw seconds into a readable string:
 *   38          → "38 sec"
 *   145         → "2 min 25 sec"
 *   4200        → "1 hr 10 min"
 */
const formatDuration = (seconds) => {
  if (seconds == null) return '—';
  const s = Number(seconds);
  if (s < 60) return `${s} sec`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m} min ${rem} sec` : `${m} min`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
};

/**
 * Returns a badge className for Overall Safety.
 * SAFE → success  |  NEEDS_ATTENTION → warning  |  UNSAFE → danger
 */
const safetyBadgeClass = (value) => {
  switch (value) {
    case 'SAFE':            return 'badge badge-success';
    case 'NEEDS_ATTENTION': return 'badge badge-warning';
    case 'UNSAFE':          return 'badge badge-danger';
    default:                return 'badge badge-info';
  }
};

/**
 * Returns a badge className for Worst Driver Status.
 * ALERT → success  |  DROWSY → warning  |  SLEEPING → danger
 */
const driverStatusBadgeClass = (value) => {
  switch (value) {
    case 'ALERT':    return 'badge badge-success';
    case 'DROWSY':   return 'badge badge-warning';
    case 'SLEEPING': return 'badge badge-danger';
    default:         return 'badge badge-info';
  }
};

/**
 * Returns a badge className for Session Status.
 * COMPLETED → info (blue)  |  ACTIVE → success (green)
 */
const sessionStatusBadgeClass = (value) => {
  switch (value) {
    case 'COMPLETED': return 'badge badge-info';
    case 'ACTIVE':    return 'badge badge-success';
    default:          return 'badge badge-info';
  }
};

/**
 * Returns inline style for End Reason badge.
 * USER_STOPPED → gray  |  PROCESS_CRASH → red  |  SYSTEM_SHUTDOWN → dark gray
 */
const endReasonStyle = (value) => {
  switch (value) {
    case 'USER_STOPPED':
      return { backgroundColor: '#f1f5f9', color: '#64748b' };
    case 'PROCESS_CRASH':
      return { backgroundColor: 'var(--danger-light)', color: '#991b1b' };
    case 'SYSTEM_SHUTDOWN':
      return { backgroundColor: '#e2e8f0', color: '#334155' };
    default:
      return { backgroundColor: '#f1f5f9', color: '#64748b' };
  }
};

/** Safely format a decimal to N fixed places, or return '—' */
const fmt = (val, decimals = 3) =>
  val != null ? Number(val).toFixed(decimals) : '—';

// ─── Session Card ──────────────────────────────────────────────────────────

const SessionCard = ({ session }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={cardStyles.wrapper}>
      {/* ── Card Header ── */}
      <div style={cardStyles.header} onClick={() => setExpanded((p) => !p)}>
        <div style={cardStyles.headerLeft}>
          <div style={cardStyles.iconBox}>
            <Icons.Reports size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={cardStyles.sessionDate}>{formatDate(session.startTime)}</div>
            <div style={cardStyles.sessionTime}>
              {formatTime(session.startTime)}
              {session.endTime ? ` – ${formatTime(session.endTime)}` : ''}
              {session.durationSeconds != null && (
                <span style={cardStyles.duration}>
                  {' '}· {formatDuration(session.durationSeconds)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={cardStyles.headerRight}>
          {session.overallSafety && (
            <span className={safetyBadgeClass(session.overallSafety)}>
              {session.overallSafety.replace('_', ' ')}
            </span>
          )}
          {session.status && (
            <span className={sessionStatusBadgeClass(session.status)}>
              {session.status}
            </span>
          )}
          <span
            style={{
              ...cardStyles.chevron,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <Icons.ChevronDown size={16} color="var(--text-sub)" />
          </span>
        </div>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div style={cardStyles.body}>
          {/* Quick Stats Row */}
          <div style={cardStyles.statsRow}>
            <StatChip label="Blinks"   value={session.totalBlinks ?? '—'} />
            <StatChip label="Yawns"    value={session.totalYawns ?? '—'} />
            <StatChip label="Alerts"   value={session.totalAlerts ?? '—'} color="var(--warning)" />
            <StatChip label="Alarms"   value={session.totalAlarmActivations ?? '—'} color="var(--danger)" />
          </div>

          <div style={cardStyles.detailGrid}>
            {/* ── Timing ── */}
            <DetailSection title="Timing">
              <DetailRow label="Start Time" value={`${formatDate(session.startTime)}  ${formatTime(session.startTime)}`} />
              <DetailRow label="End Time"   value={session.endTime ? `${formatDate(session.endTime)}  ${formatTime(session.endTime)}` : '—'} />
              <DetailRow label="Duration"   value={formatDuration(session.durationSeconds)} />
            </DetailSection>

            {/* ── Drowsiness Counts ── */}
            <DetailSection title="Event Counts">
              <DetailRow label="Total Blinks"      value={session.totalBlinks ?? '—'} />
              <DetailRow label="Total Yawns"       value={session.totalYawns ?? '—'} />
              <DetailRow label="Total Alerts"      value={session.totalAlerts ?? '—'} />
              <DetailRow label="Medium Alerts"     value={session.mediumAlerts ?? '—'} />
              <DetailRow label="High Alerts"       value={session.highAlerts ?? '—'} />
              <DetailRow label="Alarm Activations" value={session.totalAlarmActivations ?? '—'} />
            </DetailSection>

            {/* ── Eye & Mouth Metrics ── */}
            <DetailSection title="Eye & Mouth Metrics">
              <DetailRow label="Average EAR" value={fmt(session.averageEar)} />
              <DetailRow label="Average MAR" value={fmt(session.averageMar)} />
              <DetailRow label="Minimum EAR" value={fmt(session.minimumEar)} />
              <DetailRow label="Maximum MAR" value={fmt(session.maximumMar)} />
            </DetailSection>

            {/* ── Status & Safety ── */}
            <DetailSection title="Status & Safety">
              <DetailRow
                label="Worst Driver Status"
                value={
                  session.worstDriverStatus ? (
                    <span className={driverStatusBadgeClass(session.worstDriverStatus)}>
                      {session.worstDriverStatus}
                    </span>
                  ) : '—'
                }
              />
              <DetailRow
                label="Overall Safety"
                value={
                  session.overallSafety ? (
                    <span className={safetyBadgeClass(session.overallSafety)}>
                      {session.overallSafety.replace('_', ' ')}
                    </span>
                  ) : '—'
                }
              />
              <DetailRow
                label="Session Status"
                value={
                  session.status ? (
                    <span className={sessionStatusBadgeClass(session.status)}>
                      {session.status}
                    </span>
                  ) : '—'
                }
              />
              <DetailRow
                label="End Reason"
                value={
                  session.endReason ? (
                    <span className="badge" style={endReasonStyle(session.endReason)}>
                      {session.endReason.replace('_', ' ')}
                    </span>
                  ) : '—'
                }
              />
            </DetailSection>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────

const StatChip = ({ label, value, color = 'var(--text-main)' }) => (
  <div style={chipStyles.chip}>
    <span style={{ ...chipStyles.value, color }}>{value}</span>
    <span style={chipStyles.label}>{label}</span>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div style={sectionStyles.section}>
    <div style={sectionStyles.title}>{title}</div>
    <div style={sectionStyles.rows}>{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div style={rowStyles.row}>
    <span style={rowStyles.label}>{label}</span>
    <span style={rowStyles.value}>{value}</span>
  </div>
);

// ─── Main Reports Page ─────────────────────────────────────────────────────

export const Reports = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const data = await api.getSessionSummaries();
        const sorted = Array.isArray(data)
          ? [...data].sort(
              (a, b) => new Date(b.startTime) - new Date(a.startTime)
            )
          : [];
        setSummaries(sorted);
      } catch (err) {
        setError(err.message || 'Failed to load session summaries.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={pageStyles.header}>
        <div>
          <h1 style={pageStyles.title}>Driving Session Reports</h1>
          <p style={pageStyles.subtitle}>
            Review your complete driving session history and safety analytics.
          </p>
        </div>
        {!loading && !error && summaries.length > 0 && (
          <div style={pageStyles.sessionCount}>
            {summaries.length} session{summaries.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <LoadingSpinner message="Loading session reports..." />
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <ErrorCard message={error} onRetry={() => window.location.reload()} />
      )}

      {/* ── Empty State ── */}
      {!loading && !error && summaries.length === 0 && (
        <EmptyState 
          icon={<Icons.Reports size={48} color="var(--border)" />}
          title="No driving sessions available"
          description="Start monitoring to generate your first report."
        />
      )}

      {/* ── Session Cards ── */}
      {!loading && !error && summaries.length > 0 && (
        <div style={pageStyles.cardList}>
          {summaries.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────

const pageStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-sub)',
    marginTop: '0.25rem',
  },
  sessionCount: {
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontSize: '0.85rem',
    fontWeight: '700',
    alignSelf: 'center',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '0.875rem 1.25rem',
    borderRadius: '8px',
    color: '#0369a1',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #bae6fd',
    borderTopColor: '#0369a1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: '#b91c1c',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  emptyTitle: {
    marginTop: '1.25rem',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--text-main)',
  },
  emptySubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-sub)',
    marginTop: '0.5rem',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
};

const cardStyles = {
  wrapper: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    transition: 'box-shadow 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    gap: '1rem',
    userSelect: 'none',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(37,99,235,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sessionDate: {
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--text-main)',
  },
  sessionTime: {
    fontSize: '0.85rem',
    color: 'var(--text-sub)',
    marginTop: '0.1rem',
  },
  duration: {
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    marginLeft: '0.25rem',
  },
  body: {
    borderTop: '1px solid var(--border)',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },
  statsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
};

const chipStyles = {
  chip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.625rem 1.25rem',
    minWidth: '80px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  value: {
    fontSize: '1.4rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--text-sub)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '0.25rem',
  },
};

const sectionStyles = {
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-sub)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.625rem 1rem',
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid var(--border)',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
  },
};

const rowStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-sub)',
    flexShrink: 0,
    marginRight: '1rem',
  },
  value: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    textAlign: 'right',
  },
};
