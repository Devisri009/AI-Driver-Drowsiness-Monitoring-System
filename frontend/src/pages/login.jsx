import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';

/* Injected keyframes */
const keyframes = `
@keyframes loginFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
@keyframes loginFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes loginPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.08); }
}
@keyframes loginBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}
`;

/* Panel illustration component */
const PanelIllustration = () => (
  <div style={il.root}>
    <div style={il.orb1} />
    <div style={il.orb2} />

    {/* Brand */}
    <div style={il.brand}>
      <div style={il.logoBox}><Icons.Eye size={22} color="#fff" /></div>
      <span style={il.brandName}>DriveGuard</span>
    </div>

    {/* Headline */}
    <div style={il.headline}>
      <h2 style={il.headlineTitle}>Drive Safer.<br />Stay Alert.</h2>
      <p style={il.headlineDesc}>
        AI-powered driver drowsiness monitoring that keeps you safe on every journey.
      </p>
    </div>

    {/* Floating status cards */}
    <div style={il.cardsArea}>
      <div style={{...il.card, animation:'loginFloat 5s ease-in-out infinite'}}>
        <div style={{...il.cardIcon, background:'rgba(16,185,129,0.2)'}}>
          <Icons.Shield size={18} color="#34D399" />
        </div>
        <div>
          <div style={il.cardLabel}>System Status</div>
          <div style={{...il.cardValue, color:'#34D399'}}>● Secure</div>
        </div>
      </div>

      <div style={{...il.card, animation:'loginFloat 5s ease-in-out infinite 1.5s'}}>
        <div style={{...il.cardIcon, background:'rgba(96,165,250,0.2)'}}>
          <Icons.Eye size={18} color="#60A5FA" />
        </div>
        <div>
          <div style={il.cardLabel}>AI Detection</div>
          <div style={{...il.cardValue, color:'#60A5FA'}}>Ready</div>
        </div>
      </div>

      <div style={{...il.card, animation:'loginFloat 5s ease-in-out infinite 3s'}}>
        <div style={{...il.cardIcon, background:'rgba(245,158,11,0.2)'}}>
          <Icons.Alerts size={18} color="#FCD34D" />
        </div>
        <div>
          <div style={il.cardLabel}>Alert System</div>
          <div style={{...il.cardValue, color:'#FCD34D'}}>Active</div>
        </div>
      </div>
    </div>

    {/* Feature bullets */}
    <div style={il.bullets}>
      {[
        'Real-time AI drowsiness detection',
        'Instant audio & visual alerts',
        'Detailed safety analytics & reports',
        'Fully private, per-user data isolation',
      ].map((b, i) => (
        <div key={i} style={il.bullet}>
          <div style={il.bulletDot}><Icons.Check size={11} color="#fff" /></div>
          <span style={il.bulletText}>{b}</span>
        </div>
      ))}
    </div>
  </div>
);

const il = {
  root: {
    position:'relative', width:'100%', height:'100%',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    padding:'2.5rem', overflow:'hidden',
  },
  orb1: {
    position:'absolute', top:'-15%', right:'-15%', width:'400px', height:'400px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)',
    filter:'blur(40px)', animation:'loginPulse 8s ease-in-out infinite',
  },
  orb2: {
    position:'absolute', bottom:'-10%', left:'-10%', width:'300px', height:'300px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
    filter:'blur(30px)', animation:'loginPulse 10s ease-in-out infinite 3s',
  },
  brand: { display:'flex', alignItems:'center', gap:'0.75rem', position:'relative', zIndex:2 },
  logoBox: {
    width:'42px', height:'42px', borderRadius:'12px',
    background:'rgba(255,255,255,0.2)', backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.3)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 14px rgba(0,0,0,0.15)',
  },
  brandName: { fontSize:'1.35rem', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.03em' },
  headline: { position:'relative', zIndex:2 },
  headlineTitle: {
    fontSize:'2.6rem', fontWeight:'900', color:'#ffffff',
    letterSpacing:'-0.05em', lineHeight:'1.08', marginBottom:'1rem',
  },
  headlineDesc: { fontSize:'1rem', color:'rgba(255,255,255,0.7)', lineHeight:'1.7', maxWidth:'320px' },
  cardsArea: { display:'flex', flexDirection:'column', gap:'0.875rem', position:'relative', zIndex:2 },
  card: {
    display:'flex', alignItems:'center', gap:'1rem',
    background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)',
    border:'1px solid rgba(255,255,255,0.18)',
    borderRadius:'14px', padding:'1rem 1.25rem',
    boxShadow:'0 8px 24px rgba(0,0,0,0.1)',
  },
  cardIcon: { width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  cardLabel: { fontSize:'0.72rem', fontWeight:'700', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'2px' },
  cardValue: { fontSize:'0.95rem', fontWeight:'800' },
  bullets: { display:'flex', flexDirection:'column', gap:'0.75rem', position:'relative', zIndex:2 },
  bullet: { display:'flex', alignItems:'center', gap:'0.75rem' },
  bulletDot: {
    width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
    background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center',
  },
  bulletText: { fontSize:'0.9rem', color:'rgba(255,255,255,0.8)', fontWeight:'500' },
};

/* ── Main Login Component ─────────────────────────────────────────────── */
export const Login = () => {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const res = await loginUser(email.trim(), password.trim());
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div style={s.root}>
      <style>{keyframes}</style>

      {/* Left panel – illustration */}
      <div className="auth-left-panel" style={s.leftPanel}>
        <PanelIllustration />
      </div>

      {/* Right panel – form */}
      <div style={s.rightPanel}>
        <div style={s.formWrap}>
          {/* Back to home */}
          <button onClick={() => navigate('/')} style={s.backBtn}>
            <Icons.ChevronDown size={14} color="#64748B" style={{transform:'rotate(90deg)'}} />
            Back to Home
          </button>

          {/* Header */}
          <div style={s.formHeader}>
            <div style={s.formLogo}>
              <div style={s.formLogoBox}><Icons.Eye size={20} color="#fff" /></div>
            </div>
            <h1 style={s.formTitle}>Welcome back</h1>
            <p style={s.formSubtitle}>Sign in to your DriveGuard account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={s.errorBanner}>
              <Icons.Warning size={16} color="#b91c1c" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Icons.User size={16} color="#94A3B8" /></span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="driver@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={s.input}
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={s.label}>Password</label>
                <button type="button" onClick={() => setShowForgotModal(true)} style={s.forgotBtn}>
                  Forgot password?
                </button>
              </div>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Icons.Rest size={16} color="#94A3B8" /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{...s.input, paddingRight:'3rem'}}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={s.eyeBtn}>
                  <Icons.Eye size={16} color="#94A3B8" />
                </button>
              </div>
            </div>

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? (
                <span style={s.loadingSpinner}>⏳ Signing in...</span>
              ) : (
                <>Sign In to DriveGuard →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={s.dividerRow}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>New to DriveGuard?</span>
            <div style={s.dividerLine} />
          </div>

          {/* Register CTA */}
          <Link to="/register" style={s.registerBtn}>
            Create a Free Account
          </Link>

          <p style={s.privacyNote}>
            Protected by SHA-256 encryption · 100% private data · No tracking
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalHeaderLeft}>
                <div style={s.modalIconBox}><Icons.Rest size={18} color="#2563EB" /></div>
                <h3 style={s.modalTitle}>Reset Password</h3>
              </div>
              <button onClick={() => setShowForgotModal(false)} style={s.modalClose}>
                <Icons.Close size={18} color="#64748B" />
              </button>
            </div>
            <form onSubmit={handleForgotSubmit} style={s.modalBody}>
              {forgotSuccess ? (
                <div style={s.successState}>
                  <div style={s.successIconBox}><Icons.Check size={28} color="#10B981" /></div>
                  <h4 style={s.successTitle}>Recovery Link Sent!</h4>
                  <p style={s.successDesc}>Check your email for password reset instructions.</p>
                </div>
              ) : (
                <>
                  <p style={s.modalDesc}>
                    Enter your registered email address and we'll send you a password recovery link.
                  </p>
                  <div style={s.field}>
                    <label style={s.label}>Email Address</label>
                    <input
                      type="email" required
                      placeholder="driver@example.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      style={s.input}
                    />
                  </div>
                  <div style={s.modalFooter}>
                    <button type="button" onClick={() => setShowForgotModal(false)} style={s.modalCancelBtn}>Cancel</button>
                    <button type="submit" style={s.modalSubmitBtn}>Send Recovery Link →</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  root: {
    minHeight:'100vh', display:'flex',
    fontFamily:"'Inter', system-ui, -apple-system, sans-serif",
    color:'#1E293B', overflow:'hidden',
  },
  /* Left panel */
  leftPanel: {
    width:'480px', flexShrink:0,
    background:'linear-gradient(145deg,#0f172a,#1e3a8a,#2563EB)',
    display:'flex', flexDirection:'column',
    position:'relative',
  },
  /* Right panel */
  rightPanel: {
    flex:1, display:'flex', alignItems:'center', justifyContent:'center',
    backgroundColor:'#ffffff', padding:'2rem',
    backgroundImage:'radial-gradient(rgba(37,99,235,0.04) 1px, transparent 1px)',
    backgroundSize:'24px 24px',
  },
  formWrap: {
    width:'100%', maxWidth:'420px',
    animation:'loginFadeUp 0.6s ease both',
  },
  backBtn: {
    display:'inline-flex', alignItems:'center', gap:'6px',
    background:'none', border:'none', cursor:'pointer',
    color:'#64748B', fontSize:'0.85rem', fontWeight:'600',
    fontFamily:'inherit', marginBottom:'2rem', padding:'0',
    transition:'color 0.15s',
  },
  formHeader: { marginBottom:'2rem' },
  formLogo: { marginBottom:'1.25rem' },
  formLogoBox: {
    width:'48px', height:'48px', borderRadius:'14px',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 8px 20px rgba(37,99,235,0.3)',
  },
  formTitle: {
    fontSize:'1.875rem', fontWeight:'900', color:'#0F172A',
    letterSpacing:'-0.04em', marginBottom:'0.375rem',
  },
  formSubtitle: { fontSize:'0.95rem', color:'#64748B', fontWeight:'500' },
  /* Error */
  errorBanner: {
    display:'flex', alignItems:'center', gap:'0.625rem',
    background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
    borderRadius:'10px', padding:'0.75rem 1rem',
    color:'#b91c1c', fontSize:'0.875rem', fontWeight:'500', marginBottom:'1.5rem',
  },
  /* Form */
  form: { display:'flex', flexDirection:'column', gap:'1.25rem', marginBottom:'1.5rem' },
  field: { display:'flex', flexDirection:'column', gap:'0.5rem' },
  labelRow: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  label: { fontSize:'0.875rem', fontWeight:'600', color:'#374151' },
  forgotBtn: {
    background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
    fontSize:'0.82rem', fontWeight:'600', color:'#2563EB', padding:'0',
  },
  inputWrap: { position:'relative', display:'flex', alignItems:'center' },
  inputIcon: {
    position:'absolute', left:'0.875rem', pointerEvents:'none',
    display:'flex', alignItems:'center',
  },
  eyeBtn: {
    position:'absolute', right:'0.875rem', background:'none', border:'none',
    cursor:'pointer', padding:'0', display:'flex', alignItems:'center',
  },
  input: {
    width:'100%', padding:'0.75rem 0.875rem 0.75rem 2.75rem',
    fontSize:'0.95rem', border:'1.5px solid #E2E8F0', borderRadius:'10px',
    fontFamily:'inherit', color:'#1E293B', outline:'none',
    background:'#FAFAFA', transition:'all 0.2s ease',
    boxSizing:'border-box',
  },
  submitBtn: {
    width:'100%', padding:'0.9rem',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    color:'#fff', borderRadius:'10px', fontWeight:'700', fontSize:'1rem',
    border:'none', cursor:'pointer', fontFamily:'inherit',
    boxShadow:'0 8px 20px rgba(37,99,235,0.35)',
    transition:'all 0.2s ease', marginTop:'0.25rem',
  },
  loadingSpinner: { display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' },
  /* Divider */
  dividerRow: { display:'flex', alignItems:'center', gap:'1rem', margin:'1.5rem 0' },
  dividerLine: { flex:1, height:'1px', background:'#E2E8F0' },
  dividerText: { fontSize:'0.82rem', color:'#94A3B8', fontWeight:'600', whiteSpace:'nowrap' },
  /* Register CTA */
  registerBtn: {
    display:'block', width:'100%', padding:'0.85rem',
    textAlign:'center', borderRadius:'10px',
    border:'1.5px solid #E2E8F0', color:'#1E293B',
    fontWeight:'700', fontSize:'0.95rem', textDecoration:'none',
    transition:'all 0.2s ease', fontFamily:'inherit',
  },
  privacyNote: {
    marginTop:'1.5rem', textAlign:'center', fontSize:'0.75rem',
    color:'#CBD5E1', fontWeight:'500', lineHeight:'1.6',
  },
  /* Forgot modal */
  overlay: {
    position:'fixed', inset:0, backgroundColor:'rgba(15,23,42,0.5)',
    backdropFilter:'blur(8px)', display:'flex', alignItems:'center',
    justifyContent:'center', zIndex:9999, padding:'1rem',
  },
  modal: {
    background:'#ffffff', borderRadius:'16px', width:'100%', maxWidth:'440px',
    boxShadow:'0 25px 60px rgba(0,0,0,0.15)', overflow:'hidden',
    border:'1px solid rgba(226,232,240,0.8)',
    animation:'loginFadeUp 0.3s ease both',
  },
  modalHeader: {
    padding:'1.25rem 1.5rem', borderBottom:'1px solid #F1F5F9',
    display:'flex', alignItems:'center', justifyContent:'space-between',
  },
  modalHeaderLeft: { display:'flex', alignItems:'center', gap:'0.75rem' },
  modalIconBox: {
    width:'36px', height:'36px', borderRadius:'10px',
    background:'rgba(37,99,235,0.08)', display:'flex', alignItems:'center', justifyContent:'center',
  },
  modalTitle: { fontSize:'1.05rem', fontWeight:'800', color:'#0F172A', margin:0 },
  modalClose: { background:'none', border:'none', cursor:'pointer', padding:'4px' },
  modalBody: { padding:'1.5rem' },
  modalDesc: { fontSize:'0.9rem', color:'#64748B', lineHeight:'1.65', marginBottom:'1.25rem' },
  modalFooter: { display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1.5rem' },
  modalCancelBtn: {
    padding:'0.6rem 1.25rem', background:'#F8FAFC', border:'1px solid #E2E8F0',
    borderRadius:'8px', fontWeight:'600', color:'#475569', cursor:'pointer', fontFamily:'inherit',
  },
  modalSubmitBtn: {
    padding:'0.6rem 1.5rem', background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    border:'none', borderRadius:'8px', fontWeight:'700', color:'#fff',
    cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(37,99,235,0.3)',
  },
  /* Success state */
  successState: { display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'1.5rem 0' },
  successIconBox: {
    width:'64px', height:'64px', borderRadius:'50%', background:'rgba(16,185,129,0.1)',
    display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem',
  },
  successTitle: { fontSize:'1.2rem', fontWeight:'800', color:'#0F172A', marginBottom:'0.5rem' },
  successDesc: { fontSize:'0.9rem', color:'#64748B', lineHeight:'1.6' },
};