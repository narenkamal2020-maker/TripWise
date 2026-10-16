import { lazy, Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Search, MapPin, Landmark, Trees, Utensils, Camera } from 'lucide-react';

const Globe3D = lazy(() => import('@/components/Globe3D'));

const CATEGORIES = [
  { label: 'Architecture', icon: Landmark, kinds: 'historic_architecture' },
  { label: 'Nature', icon: Trees, kinds: 'natural' },
  { label: 'Food & Drink', icon: Utensils, kinds: 'foods' },
  { label: 'Attractions', icon: Camera, kinds: 'amusements' },
];

const FEATURED_CITIES = [
  { name: 'Paris', coords: '48.8566°N, 2.3522°E', emoji: '🗼', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', coords: '35.6762°N, 139.6503°E', emoji: '⛩️', lat: 35.6762, lon: 139.6503 },
  { name: 'Rome', coords: '41.9028°N, 12.4964°E', emoji: '🏛️', lat: 41.9028, lon: 12.4964 },
  { name: 'Mumbai', coords: '19.0760°N, 72.8777°E', emoji: '🐘', lat: 19.076, lon: 72.8777 },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  child: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
  },
};

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-52 h-52 rounded-full border-2 border-forest-500/30 animate-spin-slow relative flex items-center justify-center">
        <div className="absolute inset-5 rounded-full border border-forest-500/20" />
        <div className="absolute inset-10 rounded-full border border-accent/20" />
        <div className="w-3 h-3 rounded-full bg-accent/60 animate-pulse" />
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim().length >= 3) {
      navigate(`/explore?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-24">
      {/* ── HERO ── */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-none sm:rounded-3xl">
        {/* Background */}
        <div className="absolute inset-0 bg-forest-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 60%, rgba(249,115,22,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(61,107,90,0.6) 0%, transparent 55%)',
          }}
        />
        {/* Topographic lines */}
        <div className="absolute inset-0 bg-topo-dark opacity-40" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[90vh] lg:min-h-[80vh]">
          {/* Left — text */}
          <div className="flex flex-col justify-center px-6 py-20 sm:px-12 sm:py-24 lg:px-16">
            <motion.div
              variants={stagger.container}
              initial="initial"
              animate="animate"
              className="space-y-8 max-w-lg"
            >
              <motion.p
                variants={stagger.child}
                className="text-accent font-medium tracking-[0.25em] uppercase text-xs"
              >
                ✦ AWS Student Builder Group · VIT Chennai
              </motion.p>

              <motion.div variants={stagger.child}>
                <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-bold text-paper-100 leading-[1.05] text-balance">
                  The world is closer than you think.
                </h1>
              </motion.div>

              <motion.p
                variants={stagger.child}
                className="text-forest-200 text-lg sm:text-xl leading-relaxed font-light"
              >
                Discover remarkable destinations, save your favourites, and craft your perfect journey — powered by real data.
              </motion.p>

              {/* Search bar */}
              <motion.form
                variants={stagger.child}
                onSubmit={handleSearch}
                className="flex gap-2"
                role="search"
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Search a place, landmark…"
                    aria-label="Search destinations"
                    className="w-full pl-12 pr-4 py-4 bg-forest-800/70 border border-forest-600 rounded-2xl text-paper-100 placeholder-forest-400 text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent backdrop-blur-sm transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-4 bg-accent hover:bg-accent-light text-white rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-forest-900 shadow-glow active:scale-95"
                  aria-label="Search"
                >
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </motion.form>

              {/* CTAs */}
              <motion.div
                variants={stagger.child}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-paper-100 text-ink-900 rounded-xl font-semibold text-sm hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-paper-100 focus:ring-offset-2 focus:ring-offset-forest-900 shadow-card"
                >
                  <Compass className="w-4 h-4 text-forest-700" aria-hidden="true" />
                  Start Exploring
                </Link>
                <Link
                  to="/my-trip"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest-700/60 border border-forest-500/40 text-paper-200 rounded-xl font-semibold text-sm hover:bg-forest-600/60 hover:text-paper-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 focus:ring-offset-forest-900 backdrop-blur-sm"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  My Trip
                </Link>
              </motion.div>

              {/* Floating coordinate */}
              <motion.p
                variants={stagger.child}
                className="coords text-forest-400 hidden sm:block"
              >
                20.0000°N, 78.0000°E · India
              </motion.p>
            </motion.div>
          </div>

          {/* Right — Globe (desktop only) */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Glow */}
            <div className="absolute w-80 h-80 rounded-full bg-forest-600/20 blur-3xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full h-[480px]"
            >
              <Suspense fallback={<GlobeFallback />}>
                <Globe3D className="w-full h-full" />
              </Suspense>
            </motion.div>

            {/* Floating labels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute top-1/3 right-8 bg-forest-800/80 border border-forest-600/50 backdrop-blur-sm rounded-2xl px-3 py-2 text-xs"
            >
              <p className="text-accent font-medium">✦ Paris</p>
              <p className="coords text-forest-300 mt-0.5">48.8566°N, 2.3522°E</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="absolute bottom-1/3 left-8 bg-forest-800/80 border border-forest-600/50 backdrop-blur-sm rounded-2xl px-3 py-2 text-xs"
            >
              <p className="text-accent font-medium">✦ Tokyo</p>
              <p className="coords text-forest-300 mt-0.5">35.6762°N, 139.6503°E</p>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-forest-400"
          aria-hidden="true"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-forest-400 to-transparent" />
        </motion.div>
      </section>

      {/* ── CATEGORY BROWSE ── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-accent text-xs font-medium tracking-widest uppercase mb-1">✦ Discover by type</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100">
              What are you looking for?
            </h2>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-forest-300 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1"
          >
            Browse all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map(({ label, icon: Icon, kinds }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                to={`/explore?kinds=${kinds}`}
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 hover:border-accent/40 dark:hover:border-accent/30 hover:bg-accent/5 dark:hover:bg-accent/8 transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-center shadow-card hover:shadow-card-hover card-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-700 flex items-center justify-center group-hover:bg-accent/10 dark:group-hover:bg-accent/15 transition-colors">
                  <Icon className="w-6 h-6 text-forest-600 dark:text-forest-300 group-hover:text-accent transition-colors" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-ink-700 dark:text-paper-200 group-hover:text-ink-900 dark:group-hover:text-paper-100">
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED CITIES ── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-accent text-xs font-medium tracking-widest uppercase mb-1">✦ Hand-picked cities</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100">
              Start your journey
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURED_CITIES.map(({ name, coords, emoji, lat, lon }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.09 }}
            >
              <Link
                to={`/explore?lat=${lat}&lon=${lon}&city=${encodeURIComponent(name)}`}
                className="group flex items-center gap-5 p-5 rounded-2xl bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 hover:border-accent/30 dark:hover:border-accent/25 transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-card hover:shadow-card-hover card-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-paper-200 dark:bg-forest-700 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-semibold text-ink-900 dark:text-paper-100 group-hover:text-forest-600 dark:group-hover:text-forest-200 transition-colors">
                    {name}
                  </h3>
                  <p className="coords text-ink-400 dark:text-forest-400 mt-1">{coords}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-300 dark:text-forest-500 group-hover:text-accent group-hover:translate-x-1 transition-all ml-auto flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
