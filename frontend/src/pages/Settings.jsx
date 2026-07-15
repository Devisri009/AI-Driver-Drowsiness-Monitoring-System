import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../components/Icons';
import { api } from '../api/api';

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
  <div style={styles.fieldRow}>
    <div style={styles.fieldMeta}>
      <label style={styles.fieldLabel}>{label}</label>
      {hint && <span style={styles.fieldHint}>{hint}</span>}
    </div>
    <div style={styles.fieldControl}>
      {children}
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  </div>
);

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="card" style={styles.sectionCard}>
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIconBox}>{icon}</div>
      <div>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
    </div>
    <div style={styles.sectionBody}>{children}</div>
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
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>AI Monitoring Settings</h1>
          <p style={styles.pageSubtitle}>
            Configure how DriveGuard detects drowsiness and triggers alerts.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <Icons.Check size={18} color="var(--success)" />
          <span>{toast}</span>
        </div>
      )}

      {/* Fetch error */}
      {fetchErr && (
        <div style={styles.errorBanner}>
          <Icons.Warning size={18} color="#b91c1c" />
          <span>{fetchErr}</span>
        </div>
      )}

      {/* Save error */}
      {saveErr && (
        <div style={styles.errorBanner}>
          <Icons.Warning size={18} color="#b91c1c" />
          <span>{saveErr}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={styles.loadingBanner}>
          <span>Loading settings…</span>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSave} style={styles.form} noValidate>

          {/* ── Section 1: Camera ── */}
          <SectionCard
            icon={<Icons.Monitor size={22} color="var(--primary)" />}
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
                style={errors.cameraIndex ? styles.inputError : {}}
              />
            </FieldRow>
          </SectionCard>

          {/* ── Section 2: AI Detection ── */}
          <SectionCard
            icon={<Icons.Eye size={22} color="var(--primary)" />}
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
                style={errors.earThreshold ? styles.inputError : {}}
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
                style={errors.marThreshold ? styles.inputError : {}}
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
                style={errors.drowsyFrames ? styles.inputError : {}}
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
                style={errors.sleepingFrames ? styles.inputError : {}}
              />
            </FieldRow>
          </SectionCard>

          {/* ── Section 3: Alarm ── */}
          <SectionCard
            icon={<Icons.Alerts size={22} color="var(--primary)" />}
            title="Alarm"
            subtitle="Control the audible alert that sounds when drowsiness is detected."
          >
            {/* Enable/Disable toggle */}
            <div style={styles.toggleRow}>
              <div style={styles.fieldMeta}>
                <span style={styles.fieldLabel}>Enable Alarm</span>
                <span style={styles.fieldHint}>
                  Sound an alert when the driver appears drowsy or asleep.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.alarmEnabled}
                onClick={() => handleChange('alarmEnabled', !form.alarmEnabled)}
                style={{
                  ...styles.toggle,
                  backgroundColor: form.alarmEnabled ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <span style={{
                  ...styles.toggleKnob,
                  transform: form.alarmEnabled ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </button>
            </div>

            {/* Volume slider */}
            <FieldRow
              label="Alarm Volume"
              hint={`Current: ${form.alarmVolume}%`}
              error={errors.alarmVolume}
            >
              <div style={styles.sliderWrapper}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.alarmVolume}
                  disabled={!form.alarmEnabled}
                  onChange={e => handleNumericChange('alarmVolume', e.target.value)}
                  style={{
                    ...styles.slider,
                    opacity: form.alarmEnabled ? 1 : 0.4,
                    cursor: form.alarmEnabled ? 'pointer' : 'not-allowed',
                  }}
                />
                <span style={styles.sliderValue}>{form.alarmVolume}%</span>
              </div>
            </FieldRow>
          </SectionCard>

          {/* ── Action buttons ── */}
          <div style={styles.actionBar}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={saving}
              style={styles.resetBtn}
            >
              <Icons.Rest size={16} color="var(--text-sub)" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={styles.saveBtn}
            >
              {saving ? (
                <>
                  <div style={styles.savingSpinner} />
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  pageHeader: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-sub)',
    marginTop: '0.3rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  // Section card
  sectionCard: {
    padding: '1.75rem',
    borderRadius: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  sectionIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: '0 0 0.2rem 0',
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-sub)',
    margin: 0,
  },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  // Field row
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    alignItems: 'start',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--border)',
  },
  fieldMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  fieldLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  fieldHint: {
    fontSize: '0.8rem',
    color: 'var(--text-sub)',
    lineHeight: '1.4',
  },
  fieldControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  fieldError: {
    fontSize: '0.78rem',
    color: 'var(--danger)',
    fontWeight: '600',
  },
  inputError: {
    borderColor: 'var(--danger)',
    outline: '2px solid rgba(239,68,68,0.2)',
  },
  // Toggle row (for alarm enable)
  toggleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--border)',
  },
  toggle: {
    position: 'relative',
    width: '48px',
    height: '26px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease',
  },
  // Volume slider
  sliderWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  slider: {
    flex: 1,
    accentColor: 'var(--primary)',
    height: '4px',
  },
  sliderValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    minWidth: '36px',
    textAlign: 'right',
  },
  // Action bar
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    paddingTop: '0.5rem',
    flexWrap: 'wrap',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '140px',
    justifyContent: 'center',
  },
  savingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  // Banners
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: 'var(--success-light)',
    border: '1px solid rgba(16,185,129,0.25)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
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
  loadingBanner: {
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
  },
};
