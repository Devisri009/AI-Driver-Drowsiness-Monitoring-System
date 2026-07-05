import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';

export const AlertHistory = () => {
  const { alerts, clearAlertHistory } = useContext(AppContext);

  const [riskFilter, setRiskFilter] = useState('All');

  const filteredAlerts = alerts.filter(alert => {
    return riskFilter === 'All' || alert.riskLevel === riskFilter;
  });

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your personal alert history? This cannot be undone.')) {
      clearAlertHistory();
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Alert History</h1>
          <p style={styles.subtitle}>Review your past drowsiness and fatigue warnings.</p>
        </div>
        {alerts.length > 0 && (
          <button className="btn btn-secondary" onClick={handleClearHistory} style={styles.clearBtn}>
            <Icons.Trash size={18} color="var(--danger)" />
            <span>Clear History</span>
          </button>
        )}
      </div>

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
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Table Audit List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredAlerts.length === 0 ? (
          <div style={styles.emptyState}>
            <Icons.Check size={40} color="var(--success)" />
            <h3 style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>No Alerts Found</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '0.5rem' }}>You have no history of drowsiness or fatigue warnings matching this filter.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Incident Type</th>
                  <th>Severity Level</th>
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
                        alert.riskLevel === 'High' ? 'badge-danger' : 
                        alert.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {alert.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  clearBtn: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    backgroundColor: 'var(--danger-light)'
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
