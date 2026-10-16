import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/api/auth';
import { ApiError } from '@/api/client';
import gsap from 'gsap';

const BRAND = {
  orange: '#D98327',
  emerald: '#186049',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
};

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
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
    if (!password || !confirm) { setError('Please fill in both fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!token) { setError('Invalid reset link. Please request a new one.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
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
      <div ref={cardRef} style={{ width: '100%', maxWidth: 420, background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 'clamp(28px, 5vw, 48px)', boxShadow: '0 4px 24px rgba(23,35,29,0.08)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: BRAND.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          {done ? <CheckCircle2 size={24} color="#fff" /> : <KeyRound size={22} color="#fff" />}
        </div>

        {done ? (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, margin: '0 0 10px' }}>Password updated!</h2>
            <p style={{ fontSize: 14, color: BRAND.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '12px', background: BRAND.orange, border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, transition: 'background 0.2s' }}
            >
              Go to sign in
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px' }}>Set new password</h2>
            <p style={{ fontSize: 14, color: BRAND.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
              Choose a strong password for your account.
            </p>

            {!token && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }} role="alert">
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#DC2626' }}>Invalid reset link. Please request a new one.</span>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }} role="alert">
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>New password</span>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" placeholder="••••••••" required
                    style={{ width: '100%', padding: '10px 42px 10px 14px', border: `1px solid ${BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                    onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide' : 'Show'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: BRAND.muted, padding: 0, display: 'flex' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label style={{ display: 'block', marginBottom: 20 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.ink, marginBottom: 5 }}>Confirm password</span>
                <input
                  type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password" placeholder="••••••••" required
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${confirm && confirm !== password ? '#EF4444' : BRAND.border}`, borderRadius: 10, fontSize: 15, color: BRAND.ink, background: BRAND.ivory, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.orange)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                />
              </label>

              <button
                type="submit" disabled={loading || !token}
                style={{ width: '100%', padding: '12px', background: loading ? '#B86E18' : BRAND.orange, border: 'none', borderRadius: 10, cursor: loading || !token ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
              >
                {loading ? 'Updating…' : <><KeyRound size={16} /> Update password</>}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: BRAND.muted, marginTop: 20 }}>
              <Link to="/forgot-password" style={{ color: BRAND.orange, textDecoration: 'none', fontWeight: 500 }}>Request a new link</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
