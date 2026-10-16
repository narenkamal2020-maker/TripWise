import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import gsap from 'gsap';

const BRAND = {
  orange: '#D98327',
  sand: '#ECE8AF',
  emerald: '#186049',
  darkbg: '#10271F',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
  green: '#4A943F',
};

function passwordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: '#E3E6DD' };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score <= 3) return { score, label: 'Good', color: BRAND.orange };
  return { score, label: 'Strong', color: BRAND.green };
}

export function Register() {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  const strength = passwordStrength(password);
  const reqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agreed) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.ivory, padding: '24px 16px' }}>
      <div ref={cardRef} style={{
        width: '100%', maxWidth: 480,
        background: '#fff', border: `1px solid ${BRAND.border}`,
        borderRadius: 20, padding: 'clamp(28px, 5vw, 48px)',
        boxShadow: '0 4px 24px rgba(23,35,29,0.08)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: BRAND.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke={BRAND.orange} strokeWidth="1.5" />
              <path d="M8 4v8M4 8h8" stroke={BRAND.orange} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 19, fontWeight: 700, color: BRAND.ink }}>
            Trip<em style={{ fontStyle: 'normal', color: BRAND.orange }}>Wise</em>
          </span>
        </Link>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: BRAND.ink, margin: '0 0 6px' }}>Create your account</h2>
        <p style={{ fontSize: 14, color: BRAND.muted, margin: '0 0 24px' }}>Start planning remarkable journeys.</p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }} role="alert">
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>Full name</span>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              autoComplete="name" placeholder="Your name" required
              style={{ width: '100%', padding: '10px 14px', border: `1px solid ${BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
              onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
            />
          </label>

          {/* Email */}
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>Email address</span>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" placeholder="you@example.com" required
              style={{ width: '100%', padding: '10px 14px', border: `1px solid ${BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
              onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
            />
          </label>

          {/* Password */}
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" placeholder="••••••••" required
                style={{ width: '100%', padding: '10px 42px 10px 14px', border: `1px solid ${BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: BRAND.muted, padding: 0, display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* Strength bar */}
          {password && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : '#E3E6DD', transition: 'background 0.3s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {reqs.map((r) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={11} color={r.met ? BRAND.green : '#D0D9D4'} />
                    <span style={{ fontSize: 11, color: r.met ? BRAND.green : BRAND.muted }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>Confirm password</span>
            <input
              type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password" placeholder="••••••••" required
              style={{ width: '100%', padding: '10px 14px', border: `1px solid ${confirm && confirm !== password ? '#EF4444' : BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.target.style.borderColor = confirm !== password ? '#EF4444' : BRAND.orange)}
              onBlur={(e) => (e.target.style.borderColor = confirm && confirm !== password ? '#EF4444' : BRAND.border)}
            />
            {confirm && confirm !== password && (
              <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>Passwords don't match</span>
            )}
          </label>

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 22, cursor: 'pointer' }}>
            <input
              type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3, accentColor: BRAND.orange, width: 15, height: 15, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: BRAND.muted, lineHeight: 1.5 }}>
              I agree to the{' '}
              <Link to="/terms" style={{ color: BRAND.orange, textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: BRAND.orange, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
            </span>
          </label>

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#B86E18' : BRAND.orange, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#B86E18'); }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = BRAND.orange); }}
          >
            {loading ? 'Creating account…' : <><UserPlus size={16} /> Create account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: BRAND.muted, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: BRAND.orange, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
