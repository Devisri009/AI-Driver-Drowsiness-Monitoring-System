import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { api } from '../api/api';
import { LoadingSpinner, ErrorCard } from '../components/UIFeedback';

export const Profile = () => {
  const { currentUser } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getUserProfile();
        setProfile(data);
        setFormData({ name: data.name || '', phone: data.phone || '' });
      } catch (err) {
        setFetchError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const updated = await api.updateUserProfile({
        name: formData.name,
        phone: formData.phone,
      });
      setProfile(updated);
      setFormData({ name: updated.name || '', phone: updated.phone || '' });
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = profile?.name?.charAt(0)?.toUpperCase() || 'D';

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="profile-page-header">
        <div className="profile-page-header-icon">
          <Icons.User size={28} color="var(--primary)" />
        </div>
        <div>
          <h1 className="profile-page-title">My Profile</h1>
          <p className="profile-page-subtitle">Manage your account information and preferences.</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <LoadingSpinner message="Loading your profile..." />
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <ErrorCard message={fetchError} onRetry={() => window.location.reload()} />
      )}

      {/* Success banner */}
      {successMsg && (
        <div className="profile-success-banner">
          <Icons.Check size={18} color="var(--success)" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Save error banner */}
      {saveError && (
        <div className="profile-error-banner">
          <Icons.Warning size={18} color="#b91c1c" />
          <span>{saveError}</span>
        </div>
      )}

      {!loading && !fetchError && profile && (
        <div className="profile-layout">

          {/* ── Avatar / Hero Card ── */}
          <div className="card profile-hero-card">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-large">
                {avatarInitial}
              </div>
            </div>
            <div className="profile-hero-info">
              <h2 className="profile-hero-name">{profile.name || 'Driver'}</h2>
              <p className="profile-hero-email">{profile.email || ''}</p>
              <span className="badge badge-success profile-hero-badge">Active Account</span>
            </div>
          </div>

          {/* ── Content grid ── */}
          <div className="profile-content-grid">

            {/* Personal Information */}
            <div className="card profile-info-card">
              <div className="profile-section-header">
                <div className="profile-section-icon-box">
                  <Icons.User size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 className="profile-section-title">Personal Information</h3>
                  <p className="profile-section-subtitle">Update your name and contact details.</p>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="profile-edit-form">
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
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address (Read Only)</label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      disabled
                      className="profile-disabled-input"
                    />
                  </div>
                  <div className="profile-action-row">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setIsEditing(false); setSaveError(''); }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="profile-saving-spinner" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <Icons.Check size={16} color="#ffffff" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-value">{profile.name || 'Not provided'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Email Address</span>
                    <span className="profile-info-value">{profile.email || 'Not provided'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Phone Number</span>
                    <span className="profile-info-value">{profile.phone || 'Not provided'}</span>
                  </div>
                  <div className="profile-action-row">
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                      <Icons.Rest size={16} color="#ffffff" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="card profile-info-card">
              <div className="profile-section-header">
                <div className="profile-section-icon-box">
                  <Icons.Monitor size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 className="profile-section-title">Account Details</h3>
                  <p className="profile-section-subtitle">Your subscription and usage information.</p>
                </div>
              </div>

              <div className="profile-info-list">
                <div className="profile-info-row">
                  <span className="profile-info-label">Account Status</span>
                  <span className="profile-info-value profile-status-active">Active</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Subscription Level</span>
                  <span className="profile-info-value">DriveGuard Premium</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Device Used</span>
                  <span className="profile-info-value">Web Browser Camera</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">
                    {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
