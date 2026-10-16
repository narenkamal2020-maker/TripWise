import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      );
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.out' },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
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
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: BRAND.ivory,
      }}
    >
      {/* Left hero panel — hidden on mobile */}
      <div
        ref={heroRef}
        style={{
          flex: '0 0 45%',
          background: `linear-gradient(160deg, ${BRAND.darkbg} 0%, ${BRAND.emerald} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
        aria-hidden="true"
      >
        {/* Decorative grid */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
          viewBox="0 0 400 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="white" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="white" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Brand */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke={BRAND.orange} strokeWidth="1.5" />
                <path d="M8 4v8M4 8h8" stroke={BRAND.orange} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '0.08em',
              color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Trip<em style={{ fontStyle: 'normal', color: BRAND.orange }}>Wise</em>
            </span>
          </Link>
        </div>

        {/* Hero copy */}
        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(217,131,39,0.18)',
            border: `1px solid rgba(217,131,39,0.4)`,
            borderRadius: 20, padding: '4px 12px',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: BRAND.sand, textTransform: 'uppercase' }}>
              Smart Travel Planning
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 3.2vw, 42px)',
            fontWeight: 700, lineHeight: 1.12,
            color: '#fff', margin: '0 0 16px',
            fontFamily: '"Playfair Display", Georgia, serif',
          }}>
            Explore the world,<br />
            <em style={{ color: BRAND.sand, fontStyle: 'italic' }}>one place at a time.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, maxWidth: 320 }}>
            Discover remarkable destinations, build personalised itineraries, and travel smarter.
          </p>
        </div>

        {/* Testimonial */}
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, padding: '20px 24px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px', fontStyle: 'italic' }}>
            "TripWise helped me plan an entire month across Southeast Asia — the destination discovery is unmatched."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.sand})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: BRAND.darkbg,
            }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Arjun K.</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>VIT Chennai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div
          ref={cardRef}
          style={{
            width: '100%', maxWidth: 440,
            background: '#fff',
            border: `1px solid ${BRAND.border}`,
            borderRadius: 20,
            padding: 'clamp(28px, 5vw, 48px)',
            boxShadow: '0 4px 24px rgba(23,35,29,0.08)',
          }}
        >
          {/* Logo on mobile */}
          <div className="lg:hidden" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: BRAND.emerald,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke={BRAND.orange} strokeWidth="1.5" />
                <path d="M8 4v8M4 8h8" stroke={BRAND.orange} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 700, color: BRAND.ink }}>
              Trip<em style={{ fontStyle: 'normal', color: BRAND.orange }}>Wise</em>
            </span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 700, color: BRAND.ink, margin: '0 0 6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: BRAND.muted, margin: '0 0 28px' }}>
            Sign in to continue planning your journey.
          </p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            }} role="alert">
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 6 }}>
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '10px 14px',
                  border: `1px solid ${BRAND.border}`, borderRadius: 10,
                  fontSize: 15, color: BRAND.ink, background: BRAND.ivory,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
              />
            </label>

            {/* Password */}
            <label style={{ display: 'block', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.ink }}>Password</span>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 13, color: BRAND.orange, textDecoration: 'none', fontWeight: 500 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    border: `1px solid ${BRAND.border}`, borderRadius: 10,
                    fontSize: 15, color: BRAND.ink, background: BRAND.ivory,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: BRAND.muted, padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div style={{ marginBottom: 24 }} />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#B86E18' : BRAND.orange,
                border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                color: '#fff', fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#B86E18'); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = BRAND.orange); }}
              onMouseDown={(e) => { if (!loading) (e.currentTarget.style.transform = 'scale(0.98)'); }}
              onMouseUp={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: BRAND.muted, marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: BRAND.orange, fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
