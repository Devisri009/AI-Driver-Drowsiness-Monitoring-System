import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Cell as BarCell,
  LineChart, Line, XAxis as LineXAxis, YAxis as LineYAxis,
  CartesianGrid as LineGrid, Tooltip as LineTooltip, Legend as LineLegend,
} from 'recharts';
import {
  buildSeverityPieData,
  buildStatusBarData,
  buildTimelineLineData,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from '../utils/chartHelpers';

// ── Shared tooltip style ────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '0.85rem',
  color: 'var(--text-main)',
};

// ── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={styles.emptyState}>
    <span style={styles.emptyIcon}>📊</span>
    <p style={styles.emptyText}>No analytics available yet.</p>
    <p style={styles.emptyHint}>Alerts will appear here once the AI module starts logging events.</p>
  </div>
);

// ── Chart card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div className="card" style={styles.chartCard}>
    <h4 style={styles.chartTitle}>{title}</h4>
    <div style={styles.chartBody}>{children}</div>
  </div>
);

// ── Custom Pie label ─────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null; // hide tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.72rem', fontWeight: '700' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export const DriverAnalytics = ({ alerts, loading, error }) => {
  // Derive all chart data from the same alerts array — single source of truth
  const pieData      = useMemo(() => buildSeverityPieData(alerts),  [alerts]);
  const barData      = useMemo(() => buildStatusBarData(alerts),    [alerts]);
  const timelineData = useMemo(() => buildTimelineLineData(alerts), [alerts]);

  const hasAlerts = alerts && alerts.length > 0;

  return (
    <section style={styles.section}>
      {/* Section Header */}
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleGroup}>
          <span style={styles.sectionIcon}>📈</span>
          <div>
            <h2 style={styles.sectionTitle}>Driver Analytics</h2>
            <p style={styles.sectionSubtitle}>
              Visual breakdown of your alert history and driver safety trends.
            </p>
          </div>
        </div>
        {hasAlerts && (
          <span style={styles.alertCountBadge}>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''} total
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={styles.statusBanner}>
          <div style={styles.loadingDots}>
            <span /><span /><span />
          </div>
          <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
            Loading analytics data…
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !hasAlerts && <EmptyState />}

      {/* Charts grid */}
      {!loading && !error && hasAlerts && (
        <div style={styles.chartsGrid}>

          {/* Chart 1 — Severity Pie */}
          <ChartCard title="Alert Severity Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={46}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <PieTooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value} alerts`, name]}
                />
                <PieLegend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 2 — Status Bar */}
          <ChartCard title="Alerts by Driver Status">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barCategoryGap="35%" margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: 'var(--text-sub)', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <BarTooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                  formatter={(value) => [`${value} alerts`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <BarCell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 3 — Timeline Line (full width) */}
          <ChartCard title="Recent Alert Timeline">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={timelineData}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              >
                <LineGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <LineXAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <LineYAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <LineTooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value}`, 'Alerts']}
                />
                <LineLegend
                  iconType="circle"
                  iconSize={8}
                  formatter={() => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Alert Count</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      )}
    </section>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  section: {
    marginTop: '2.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  sectionTitleGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  sectionIcon: {
    fontSize: '1.75rem',
    lineHeight: 1,
    marginTop: '2px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-sub)',
    margin: '0.2rem 0 0',
  },
  alertCountBadge: {
    alignSelf: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '999px',
    padding: '0.3rem 0.9rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    // The last chart (Timeline) spans full width on large screens
  },
  chartTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.01em',
  },
  chartBody: {
    marginTop: '0.75rem',
    width: '100%',
  },
  // Empty / status states
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  emptyIcon: {
    fontSize: '2.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: 'var(--text-sub)',
    margin: 0,
    maxWidth: '360px',
  },
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: 'var(--surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: 'var(--danger)',
    fontWeight: '600',
  },
};
