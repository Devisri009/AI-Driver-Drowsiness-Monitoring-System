import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../components/Icons';
import { api } from '../api/api';
import { LoadingSpinner, ErrorCard } from '../components/UIFeedback';

// ── Default values mirroring backend entity defaults ─────────────────────────
const DEFAULT_SETTINGS = {
  cameraIndex:   0,
  earThreshold:  0.25,
  marThreshold:  0.65,
  drowsyFrames:  20,
  sleepingFrames: 40,
  alarmEnabled:  true,
  alarmVolume:   80,
};

// ── Field-level validation ───────────────────────────────────────────────────
function validate(form) {
  const errors = {};
  if (form.cameraIndex < 0)
    errors.cameraIndex = 'Camera index must be 0 or greater.';
  if (form.earThreshold < 0.10 || form.earThreshold > 0.50)
    errors.earThreshold = 'EAR threshold must be between 0.10 and 0.50.';
  if (form.marThreshold < 0.20 || form.marThreshold > 1.20)
    errors.marThreshold = 'MAR threshold must be between 0.20 and 1.20.';
  if (!Number.isInteger(form.drowsyFrames) || form.drowsyFrames < 1)
    errors.drowsyFrames = 'Drowsy frames must be a positive integer.';
  if (!Number.isInteger(form.sleepingFrames) || form.sleepingFrames < 1)
    errors.sleepingFrames = 'Sleeping frames must be a positive integer.';
  if (form.alarmVolume < 0 || form.alarmVolume > 100)
    errors.alarmVolume = 'Alarm volume must be between 0 and 100.';
  return errors;
}

// ── Reusable form-field sub-components ───────────────────────────────────────
const FieldRow = ({ label, hint, children, error }) => (
  <div className="settings-field-row">
    <div className="settings-field-meta">
      <label className="settings-field-label">{label}</label>
      {hint && <span className="settings-field-hint">{hint}</span>}
    </div>
    <div className="settings-field-control">
      {children}
      {error && <span className="settings-field-error">{error}</span>}
    </div>
  </div>
);

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="card settings-section-card">
    <div className="settings-section-header">
      <div className="settings-section-icon-box">{icon}</div>
      <div className="settings-section-title-group">
        <h3 className="settings-section-title">{title}</h3>
        {subtitle && <p className="settings-section-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="settings-section-body">{children}</div>
  </div>
);

// ── Main Settings page ────────────────────────────────────────────────────────
export const Settings = () => {
  const [form, setForm]         = useState(DEFAULT_SETTINGS);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [saveErr, setSaveErr]   = useState('');
  const [toast, setToast]       = useState('');  // success message

  // ── Load settings from backend ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        if (mounted) {
          setForm({
            cameraIndex:    data.cameraIndex,
            earThreshold:   data.earThreshold,
            marThreshold:   data.marThreshold,
            drowsyFrames:   data.drowsyFrames,
            sleepingFrames: data.sleepingFrames,
            alarmEnabled:   data.alarmEnabled,
            alarmVolume:    data.alarmVolume,
          });
        }
      } catch (err) {
        if (mounted) setFetchErr(err.message || 'Failed to load settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  // ── Field change helpers ────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear the field's error on change
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSaveErr('');
  }, []);

  const handleNumericChange = useCallback((field, raw, isFloat = false) => {
    const parsed = isFloat ? parseFloat(raw) : parseInt(raw, 10);
    handleChange(field, isNaN(parsed) ? raw : parsed);
  }, [handleChange]);

  // ── Reset to defaults ───────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    setErrors({});
    setSaveErr('');
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setSaveErr('');
    try {
      const updated = await api.updateSettings(form);
      setForm({
        cameraIndex:    updated.cameraIndex,
        earThreshold:   updated.earThreshold,
        marThreshold:   updated.marThreshold,
        drowsyFrames:   updated.drowsyFrames,
        sleepingFrames: updated.sleepingFrames,
        alarmEnabled:   updated.alarmEnabled,
        alarmVolume:    updated.alarmVolume,
      });
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      setSaveErr(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* Page header */}
      <div className="settings-page-header">
        <div className="settings-page-header-icon">
          <Icons.Eye size={28} color="var(--primary)" />
        </div>
        <div>
          <h1 className="settings-page-title">AI Monitoring Settings</h1>
          <p className="settings-page-subtitle">
            Configure how DriveGuard detects drowsiness and triggers alerts.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="settings-toast">
          <Icons.Check size={18} color="var(--success)" />
          <span>{toast}</span>
        </div>
      )}

      {/* Fetch error */}
      {fetchErr && (
        <ErrorCard message={fetchErr} onRetry={() => window.location.reload()} />
      )}

      {/* Save error */}
      {saveErr && (
        <div className="settings-error-banner">
          <Icons.Warning size={18} color="#b91c1c" />
          <span>{saveErr}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <LoadingSpinner message="Loading settings..." />
      )}

      {!loading && (
        <form onSubmit={handleSave} className="settings-form" noValidate>

          {/* ── Section 1: Camera ── */}
          <SectionCard
            icon={<Icons.Monitor size={24} color="var(--primary)" />}
            title="Camera"
            subtitle="Select which camera device the AI module should use."
          >
            <FieldRow
              label="Camera Index"
              hint="0 = default webcam, 1 = secondary camera, etc."
              error={errors.cameraIndex}
            >
              <input
                type="number"
                min={0}
                step={1}
                value={form.cameraIndex}
                onChange={e => handleNumericChange('cameraIndex', e.target.value)}
                className={errors.cameraIndex ? 'settings-input-error' : ''}
              />
            </FieldRow>
          </SectionCard>

          {/* ── Section 2: AI Detection ── */}
          <SectionCard
            icon={<Icons.Eye size={24} color="var(--primary)" />}
            title="AI Detection"
            subtitle="Tune the sensitivity thresholds used by the drowsiness detection model."
          >
            <FieldRow
              label="EAR Threshold"
              hint="Eye Aspect Ratio — eyes are considered closed below this value. Range: 0.10–0.50"
              error={errors.earThreshold}
            >
              <input
                type="number"
                min={0.10}
                max={0.50}
                step={0.01}
                value={form.earThreshold}
                onChange={e => handleNumericChange('earThreshold', e.target.value, true)}
                className={errors.earThreshold ? 'settings-input-error' : ''}
              />
            </FieldRow>

            <FieldRow
              label="MAR Threshold"
              hint="Mouth Aspect Ratio — mouth is considered open (yawn) above this value. Range: 0.20–1.20"
              error={errors.marThreshold}
            >
              <input
                type="number"
                min={0.20}
                max={1.20}
                step={0.01}
                value={form.marThreshold}
                onChange={e => handleNumericChange('marThreshold', e.target.value, true)}
                className={errors.marThreshold ? 'settings-input-error' : ''}
              />
            </FieldRow>

            <FieldRow
              label="Drowsy Frames"
              hint="Consecutive frames below EAR threshold required to trigger a DROWSY alert."
              error={errors.drowsyFrames}
            >
              <input
                type="number"
                min={1}
                step={1}
                value={form.drowsyFrames}
                onChange={e => handleNumericChange('drowsyFrames', e.target.value)}
                className={errors.drowsyFrames ? 'settings-input-error' : ''}
              />
            </FieldRow>

            <FieldRow
              label="Sleeping Frames"
              hint="Consecutive frames below EAR threshold required to trigger a SLEEPING alert."
              error={errors.sleepingFrames}
            >
              <input
                type="number"
                min={1}
                step={1}
                value={form.sleepingFrames}
                onChange={e => handleNumericChange('sleepingFrames', e.target.value)}
                className={errors.sleepingFrames ? 'settings-input-error' : ''}
              />
            </FieldRow>
          </SectionCard>

          {/* ── Section 3: Alarm ── */}
          <SectionCard
            icon={<Icons.Alerts size={24} color="var(--primary)" />}
            title="Alarm"
            subtitle="Control the audible alert that sounds when drowsiness is detected."
          >
            {/* Enable/Disable toggle */}
            <FieldRow
              label="Enable Alarm"
              hint="Sound an alert when the driver appears drowsy or asleep."
            >
              <button
                type="button"
                role="switch"
                aria-checked={form.alarmEnabled}
                onClick={() => handleChange('alarmEnabled', !form.alarmEnabled)}
                className="settings-toggle"
                style={{
                  backgroundColor: form.alarmEnabled ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <span
                  className="settings-toggle-knob"
                  style={{
                    transform: form.alarmEnabled ? 'translateX(24px)' : 'translateX(2px)',
                  }}
                />
              </button>
            </FieldRow>

            {/* Volume slider */}
            <FieldRow
              label="Alarm Volume"
              hint={`Current: ${form.alarmVolume}%`}
              error={errors.alarmVolume}
            >
              <div className="settings-slider-wrapper">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.alarmVolume}
                  disabled={!form.alarmEnabled}
                  onChange={e => handleNumericChange('alarmVolume', e.target.value)}
                  className="settings-slider"
                  style={{
                    opacity: form.alarmEnabled ? 1 : 0.4,
                    cursor: form.alarmEnabled ? 'pointer' : 'not-allowed',
                  }}
                />
                <span className="settings-slider-value">{form.alarmVolume}%</span>
              </div>
            </FieldRow>
          </SectionCard>

          {/* ── Action buttons ── */}
          <div className="settings-action-bar">
            <button
              type="button"
              className="btn btn-secondary settings-reset-btn"
              onClick={handleReset}
              disabled={saving}
            >
              <Icons.Rest size={16} color="var(--text-sub)" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary settings-save-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="settings-saving-spinner" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Icons.Check size={16} color="#ffffff" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
};
