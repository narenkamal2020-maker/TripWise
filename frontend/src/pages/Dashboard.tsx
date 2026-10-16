import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Map, Heart, Settings, Plus, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getItinerary } from '@/api/itinerary';
import type { ItineraryItem } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const B = {
  orange: '#D98327',
  sand: '#ECE8AF',
  emerald: '#186049',
  green: '#4A943F',
  darkbg: '#10271F',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
  surface: '#FFFFFF',
};

const QUICK_ACTIONS = [
  { icon: Compass, label: 'Explore', sub: 'Discover new places', href: '/explore', color: B.emerald },
  { icon: Plus, label: 'New Trip', sub: 'Start planning', href: '/my-trip', color: B.orange },
  { icon: Heart, label: 'Saved', sub: 'Your saved places', href: '/saved', color: B.green },
  { icon: Map, label: 'Map', sub: 'Interactive map', href: '/explore', color: '#5A7A8A' },
];

const FEATURED_REGIONS = [
  { name: 'South-East Asia', places: '2,400+', emoji: '🌿', bg: '#1C3828' },
  { name: 'Mediterranean', places: '1,800+', emoji: '⛵', bg: '#1A3344' },
  { name: 'South America', places: '1,600+', emoji: '🏔️', bg: '#2D1C0A' },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getItinerary().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll('.hero-item'),
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out', delay: 0.1 },
        );
      }

      // Quick action cards stagger
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll('.qa-card'),
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: 'back.out(1.4)', delay: 0.3 },
        );
      }

      // Scroll-triggered sections
      if (sectionsRef.current) {
        gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
            },
          );
        });
      }
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div style={{ minHeight: '100dvh', background: B.ivory, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(250,249,242,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${B.border}`,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: B.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={15} color={B.orange} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: B.ink }}>
              Trip<em style={{ fontStyle: 'normal', color: B.orange }}>Wise</em>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link to="/explore" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: B.muted, textDecoration: 'none', transition: 'background 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = B.border; (e.currentTarget as HTMLAnchorElement).style.color = B.ink; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = B.muted; }}>
              Explore
            </Link>
            <Link to="/my-trip" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: B.muted, textDecoration: 'none', transition: 'background 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = B.border; (e.currentTarget as HTMLAnchorElement).style.color = B.ink; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = B.muted; }}>
              My Trip
            </Link>
            <Link to="/settings" style={{ padding: '6px', borderRadius: 8, color: B.muted, display: 'flex', alignItems: 'center', transition: 'background 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = B.border; (e.currentTarget as HTMLAnchorElement).style.color = B.ink; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = B.muted; }}>
              <Settings size={16} />
            </Link>
            {/* Avatar + logout */}
            <div style={{ position: 'relative', marginLeft: 8 }}>
              <button
                onClick={logout}
                title="Sign out"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${B.orange}, #E89B3F)`,
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {initials}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Hero */}
        <div ref={heroRef} style={{
          background: `linear-gradient(135deg, ${B.darkbg} 0%, ${B.emerald} 100%)`,
          borderRadius: 20, padding: 'clamp(32px, 5vw, 56px)', marginTop: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative */}
          <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', opacity: 0.06 }} viewBox="0 0 300 200" fill="none" aria-hidden="true">
            <circle cx="250" cy="100" r="140" stroke="white" strokeWidth="0.5" />
            <circle cx="250" cy="100" r="100" stroke="white" strokeWidth="0.5" />
            <circle cx="250" cy="100" r="60" stroke="white" strokeWidth="0.5" />
          </svg>

          <div className="hero-item" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: B.sand, textTransform: 'uppercase', opacity: 0.85 }}>
              {greeting}
            </span>
          </div>
          <h1 className="hero-item" style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', fontFamily: '"Playfair Display", Georgia, serif' }}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'Traveller'}
          </h1>
          <p className="hero-item" style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', maxWidth: 480 }}>
            {items.length > 0
              ? `You have ${items.length} destination${items.length !== 1 ? 's' : ''} planned. Keep exploring!`
              : 'Your journey starts here. Explore destinations and build your first trip.'}
          </p>
          <div className="hero-item" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/explore" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: B.orange, color: '#fff',
              padding: '10px 20px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              transition: 'background 0.2s',
            }}>
              <Compass size={16} /> Explore destinations
            </Link>
            <Link to="/my-trip" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '10px 20px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              transition: 'background 0.2s',
            }}>
              <Map size={16} /> My trip ({items.length})
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div ref={cardsRef} style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: B.ink, marginBottom: 16 }}>Quick actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {QUICK_ACTIONS.map(({ icon: Icon, label, sub, href, color }) => (
              <Link
                key={label}
                to={href}
                className="qa-card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: B.surface, border: `1px solid ${B.border}`,
                  borderRadius: 14, padding: '16px 18px',
                  textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(23,35,29,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(23,35,29,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(23,35,29,0.06)';
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.ink }}>{label}</div>
                  <div style={{ fontSize: 12, color: B.muted, marginTop: 1 }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div ref={sectionsRef} style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
          {/* Recent trip items */}
          <div className="scroll-reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: B.ink, margin: 0 }}>Trip itinerary</h2>
              <Link to="/my-trip" style={{ fontSize: 13, color: B.orange, textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {items.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <MapPin size={28} color={B.muted} style={{ marginBottom: 10, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, color: B.muted, margin: 0 }}>No destinations yet</p>
                  <Link to="/explore" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: B.orange, textDecoration: 'none', fontWeight: 500 }}>
                    Explore to add some →
                  </Link>
                </div>
              ) : (
                items.slice(0, 4).map((item, i) => {
                  const snap = item.snapshot as { name?: string; kinds?: string };
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: i < Math.min(items.length, 4) - 1 ? `1px solid ${B.border}` : 'none',
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${B.emerald}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={14} color={B.emerald} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: B.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {snap?.name ?? item.xid}
                        </div>
                        <div style={{ fontSize: 11, color: B.muted, marginTop: 1 }}>
                          {snap?.kinds?.split(',')[0]?.replace(/_/g, ' ') ?? 'Destination'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Featured regions */}
          <div className="scroll-reveal">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: B.ink, marginBottom: 16 }}>Discover regions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURED_REGIONS.map(({ name, places, emoji, bg }) => (
                <button
                  key={name}
                  onClick={() => navigate('/explore')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: bg, border: 'none', borderRadius: 12, padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{places} places</div>
                  </div>
                  <ArrowRight size={14} color="rgba(255,255,255,0.5)" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="scroll-reveal" style={{ marginTop: 36, background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: '20px 28px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Destinations planned', value: items.length },
            { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
            { label: 'Account', value: user?.email ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 700, color: B.ink }}>{value}</div>
              <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
