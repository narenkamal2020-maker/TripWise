import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, KeyRound, Palette, Bell, Shield, HelpCircle, LogOut, Trash2, Sun, Moon, ChevronRight, CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword, deleteAccount } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useTheme } from '@/context/ThemeContext';
import gsap from 'gsap';

const B = {
  orange: '#D98327',
  sand: '#ECE8AF',
  emerald: '#186049',
  green: '#4A943F',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
  surface: '#FFFFFF',
};

type Section = 'appearance' | 'profile' | 'security' | 'notifications' | 'account';

interface SectionBtn {
  id: Section;
  icon: typeof User;
  label: string;
}

const SECTIONS: SectionBtn[] = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'security', icon: KeyRound, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'account', icon: Shield, label: 'Account' },
];

function StatusPill({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: type === 'success' ? '#ECFDF5' : '#FEF2F2',
      border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
      borderRadius: 8, padding: '8px 12px', marginTop: 12,
    }} role="alert">
      {type === 'success' ? <CheckCircle2 size={14} color="#16A34A" /> : <AlertCircle size={14} color="#DC2626" />}
      <span style={{ fontSize: 13, color: type === 'success' ? '#16A34A' : '#DC2626' }}>{message}</span>
    </div>
  );
}

export function Settings() {
  const { user, logout, setUser } = useAuth();
  const { toggle, isDark } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const contentRef = useRef<HTMLDivElement>(null);

  // Profile
  const [name, setName] = useState(user?.name ?? '');
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, [activeSection]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setProfileStatus({ type: 'error', message: 'Name cannot be empty.' }); return; }
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      const updated = await updateProfile(name.trim());
      setUser(updated);
      setProfileStatus({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to save.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { setPwStatus({ type: 'error', message: 'Fill in all fields.' }); return; }
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', message: 'New passwords don\'t match.' }); return; }
    if (newPw.length < 8) { setPwStatus({ type: 'error', message: 'Password must be at least 8 characters.' }); return; }
    setSavingPw(true);
    setPwStatus(null);
    try {
      await changePassword(currentPw, newPw);
      setPwStatus({ type: 'success', message: 'Password changed.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwStatus({ type: 'error', message: err instanceof ApiError ? err.message : 'Failed to change password.' });
    } finally {
      setSavingPw(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
    } catch {
      setDeleting(false);
    }
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px',
    border: `1px solid ${B.border}`, borderRadius: 10,
    fontSize: 14, color: B.ink, background: B.ivory,
    outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  const labelStyle = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, color: B.ink, marginBottom: 5 };

  return (
    <div style={{ minHeight: '100dvh', background: B.ivory, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top nav */}
      <header style={{ background: 'rgba(250,249,242,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${B.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: B.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <span style={{ color: B.border }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>Settings</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 88 }}>
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', background: activeSection === id ? `${B.orange}12` : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderLeft: `3px solid ${activeSection === id ? B.orange : 'transparent'}`,
                transition: 'background 0.2s',
              }}
            >
              <Icon size={16} color={activeSection === id ? B.orange : B.muted} />
              <span style={{ fontSize: 14, fontWeight: activeSection === id ? 600 : 400, color: activeSection === id ? B.ink : B.muted }}>
                {label}
              </span>
            </button>
          ))}

          <div style={{ borderTop: `1px solid ${B.border}`, marginTop: 4 }}>
            <button
              onClick={logout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={16} color="#EF4444" />
              <span style={{ fontSize: 14, color: '#EF4444' }}>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0 }}>
          {/* PROFILE */}
          {activeSection === 'profile' && (
            <section>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: B.ink, marginBottom: 24, margin: '0 0 24px' }}>Profile</h1>
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${B.orange}, #E89B3F)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 700, color: '#fff',
                  }}>
                    {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: B.ink }}>{user?.name}</div>
                    <div style={{ fontSize: 13, color: B.muted }}>{user?.email}</div>
                  </div>
                </div>

                <form onSubmit={saveProfile}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={labelStyle}>Display name</span>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle}
                      onFocus={(e) => (e.target.style.borderColor = B.orange)}
                      onBlur={(e) => (e.target.style.borderColor = B.border)}
                    />
                  </label>
                  <label style={{ display: 'block', marginBottom: 20 }}>
                    <span style={labelStyle}>Email</span>
                    <input type="email" value={user?.email ?? ''} disabled
                      style={{ ...fieldStyle, background: B.border, color: B.muted, cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: 12, color: B.muted, marginTop: 4, display: 'block' }}>Email cannot be changed.</span>
                  </label>
                  <button type="submit" disabled={savingProfile}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: savingProfile ? '#B86E18' : B.orange, border: 'none', borderRadius: 9, cursor: savingProfile ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 14, fontWeight: 600, transition: 'background 0.2s' }}>
                    <Save size={14} />{savingProfile ? 'Saving…' : 'Save changes'}
                  </button>
                  {profileStatus && <StatusPill {...profileStatus} />}
                </form>
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeSection === 'appearance' && (
            <section>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: B.ink, margin: '0 0 24px' }}>Appearance</h1>
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: B.ink, margin: '0 0 16px' }}>Theme</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                  {[
                    { label: 'Light', icon: Sun, value: false },
                    { label: 'Dark', icon: Moon, value: true },
                  ].map(({ label, icon: Icon, value }) => (
                    <button
                      key={label}
                      onClick={() => { if (isDark !== value) toggle(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 10,
                        border: `2px solid ${isDark === value ? B.orange : B.border}`,
                        background: isDark === value ? `${B.orange}12` : 'transparent',
                        cursor: 'pointer', fontSize: 14, fontWeight: isDark === value ? 600 : 400,
                        color: isDark === value ? B.ink : B.muted, transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={15} color={isDark === value ? B.orange : B.muted} />
                      {label}
                    </button>
                  ))}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 600, color: B.ink, margin: '0 0 12px' }}>Brand colours</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { name: 'Travel Orange', hex: '#D98327' },
                    { name: 'Warm Sand', hex: '#ECE8AF' },
                    { name: 'Forest Green', hex: '#4A943F' },
                    { name: 'Deep Emerald', hex: '#186049' },
                  ].map(({ name, hex }) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: hex, border: `1px solid ${B.border}` }} />
                      <span style={{ fontSize: 12, color: B.muted }}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SECURITY */}
          {activeSection === 'security' && (
            <section>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: B.ink, margin: '0 0 24px' }}>Security</h1>
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: B.ink, margin: '0 0 20px' }}>Change password</h3>
                <form onSubmit={savePassword}>
                  {(['Current password', 'New password', 'Confirm new password'] as const).map((label, i) => {
                    const vals = [currentPw, newPw, confirmPw];
                    const setters = [setCurrentPw, setNewPw, setConfirmPw];
                    return (
                      <label key={label} style={{ display: 'block', marginBottom: 14 }}>
                        <span style={labelStyle}>{label}</span>
                        <input type="password" value={vals[i]} onChange={(e) => setters[i](e.target.value)}
                          autoComplete={i === 0 ? 'current-password' : 'new-password'}
                          style={fieldStyle}
                          onFocus={(e) => (e.target.style.borderColor = B.orange)}
                          onBlur={(e) => (e.target.style.borderColor = B.border)}
                        />
                      </label>
                    );
                  })}
                  <button type="submit" disabled={savingPw}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: savingPw ? '#B86E18' : B.orange, border: 'none', borderRadius: 9, cursor: savingPw ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 6, transition: 'background 0.2s' }}>
                    <KeyRound size={14} />{savingPw ? 'Saving…' : 'Update password'}
                  </button>
                  {pwStatus && <StatusPill {...pwStatus} />}
                </form>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <section>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: B.ink, margin: '0 0 24px' }}>Notifications</h1>
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: 28 }}>
                {[
                  { label: 'Trip updates', desc: 'Reminders and changes to your planned trips' },
                  { label: 'Product announcements', desc: 'New features and improvements' },
                  { label: 'Email digest', desc: 'Weekly summary of new destinations' },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${B.border}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: B.ink }}>{label}</div>
                      <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{desc}</div>
                    </div>
                    <div style={{ fontSize: 12, color: B.muted, fontStyle: 'italic' }}>Coming soon</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACCOUNT */}
          {activeSection === 'account' && (
            <section>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: B.ink, margin: '0 0 24px' }}>Account</h1>

              {/* Links */}
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Help & Support', href: '#' },
                ].map(({ label, href }) => (
                  <Link key={label} to={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${B.border}`, textDecoration: 'none', color: B.ink, fontSize: 14, transition: 'background 0.2s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = B.ivory)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <HelpCircle size={15} color={B.muted} />
                      {label}
                    </div>
                    <ChevronRight size={14} color={B.muted} />
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#DC2626', transition: 'background 0.2s' }}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>

              {/* Delete account */}
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Trash2 size={16} color="#DC2626" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#DC2626', margin: 0 }}>Delete account</h3>
                </div>
                <p style={{ fontSize: 13, color: '#7F1D1D', margin: '0 0 14px', lineHeight: 1.5 }}>
                  This is permanent. All your trips, saved places, and preferences will be deleted.
                </p>
                {!showDelete ? (
                  <button onClick={() => setShowDelete(true)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #FCA5A5', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#DC2626' }}>
                    I want to delete my account
                  </button>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: '#7F1D1D', margin: '0 0 10px', fontWeight: 600 }}>
                      Type DELETE to confirm:
                    </p>
                    <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      style={{ padding: '8px 12px', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 14, color: B.ink, marginBottom: 10, display: 'block', background: '#fff' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleting}
                        style={{ padding: '8px 16px', background: deleteConfirm === 'DELETE' ? '#DC2626' : '#FCA5A5', border: 'none', borderRadius: 8, cursor: deleteConfirm === 'DELETE' && !deleting ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {deleting ? 'Deleting…' : 'Delete account'}
                      </button>
                      <button onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                        style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${B.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, color: B.muted }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
