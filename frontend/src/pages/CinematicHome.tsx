import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const C = { ink: '#01030F', blue: '#0071FF', focus: '#4DA3FF' };

interface Destination {
  name: string; kind: string; deck: string; history: string;
  detail: string; question: string; lat: number; lon: number;
  pctX: number; pctY: number; phonePctX: number; phonePctY: number;
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Paris', kind: '01 / ROMANCE & GRAND BOULEVARDS',
    deck: 'Where boulevards become living rooms.',
    history: "Paris grew from a small island settlement on the Seine into one of the most celebrated cities on Earth. Haussmann's grand restructuring of the 19th century carved broad, tree-lined boulevards through medieval fabric, creating the luminous street grid that still defines the city's character.",
    detail: 'Wide boulevards, covered passages and riverfront promenades create an interlocking public realm refined across centuries.',
    question: 'How can a city as celebrated as Paris continue to serve its own residents as land values and visitor pressure intensify?',
    lat: 48.8566, lon: 2.3522, pctX: 38.5, pctY: 47, phonePctX: 30, phonePctY: 50,
  },
  {
    name: 'Tokyo', kind: '02 / DENSITY & NEIGHBOURHOOD GRAIN',
    deck: 'Ancient ritual, hyper-modern rhythm.',
    history: "Built on river deltas and reclaimed land, Tokyo evolved from Edo castle town to Meiji capital to a decentralised mega-city. Post-war reconstruction and incremental building produced a dense, walkable fabric where small shops, shrines and train lines coexist.",
    detail: "Tokyo's smallest streets carry enormous daily life: the width of a lane defines the scale of commerce, housing and green pocket parks.",
    question: 'As seismic resilience requires major infrastructure investment, how do you rebuild a city that works so well at fine grain?',
    lat: 35.6762, lon: 139.6503, pctX: 78, pctY: 44, phonePctX: 68, phonePctY: 47,
  },
  {
    name: 'Rome', kind: '03 / ANTIQUITY & LIVING PALIMPSEST',
    deck: 'Three thousand years, one city.',
    history: "Rome is built above, below and around itself. Republican temples, medieval churches and Baroque piazzas share the same street level, often using the same stone. The historical layers have never been fully cleared away.",
    detail: "The historic centre's street network still follows the grid of ancient insulae and the curves of earlier race tracks.",
    question: "Which interventions protect Rome's layered fabric while making it genuinely accessible for contemporary residents?",
    lat: 41.9028, lon: 12.4964, pctX: 58, pctY: 55, phonePctX: 50, phonePctY: 58,
  },
  {
    name: 'Mumbai', kind: '04 / RESILIENCE & INFORMAL CITY',
    deck: 'A city that never stops inventing itself.',
    history: "Mumbai occupies a narrow peninsula once seven islands. The city's extraordinary density and the informal neighbourhoods that produce much of its economic dynamism reflect a history of continuous reinvention.",
    detail: 'The juxtaposition of dense chawls, Victorian Gothic institutions and modernist towers makes Mumbai one of the most visually layered cities.',
    question: 'How do redevelopment policies balance the economic contribution of informal settlements against the urgent need for better housing?',
    lat: 19.076, lon: 72.8777, pctX: 22, pctY: 67, phonePctX: 18, phonePctY: 68,
  },
];

const CITY_STATS = [
  { serial: '01', city: 'Paris', stat: '2,200+', unit: 'years of continuous settlement', fact: 'Re-planned by Haussmann in 1853; still defines the European boulevard ideal.' },
  { serial: '02', city: 'Tokyo', stat: '37.4M', unit: 'metropolitan population', fact: "World's largest megacity and one of the lowest crime rates globally." },
  { serial: '03', city: 'Rome', stat: '3,000+', unit: 'monuments catalogued in the centre', fact: 'The Colosseum hosted 65,000 spectators and remains structurally active 2,000 years on.' },
  { serial: '04', city: 'Mumbai', stat: '20,680', unit: 'people per km²', fact: 'Dharavi produces an estimated $1B in annual goods from just 0.7 km².' },
];

const BrandIcon = ({ size = 32 }: { size?: number }) => (
  <svg viewBox="0 0 32 38" width={size} height={size * 1.1875} fill="none" aria-hidden="true" style={{ color: 'rgba(255,255,255,.88)' }}>
    <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 1 31 9.5v18.8L16 37 1 28.3V9.5ZM1 9.5 16 18l15-8.5M16 18v19M8.5 5.3 23.5 14v18.5M23.5 5.3 8.5 14v18.5M1 19l15 8.5L31 19M1 28.3 23.5 14M31 28.3 8.5 14" />
      <ellipse cx="16" cy="28" rx="9" ry="5.1" />
      <ellipse cx="16" cy="28" rx="6" ry="3.4" />
      <ellipse cx="16" cy="28" rx="3" ry="1.7" />
    </g>
  </svg>
);

const ramp = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOut5 = (t: number) => 1 - Math.pow(1 - t, 5);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CinematicHome() {
  const navigate = useNavigate();
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const globeInstRef = useRef<any>(null);
  const globeLngRef = useRef(0);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);
  const displayedRef = useRef(0);
  const lastTimeRef = useRef(0);

  const [entered, setEntered] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && (window.innerWidth <= 1000 || (window.innerWidth <= 1200 && window.innerWidth / window.innerHeight <= 1.2)),
  );

  const openPanel = useCallback((idx: number) => { setActiveRecord(idx); setPanelOpen(true); }, []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const cycleRecord = useCallback((dir: number) => {
    setActiveRecord((prev) => (prev + dir + DESTINATIONS.length) % DESTINATIONS.length);
  }, []);

  /* ── Resize ── */
  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth <= 1000 || (window.innerWidth <= 1200 && window.innerWidth / window.innerHeight <= 1.2));
      if (globeInstRef.current) globeInstRef.current.width(window.innerWidth).height(window.innerHeight);
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Globe.gl init ── */
  useEffect(() => {
    if (!globeWrapRef.current) return;
    import('globe.gl').then(({ default: Globe }) => {
      if (!globeWrapRef.current) return;
      const g = (Globe as any)({ animateIn: false })(globeWrapRef.current)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#1a6fff')
        .atmosphereAltitude(0.18)
        .backgroundColor('rgba(0,0,0,0)')
        .width(window.innerWidth)
        .height(window.innerHeight)
        .pointsData(DESTINATIONS)
        .pointLat((d: any) => d.lat)
        .pointLng((d: any) => d.lon)
        .pointColor(() => '#0071FF')
        .pointAltitude(0.02)
        .pointRadius(0.55)
        .pointLabel((d: any) => `<div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#fff;background:rgba(0,0,26,.88);padding:5px 10px;border-radius:5px;border:1px solid rgba(0,113,255,.5)">${d.name}</div>`)
        .onPointClick((d: any) => openPanel(DESTINATIONS.findIndex((x) => x.name === d.name)));

      const ctrl = g.controls();
      ctrl.autoRotate = false;
      ctrl.enableZoom = false;
      ctrl.enablePan = false;
      ctrl.enableRotate = false;
      g.pointOfView({ lat: 18, lng: 0, altitude: 2.5 });
      globeInstRef.current = g;
    });
    return () => { globeInstRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Leaflet init ── */
  useEffect(() => {
    if (!mapDivRef.current || mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapDivRef.current!, { center: [30, 20], zoom: 2, zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);
      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
      (map as any).attributionControl.addAttribution('© OpenStreetMap contributors © CARTO');

      // Arc lines between cities
      const arcs: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
      arcs.forEach(([a, b]) => {
        L.polyline(
          [[DESTINATIONS[a].lat, DESTINATIONS[a].lon], [DESTINATIONS[b].lat, DESTINATIONS[b].lon]],
          { color: 'rgba(0,113,255,.22)', weight: 1, dashArray: '4 6' },
        ).addTo(map);
      });

      // City markers
      DESTINATIONS.forEach((dest, idx) => {
        const el = document.createElement('div');
        el.className = 'tw-marker';
        el.innerHTML = '<div class="tw-marker-ring"></div><div class="tw-marker-dot"></div>';
        el.setAttribute('aria-label', `Explore ${dest.name}`);
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', () => openPanel(idx));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openPanel(idx); });
        const icon = L.divIcon({ html: el, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
        L.marker([dest.lat, dest.lon], { icon }).bindTooltip(dest.name, {
          permanent: true, direction: 'top', className: 'tw-tip', offset: [0, -10],
        }).addTo(map);
      });

      mapInstanceRef.current = map;
    });
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Main animation loop ── */
  useEffect(() => {
    const totalScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const onScroll = () => {
      scrollRef.current = Math.max(0, Math.min(1, window.scrollY / (totalScroll() || 1)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (time: number) => {
      const dt = Math.min(64, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const smoothing = reducedMotion ? 1 : 1 - Math.pow(1 - 0.11, dt / 16.667);
      displayedRef.current += (scrollRef.current - displayedRef.current) * smoothing;
      const p = displayedRef.current;
      setDisplayedProgress(p);

      // Globe.gl: self-rotate + zoom via POV
      if (globeInstRef.current) {
        globeLngRef.current -= dt * 0.012;
        const alt = lerp(2.5, 1.4, easeOut3(ramp(p, 0, 0.45)));
        globeInstRef.current.pointOfView({ lat: 18, lng: globeLngRef.current, altitude: alt });
      }
      if (globeWrapRef.current) {
        globeWrapRef.current.style.opacity = String(1 - ramp(p, 0.70, 0.82));
      }

      // Map
      if (mapDivRef.current) {
        const mapAlpha = ramp(p, 0.72, 0.86);
        mapDivRef.current.style.opacity = String(mapAlpha);
        mapDivRef.current.style.pointerEvents = mapAlpha > 0.1 ? 'auto' : 'none';
      }
      if (mapInstanceRef.current && p > 0.72) {
        mapInstanceRef.current.setZoom(lerp(2, 4, easeOut5(ramp(p, 0.72, 0.90))), { animate: false });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    setTimeout(() => setEntered(true), 80);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panelOpen) {
        if (e.key === 'Escape') closePanel();
        if (e.key === 'ArrowRight') cycleRecord(1);
        if (e.key === 'ArrowLeft') cycleRecord(-1);
      }
      if (menuOpen && e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, menuOpen, closePanel, cycleRecord]);

  /* ── Scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = (panelOpen || menuOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [panelOpen, menuOpen]);

  const p = displayedProgress;
  const scene1Opacity = 1 - easeOut3(ramp(p, 0, 0.11));
  const scene1Translate = ramp(p, 0, 0.11) * -56;
  const navOpacity = p < 0.12 ? 1 - ramp(p, 0, 0.12) : p > 0.76 ? ramp(p, 0.76, 0.84) : 0;
  const scene2Opacity = ramp(p, 0.15, 0.31) * (1 - easeOut3(ramp(p, 0.47, 0.57)));
  const scene3Opacity = ramp(p, 0.80, 0.92);

  const scrollTo = (target: number) => {
    window.scrollTo({ top: target * (document.documentElement.scrollHeight - window.innerHeight), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const dest = DESTINATIONS[activeRecord];

  return (
    <>
      <div style={{ height: '700vh', background: 'transparent' }} aria-hidden="true" />

      <div style={{ position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden', background: C.ink, fontFamily: 'Manrope, system-ui, sans-serif' }} role="main">

        {/* Globe.gl container */}
        <div ref={globeWrapRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

        {/* Leaflet map */}
        <div ref={mapDivRef} aria-label="Interactive world map" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 2 }} />

        {/* ── NAV ── */}
        <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: mobile ? '16px 20px' : '20px 38px', opacity: mobile ? 1 : navOpacity, transition: 'opacity 0.4s', pointerEvents: navOpacity > 0.05 || mobile ? 'auto' : 'none' }}>
          <button onClick={() => scrollTo(0)} aria-label="TripWise — top" style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <BrandIcon size={mobile ? 26 : 30} />
            <span style={{ fontFamily: 'Manrope, system-ui', fontSize: mobile ? 21 : 25, fontWeight: 700, letterSpacing: '0.13em', color: '#fff', textTransform: 'uppercase' }}>
              Trip<em style={{ fontStyle: 'normal', color: C.blue }}>Wise</em>
            </span>
          </button>

          {!mobile && (
            <nav style={{ position: 'absolute', left: '50%', top: 26, transform: 'translateX(-50%)', display: 'flex', gap: 28, alignItems: 'center' }}>
              {[{ label: 'EXPLORE', target: 0.34 }, { label: 'WORLD ATLAS', target: 0.96 }, { label: 'MY TRIP', target: null }].map(({ label, target }) => (
                <button key={label} onClick={() => target !== null ? scrollTo(target) : navigate('/my-trip')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.82)', fontSize: 12, fontFamily: 'Manrope, system-ui', fontWeight: 600, letterSpacing: '0.085em', textTransform: 'uppercase', padding: '4px 2px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.82)')}>
                  {label}
                </button>
              ))}
            </nav>
          )}

          {mobile && (
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} style={{ width: 36, height: 36, background: 'none', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span style={{ width: 16, height: 1.5, background: '#fff', display: 'block' }} />
              <span style={{ width: 16, height: 1.5, background: '#fff', display: 'block' }} />
            </button>
          )}
        </header>

        {/* ── SCENE 1 ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: scene1Opacity, transform: `translateY(${scene1Translate}px)` }} aria-hidden={scene1Opacity < 0.1}>
          <div style={{ position: 'absolute', left: mobile ? 20 : 40, top: mobile ? '18%' : 'calc(140px + (100% - 720px) * .22)', width: mobile ? 'calc(100% - 40px)' : 580, height: 200, background: 'rgba(1,3,15,.65)', filter: 'blur(28px)', borderRadius: 20 }} aria-hidden="true" />
          <div style={{ position: 'absolute', left: mobile ? 22 : 40, top: mobile ? 'clamp(120px, 18vh, 160px)' : 'calc(140px + (100% - 720px) * .22)' }}>
            {['Where Will', 'You Go', <em key="i" style={{ fontStyle: 'italic' }}>Next?</em>].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden', paddingTop: 4, paddingBottom: 6 }}>
                <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: mobile ? 'clamp(36px, calc((100vw - 44px) / 7.2), 64px)' : 78, lineHeight: 1.0, fontWeight: 400, letterSpacing: '-0.015em', color: '#fff', transform: entered || reducedMotion ? 'translateY(0)' : 'translateY(130%)', opacity: entered || reducedMotion ? 1 : 0, transition: reducedMotion ? 'none' : `transform 0.66s cubic-bezier(.19,1,.22,1) ${0.18 + i * 0.16}s, opacity 0.4s ease ${0.18 + i * 0.16}s` }}>
                  {line}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollTo(0.15)}
            style={{ position: 'absolute', left: mobile ? 22 : 40, top: mobile ? 'clamp(310px, 48vh, 380px)' : 'calc(379.5px + (100% - 720px) * .22)', width: mobile ? 'clamp(146px, 42vw, 170px)' : 157, height: 56, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.84)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', backdropFilter: 'blur(6px)', pointerEvents: 'auto', opacity: entered || reducedMotion ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.5s ease 0.74s, border-color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.84)'; }}
          >
            <span style={{ marginLeft: 16.5, color: '#fff', fontSize: 11.5, fontFamily: 'Manrope, system-ui', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', flex: 1 }}>EXPLORE WORLD</span>
            <div style={{ width: 24, height: 24, background: C.blue, borderRadius: 5.5, marginRight: 16.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 8L8 2M8 2H3M8 2v5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </div>
          </button>

          <div style={{ position: 'absolute', left: mobile ? 22 : 42, bottom: mobile ? 80 : 44, maxWidth: mobile ? 'min(34ch, calc(100vw - 44px))' : 380, opacity: entered || reducedMotion ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.5s ease 0.86s', pointerEvents: 'none' }}>
            <p style={{ color: '#fff', margin: '0 0 6px', fontSize: mobile ? 'clamp(14px, 3.9vw, 18px)' : 21, lineHeight: mobile ? '1.34' : '28px', fontWeight: 600, letterSpacing: '-0.015em' }}>Explore the world, one place at a time.</p>
            <p style={{ color: 'rgba(255,255,255,.65)', margin: 0, fontSize: mobile ? 'clamp(13px, 3.5vw, 16px)' : 21, lineHeight: mobile ? '1.34' : '28px' }}>Discover remarkable landmarks, local experiences, and the stories behind the places you visit.</p>
          </div>

          <div style={{ position: 'absolute', right: mobile ? 22 : 49, bottom: mobile ? 24 : 36, display: 'flex', alignItems: 'center', gap: 8, opacity: entered || reducedMotion ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.5s ease 1.24s', pointerEvents: 'none' }}>
            <BrandIcon size={14} />
            <span style={{ color: 'rgba(255,255,255,.55)', fontSize: mobile ? 12 : 13 }}>Scroll to explore</span>
          </div>

          {!mobile && (
            <div style={{ position: 'absolute', left: 'calc(50% + 90px)', top: 'calc(50% - 10px)', width: 71, height: 23, background: C.blue, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', opacity: entered || reducedMotion ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.4s ease 0.98s', boxShadow: `0 0 12px ${C.blue}80` }}
              onClick={() => openPanel(0)} role="button" tabIndex={0} aria-label="Field notes: Paris"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openPanel(0); }}>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: '#fff', textTransform: 'uppercase' }}>DISCOVER</span>
            </div>
          )}
        </div>

        {/* ── SCENE 2: city data ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: scene2Opacity, transform: `translateY(${ramp(p, 0.47, 0.57) * -18}px) scale(${1 + ramp(p, 0.47, 0.57) * 0.14})` }} aria-hidden={scene2Opacity < 0.1}>
          <div style={{ position: 'absolute', inset: '5% 10%', background: 'radial-gradient(ellipse, rgba(1,3,15,.85) 0%, rgba(1,3,15,.5) 70%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', textAlign: 'center', padding: '0 5%', width: '100%' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: C.blue, textTransform: 'uppercase', marginBottom: 18 }}>
              WORLD INTELLIGENCE / FOUR CITIES
            </div>
            <div style={{ marginBottom: 44 }}>
              {['From Your Screen', 'To the Street—', <em key="i" style={{ fontStyle: 'italic' }}>Every City Has a Story.</em>].map((line, i) => (
                <div key={i} style={{ overflow: 'hidden', paddingTop: 3, paddingBottom: 4 }}>
                  <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: mobile ? 'clamp(30px, 8.5vw, 44px)' : 'clamp(34px, 3.4vw, 48px)', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.012em', color: '#fff', transform: ramp(p, 0.15 + i * 0.06, 0.31 + i * 0.02) < 1 && !reducedMotion ? 'translateY(100%)' : 'translateY(0)', opacity: ramp(p, 0.15 + i * 0.06, 0.31 + i * 0.02) }}>
                    {line}
                  </div>
                </div>
              ))}
            </div>

            {/* City data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 1, width: 'min(920px, 90vw)', margin: '0 auto', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 12, overflow: 'hidden', opacity: ramp(p, 0.22, 0.35) }}>
              {CITY_STATS.map((s) => (
                <div key={s.city} style={{ background: 'rgba(1,3,15,.9)', padding: '20px 18px', textAlign: 'left' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(255,255,255,.32)', marginBottom: 4 }}>{s.serial}</div>
                  <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>{s.city}</div>
                  <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36, fontWeight: 400, color: C.blue, lineHeight: 1, margin: '6px 0 2px' }}>{s.stat}</div>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', lineHeight: 1.35 }}>{s.unit}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.52)', lineHeight: 1.5, marginTop: 8 }}>{s.fact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SCENE 3: world atlas ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none', opacity: scene3Opacity }} aria-hidden={scene3Opacity < 0.1}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '44%', background: 'linear-gradient(to bottom, rgba(1,3,15,.88) 0%, rgba(1,3,15,.55) 55%, transparent 100%)', pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', top: 72, left: 0, right: 0, padding: mobile ? '0 22px' : '0 5%', display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 14 : 48, alignItems: mobile ? 'flex-start' : 'flex-end' }}>
            <div style={{ flexShrink: 0, opacity: ramp(p, 0.82, 0.93) }}>
              {['DESTINATION-BASED,', 'STORY-AWARE', 'WORLD DISCOVERY'].map((line) => (
                <div key={line} style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,255,255,.62)', lineHeight: 1.6, textTransform: 'uppercase' }}>{line}</div>
              ))}
            </div>
            <p style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: mobile ? 'clamp(22px, 5.8vw, 34px)' : 'clamp(24px, 2.5vw, 32px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.012em', color: '#fff', maxWidth: mobile ? '100%' : '65%', margin: 0, opacity: ramp(p, 0.84, 0.95) }}>
              Our world intelligence connects historic character, lived patterns, and geographic evidence — so curious travellers can discover places with depth, not just directions.
            </p>
          </div>

          {/* Place markers */}
          {DESTINATIONS.map((dest, idx) => {
            const pinReveal = ramp(p, 0.82 + idx * 0.025, 0.92 + idx * 0.015);
            const pinScale = lerp(0.7, 1, easeOut5(pinReveal));
            return (
              <button key={dest.name} aria-label={`Field notes: ${dest.name}`} tabIndex={scene3Opacity > 0.5 ? 0 : -1} disabled={scene3Opacity < 0.5} onClick={() => openPanel(idx)}
                style={{ position: 'absolute', left: mobile ? `${dest.phonePctX}%` : `${dest.pctX}%`, top: mobile ? `${dest.phonePctY}%` : `${dest.pctY}%`, transform: `translate(-50%,-50%) scale(${pinScale})`, opacity: pinReveal, pointerEvents: scene3Opacity > 0.5 ? 'auto' : 'none', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, zIndex: 20 }}
                onMouseEnter={(e) => { const d = e.currentTarget.querySelector('.pin-dot') as HTMLElement; const l = e.currentTarget.querySelector('.pin-lbl') as HTMLElement; if (d) d.style.transform = 'scale(1.12)'; if (l) l.style.color = '#fff'; }}
                onMouseLeave={(e) => { const d = e.currentTarget.querySelector('.pin-dot') as HTMLElement; const l = e.currentTarget.querySelector('.pin-lbl') as HTMLElement; if (d) d.style.transform = 'scale(1)'; if (l) l.style.color = 'rgba(255,255,255,.72)'; }}>
                <div className="pin-dot" style={{ width: 23, height: 23, borderRadius: '50%', background: C.blue, boxShadow: `0 0 14px ${C.blue}99, 0 0 28px ${C.blue}44`, transition: 'transform 0.2s', position: 'relative' }}>
                  {[[0,0],[0,-5],[0,5],[-5,0],[5,0]].map(([dx,dy],i) => (
                    <div key={i} style={{ position: 'absolute', width: 2.5, height: 2.5, borderRadius: '50%', background: '#fff', left: `calc(50% + ${dx}px - 1.25px)`, top: `calc(50% + ${dy}px - 1.25px)` }} />
                  ))}
                </div>
                <div className="pin-lbl" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.72)', letterSpacing: '0.04em', textTransform: 'uppercase', textShadow: '0 1px 4px rgba(1,3,15,.8)', transition: 'color 0.18s', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{dest.name}</div>
              </button>
            );
          })}

          <button onClick={() => navigate('/explore')} tabIndex={scene3Opacity > 0.5 ? 0 : -1}
            style={{ position: 'absolute', bottom: mobile ? 24 : 40, left: '50%', transform: 'translateX(-50%)', background: C.blue, border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', padding: '14px 32px', fontFamily: 'Manrope, system-ui', fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', pointerEvents: scene3Opacity > 0.5 ? 'auto' : 'none', opacity: ramp(p, 0.88, 0.97), boxShadow: `0 0 24px ${C.blue}66` }}>
            Start Exploring →
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(1,3,15,.82)', backdropFilter: 'blur(12px)' }} onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}>
            <div style={{ background: 'rgba(4,9,23,.97)', borderBottom: '1px solid rgba(255,255,255,.15)', padding: '20px 22px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BrandIcon size={24} />
                  <span style={{ color: '#fff', fontSize: 21, fontFamily: 'Manrope', fontWeight: 700, letterSpacing: '0.13em' }}>Trip<em style={{ fontStyle: 'normal', color: C.blue }}>Wise</em></span>
                </div>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              {[{ label: 'EXPLORE', action: () => { scrollTo(0.34); setMenuOpen(false); } }, { label: 'WORLD ATLAS', action: () => { scrollTo(0.96); setMenuOpen(false); } }, { label: 'MY TRIP', action: () => { navigate('/my-trip'); setMenuOpen(false); } }].map(({ label, action }) => (
                <button key={label} onClick={action} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.8)', fontSize: 16, fontFamily: 'Manrope', fontWeight: 600, letterSpacing: '0.085em', textTransform: 'uppercase', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── FIELD NOTES PANEL ── */}
        {panelOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(1,3,15,.38)', backdropFilter: 'blur(3px)' }} onClick={(e) => { if (e.target === e.currentTarget) closePanel(); }} role="dialog" aria-modal="true" aria-label={`Field notes: ${dest.name}`}>
            <div style={{ position: 'absolute', right: mobile ? 0 : 28, top: mobile ? 'auto' : 24, bottom: mobile ? 0 : 24, left: mobile ? 0 : 'auto', width: mobile ? '100%' : Math.min(438, window.innerWidth - 56), maxHeight: mobile ? '88dvh' : 'calc(100dvh - 48px)', background: 'rgba(4,9,23,.97)', border: '1px solid rgba(255,255,255,.12)', borderRadius: mobile ? '16px 16px 0 0' : 14, boxShadow: '0 8px 48px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideInPanel 0.24s ease' }}>
              <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.08)', background: 'rgba(4,9,23,.98)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>WORLD ATLAS / FIELD NOTES</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue }} />
                </div>
                <button onClick={closePanel} aria-label="Close field notes" autoFocus style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px 28px' }}>
                <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: C.blue, textTransform: 'uppercase', marginBottom: 10 }}>{dest.kind}</div>
                <h2 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: mobile ? 37 : 42, fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.012em', color: '#fff', margin: '0 0 12px' }}>{dest.name}</h2>
                <p style={{ color: 'rgba(255,255,255,.62)', fontSize: 16, lineHeight: 1.45, margin: '0 0 18px' }}>{dest.deck}</p>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.65, margin: '0 0 24px' }}>{dest.history}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 8 }}>READ THE FABRIC</div>
                  <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{dest.detail}</p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20, marginBottom: 24 }}>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 8 }}>THE PLANNING QUESTION</div>
                  <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{dest.question}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ width: 2, background: C.blue, borderRadius: 2, flexShrink: 0 }} />
                  <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 11.5, lineHeight: 1.55, margin: 0 }}>Place descriptions are editorial summaries for illustrative purposes. Not a verified travel advisory.</p>
                </div>
                <button onClick={() => { navigate(`/explore?lat=${dest.lat}&lon=${dest.lon}&city=${encodeURIComponent(dest.name)}`); closePanel(); }} style={{ width: '100%', padding: '13px', background: C.blue, border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontFamily: 'Manrope', fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
                  EXPLORE {dest.name.toUpperCase()} →
                </button>
              </div>

              <div style={{ padding: '14px 28px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(4,9,23,.98)', flexShrink: 0 }}>
                <button onClick={() => cycleRecord(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.65)', cursor: 'pointer', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontFamily: 'Manrope', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>← PREVIOUS</button>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.06em' }}>{String(activeRecord + 1).padStart(2, '0')} / {String(DESTINATIONS.length).padStart(2, '0')}</span>
                <button onClick={() => cycleRecord(1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.65)', cursor: 'pointer', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontFamily: 'Manrope', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>NEXT →</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInPanel { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        *:focus-visible { outline: 2px solid #4DA3FF; outline-offset: 3px; }
        .tw-marker { width: 32px; height: 32px; cursor: pointer; position: relative; }
        .tw-marker-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 10px; height: 10px; border-radius: 50%; background: #0071FF; box-shadow: 0 0 10px #0071FF99; }
        .tw-marker-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #0071FF66; animation: markerPulse 2.4s ease-out infinite; }
        @keyframes markerPulse { 0% { transform: translate(-50%,-50%) scale(1); opacity: .7; } 100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; } }
        .tw-tip { background: rgba(4,9,26,.92) !important; border: 1px solid rgba(0,113,255,.4) !important; color: #fff !important; font-family: "IBM Plex Mono", monospace !important; font-size: 11px !important; font-weight: 600 !important; letter-spacing: .04em !important; border-radius: 5px !important; padding: 4px 10px !important; box-shadow: none !important; }
        .leaflet-tooltip-top:before { border-top-color: rgba(0,113,255,.4) !important; }
        .leaflet-container { background: #01030F !important; }
        .leaflet-attribution-flag { display: none !important; }
        html { scrollbar-width: none; }
        html::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { .tw-marker-ring { animation: none; } }
      `}</style>
    </>
  );
}
