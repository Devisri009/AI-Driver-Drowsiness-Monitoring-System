/**
 * chartHelpers.js
 * Pure utility functions that transform raw alert arrays into
 * the dataset shapes expected by Recharts.
 *
 * All functions are side-effect free and return new arrays/objects.
 */

// ── Colour palette aligned to the DriveGuard design system ──────────────────
export const SEVERITY_COLORS = {
  LOW:    '#10b981', // var(--success) green
  MEDIUM: '#f59e0b', // var(--warning) amber
  HIGH:   '#ef4444', // var(--danger) red
};

export const STATUS_COLORS = {
  ALERT:    '#3b82f6', // var(--primary) blue
  DROWSY:   '#f59e0b', // amber
  SLEEPING: '#ef4444', // red
};

// ── Chart 1: Alert Severity Distribution (Pie) ───────────────────────────────
/**
 * Returns an array suitable for a Recharts PieChart.
 * [{ name: 'HIGH', value: 4, fill: '#ef4444' }, …]
 *
 * @param {Array} alerts  Raw alert objects from api.getAlerts()
 * @returns {Array}
 */
export function buildSeverityPieData(alerts) {
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  alerts.forEach(({ severity }) => {
    const key = (severity || '').toUpperCase();
    if (key in counts) counts[key]++;
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: SEVERITY_COLORS[name],
  }));
}

// ── Chart 2: Alerts by Driver Status (Bar) ───────────────────────────────────
/**
 * Returns an array suitable for a Recharts BarChart.
 * [{ status: 'ALERT', count: 10, fill: '#3b82f6' }, …]
 *
 * @param {Array} alerts  Raw alert objects from api.getAlerts()
 * @returns {Array}
 */
export function buildStatusBarData(alerts) {
  const counts = { ALERT: 0, DROWSY: 0, SLEEPING: 0 };

  alerts.forEach(({ alertType }) => {
    const key = (alertType || '').toUpperCase();
    if (key in counts) counts[key]++;
  });

  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status],
  }));
}

// ── Chart 3: Recent Alert Timeline (Line) ────────────────────────────────────
/**
 * Buckets the latest (up to `maxPoints`) alerts into per-minute time slots
 * and returns a line-chart compatible array.
 * [{ time: '14:32', alerts: 2 }, …]
 *
 * @param {Array}  alerts     Raw alert objects from api.getAlerts()
 * @param {number} maxPoints  Max time-buckets to display (default 15)
 * @returns {Array}
 */
export function buildTimelineLineData(alerts, maxPoints = 15) {
  if (!alerts.length) return [];

  // Sort ascending by timestamp
  const sorted = [...alerts].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Take the most recent `maxPoints * 4` alerts to bucket into maxPoints slots
  const recent = sorted.slice(-maxPoints * 4);

  // Bucket by minute label
  const buckets = {};
  recent.forEach(({ timestamp }) => {
    if (!timestamp) return;
    const d = new Date(timestamp);
    const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    buckets[label] = (buckets[label] || 0) + 1;
  });

  const entries = Object.entries(buckets);

  // Keep at most `maxPoints` most-recent buckets
  const sliced = entries.slice(-maxPoints);

  return sliced.map(([time, alerts]) => ({ time, alerts }));
}
