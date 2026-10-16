import { Outlet, Link } from 'react-router-dom';
import { Nav } from './Nav';
import { PrivacyBanner } from './PrivacyBanner';

export function Layout() {
  return (
    <div className="min-h-screen font-sans antialiased bg-paper-100 dark:bg-forest-900 text-ink-900 dark:text-paper-100 transition-colors duration-300">
      <Nav />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-paper-300 dark:border-forest-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-forest-700 dark:bg-forest-600 flex items-center justify-center">
                <span className="text-accent text-sm font-serif font-bold">T</span>
              </div>
              <div>
                <p className="font-serif font-bold text-ink-900 dark:text-paper-100 leading-none">TripWise</p>
                <p className="text-xs text-ink-400 dark:text-forest-300 mt-0.5">AWS Student Builder Group · VIT Chennai</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-ink-400 dark:text-forest-300">
              <span>Places data by{' '}
                <a
                  href="https://opentripmap.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded transition-colors"
                >
                  OpenTripMap
                </a>
                {' '}(CC BY-SA 4.0)
              </span>
              <span className="hidden sm:inline text-paper-400 dark:text-forest-600">·</span>
              <Link
                to="/privacy"
                className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
              >
                Privacy
              </Link>
              <span className="hidden sm:inline text-paper-400 dark:text-forest-600">·</span>
              <Link
                to="/terms"
                className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
              >
                Terms
              </Link>
              <span className="hidden sm:inline text-paper-400 dark:text-forest-600">·</span>
              <span className="font-mono coords">
                20.0000°N, 78.0000°E
              </span>
            </div>
          </div>
        </div>
      </footer>
      <PrivacyBanner />
    </div>
  );
}
