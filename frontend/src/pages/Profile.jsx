import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';

export const Profile = () => {
  const { currentUser, updateProfile } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
  });
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      phone: formData.phone
    });
    setIsEditing(false);
    setSuccessMsg('Profile updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="page-container">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your account information and preferences.</p>
        </div>
      </div>

      {successMsg && (
        <div style={styles.successBanner}>
          <Icons.Check size={18} color="var(--success)" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card" style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {currentUser?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 style={styles.userName}>{currentUser?.name || 'Driver'}</h2>
            <span className="badge badge-success">Active Account</span>
          </div>
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.infoSection}>
            <div style={styles.sectionTitle}>
              <Icons.User size={20} color="var(--primary)" />
              <h3>Personal Information</h3>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSave} style={styles.form}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Read Only)</label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    style={styles.disabledInput}
                  />
                </div>
                <div style={styles.actionRow}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.infoList}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Full Name</span>
                  <span style={styles.infoValue}>{currentUser?.name || 'Not provided'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Email Address</span>
                  <span style={styles.infoValue}>{currentUser?.email || 'Not provided'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phone Number</span>
                  <span style={styles.infoValue}>{currentUser?.phone || 'Not provided'}</span>
                </div>
                <div style={styles.actionRow}>
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    <Icons.Rest size={16} color="#ffffff" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.infoSection}>
            <div style={styles.sectionTitle}>
              <Icons.Monitor size={20} color="var(--primary)" />
              <h3>Account Details</h3>
            </div>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Account Status</span>
                <span style={{...styles.infoValue, color: 'var(--success)', fontWeight: '700'}}>Active</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Subscription Level</span>
                <span style={styles.infoValue}>DriveGuard Premium</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Device Used</span>
                <span style={styles.infoValue}>Web Browser Camera</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>
                  {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
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
    fontSize: '0.95rem',
    color: 'var(--text-sub)',
    marginTop: '0.25rem'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: 'var(--success-light)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem'
  },
  profileCard: {
    padding: '2rem',
    borderRadius: '12px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid var(--border)',
    marginBottom: '2rem'
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '800',
    fontSize: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--primary)'
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0 0 0.5rem 0'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-sub)',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: '1rem',
    color: 'var(--text-main)',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: 'var(--text-sub)',
    cursor: 'not-allowed'
  },
  actionRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  }
};
