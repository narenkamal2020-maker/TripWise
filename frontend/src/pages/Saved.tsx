import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, MapPin, ArrowLeft, Compass } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';

const B = {
  orange: '#D98327',
  emerald: '#186049',
  ivory: '#FAF9F2',
  ink: '#17231D',
  muted: '#66736B',
  border: '#E3E6DD',
  surface: '#FFFFFF',
};

interface SavedPlace {
  id: number;
  xid: string;
  snapshot: { name?: string; kinds?: string; preview_image?: { source?: string } };
  created_at: string;
}

export function Saved() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    apiClient.get<SavedPlace[]>('/saved')
      .then((res) => { setPlaces(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load saved places.'); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (loading || !listRef.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        listRef.current!.querySelectorAll('.saved-card'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: 'power2.out' },
      );
    });
    return () => ctx.revert();
  }, [loading]);

  async function remove(xid: string) {
    setRemoving(xid);
    try {
      await apiClient.delete(`/saved/${encodeURIComponent(xid)}`);
      setPlaces((prev) => prev.filter((p) => p.xid !== xid));
    } catch {
      // silent
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: B.ivory, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ background: 'rgba(250,249,242,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${B.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: B.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <span style={{ color: B.border }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: B.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Heart size={14} color={B.orange} /> Saved Places
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: B.ink, margin: '0 0 8px' }}>Saved places</h1>
        <p style={{ fontSize: 14, color: B.muted, margin: '0 0 28px' }}>Destinations you've saved while exploring.</p>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: B.muted }}>Loading…</div>
        )}
        {error && (
          <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, color: '#DC2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div ref={listRef}>
            {places.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Heart size={36} color={B.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: B.ink, margin: '0 0 8px' }}>No saved places yet</p>
                <p style={{ fontSize: 14, color: B.muted, margin: '0 0 20px' }}>Explore destinations and tap the heart icon to save them here.</p>
                <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: B.orange, borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  <Compass size={16} /> Start exploring
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {places.map((place) => {
                  const img = place.snapshot?.preview_image?.source;
                  const name = place.snapshot?.name ?? place.xid;
                  const kind = place.snapshot?.kinds?.split(',')[0]?.replace(/_/g, ' ') ?? 'Destination';
                  return (
                    <div key={place.id} className="saved-card" style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(23,35,29,0.06)' }}>
                      {img ? (
                        <img src={img} alt={name} style={{ width: '100%', height: 140, objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: 140, background: `${B.emerald}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={28} color={B.emerald} style={{ opacity: 0.5 }} />
                        </div>
                      )}
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: B.ink, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 12, color: B.muted, textTransform: 'capitalize', marginBottom: 14 }}>{kind}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => navigate(`/destinations/${place.xid}`)}
                            style={{ flex: 1, padding: '7px 12px', background: B.orange, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', transition: 'background 0.2s' }}
                          >
                            View details
                          </button>
                          <button
                            onClick={() => remove(place.xid)}
                            disabled={removing === place.xid}
                            title="Remove from saved"
                            style={{ padding: '7px 10px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                          >
                            <Trash2 size={14} color="#DC2626" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
