import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Icons } from '../components/Icons';

/* Injected keyframes */
const keyframes = `
@keyframes regFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes regPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.08); }
}
@keyframes regFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
@keyframes regSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

/* Left panel illustration */
const PanelContent = () => (
  <div style={il.root}>
    <div style={il.orb1} />
    <div style={il.orb2} />
    <div style={il.orb3} />

    {/* Brand */}
    <div style={il.brand}>
      <div style={il.logoBox}><Icons.Eye size={22} color="#fff" /></div>
      <span style={il.brandName}>DriveGuard</span>
    </div>

    {/* Main headline */}
    <div style={il.headline}>
      <h2 style={il.headlineTitle}>Your Safety<br />Journey Starts<br /><span style={{color:'#34D399'}}>Right Here.</span></h2>
      <p style={il.headlineDesc}>
        Join thousands of drivers using AI to stay alert and avoid accidents on every road.
      </p>
    </div>

    {/* Steps */}
    <div style={il.steps}>
      {[
        { n:'01', t:'Create Account',       d:'Register your secure driver profile in seconds.' },
        { n:'02', t:'Start AI Monitoring',  d:'Activate the webcam and let our AI guard you.' },
        { n:'03', t:'Stay Safe',            d:'Receive real-time alerts and safety recommendations.' },
      ].map((step, i) => (
        <div key={i} style={{...il.step, animation:`regFloat 6s ease-in-out infinite ${i*1.5}s`}}>
          <div style={il.stepNum}>{step.n}</div>
          <div>
            <div style={il.stepTitle}>{step.t}</div>
            <div style={il.stepDesc}>{step.d}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Trust footer */}
    <div style={il.trustRow}>
      {['256-bit Encryption','GDPR Compliant','No Data Sharing'].map((t, i) => (
        <div key={i} style={il.trustItem}>
          <Icons.Check size={11} color="#34D399" />
          <span>{t}</span>
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
    position:'absolute', top:'-20%', right:'-20%', width:'420px', height:'420px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)',
    filter:'blur(40px)', animation:'regPulse 8s ease-in-out infinite', pointerEvents:'none',
  },
  orb2: {
    position:'absolute', bottom:'-15%', left:'-10%', width:'320px', height:'320px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)',
    filter:'blur(30px)', animation:'regPulse 10s ease-in-out infinite 3s', pointerEvents:'none',
  },
  orb3: {
    position:'absolute', top:'40%', left:'-5%', width:'200px', height:'200px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
    filter:'blur(25px)', animation:'regPulse 12s ease-in-out infinite 5s', pointerEvents:'none',
  },
  brand: { display:'flex', alignItems:'center', gap:'0.75rem', position:'relative', zIndex:2 },
  logoBox: {
    width:'42px', height:'42px', borderRadius:'12px',
    background:'rgba(255,255,255,0.2)', backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.3)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  brandName: { fontSize:'1.35rem', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.03em' },
  headline: { position:'relative', zIndex:2 },
  headlineTitle: { fontSize:'2.4rem', fontWeight:'900', color:'#ffffff', letterSpacing:'-0.05em', lineHeight:'1.1', marginBottom:'1rem' },
  headlineDesc: { fontSize:'0.95rem', color:'rgba(255,255,255,0.7)', lineHeight:'1.7', maxWidth:'300px' },
  steps: { display:'flex', flexDirection:'column', gap:'1rem', position:'relative', zIndex:2 },
  step: {
    display:'flex', alignItems:'flex-start', gap:'1rem',
    background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'14px', padding:'1rem 1.25rem',
  },
  stepNum: {
    fontSize:'0.75rem', fontWeight:'900', color:'#34D399',
    letterSpacing:'0.04em', flexShrink:0, paddingTop:'2px',
  },
  stepTitle: { fontSize:'0.9rem', fontWeight:'700', color:'#ffffff', marginBottom:'2px' },
  stepDesc: { fontSize:'0.78rem', color:'rgba(255,255,255,0.6)', lineHeight:'1.5' },
  trustRow: { display:'flex', gap:'1.25rem', flexWrap:'wrap', position:'relative', zIndex:2 },
  trustItem: {
    display:'flex', alignItems:'center', gap:'5px',
    fontSize:'0.75rem', color:'rgba(255,255,255,0.65)', fontWeight:'600',
  },
};

/* Password strength helper */
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '#E2E8F0' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (score <= 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
  if (score <= 3) return { level: 3, label: 'Good', color: '#3B82F6' };
  return { level: 4, label: 'Strong', color: '#10B981' };
};

/* ── Main Register Component ─────────────────────────────────────────── */
export const Register = () => {
  const { registerUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreed) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    const res = await registerUser(name.trim(), email.trim(), phone.trim(), password);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={s.root}>
      <style>{keyframes}</style>

      {/* Left panel */}
      <div style={s.leftPanel}>
        <PanelContent />
      </div>

      {/* Right panel */}
      <div style={s.rightPanel}>
        <div style={s.formWrap}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={s.backBtn}>
            ← Back to Home
          </button>

          {/* Header */}
          <div style={s.formHeader}>
            <div style={s.formLogoBox}><Icons.Eye size={20} color="#fff" /></div>
            <h1 style={s.formTitle}>Create your account</h1>
            <p style={s.formSubtitle}>Start your AI-powered driver safety journey today</p>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={s.errorBanner}>
              <Icons.Warning size={16} color="#b91c1c" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div style={s.successBanner}>
              <Icons.Check size={16} color="#065f46" />
              <span>Account created! Redirecting to login...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form}>
            {/* Name + Email row */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><Icons.User size={15} color="#94A3B8" /></span>
                  <input
                    id="reg-name" type="text"
                    placeholder="John Doe"
                    value={name} onChange={e => setName(e.target.value)}
                    style={s.input} required
                  />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><Icons.Mail size={15} color="#94A3B8" /></span>
                  <input
                    id="reg-email" type="email"
                    placeholder="driver@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={s.input} required
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div style={s.field}>
              <label style={s.label}>Phone Number</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Icons.Rest size={15} color="#94A3B8" /></span>
                <input
                  id="reg-phone" type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  style={s.input} required
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Icons.Shield size={15} color="#94A3B8" /></span>
                <input
                  id="reg-password" type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{...s.input, paddingRight:'3rem'}} required
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={s.eyeBtn}>
                  <Icons.Eye size={15} color="#94A3B8" />
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div style={s.strengthArea}>
                  <div style={s.strengthBar}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{
                        ...s.strengthSegment,
                        background: n <= pwStrength.level ? pwStrength.color : '#E2E8F0',
                        transition:`background 0.3s ease ${n * 0.05}s`,
                      }} />
                    ))}
                  </div>
                  <span style={{...s.strengthLabel, color: pwStrength.color}}>
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Terms */}
            <label style={s.checkRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={s.checkbox}
              />
              <span style={s.checkLabel}>
                I agree to the{' '}
                <a href="#" style={s.checkLink}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={s.checkLink}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" style={s.submitBtn} disabled={loading || success}>
              {loading ? '⏳ Creating Account...' : 'Create Free Account →'}
            </button>
          </form>

          {/* Sign in link */}
          <div style={s.signinRow}>
            <span style={{color:'#94A3B8', fontSize:'0.875rem'}}>Already have an account? </span>
            <Link to="/login" style={s.signinLink}>Sign In</Link>
          </div>

          <p style={s.privacyNote}>
            🔒 Your data is encrypted and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  root: {
    minHeight:'100vh', display:'flex',
    fontFamily:"'Inter', system-ui, -apple-system, sans-serif",
    color:'#1E293B', overflow:'hidden',
  },
  leftPanel: {
    width:'460px', flexShrink:0,
    background:'linear-gradient(145deg,#0f172a,#1e3a8a,#2563EB)',
    display:'flex', flexDirection:'column', position:'relative',
  },
  rightPanel: {
    flex:1, display:'flex', alignItems:'center', justifyContent:'center',
    backgroundColor:'#ffffff', padding:'2rem',
    backgroundImage:'radial-gradient(rgba(37,99,235,0.035) 1px, transparent 1px)',
    backgroundSize:'24px 24px', overflowY:'auto',
  },
  formWrap: {
    width:'100%', maxWidth:'520px', paddingTop:'1.5rem', paddingBottom:'2rem',
    animation:'regFadeUp 0.6s ease both',
  },
  backBtn: {
    background:'none', border:'none', cursor:'pointer',
    color:'#64748B', fontSize:'0.85rem', fontWeight:'600',
    fontFamily:'inherit', marginBottom:'1.75rem', padding:'0',
    display:'flex', alignItems:'center', gap:'6px',
  },
  formHeader: { marginBottom:'2rem' },
  formLogoBox: {
    width:'48px', height:'48px', borderRadius:'14px',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 8px 20px rgba(37,99,235,0.3)', marginBottom:'1.25rem',
  },
  formTitle: {
    fontSize:'1.75rem', fontWeight:'900', color:'#0F172A',
    letterSpacing:'-0.04em', marginBottom:'0.375rem',
  },
  formSubtitle: { fontSize:'0.95rem', color:'#64748B', fontWeight:'500' },
  errorBanner: {
    display:'flex', alignItems:'center', gap:'0.625rem',
    background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
    borderRadius:'10px', padding:'0.75rem 1rem',
    color:'#b91c1c', fontSize:'0.875rem', fontWeight:'500', marginBottom:'1.25rem',
  },
  successBanner: {
    display:'flex', alignItems:'center', gap:'0.625rem',
    background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)',
    borderRadius:'10px', padding:'0.75rem 1rem',
    color:'#065f46', fontSize:'0.875rem', fontWeight:'500', marginBottom:'1.25rem',
  },
  form: { display:'flex', flexDirection:'column', gap:'1.125rem', marginBottom:'1.5rem' },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  field: { display:'flex', flexDirection:'column', gap:'0.5rem' },
  label: { fontSize:'0.875rem', fontWeight:'600', color:'#374151' },
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
    width:'100%', padding:'0.7rem 0.875rem 0.7rem 2.625rem',
    fontSize:'0.9rem', border:'1.5px solid #E2E8F0', borderRadius:'10px',
    fontFamily:'inherit', color:'#1E293B', outline:'none',
    background:'#FAFAFA', transition:'all 0.2s ease', boxSizing:'border-box',
  },
  strengthArea: { display:'flex', alignItems:'center', gap:'0.75rem', marginTop:'0.375rem' },
  strengthBar: { flex:1, display:'flex', gap:'4px' },
  strengthSegment: { flex:1, height:'4px', borderRadius:'9999px' },
  strengthLabel: { fontSize:'0.75rem', fontWeight:'700', minWidth:'40px' },
  checkRow: {
    display:'flex', alignItems:'flex-start', gap:'0.625rem', cursor:'pointer',
  },
  checkbox: { marginTop:'2px', width:'16px', height:'16px', cursor:'pointer', flexShrink:0 },
  checkLabel: { fontSize:'0.875rem', color:'#64748B', lineHeight:'1.5' },
  checkLink: { color:'#2563EB', fontWeight:'600', textDecoration:'none' },
  submitBtn: {
    width:'100%', padding:'0.9rem',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    color:'#fff', borderRadius:'10px', fontWeight:'700', fontSize:'1rem',
    border:'none', cursor:'pointer', fontFamily:'inherit',
    boxShadow:'0 8px 20px rgba(37,99,235,0.35)',
    transition:'all 0.2s ease',
  },
  signinRow: { display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'center', marginBottom:'1rem' },
  signinLink: { fontSize:'0.875rem', fontWeight:'700', color:'#2563EB', textDecoration:'none' },
  privacyNote: { textAlign:'center', fontSize:'0.75rem', color:'#CBD5E1', fontWeight:'500', lineHeight:'1.6' },
};
