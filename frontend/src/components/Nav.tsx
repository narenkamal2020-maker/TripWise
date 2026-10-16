import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Compass, Map, Menu, X, Sun, Moon, BookMarked, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getItinerary } from '@/api/itinerary';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { toggle, isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    getItinerary().then((items) => setTripCount(items.length)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
      isActive
        ? 'text-accent bg-accent/10 dark:bg-accent/15'
        : 'text-ink-600 dark:text-forest-200 hover:text-ink-900 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-forest-700'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-paper-100/90 dark:bg-forest-900/90 backdrop-blur-xl shadow-sm border-b border-paper-300/60 dark:border-forest-700/60'
          : 'bg-paper-100/60 dark:bg-forest-900/60 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded-lg"
          aria-label="TripWise home"
        >
          <div className="w-8 h-8 rounded-xl bg-forest-700 dark:bg-forest-600 flex items-center justify-center group-hover:bg-forest-600 dark:group-hover:bg-forest-500 transition-colors shadow-sm">
            <Compass className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>
          <span className="font-serif text-xl font-bold text-ink-900 dark:text-paper-100 tracking-tight">
            Trip<em className="text-accent not-italic">Wise</em>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          <NavLink to="/explore" className={linkClass}>
            <Compass className="w-4 h-4" aria-hidden="true" />
            Explore
          </NavLink>

          <NavLink to="/my-trip" className={linkClass}>
            <div className="relative">
              <Map className="w-4 h-4" aria-hidden="true" />
              {tripCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-[9px] font-bold bg-accent text-white rounded-full flex items-center justify-center leading-none">
                  {tripCount > 9 ? '9+' : tripCount}
                </span>
              )}
            </div>
            My Trip
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                Sign Up
              </NavLink>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-2 p-2 rounded-lg text-ink-500 dark:text-forest-300 hover:text-ink-900 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-forest-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>

        {/* Mobile: trip count + hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          {tripCount > 0 && (
            <Link
              to="/my-trip"
              className="relative p-2 text-ink-600 dark:text-forest-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
              aria-label={`My Trip, ${tripCount} destinations`}
            >
              <BookMarked className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-accent text-white rounded-full flex items-center justify-center">
                {tripCount > 9 ? '9+' : tripCount}
              </span>
            </Link>
          )}
          <button
            className="p-2 rounded-lg text-ink-700 dark:text-forest-200 hover:bg-paper-200 dark:hover:bg-forest-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="sm:hidden overflow-hidden border-t border-paper-300/60 dark:border-forest-700/60 bg-paper-100/95 dark:bg-forest-900/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col p-3 gap-1" aria-label="Mobile navigation">
              <NavLink to="/explore" className={linkClass} onClick={() => setOpen(false)}>
                <Compass className="w-4 h-4" />
                Explore
              </NavLink>
              <NavLink to="/my-trip" className={linkClass} onClick={() => setOpen(false)}>
                <Map className="w-4 h-4" />
                My Trip
                {tripCount > 0 && (
                  <span className="ml-auto text-xs font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                    {tripCount}
                  </span>
                )}
              </NavLink>
              {!user && (
                <>
                  <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                    <LogIn className="w-4 h-4" />
                    Login
                  </NavLink>
                  <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </NavLink>
                </>
              )}
              <div className="pt-2 border-t border-paper-300 dark:border-forest-700 mt-1">
                <button
                  onClick={() => { toggle(); setOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-ink-600 dark:text-forest-200 hover:text-ink-900 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-forest-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
