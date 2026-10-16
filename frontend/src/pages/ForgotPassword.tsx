import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '@/api/auth';
import { ApiError } from '@/api/client';
import gsap from 'gsap';

const BRAND = {
  orange: '#D98327',
  emerald: '#186049',
  darkbg: '#10271F',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
};

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setSent(true); // Always show neutral response on error too
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.ivory, padding: '24px 16px' }}>
      <div ref={cardRef} style={{ width: '100%', maxWidth: 420, background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 'clamp(28px, 5vw, 48px)', boxShadow: '0 4px 24px rgba(23,35,29,0.08)' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: BRAND.muted, textDecoration: 'none', marginBottom: 28, fontWeight: 500 }}>
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        <div style={{ width: 48, height: 48, borderRadius: 14, background: BRAND.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Mail size={22} color="#fff" />
        </div>

        {sent ? (
          <>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={24} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, margin: '0 0 10px' }}>Check your email</h2>
            <p style={{ fontSize: 14, color: BRAND.muted, lineHeight: 1.6, margin: '0 0 24px' }}>
              If an account with <strong>{email}</strong> exists, we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <p style={{ fontSize: 13, color: BRAND.muted, margin: '0 0 24px', padding: '12px 14px', background: '#FDF6EC', border: `1px solid rgba(217,131,39,0.3)`, borderRadius: 10 }}>
              <strong>Development mode:</strong> The reset link is printed to the backend console. Check your server logs.
            </p>
            <Link to="/login" style={{ display: 'block', width: '100%', padding: '12px', background: BRAND.orange, border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px' }}>Forgot password?</h2>
            <p style={{ fontSize: 14, color: BRAND.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }} role="alert">
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <label style={{ display: 'block', marginBottom: 20 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 6 }}>Email address</span>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" placeholder="you@example.com" required
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                />
              </label>

              <button
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? '#B86E18' : BRAND.orange, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#B86E18'); }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = BRAND.orange); }}
              >
                {loading ? 'Sending…' : <><Mail size={16} /> Send reset link</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
