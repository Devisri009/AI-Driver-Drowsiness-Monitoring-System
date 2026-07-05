import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

/* ── Injected global keyframe CSS ──────────────────────────────────────── */
const keyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}
@keyframes floatAlt {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(2deg); }
}
@keyframes gentleFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
  70%  { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
@keyframes scanLine {
  0%   { top: 8%; opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 88%; opacity: 0; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInSection {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes orbPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%       { transform: scale(1.1); opacity: 0.9; }
}
@keyframes rotateGlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes rotateGlowReverse {
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
}
@keyframes dash {
  to { stroke-dashoffset: 0; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes subtlePulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}
`;

/* ── Scroll-triggered animation hook ──────────────────────────────────── */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

/* ── Reusable Glassmorphism Hero Illustration (pure CSS/SVG) ────────────── */
const HeroIllustration = () => (
  <div style={il.root}>
    {/* Ambient orbs */}
    <div style={il.orbBlue} />
    <div style={il.orbGreen} />
    <div style={il.orbCyan} />

    {/* Rotating border rings */}
    <div style={il.rotatingRing} />
    <div style={il.rotatingRingInner} />

    {/* Main browser / monitor frame */}
    <div style={il.frame}>
      {/* Title bar */}
      <div style={il.titleBar}>
        <div style={il.dots}>
          <span style={{...il.dot, background:'#EF4444'}} />
          <span style={{...il.dot, background:'#F59E0B'}} />
          <span style={{...il.dot, background:'#10B981'}} />
        </div>
        <div style={il.urlBar}>
          <span style={{color:'#10B981',marginRight:'4px',fontSize:'0.7rem'}}>●</span>
          app.driveguard.com/monitoring
        </div>
        <div style={il.livePill}>
          <span style={il.liveDot} />
          LIVE
        </div>
      </div>

      {/* Camera viewport */}
      <div style={il.viewport}>
        {/* Dark camera background */}
        <div style={il.camBg} />

        {/* Scan line */}
        <div style={il.scanLine} />

        {/* Grid overlay */}
        <svg style={il.gridSvg} viewBox="0 0 460 300" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="460" height="300" fill="url(#grid)" />
        </svg>

        {/* Driver silhouette */}
        <svg style={il.silSvg} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <ellipse cx="100" cy="60" rx="38" ry="42" fill="rgba(148,163,184,0.25)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
          {/* Shoulders */}
          <path d="M40,140 Q60,105 100,100 Q140,105 160,140 L170,200 L30,200 Z" fill="rgba(100,116,139,0.2)" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
        </svg>

        {/* AI Bounding box */}
        <div style={il.boundingBox}>
          {/* Corners */}
          {[
            {top:-2,left:-2,borderTop:'2px solid #10B981',borderLeft:'2px solid #10B981'},
            {top:-2,right:-2,borderTop:'2px solid #10B981',borderRight:'2px solid #10B981'},
            {bottom:-2,left:-2,borderBottom:'2px solid #10B981',borderLeft:'2px solid #10B981'},
            {bottom:-2,right:-2,borderBottom:'2px solid #10B981',borderRight:'2px solid #10B981'},
          ].map((c,i) => (
            <div key={i} style={{position:'absolute',width:'16px',height:'16px',...c}} />
          ))}

          {/* Eye trackers */}
          <div style={{...il.eyeRing, left:'22px', animation:'pulseRing 2s infinite'}} />
          <div style={{...il.eyeRing, right:'22px', animation:'pulseRing 2s infinite 0.5s'}} />

          {/* Face mesh dots — enhanced with more points */}
          {[
            [48,18],[80,18],[50,34],[80,34],[64,50],[40,24],[88,24],
            [64,14],[64,30],[56,42],[72,42],[44,38],[84,38],[64,58],[52,54],[76,54],
          ].map(([x,y],i)=>(
            <div key={i} style={{...il.meshDot, left:x+'px', top:y+'px'}} />
          ))}

          {/* Face mesh connection lines */}
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} viewBox="0 0 128 100">
            <line x1="48" y1="18" x2="80" y2="18" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
            <line x1="40" y1="24" x2="48" y2="18" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
            <line x1="80" y1="18" x2="88" y2="24" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
            <line x1="50" y1="34" x2="80" y2="34" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
            <line x1="56" y1="42" x2="72" y2="42" stroke="rgba(16,185,129,0.12)" strokeWidth="0.5" />
            <line x1="64" y1="50" x2="64" y2="58" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* EAR metric badge */}
        <div style={il.earBadge}>
          <span style={{color:'#10B981',fontWeight:'700'}}>EAR</span>
          <span style={{color:'#fff',fontWeight:'800',marginLeft:'6px'}}>0.29</span>
          <span style={{color:'#10B981',marginLeft:'4px',fontSize:'0.65rem'}}>[OK]</span>
        </div>

        {/* FPS counter badge */}
        <div style={il.fpsBadge}>
          <span style={{color:'#60A5FA',fontWeight:'700'}}>FPS</span>
          <span style={{color:'#fff',fontWeight:'800',marginLeft:'4px'}}>30</span>
        </div>

        {/* HUD text lines */}
        <div style={il.hudText}>
          <span style={il.hudLine}>DRIVEGUARD AI CORE v2.4</span>
          <span style={il.hudLine}>MODEL: FACE_MESH_468 | FOCUS: 98.4%</span>
          <span style={{...il.hudLine, color:'rgba(16,185,129,0.6)'}}>▸ TRACKING ACTIVE</span>
        </div>
      </div>

      {/* Bottom status strip */}
      <div style={il.statusStrip}>
        <div style={il.statusItem}>
          <span style={{...il.statusDot,background:'#10B981'}} />
          <span style={il.statusText}>Monitoring Active</span>
        </div>
        <div style={il.statusItem}>
          <span style={{...il.statusDot,background:'#3B82F6'}} />
          <span style={il.statusText}>AI Tracking</span>
        </div>
        <div style={il.statusItem}>
          <span style={{...il.statusDot,background:'#F59E0B'}} />
          <span style={il.statusText}>Alert Ready</span>
        </div>
      </div>
    </div>

    {/* Floating cards */}
    <div style={{...il.floatCard, top:'2%', right:'-6%', animationDelay:'0s'}}>
      <div style={{...il.floatIcon, background:'linear-gradient(135deg,#2563EB,#60A5FA)'}}>
        <Icons.Shield size={16} color="#fff" />
      </div>
      <div>
        <div style={il.floatLabel}>System Status</div>
        <div style={{...il.floatValue, color:'#2563EB'}}>Secure</div>
      </div>
    </div>

    <div style={{...il.floatCard, bottom:'30%', left:'-10%', animationDelay:'1.2s'}}>
      <div style={{...il.floatIcon, background:'linear-gradient(135deg,#EF4444,#F87171)'}}>
        <Icons.Warning size={16} color="#fff" />
      </div>
      <div>
        <div style={il.floatLabel}>Fatigue Alert</div>
        <div style={{...il.floatValue, color:'#EF4444'}}>Drowsiness</div>
      </div>
    </div>

    <div style={{...il.floatCard, bottom:'-4%', right:'6%', animationDelay:'2.4s'}}>
      <div style={{...il.floatIcon, background:'linear-gradient(135deg,#10B981,#34D399)'}}>
        <Icons.Eye size={16} color="#fff" />
      </div>
      <div>
        <div style={il.floatLabel}>Eye Aspect Ratio</div>
        <div style={{...il.floatValue, color:'#10B981'}}>0.28 – OK</div>
      </div>
    </div>

    {/* NEW: Safety Recommendation popup */}
    <div style={{...il.floatCard, bottom:'8%', left:'-6%', animationDelay:'3.6s', minWidth:'200px'}}>
      <div style={{...il.floatIcon, background:'linear-gradient(135deg,#8B5CF6,#C4B5FD)'}}>
        <Icons.Shield size={16} color="#fff" />
      </div>
      <div>
        <div style={il.floatLabel}>Safety Tip</div>
        <div style={{...il.floatValue, color:'#8B5CF6', fontSize:'0.85rem'}}>Take a break soon</div>
      </div>
    </div>

    {/* NEW: Monitoring Active indicator */}
    <div style={il.monitoringIndicator}>
      <span style={il.monitoringDot} />
      <span style={{fontWeight:'700', color:'#10B981', fontSize:'0.72rem', letterSpacing:'0.04em'}}>MONITORING ACTIVE</span>
    </div>

    {/* Driver status widget */}
    <div style={il.driverWidget}>
      <div style={il.driverWidgetDot} />
      <span style={il.driverWidgetText}>Driver: <strong style={{color:'#10B981'}}>Alert</strong></span>
    </div>
  </div>
);

/* Illustration styles */
const il = {
  root: {
    position:'relative', width:'100%', maxWidth:'660px', height:'560px',
    display:'flex', alignItems:'center', justifyContent:'center',
    animation:'gentleFloat 8s ease-in-out infinite',
  },
  orbBlue: {
    position:'absolute', width:'400px', height:'400px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)',
    filter:'blur(50px)', top:'5%', left:'2%', animation:'orbPulse 6s ease-in-out infinite', pointerEvents:'none',
  },
  orbGreen: {
    position:'absolute', width:'320px', height:'320px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
    filter:'blur(35px)', bottom:'0%', right:'-5%', animation:'orbPulse 8s ease-in-out infinite 2s', pointerEvents:'none',
  },
  orbCyan: {
    position:'absolute', width:'200px', height:'200px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
    filter:'blur(30px)', top:'60%', left:'10%', animation:'orbPulse 10s ease-in-out infinite 4s', pointerEvents:'none',
  },
  rotatingRing: {
    position:'absolute', width:'480px', height:'480px', borderRadius:'50%',
    border:'1px dashed rgba(37,99,235,0.14)',
    animation:'rotateGlow 30s linear infinite', pointerEvents:'none',
  },
  rotatingRingInner: {
    position:'absolute', width:'540px', height:'540px', borderRadius:'50%',
    border:'1px dashed rgba(16,185,129,0.08)',
    animation:'rotateGlowReverse 45s linear infinite', pointerEvents:'none',
  },
  frame: {
    position:'relative', width:'460px', zIndex:2,
    background:'rgba(255,255,255,0.75)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
    border:'1px solid rgba(255,255,255,0.92)',
    borderRadius:'22px',
    boxShadow:'0 40px 80px -16px rgba(0,0,0,0.16), 0 16px 32px -8px rgba(37,99,235,0.08), inset 0 0 0 1px rgba(255,255,255,0.65)',
    overflow:'hidden',
  },
  titleBar: {
    height:'44px', background:'rgba(248,250,252,0.97)', borderBottom:'1px solid rgba(226,232,240,0.85)',
    display:'flex', alignItems:'center', padding:'0 1rem', gap:'0.75rem',
  },
  dots: { display:'flex', gap:'5px', flexShrink:0 },
  dot: { width:'10px', height:'10px', borderRadius:'50%', display:'block' },
  urlBar: {
    flex:1, maxWidth:'240px', margin:'0 auto', textAlign:'center',
    fontSize:'0.72rem', color:'#64748B', background:'#fff',
    padding:'0.3rem 0.625rem', borderRadius:'6px', border:'1px solid #e2e8f0', fontWeight:'500',
  },
  livePill: {
    display:'flex', alignItems:'center', gap:'5px',
    padding:'0.2rem 0.625rem', background:'rgba(16,185,129,0.1)',
    borderRadius:'99px', fontSize:'0.68rem', fontWeight:'800',
    color:'#10B981', letterSpacing:'0.05em',
  },
  liveDot: {
    width:'6px', height:'6px', borderRadius:'50%', background:'#10B981',
    animation:'blink 1.4s infinite',
    display:'block',
  },
  viewport: {
    position:'relative', height:'280px', overflow:'hidden',
    background:'#0f172a',
  },
  camBg: {
    position:'absolute', inset:0,
    background:'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  },
  scanLine: {
    position:'absolute', left:0, right:0, height:'3px',
    background:'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.5) 30%, rgba(16,185,129,0.8) 50%, rgba(16,185,129,0.5) 70%, transparent 95%)',
    animation:'scanLine 3s linear infinite',
    zIndex:4, pointerEvents:'none',
    boxShadow:'0 0 12px rgba(16,185,129,0.4)',
  },
  gridSvg: {
    position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1,
  },
  silSvg: {
    position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
    width:'210px', height:'210px', zIndex:2,
  },
  boundingBox: {
    position:'absolute', top:'24px', left:'50%', transform:'translateX(-50%)',
    width:'150px', height:'120px',
    border:'1px solid rgba(16,185,129,0.5)',
    background:'rgba(16,185,129,0.04)',
    borderRadius:'6px', zIndex:5,
  },
  eyeRing: {
    position:'absolute', top:'22px', width:'22px', height:'12px',
    border:'2px solid #10B981', borderRadius:'10px',
    boxShadow:'0 0 12px rgba(16,185,129,0.6)',
  },
  meshDot: {
    position:'absolute', width:'3px', height:'3px', borderRadius:'50%',
    background:'rgba(16,185,129,0.85)', boxShadow:'0 0 5px rgba(16,185,129,0.5)',
    zIndex:1,
  },
  earBadge: {
    position:'absolute', top:'8px', right:'8px',
    background:'rgba(0,0,0,0.55)', backdropFilter:'blur(10px)',
    padding:'0.3rem 0.6rem', borderRadius:'8px',
    fontSize:'0.72rem', display:'flex', alignItems:'center', zIndex:6,
    border:'1px solid rgba(16,185,129,0.15)',
  },
  fpsBadge: {
    position:'absolute', top:'8px', right:'90px',
    background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)',
    padding:'0.2rem 0.5rem', borderRadius:'6px',
    fontSize:'0.68rem', display:'flex', alignItems:'center', zIndex:6,
    border:'1px solid rgba(96,165,250,0.15)',
  },
  hudText: {
    position:'absolute', bottom:'8px', left:'8px',
    display:'flex', flexDirection:'column', gap:'2px', zIndex:6,
  },
  hudLine: {
    fontSize:'0.62rem', color:'rgba(255,255,255,0.45)',
    fontFamily:'monospace', letterSpacing:'0.08em',
  },
  statusStrip: {
    height:'40px', background:'rgba(248,250,252,0.97)',
    borderTop:'1px solid rgba(226,232,240,0.75)',
    display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 1rem',
  },
  statusItem: { display:'flex', alignItems:'center', gap:'5px' },
  statusDot: { width:'7px', height:'7px', borderRadius:'50%', display:'block' },
  statusText: { fontSize:'0.72rem', fontWeight:'600', color:'#64748B' },
  floatCard: {
    position:'absolute',
    background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.95)',
    padding:'0.875rem 1.125rem',
    borderRadius:'16px',
    boxShadow:'0 20px 50px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,1)',
    display:'flex', alignItems:'center', gap:'0.875rem', zIndex:3,
    animation:'float 5s ease-in-out infinite',
    minWidth:'180px',
  },
  floatIcon: {
    width:'42px', height:'42px', borderRadius:'12px',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 8px 18px rgba(0,0,0,0.14)', flexShrink:0,
  },
  floatLabel: {
    fontSize:'0.66rem', fontWeight:'700', color:'#94A3B8',
    textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'2px',
  },
  floatValue: {
    fontSize:'1rem', fontWeight:'800', lineHeight:'1.1',
  },
  monitoringIndicator: {
    position:'absolute', top:'0%', left:'16%',
    background:'rgba(16,185,129,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    border:'1px solid rgba(16,185,129,0.25)',
    padding:'0.45rem 1rem', borderRadius:'99px',
    boxShadow:'0 8px 20px rgba(16,185,129,0.1)',
    display:'flex', alignItems:'center', gap:'0.5rem', zIndex:4,
    animation:'floatAlt 9s ease-in-out infinite 1s',
  },
  monitoringDot: {
    width:'7px', height:'7px', borderRadius:'50%', background:'#10B981',
    boxShadow:'0 0 10px rgba(16,185,129,0.8)',
    animation:'blink 1.6s infinite',
    display:'block',
  },
  driverWidget: {
    position:'absolute', top:'-2%', left:'2%',
    background:'rgba(255,255,255,0.92)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
    border:'1px solid rgba(255,255,255,0.95)',
    padding:'0.6rem 1.25rem', borderRadius:'99px',
    boxShadow:'0 10px 28px rgba(0,0,0,0.07)',
    display:'flex', alignItems:'center', gap:'0.5rem', zIndex:3,
    animation:'floatAlt 7s ease-in-out infinite',
    fontSize:'0.85rem', fontWeight:'500', color:'#475569',
  },
  driverWidgetDot: {
    width:'8px', height:'8px', borderRadius:'50%', background:'#10B981',
    boxShadow:'0 0 8px rgba(16,185,129,0.7)',
    animation:'blink 2s infinite',
    display:'block',
  },
  driverWidgetText: { whiteSpace:'nowrap' },
};

/* ── AnimatedSection wrapper ─────────────────────────────────────────── */
const AnimatedSection = ({ children, style, ...rest }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)',
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

/* ── Main LandingPage Component ─────────────────────────────────────────── */
export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  /* ── Data ─────────────────────────────────────────────────────── */
  const navLinks = [
    { label: 'Home',         id: 'home' },
    { label: 'Features',     id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'About',        id: 'about' },
    { label: 'Contact',      id: 'contact' },
  ];

  const features = [
    {
      title: 'AI Drowsiness Detection',
      desc: 'Advanced computer vision monitors facial landmarks to detect early signs of fatigue in real time.',
      icon: <Icons.Monitor size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)',
    },
    {
      title: 'Live Camera Monitoring',
      desc: 'Continuous, low-latency webcam tracking ensures you are always monitored while on the road.',
      icon: <Icons.Eye size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#10B981,#34D399)',
    },
    {
      title: 'Real-Time Alerts',
      desc: 'Instant visual and auditory warnings are triggered the moment drowsiness is detected.',
      icon: <Icons.Alerts size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)',
    },
    {
      title: 'Safety Recommendations',
      desc: 'Receive smart AI-generated suggestions for breaks, hydration and micro-naps to stay alert.',
      icon: <Icons.Shield size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#8B5CF6,#C4B5FD)',
    },
    {
      title: 'Alert History & Logs',
      desc: 'Review detailed logs of all recorded fatigue events to understand your driving patterns.',
      icon: <Icons.Reports size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#EC4899,#F9A8D4)',
    },
    {
      title: 'Secure Multi-User Accounts',
      desc: 'Enterprise-grade data isolation ensures your personal safety data stays completely private.',
      icon: <Icons.User size={30} color="#fff" />,
      gradient: 'linear-gradient(135deg,#06B6D4,#67E8F9)',
    },
  ];

  const whyItems = [
    {
      icon: <Icons.Eye size={22} color="#fff" />,
      bg: 'linear-gradient(135deg,#2563EB,#60A5FA)',
      title: 'AI Driver Monitoring',
      desc: 'Real-time facial landmark tracking using computer vision to detect closed eyes, yawning, and micro-sleep events.',
    },
    {
      icon: <Icons.Alerts size={22} color="#fff" />,
      bg: 'linear-gradient(135deg,#EF4444,#F87171)',
      title: 'Instant Safety Alerts',
      desc: 'Audio and visual alarms fire immediately when drowsiness thresholds are exceeded, keeping you alert.',
    },
    {
      icon: <Icons.Shield size={22} color="#fff" />,
      bg: 'linear-gradient(135deg,#10B981,#34D399)',
      title: 'Driver Safety Recommendations',
      desc: 'Personalized, AI-generated safety protocols guide drivers through corrective actions on every alert.',
    },
  ];

  const timeline = [
    { num: '01', title: 'Register Account',     desc: 'Create your private, encrypted driver profile in under 60 seconds.' },
    { num: '02', title: 'Login Securely',        desc: 'Access your personal AI dashboard protected by SHA-256 hashing.' },
    { num: '03', title: 'Start AI Monitoring',   desc: 'Click Start Monitoring to enable the live webcam and AI detection engine.' },
    { num: '04', title: 'Instant Safety Alerts', desc: 'Get notified immediately and receive real-time safety recommendations.' },
  ];

  const stats = [
    { value: '99.2%', label: 'Detection Accuracy' },
    { value: '<0.3s', label: 'Alert Response Time' },
    { value: '24/7',  label: 'Continuous Monitoring' },
    { value: '100%',  label: 'Data Privacy' },
  ];

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div style={s.root}>
      {/* Inject keyframes */}
      <style>{keyframes}</style>

      {/* ── Global background decorators ───────────────────────── */}
      <div style={s.bgDot} />
      <div style={s.bgBlue} />
      <div style={s.bgGreen} />
      <div style={s.bgIndigo} />
      <div style={s.bgCyanExtra} />
      <div style={s.bgPinkExtra} />

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav style={{
        ...s.nav,
        background: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
        backdropFilter: scrolled ? 'blur(24px)' : 'blur(10px)',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(10px)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.06)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.6)' : '1px solid transparent',
        padding: scrolled ? '0 5%' : '0 5%',
      }}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logoBox}>
            <Icons.Eye size={18} color="#fff" />
          </div>
          <span style={s.brandName}>DriveGuard</span>
        </div>

        {/* Desktop nav links */}
        <div style={s.navLinks}>
          {navLinks.map(nl => (
            <button key={nl.id} onClick={() => scrollTo(nl.id)} style={s.navLink}>
              {nl.label}
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={s.navCta}>
          <button onClick={() => navigate('/login')} style={s.loginBtn}>Sign In</button>
          <button onClick={() => navigate('/register')} style={s.registerBtn}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section id="home" style={s.hero}>
        <div style={s.heroInner}>
          {/* Left column */}
          <div style={s.heroLeft}>
            {/* Badge */}
            <div style={s.heroBadge}>
              <span style={{marginRight:'6px',fontSize:'1rem'}}>🛡️</span>
              AI DRIVER SAFETY PLATFORM
            </div>

            <h1 style={s.heroTitle}>
              Drive <span style={s.heroTitleAccent}>Smarter.</span>
              <br />Stay Alert.
              <br />Arrive <span style={{...s.heroTitleAccent, background:'linear-gradient(90deg,#10B981,#34D399)', WebkitBackgroundClip:'text'}}>Safely.</span>
            </h1>

            <p style={s.heroDesc}>
              DriveGuard is an AI-powered Driver Drowsiness Monitoring and Alert Management System
              that continuously monitors driver alertness using Computer Vision and Artificial Intelligence,
              detects fatigue in real time, and delivers instant safety alerts and intelligent recommendations
              to help prevent accidents.
            </p>

            <div style={s.heroButtons}>
              <button onClick={() => navigate('/register')} style={s.btnPrimary}>
                Get Started
                <span style={{marginLeft:'8px'}}>→</span>
              </button>
              <button onClick={() => scrollTo('features')} style={s.btnOutline}>
                Learn More
              </button>
            </div>

            {/* Trust badges */}
            <div style={s.trustRow}>
              {['AI Powered','Real-Time Detection','100% Private','Multi-User'].map(t => (
                <div key={t} style={s.trustBadge}>
                  <div style={s.checkCircle}><Icons.Check size={10} color="#fff" /></div>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column – illustration */}
          <div style={s.heroRight}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAND ════════════════ */}
      <AnimatedSection style={s.statsBand}>
        <div style={s.statsInner}>
          {stats.map((st, i) => (
            <div key={i} style={s.statItem}>
              <span style={s.statValue}>{st.value}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ════════════════ WHY DRIVEGUARD ════════════════ */}
      <section id="about" style={s.sectionWhite}>
        <AnimatedSection style={s.sectionInner}>
          <div style={s.whyGrid}>
            {/* Left: text */}
            <div style={s.whyText}>
              <div style={s.sectionPill}>WHY DRIVEGUARD</div>
              <h2 style={s.sectionTitle}>The Road to<br /><span style={s.titleGradient}>Absolute Safety</span></h2>
              <p style={s.sectionSub}>
                Driver fatigue accounts for over <strong>20% of fatal road accidents</strong> globally.
                DriveGuard addresses this critical problem using advanced AI computer vision to
                analyze your alertness in real time — preventing accidents before they happen.
              </p>
              <button onClick={() => navigate('/register')} style={{...s.btnPrimary, marginTop:'2rem', width:'fit-content'}}>
                Start Free Today →
              </button>
            </div>

            {/* Right: why cards */}
            <div style={s.whyCards}>
              {whyItems.map((w, i) => (
                <div key={i} style={s.whyCard}>
                  <div style={{...s.whyIconBox, background: w.bg}}>
                    {w.icon}
                  </div>
                  <div>
                    <h4 style={s.whyCardTitle}>{w.title}</h4>
                    <p style={s.whyCardDesc}>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" style={s.sectionLight}>
        <AnimatedSection style={s.sectionInner}>
          <div style={s.sectionCenter}>
            <div style={s.sectionPill}>PREMIUM FEATURES</div>
            <h2 style={s.sectionTitle}>
              Everything You Need to<br />
              <span style={s.titleGradient}>Drive Safely</span>
            </h2>
            <p style={s.sectionSub}>
              A complete AI-powered safety suite built for modern drivers.
            </p>
          </div>

          <div style={s.featGrid}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  ...s.featCard,
                  transform: hoveredFeature === i ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredFeature === i
                    ? '0 28px 56px -14px rgba(37,99,235,0.16), 0 10px 24px -6px rgba(0,0,0,0.08)'
                    : '0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
                  borderColor: hoveredFeature === i ? 'rgba(37,99,235,0.22)' : 'rgba(226,232,240,1)',
                  background: hoveredFeature === i
                    ? 'linear-gradient(180deg, #ffffff 0%, rgba(239,246,255,0.5) 100%)'
                    : '#ffffff',
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{...s.featIcon, background: f.gradient}}>{f.icon}</div>
                <h3 style={s.featTitle}>{f.title}</h3>
                <p style={s.featDesc}>{f.desc}</p>
                <div style={{
                  ...s.featLearnMore,
                  opacity: hoveredFeature === i ? 1 : 0,
                  transform: hoveredFeature === i ? 'translateY(0)' : 'translateY(6px)',
                }}>Learn more →</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how-it-works" style={s.sectionWhite}>
        <AnimatedSection style={s.sectionInner}>
          <div style={s.sectionCenter}>
            <div style={s.sectionPill}>HOW IT WORKS</div>
            <h2 style={s.sectionTitle}>
              Up and Running in<br />
              <span style={s.titleGradient}>4 Simple Steps</span>
            </h2>
            <p style={s.sectionSub}>
              A seamless, fully automated safety experience from registration to real-time alerts.
            </p>
          </div>

          <div style={s.timelineRow}>
            {/* Connector line */}
            <div style={s.timelineLine} />

            {timeline.map((step, i) => (
              <div key={i} style={s.timelineItem}>
                <div style={s.timelineNumWrapper}>
                  <div style={s.timelineNum}>{step.num}</div>
                </div>
                <div style={s.timelineContent}>
                  <h4 style={s.timelineTitle}>{step.title}</h4>
                  <p style={s.timelineDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════ DASHBOARD PREVIEW ════════════════ */}
      <section style={s.sectionDash}>
        {/* Background glow */}
        <div style={s.dashGlow} />
        <div style={s.dashGlowGreen} />
        <div style={s.dashGlowBlueAccent} />

        <AnimatedSection style={s.sectionInner}>
          <div style={s.sectionCenter}>
            <div style={s.sectionPill}>APP PREVIEW</div>
            <h2 style={s.sectionTitle}>
              A Beautifully Crafted<br />
              <span style={s.titleGradient}>Safety Dashboard</span>
            </h2>
            <p style={s.sectionSub}>
              Manage all your safety metrics with absolute clarity. Clean, powerful, and built for speed.
            </p>
          </div>

          {/* Mac-style browser window */}
          <div style={s.browserWrap}>
            {/* Browser chrome */}
            <div style={s.browserChrome}>
              <div style={s.chromeDots}>
                {['#EF4444','#F59E0B','#10B981'].map(c => (
                  <span key={c} style={{...s.chromeDot, background:c}} />
                ))}
              </div>
              <div style={s.chromeUrl}>
                <span style={{color:'#10B981',marginRight:'4px',fontSize:'0.7rem'}}>🔒</span>
                app.driveguard.com/dashboard
              </div>
              <div style={s.chromeActions}>
                {['⋯','↗'].map((a,i) => (
                  <span key={i} style={s.chromeAction}>{a}</span>
                ))}
              </div>
            </div>

            {/* App body */}
            <div style={s.appBody}>
              {/* Sidebar */}
              <div style={s.appSidebar}>
                <div style={s.appLogo}>
                  <div style={s.appLogoIcon}><Icons.Eye size={12} color="#fff" /></div>
                  <span style={{fontWeight:'800',fontSize:'0.85rem',color:'#1e293b',letterSpacing:'-0.02em'}}>DriveGuard</span>
                </div>
                {['Dashboard','Live Monitoring','Alert History','Reports','Profile'].map((n,i) => (
                  <div key={i} style={{
                    ...s.appNavItem,
                    ...(i===0 ? s.appNavItemActive : {}),
                  }}>{n}</div>
                ))}
                <div style={s.appSidebarSpacer} />
                <div style={s.appSidebarUser}>
                  <div style={s.appUserAvatar}>D</div>
                  <div>
                    <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#1e293b'}}>Driver</div>
                    <div style={{fontSize:'0.65rem',color:'#64748B'}}>Account Owner</div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div style={s.appMain}>
                {/* Topbar */}
                <div style={s.appTopbar}>
                  <span style={s.appPageTitle}>Dashboard Overview</span>
                  <div style={s.appTopbarRight}>
                    <div style={s.appStatusPill}>
                      <span style={{...s.appStatusDot, background:'#10B981'}} />
                      SYSTEM SECURE
                    </div>
                    <div style={s.appDateChip}>Sat, Jul 5</div>
                  </div>
                </div>

                {/* Hero banner */}
                <div style={s.appHeroBanner}>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:'800',color:'#1e293b',marginBottom:'2px'}}>Welcome back, Driver 👋</div>
                    <div style={{fontSize:'0.75rem',color:'#64748B'}}>AI Driver Safety Assistant</div>
                  </div>
                  <div style={s.appHeroMetrics}>
                    {[{l:'Driver Status',v:'✅ Safe',c:'#10B981'},{l:'Monitoring',v:'INACTIVE',c:'#64748B'},{l:'Risk Level',v:'LOW',c:'#10B981'}].map((m,i)=>(
                      <div key={i} style={s.appMetricItem}>
                        <span style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.7)',textTransform:'uppercase',fontWeight:'700'}}>{m.l}</span>
                        <span style={{fontSize:'0.8rem',fontWeight:'800',color:'#fff'}}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                  <button style={s.appStartBtn}>▶ Start Monitoring</button>
                </div>

                {/* Stats row */}
                <div style={s.appStatsRow}>
                  {[
                    {title:'Driver Status',value:'SAFE',color:'#10B981'},
                    {title:'Monitoring',value:'STANDBY',color:'#64748B'},
                    {title:"Today's Alerts",value:'0',color:'#1e293b'},
                    {title:'Last Detection',value:'—',color:'#1e293b'},
                  ].map((card,i)=>(
                    <div key={i} style={s.appStatCard}>
                      <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#94A3B8',textTransform:'uppercase',marginBottom:'4px'}}>{card.title}</div>
                      <div style={{fontSize:'1.1rem',fontWeight:'800',color:card.color}}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom section */}
                <div style={s.appBottomGrid}>
                  {/* Safety Recs */}
                  <div style={s.appCard}>
                    <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1e293b',marginBottom:'8px'}}>Safety Recommendations</div>
                    {['Stay hydrated during long drives.','Take breaks every 2 hours.','Avoid driving when exhausted.'].map((r,i)=>(
                      <div key={i} style={s.appRecItem}>
                        <Icons.Check size={11} color="#10B981" />
                        <span style={{fontSize:'0.65rem',color:'#64748B'}}>{r}</span>
                      </div>
                    ))}
                  </div>
                  {/* Camera placeholder */}
                  <div style={s.appCamCard}>
                    <Icons.Eye size={28} color="rgba(226,232,240,0.8)" />
                    <div style={{fontSize:'0.65rem',color:'#94A3B8',marginTop:'4px',fontWeight:'600'}}>Camera Offline</div>
                    <div style={{...s.appStartBtn, marginTop:'8px', fontSize:'0.65rem', padding:'4px 10px'}}>Start →</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════ CTA BANNER ════════════════ */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <div style={s.ctaGlowCorner} />
        <AnimatedSection style={s.ctaInner}>
          <div style={s.ctaCard}>
            <h2 style={s.ctaTitle}>Ready to Drive Smarter?</h2>
            <p style={s.ctaDesc}>
              Join DriveGuard today and experience AI-powered driver safety monitoring designed to help
              reduce fatigue-related accidents and improve road safety.
            </p>
            <div style={s.ctaButtons}>
              <button onClick={() => navigate('/register')} style={s.ctaBtn}>
                Create Account
              </button>
              <button onClick={() => navigate('/login')} style={s.ctaBtnOutline}>
                Sign In
              </button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer id="contact" style={s.footer}>
        <div style={s.footerInner}>
          {/* Brand col */}
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>
              <div style={s.logoBox}><Icons.Eye size={16} color="#fff" /></div>
              <span style={{...s.brandName, color:'#1e293b'}}>DriveGuard</span>
            </div>
            <p style={s.footerDesc}>
              AI-Based Driver Drowsiness Monitoring and Alert Management System built to protect every driver on every road.
            </p>
            <div style={s.footerSocials}>
              {[<Icons.Github size={18} color="#64748B" />, <Icons.Twitter size={18} color="#64748B" />, <Icons.Mail size={18} color="#64748B" />].map((ic,i)=>(
                <a key={i} href="#" style={s.socialIcon}>{ic}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { heading: 'Quick Links', links: ['Features','How It Works','About'] },
            { heading: 'Legal',      links: ['Privacy Policy','Terms of Service','Cookies'] },
            { heading: 'Connect',    links: ['Contact Us','GitHub','Email Us'] },
          ].map((col, i) => (
            <div key={i} style={s.footerCol}>
              <h4 style={s.footerColTitle}>{col.heading}</h4>
              {col.links.map(l => (
                <a key={l} href="#" style={s.footerLink}>{l}</a>
              ))}
            </div>
          ))}
        </div>

        <div style={s.footerBottom}>
          <span>© {new Date().getFullYear()} DriveGuard. All rights reserved.</span>
          <span style={{color:'#94A3B8'}}>Built with ❤️ for driver safety</span>
        </div>
      </footer>
    </div>
  );
};

/* ── Page-level styles ──────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight:'100vh', display:'flex', flexDirection:'column',
    backgroundColor:'#ffffff', color:'#1E293B',
    fontFamily:"'Inter', system-ui, -apple-system, sans-serif",
    overflowX:'hidden', position:'relative',
  },

  /* Background decorators — enhanced depth */
  bgDot: {
    position:'fixed', top:0, left:0, width:'100%', height:'100%',
    backgroundImage:'radial-gradient(rgba(37,99,235,0.06) 1px, transparent 1px)',
    backgroundSize:'26px 26px', opacity:1, zIndex:0, pointerEvents:'none',
  },
  bgBlue: {
    position:'fixed', top:'-15%', left:'-12%', width:'55vw', height:'55vw',
    background:'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:0, pointerEvents:'none',
    animation:'orbPulse 12s ease-in-out infinite',
  },
  bgGreen: {
    position:'fixed', top:'30%', right:'-15%', width:'45vw', height:'45vw',
    background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:0, pointerEvents:'none',
    animation:'orbPulse 15s ease-in-out infinite 4s',
  },
  bgIndigo: {
    position:'fixed', bottom:'-10%', left:'20%', width:'50vw', height:'30vw',
    background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:0, pointerEvents:'none',
  },
  bgCyanExtra: {
    position:'fixed', top:'60%', right:'5%', width:'30vw', height:'30vw',
    background:'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:0, pointerEvents:'none',
    filter:'blur(20px)',
    animation:'orbPulse 18s ease-in-out infinite 6s',
  },
  bgPinkExtra: {
    position:'fixed', top:'10%', right:'30%', width:'25vw', height:'25vw',
    background:'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:0, pointerEvents:'none',
    filter:'blur(30px)',
  },

  /* ── Navbar */
  nav: {
    position:'fixed', top:0, left:0, right:0, height:'68px', zIndex:1000,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'0 5%', transition:'all 0.35s cubic-bezier(0.22,1,0.36,1)',
  },
  brand: { display:'flex', alignItems:'center', gap:'0.75rem', textDecoration:'none' },
  logoBox: {
    width:'36px', height:'36px', borderRadius:'10px',
    background:'linear-gradient(135deg, #2563EB, #60A5FA)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 12px rgba(37,99,235,0.35)',
  },
  brandName: {
    fontSize:'1.25rem', fontWeight:'800', letterSpacing:'-0.03em', color:'#1E293B',
  },
  navLinks: { display:'flex', gap:'0.25rem', alignItems:'center' },
  navLink: {
    background:'none', border:'none', cursor:'pointer',
    color:'#64748B', fontWeight:'500', fontSize:'0.9rem',
    padding:'0.5rem 0.875rem', borderRadius:'8px',
    transition:'all 0.2s ease', fontFamily:'inherit',
  },
  navCta: { display:'flex', alignItems:'center', gap:'0.75rem' },
  loginBtn: {
    background:'none', border:'none', cursor:'pointer',
    fontWeight:'600', color:'#475569', fontSize:'0.9rem',
    padding:'0.5rem 0.875rem', borderRadius:'8px',
    transition:'color 0.2s ease', fontFamily:'inherit',
  },
  registerBtn: {
    padding:'0.6rem 1.375rem',
    background:'linear-gradient(135deg, #2563EB, #3B82F6)',
    color:'#fff', borderRadius:'99px', fontWeight:'700', fontSize:'0.9rem',
    border:'none', cursor:'pointer',
    boxShadow:'0 6px 18px rgba(37,99,235,0.35)',
    transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)', fontFamily:'inherit',
  },

  /* ── Hero */
  hero: {
    position:'relative', zIndex:1, minHeight:'100vh',
    display:'flex', alignItems:'center', paddingTop:'68px',
  },
  heroInner: {
    maxWidth:'1320px', margin:'0 auto', padding:'4rem 5%',
    display:'flex', alignItems:'center', gap:'4rem', flexWrap:'wrap',
  },
  heroLeft: {
    flex:'1 1 440px', display:'flex', flexDirection:'column',
    animation:'fadeUp 0.8s ease both',
  },
  heroRight: {
    flex:'1 1 520px', display:'flex', justifyContent:'center', alignItems:'center',
    animation:'fadeUp 0.8s ease 0.2s both',
  },
  heroBadge: {
    alignSelf:'flex-start', display:'inline-flex', alignItems:'center',
    padding:'0.4rem 1.125rem',
    background:'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))',
    border:'1px solid rgba(37,99,235,0.18)',
    borderRadius:'999px', fontSize:'0.72rem', fontWeight:'800',
    letterSpacing:'0.07em', color:'#2563EB', marginBottom:'1.75rem',
  },
  heroTitle: {
    fontSize:'4rem', fontWeight:'900', lineHeight:'1.06',
    letterSpacing:'-0.05em', color:'#0F172A', marginBottom:'1.5rem',
  },
  heroTitleAccent: {
    background:'linear-gradient(135deg,#2563EB,#60A5FA)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
  },
  heroDesc: {
    fontSize:'1.1rem', color:'#64748B', lineHeight:'1.75', marginBottom:'2.5rem',
    maxWidth:'540px',
  },
  heroButtons: { display:'flex', gap:'1rem', marginBottom:'2.25rem', flexWrap:'wrap' },
  btnPrimary: {
    padding:'0.9rem 2.25rem',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    color:'#fff', borderRadius:'99px', fontSize:'1rem', fontWeight:'700',
    border:'none', cursor:'pointer',
    boxShadow:'0 12px 28px -6px rgba(37,99,235,0.5)',
    transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)', fontFamily:'inherit',
    display:'flex', alignItems:'center',
  },
  btnOutline: {
    padding:'0.9rem 2rem',
    background:'#ffffff', color:'#1E293B',
    borderRadius:'99px', fontSize:'1rem', fontWeight:'600',
    border:'1px solid rgba(226,232,240,1)',
    boxShadow:'0 4px 12px rgba(0,0,0,0.05)',
    transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)', fontFamily:'inherit',
    cursor:'pointer', display:'flex', alignItems:'center',
  },
  trustRow: { display:'flex', gap:'1.5rem', flexWrap:'wrap' },
  trustBadge: {
    display:'flex', alignItems:'center', gap:'0.5rem',
    fontSize:'0.82rem', color:'#475569', fontWeight:'600',
  },
  checkCircle: {
    width:'18px', height:'18px', borderRadius:'50%',
    background:'linear-gradient(135deg,#10B981,#34D399)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 2px 6px rgba(16,185,129,0.3)', flexShrink:0,
  },

  /* ── Stats band */
  statsBand: {
    position:'relative', zIndex:1,
    borderTop:'1px solid rgba(226,232,240,0.8)',
    borderBottom:'1px solid rgba(226,232,240,0.8)',
    background:'rgba(248,250,252,0.92)', backdropFilter:'blur(10px)',
  },
  statsInner: {
    maxWidth:'1000px', margin:'0 auto', padding:'2.5rem 5%',
    display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:'1.5rem',
  },
  statItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  statValue: {
    fontSize:'2.2rem', fontWeight:'900', letterSpacing:'-0.04em',
    background:'linear-gradient(135deg,#2563EB,#10B981)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
  },
  statLabel: { fontSize:'0.8rem', fontWeight:'600', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em' },

  /* ── Section commons */
  sectionWhite: { position:'relative', zIndex:1, backgroundColor:'#ffffff', padding:'7rem 5%' },
  sectionLight: { position:'relative', zIndex:1, backgroundColor:'#F8FAFC', padding:'7rem 5%' },
  sectionDash:  { position:'relative', zIndex:1, backgroundColor:'#F8FAFC', padding:'7rem 5% 8rem 5%', overflow:'hidden' },
  sectionInner: { maxWidth:'1200px', margin:'0 auto', position:'relative', zIndex:2 },
  sectionCenter: { textAlign:'center', maxWidth:'600px', margin:'0 auto 5rem auto' },
  sectionPill: {
    display:'inline-block', padding:'0.35rem 1rem',
    background:'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))',
    border:'1px solid rgba(37,99,235,0.15)',
    borderRadius:'99px', fontSize:'0.72rem', fontWeight:'800',
    letterSpacing:'0.08em', color:'#2563EB', marginBottom:'1.25rem',
  },
  sectionTitle: {
    fontSize:'2.6rem', fontWeight:'900', letterSpacing:'-0.04em',
    color:'#0F172A', marginBottom:'1.25rem', lineHeight:'1.1',
  },
  titleGradient: {
    background:'linear-gradient(135deg,#2563EB,#10B981)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
  },
  sectionSub: { fontSize:'1.05rem', color:'#64748B', lineHeight:'1.7' },

  /* ── Why DriveGuard */
  whyGrid: { display:'flex', gap:'5rem', flexWrap:'wrap', alignItems:'center' },
  whyText: { flex:'1 1 380px' },
  whyCards: { flex:'1 1 460px', display:'flex', flexDirection:'column', gap:'1.25rem' },
  whyCard: {
    display:'flex', alignItems:'flex-start', gap:'1.25rem', padding:'1.75rem',
    background:'#ffffff', borderRadius:'22px',
    border:'1px solid rgba(226,232,240,0.8)',
    boxShadow:'0 4px 16px rgba(0,0,0,0.04)',
    transition:'all 0.3s cubic-bezier(0.22,1,0.36,1)',
  },
  whyIconBox: {
    width:'52px', height:'52px', borderRadius:'15px', flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 8px 18px rgba(0,0,0,0.12)',
  },
  whyCardTitle: { fontSize:'1.05rem', fontWeight:'700', color:'#1E293B', marginBottom:'0.375rem' },
  whyCardDesc: { fontSize:'0.9rem', color:'#64748B', lineHeight:'1.6' },

  /* ── Features — enhanced */
  featGrid: {
    display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'2rem',
  },
  featCard: {
    background:'#ffffff', padding:'2.75rem', borderRadius:'28px',
    border:'1px solid rgba(226,232,240,1)',
    transition:'all 0.35s cubic-bezier(0.22,1,0.36,1)',
    cursor:'default', position:'relative', overflow:'hidden',
  },
  featIcon: {
    width:'64px', height:'64px', borderRadius:'18px',
    display:'flex', alignItems:'center', justifyContent:'center',
    marginBottom:'1.75rem',
    boxShadow:'0 12px 28px -6px rgba(0,0,0,0.14)',
  },
  featTitle: { fontSize:'1.15rem', fontWeight:'700', color:'#1E293B', marginBottom:'0.75rem' },
  featDesc: { fontSize:'0.92rem', color:'#64748B', lineHeight:'1.7' },
  featLearnMore: {
    marginTop:'1.25rem', fontSize:'0.875rem', fontWeight:'700', color:'#2563EB',
    transition:'all 0.3s ease',
  },

  /* ── How it works timeline */
  timelineRow: {
    display:'flex', justifyContent:'space-between', gap:'2rem',
    position:'relative', flexWrap:'wrap',
  },
  timelineLine: {
    position:'absolute', top:'32px', left:'5%', right:'5%', height:'2px',
    background:'linear-gradient(90deg, rgba(226,232,240,0.5), #2563EB 30%, #10B981 70%, rgba(226,232,240,0.5))',
    zIndex:0,
  },
  timelineItem: {
    flex:'1 1 200px', display:'flex', flexDirection:'column', alignItems:'center',
    textAlign:'center', position:'relative', zIndex:1,
  },
  timelineNumWrapper: {
    width:'64px', height:'64px', borderRadius:'50%',
    background:'#ffffff', border:'3px solid rgba(37,99,235,0.3)',
    display:'flex', alignItems:'center', justifyContent:'center',
    marginBottom:'1.5rem',
    boxShadow:'0 8px 24px rgba(37,99,235,0.15)',
  },
  timelineNum: {
    fontSize:'1.2rem', fontWeight:'900', letterSpacing:'-0.04em',
    background:'linear-gradient(135deg,#2563EB,#10B981)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
  },
  timelineContent: {},
  timelineTitle: { fontSize:'1.05rem', fontWeight:'700', color:'#1E293B', marginBottom:'0.5rem' },
  timelineDesc: { fontSize:'0.875rem', color:'#64748B', lineHeight:'1.6', maxWidth:'180px', margin:'0 auto' },

  /* ── Dashboard preview — enhanced */
  dashGlow: {
    position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
    width:'90%', height:'90%',
    background:'radial-gradient(circle, rgba(37,99,235,0.09) 0%, rgba(16,185,129,0.06) 40%, transparent 75%)',
    filter:'blur(70px)', zIndex:0, pointerEvents:'none',
  },
  dashGlowGreen: {
    position:'absolute', bottom:'-10%', right:'-5%', width:'40%', height:'60%',
    background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    filter:'blur(50px)', zIndex:0, pointerEvents:'none',
  },
  dashGlowBlueAccent: {
    position:'absolute', top:'-5%', left:'10%', width:'35%', height:'50%',
    background:'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
    filter:'blur(45px)', zIndex:0, pointerEvents:'none',
  },
  browserWrap: {
    width:'100%', maxWidth:'1140px', margin:'0 auto',
    borderRadius:'18px', overflow:'hidden',
    boxShadow:'0 50px 100px -24px rgba(15,23,42,0.2), 0 12px 24px rgba(37,99,235,0.06), 0 4px 8px rgba(0,0,0,0.04)',
    border:'1px solid rgba(226,232,240,0.8)',
  },
  browserChrome: {
    height:'50px', background:'#f1f5f9', borderBottom:'1px solid rgba(226,232,240,0.8)',
    display:'flex', alignItems:'center', padding:'0 1.25rem', gap:'1.25rem',
  },
  chromeDots: { display:'flex', gap:'7px', flexShrink:0 },
  chromeDot: { width:'13px', height:'13px', borderRadius:'50%', display:'block' },
  chromeUrl: {
    flex:1, maxWidth:'360px', margin:'0 auto', textAlign:'center',
    fontSize:'0.8rem', color:'#64748B', background:'#ffffff',
    padding:'0.35rem 0.875rem', borderRadius:'8px',
    border:'1px solid rgba(226,232,240,0.8)', fontWeight:'500',
  },
  chromeActions: { display:'flex', gap:'0.5rem', marginLeft:'auto' },
  chromeAction: { fontSize:'0.9rem', color:'#94A3B8', cursor:'pointer', padding:'0 4px' },
  appBody: { display:'flex', height:'580px', background:'#ffffff' },
  appSidebar: {
    width:'210px', borderRight:'1px solid #e2e8f0', background:'#f8fafc',
    padding:'1.25rem', display:'flex', flexDirection:'column', gap:'4px', flexShrink:0,
  },
  appLogo: { display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.75rem' },
  appLogoIcon: {
    width:'26px', height:'26px', borderRadius:'7px',
    background:'linear-gradient(135deg,#2563EB,#60A5FA)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  appNavItem: {
    padding:'0.6rem 0.875rem', borderRadius:'8px', fontSize:'0.8rem',
    fontWeight:'600', color:'#64748B', transition:'all 0.15s', cursor:'pointer',
  },
  appNavItemActive: {
    background:'rgba(37,99,235,0.08)', color:'#2563EB', borderLeft:'3px solid #2563EB',
    paddingLeft:'calc(0.875rem - 3px)',
  },
  appSidebarSpacer: { flex:1 },
  appSidebarUser: {
    display:'flex', alignItems:'center', gap:'0.625rem',
    padding:'0.875rem', borderRadius:'10px', background:'#ffffff',
    border:'1px solid #e2e8f0',
  },
  appUserAvatar: {
    width:'32px', height:'32px', borderRadius:'50%',
    background:'rgba(37,99,235,0.1)', color:'#2563EB',
    fontWeight:'800', fontSize:'0.9rem',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  appMain: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#f8fafc' },
  appTopbar: {
    height:'48px', background:'#ffffff', borderBottom:'1px solid #e2e8f0',
    display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', flexShrink:0,
  },
  appPageTitle: { fontSize:'0.85rem', fontWeight:'800', color:'#1e293b' },
  appTopbarRight: { display:'flex', alignItems:'center', gap:'0.75rem' },
  appStatusPill: {
    display:'flex', alignItems:'center', gap:'5px', padding:'0.25rem 0.75rem',
    background:'rgba(16,185,129,0.1)', borderRadius:'99px',
    fontSize:'0.65rem', fontWeight:'800', color:'#10B981', letterSpacing:'0.05em',
  },
  appStatusDot: { width:'6px', height:'6px', borderRadius:'50%', display:'block' },
  appDateChip: {
    fontSize:'0.72rem', fontWeight:'600', color:'#64748B',
    padding:'0.25rem 0.625rem', background:'#f1f5f9',
    borderRadius:'6px', border:'1px solid #e2e8f0',
  },
  appHeroBanner: {
    margin:'1rem 1.25rem', borderRadius:'14px',
    background:'linear-gradient(135deg,#1e3a8a,#2563EB,#3B82F6)',
    padding:'1.25rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap',
    flexShrink:0,
  },
  appHeroMetrics: { display:'flex', gap:'1.5rem', flexGrow:1 },
  appMetricItem: { display:'flex', flexDirection:'column', gap:'2px' },
  appStartBtn: {
    padding:'0.45rem 1rem', background:'rgba(255,255,255,0.15)',
    border:'1px solid rgba(255,255,255,0.3)', color:'#fff',
    borderRadius:'8px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer',
    transition:'all 0.2s ease', fontFamily:'inherit', flexShrink:0,
    backdropFilter:'blur(8px)',
  },
  appStatsRow: {
    display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.75rem',
    padding:'0 1.25rem', flexShrink:0,
  },
  appStatCard: {
    background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'10px',
    padding:'0.875rem', boxShadow:'0 2px 6px rgba(0,0,0,0.02)',
  },
  appBottomGrid: {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem',
    padding:'0.75rem 1.25rem', flex:1, overflow:'hidden',
  },
  appCard: {
    background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'0.875rem',
  },
  appRecItem: {
    display:'flex', alignItems:'center', gap:'6px', padding:'0.375rem 0.5rem',
    background:'#f8fafc', borderRadius:'6px', marginBottom:'4px',
    border:'1px solid #e2e8f0',
  },
  appCamCard: {
    background:'#0f172a', border:'1px solid #1e293b', borderRadius:'10px',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
  },

  /* ── CTA — soft blue gradient with rounded card */
  ctaSection: {
    position:'relative', zIndex:1, overflow:'hidden',
    background:'linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #ecfdf5 100%)',
    padding:'7rem 5%',
  },
  ctaGlow: {
    position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
    width:'60%', height:'120%',
    background:'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
    filter:'blur(50px)', pointerEvents:'none',
  },
  ctaGlowCorner: {
    position:'absolute', bottom:'-20%', right:'-10%', width:'40%', height:'80%',
    background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    filter:'blur(40px)', pointerEvents:'none',
  },
  ctaInner: { maxWidth:'720px', margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 },
  ctaCard: {
    background:'rgba(255,255,255,0.7)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.9)',
    borderRadius:'32px', padding:'4rem 3rem',
    boxShadow:'0 24px 48px -12px rgba(37,99,235,0.1), 0 8px 16px rgba(0,0,0,0.04)',
  },
  ctaTitle: {
    fontSize:'2.75rem', fontWeight:'900', letterSpacing:'-0.04em',
    color:'#0F172A', marginBottom:'1.25rem',
  },
  ctaDesc: { fontSize:'1.1rem', color:'#64748B', lineHeight:'1.7', marginBottom:'2.5rem' },
  ctaButtons: { display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' },
  ctaBtn: {
    padding:'1rem 2.5rem',
    background:'linear-gradient(135deg,#2563EB,#3B82F6)',
    color:'#fff', borderRadius:'99px', fontSize:'1rem', fontWeight:'700',
    border:'none', cursor:'pointer',
    boxShadow:'0 12px 28px rgba(37,99,235,0.4)', transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)',
    fontFamily:'inherit',
  },
  ctaBtnOutline: {
    padding:'1rem 2rem', background:'#ffffff', color:'#1E293B',
    borderRadius:'99px', fontSize:'1rem', fontWeight:'600',
    border:'1px solid rgba(226,232,240,1)',
    boxShadow:'0 4px 12px rgba(0,0,0,0.05)',
    cursor:'pointer', transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)', fontFamily:'inherit',
  },

  /* ── Footer */
  footer: {
    background:'#ffffff', borderTop:'1px solid rgba(226,232,240,0.8)',
    padding:'5rem 5% 2.5rem 5%', position:'relative', zIndex:1,
  },
  footerInner: {
    maxWidth:'1200px', margin:'0 auto', display:'flex', flexWrap:'wrap',
    gap:'4rem', marginBottom:'4rem',
  },
  footerBrand: { flex:'1 1 280px', maxWidth:'320px' },
  footerLogo: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' },
  footerDesc: { fontSize:'0.9rem', color:'#64748B', lineHeight:'1.7', marginBottom:'1.5rem' },
  footerSocials: { display:'flex', gap:'0.875rem' },
  socialIcon: {
    width:'38px', height:'38px', borderRadius:'10px',
    background:'#f1f5f9', border:'1px solid #e2e8f0',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all 0.2s ease', textDecoration:'none',
  },
  footerCol: { display:'flex', flexDirection:'column', gap:'1rem', minWidth:'120px' },
  footerColTitle: { fontSize:'0.875rem', fontWeight:'800', color:'#1E293B', marginBottom:'0.25rem' },
  footerLink: {
    fontSize:'0.9rem', color:'#64748B', textDecoration:'none',
    fontWeight:'500', transition:'color 0.2s ease',
  },
  footerBottom: {
    maxWidth:'1200px', margin:'0 auto', paddingTop:'2rem',
    borderTop:'1px solid rgba(226,232,240,0.7)',
    display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
    fontSize:'0.85rem', color:'#64748B',
  },
};
