import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Icons } from '../components/Icons';
import { LoadingSpinner, ErrorCard, EmptyState } from '../components/UIFeedback';

export const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  // Detail modal state
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const handleRowClick = async (alertId) => {
    setShowModal(true);
    setSelectedAlert(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const data = await api.getAlertById(alertId);
      setSelectedAlert(data);
    } catch (err) {
      setDetailError(err.message || 'Failed to load alert details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
    setDetailError('');
  };

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
        <LoadingSpinner message="Loading alert history..." />
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorCard message={error} onRetry={() => window.location.reload()} />
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
              <EmptyState
                icon={<Icons.Check size={40} color="var(--success)" />}
                title={riskFilter === 'All' ? 'No alerts recorded yet' : `No ${riskFilter.toLowerCase()} severity alerts`}
                description="You have no drowsiness or fatigue warnings matching this filter."
              />
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
                      <tr key={alert.id} onClick={() => handleRowClick(alert.id)} style={{ cursor: 'pointer' }}>
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

      {/* Alert Detail Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBox}>
                  <Icons.Alerts size={18} color="var(--primary)" />
                </div>
                <h3 style={styles.modalTitle}>Alert Details</h3>
              </div>
              <button onClick={closeModal} style={styles.modalClose}>
                <Icons.Close size={18} color="#64748B" />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Detail Loading */}
              {detailLoading && (
                <div style={styles.infoBanner}>
                  <span>Loading alert details...</span>
                </div>
              )}

              {/* Detail Error */}
              {detailError && (
                <div style={styles.errorBanner}>
                  <Icons.Warning size={18} color="#b91c1c" />
                  <span>{detailError}</span>
                </div>
              )}

              {/* Detail Content */}
              {!detailLoading && !detailError && selectedAlert && (
                <div style={styles.detailGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Alert Type</span>
                    <span style={styles.detailValue}>{selectedAlert.alertType}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Severity</span>
                    <span className={`badge ${
                      selectedAlert.severity === 'HIGH' ? 'badge-danger' :
                      selectedAlert.severity === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Driver Status</span>
                    <span style={styles.detailValue}>{selectedAlert.driverStatus}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Message</span>
                    <span style={styles.detailValue}>{selectedAlert.message}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Eye Aspect Ratio (EAR)</span>
                    <span style={styles.detailValue}>{selectedAlert.eyeAspectRatio?.toFixed(4) ?? '—'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Confidence</span>
                    <span style={styles.detailValue}>{selectedAlert.confidence != null ? `${selectedAlert.confidence}%` : '—'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Timestamp</span>
                    <span style={styles.detailValue}>{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
  },
  /* Modal styles */
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    border: '1px solid rgba(226,232,240,0.8)'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  modalIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(37,99,235,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  modalBody: {
    padding: '1.5rem'
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9'
  },
  detailLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-sub)'
  },
  detailValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  }
};
