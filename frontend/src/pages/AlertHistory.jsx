import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Icons } from '../components/Icons';

export const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err.message || 'Failed to load alerts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    return riskFilter === 'All' || alert.severity === riskFilter;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Alert History</h1>
          <p style={styles.subtitle}>Review your past drowsiness and fatigue warnings.</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.infoBanner}>
          <span>Loading alerts...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          <Icons.Warning size={18} color="#b91c1c" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filter Options */}
          <div className="card" style={styles.filterCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Filter by Severity:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{ width: '200px', height: '40px', borderRadius: '8px' }}
              >
                <option value="All">All Alerts</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>
            </div>
          </div>

          {/* Table Audit List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredAlerts.length === 0 ? (
              <div style={styles.emptyState}>
                <Icons.Check size={40} color="var(--success)" />
                <h3 style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>No alerts recorded yet.</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '0.5rem' }}>You have no history of drowsiness or fatigue warnings matching this filter.</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Alert Type</th>
                      <th>Severity</th>
                      <th>Driver Status</th>
                      <th>Message</th>
                      <th>EAR</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td style={{ fontWeight: '500' }}>
                          {new Date(alert.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span style={styles.alertTypeSpan}>
                            {alert.alertType}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            alert.severity === 'HIGH' ? 'badge-danger' : 
                            alert.severity === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td style={{ fontWeight: '500' }}>{alert.driverStatus}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{alert.message}</td>
                        <td style={{ fontWeight: '600' }}>{alert.eyeAspectRatio?.toFixed(2) ?? '—'}</td>
                        <td style={{ fontWeight: '600' }}>{alert.confidence != null ? `${alert.confidence}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-sub)',
    marginTop: '0.25rem'
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: '#0369a1',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem'
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
    marginBottom: '1.5rem'
  },
  filterCard: {
    padding: '1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '12px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc'
  },
  alertTypeSpan: {
    color: 'var(--text-main)',
    fontWeight: '600'
  }
};

