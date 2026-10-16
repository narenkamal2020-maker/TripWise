import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trash2, Compass, Loader2, Calendar, Download, Printer, Share2 } from 'lucide-react';
import { ItineraryItem } from '@/types';
import { getItinerary, removeFromItinerary } from '@/api/itinerary';
import { ApiError } from '@/api/client';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ErrorMessage } from '@/components/ErrorMessage';
import { formatAddress, formatKinds, formatDate, formatCoordinates } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* SVG illustration */}
      <div className="w-32 h-32 mb-8 relative">
        <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="64" cy="64" r="56" className="fill-paper-200 dark:fill-forest-800" />
          <path d="M64 32 L64 96 M32 64 L96 64" stroke="currentColor" className="text-paper-400 dark:text-forest-600" strokeWidth="3" strokeLinecap="round" />
          <circle cx="64" cy="64" r="12" className="fill-forest-200 dark:fill-forest-700" />
          <circle cx="64" cy="64" r="5" className="fill-accent/60" />
          <circle cx="42" cy="48" r="4" className="fill-forest-300 dark:fill-forest-600" />
          <circle cx="84" cy="78" r="3" className="fill-forest-300 dark:fill-forest-600" />
          <circle cx="80" cy="44" r="3.5" className="fill-accent/30" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl text-ink-700 dark:text-paper-200 mb-3">
        Your journey is waiting
      </h2>
      <p className="text-ink-400 dark:text-forest-400 text-sm max-w-xs mb-8 leading-relaxed">
        Start exploring destinations and save the ones you love to craft your perfect itinerary.
      </p>
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 shadow-glow"
      >
        <Compass className="w-4 h-4" />
        Start exploring
      </Link>
    </motion.div>
  );
}

function exportItinerary(items: ItineraryItem[]) {
  const data = {
    exported_at: new Date().toISOString(),
    title: 'My TripWise Itinerary',
    destinations: items.map((item, i) => ({
      order: i + 1,
      name: item.snapshot.name,
      category: formatKinds(item.snapshot.kinds),
      coordinates: formatCoordinates(item.snapshot.latitude, item.snapshot.longitude),
      address: formatAddress(item.snapshot.address) || undefined,
      description: item.snapshot.description || undefined,
      wikipedia: item.snapshot.wikipedia || undefined,
      saved_at: item.created_at,
    })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tripwise-itinerary-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MyTrip() {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchItinerary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItinerary();
      setItems(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load your itinerary.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItinerary(); }, [fetchItinerary]);

  const handleRemove = async (id: number, name: string) => {
    if (removingId !== null) return;
    setRemovingId(id);
    try {
      await removeFromItinerary(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast(`${name} removed from your trip.`, 'info');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : `Failed to remove ${name}.`;
      toast(msg, 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleShare = async () => {
    const text = items.map((i, idx) => `${idx + 1}. ${i.snapshot.name}`).join('\n');
    const shareText = `My TripWise Itinerary:\n${text}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My TripWise Itinerary', text: shareText }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast('Itinerary copied to clipboard!', 'success');
      } catch {
        toast('Unable to copy itinerary.', 'error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <p className="text-accent font-medium tracking-widest uppercase text-xs mb-1.5">✦ Your Journey</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100">My Trip</h1>
          {!loading && !error && (
            <p className="text-ink-400 dark:text-forest-400 text-sm mt-1.5" aria-live="polite">
              {items.length === 0
                ? 'No destinations saved yet'
                : `${items.length} ${items.length === 1 ? 'destination' : 'destinations'} saved`}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-paper-300 dark:border-forest-600 text-sm text-ink-600 dark:text-forest-200 hover:border-accent/50 hover:text-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-paper-300 dark:border-forest-600 text-sm text-ink-600 dark:text-forest-200 hover:border-accent/50 hover:text-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => exportItinerary(items)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 dark:bg-paper-100 text-white dark:text-ink-900 text-sm font-medium hover:bg-forest-700 dark:hover:bg-paper-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-card"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Destinations', value: items.length },
            {
              label: 'Countries',
              value: new Set(
                items
                  .map((i) => i.snapshot.address?.country)
                  .filter(Boolean),
              ).size || '—',
            },
            {
              label: 'Categories',
              value: new Set(
                items.map((i) => i.snapshot.kinds.split(',')[0]).filter(Boolean),
              ).size,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl p-4 text-center"
            >
              <p className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">{value}</p>
              <p className="text-xs text-ink-400 dark:text-forest-400 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Explore more */}
      {!loading && !error && items.length > 0 && (
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-ink-500 dark:text-forest-300 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-1 py-0.5"
        >
          <Compass className="w-4 h-4" />
          Explore more destinations
        </Link>
      )}

      {/* Main content */}
      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading itinerary">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-paper-200 dark:bg-forest-700 rounded-2xl animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchItinerary} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const dest = item.snapshot;
              const address = formatAddress(dest.address);
              const category = formatKinds(dest.kinds);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.035 }}
                  className="group flex gap-4 bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl overflow-hidden hover:border-paper-400 dark:hover:border-forest-600 hover:shadow-card dark:hover:shadow-card-dark transition-all"
                >
                  {/* Number badge */}
                  <div className="shrink-0 w-8 flex items-center justify-center">
                    <span className="text-xs font-bold font-mono text-ink-300 dark:text-forest-600">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <Link
                    to={`/destinations/${item.xid}`}
                    className="shrink-0 w-24 sm:w-32 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                    aria-label={`View details for ${dest.name}`}
                  >
                    <ImageWithFallback
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full min-h-[7rem] transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 py-4 pr-4 min-w-0 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-medium text-accent bg-accent/10 dark:bg-accent/15 px-2 py-0.5 rounded-full">
                          {category}
                        </span>
                        {address && (
                          <span className="flex items-center gap-1 text-xs text-ink-400 dark:text-forest-400 hidden sm:flex">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            {address}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/destinations/${item.xid}`}
                        className="font-serif text-ink-900 dark:text-paper-100 text-base sm:text-lg font-semibold hover:text-forest-600 dark:hover:text-forest-200 transition-colors line-clamp-1 focus:outline-none focus-visible:underline"
                      >
                        {dest.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-ink-300 dark:text-forest-500">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        <span>Saved {formatDate(item.created_at)}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, dest.name)}
                        disabled={removingId === item.id}
                        aria-label={`Remove ${dest.name} from My Trip`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-400 dark:text-forest-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
                      >
                        {removingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
