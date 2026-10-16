import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

const STORAGE_KEY = 'tripwise_privacy_ack';

export function PrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing, etc.) — don't show banner
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          role="region"
          aria-label="Privacy notice"
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
        >
          <div className="max-w-4xl mx-auto bg-forest-900/95 dark:bg-forest-800/95 backdrop-blur-xl border border-forest-700/60 rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-forest-200 leading-relaxed flex-1">
              TripWise stores your saved destinations on a server and loads fonts from Google Fonts
              (which receives your IP address). We set no tracking cookies.{' '}
              <Link
                to="/privacy"
                className="text-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
              >
                Privacy Policy
              </Link>
              {' · '}
              <Link
                to="/terms"
                className="text-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
              >
                Terms
              </Link>
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss privacy notice"
              className="p-1 rounded-lg text-forest-400 hover:text-paper-100 hover:bg-forest-700 transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
