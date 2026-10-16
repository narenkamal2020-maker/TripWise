import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Tag, Globe, Plus, Check, Loader2,
  ExternalLink, Share2, Copy, CheckCheck,
} from 'lucide-react';
import { Destination } from '@/types';
import { getDestination } from '@/api/destinations';
import { addToItinerary, getItinerary } from '@/api/itinerary';
import { ApiError } from '@/api/client';
import { ErrorMessage } from '@/components/ErrorMessage';
import { formatAddress, formatKinds, formatCoordinates } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading destination" role="status">
      <div className="h-9 w-28 bg-paper-200 dark:bg-forest-700 rounded-xl" />
      <div className="h-72 sm:h-[480px] bg-paper-200 dark:bg-forest-700 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-1/4 bg-paper-200 dark:bg-forest-700 rounded" />
          <div className="h-12 w-3/4 bg-paper-200 dark:bg-forest-700 rounded" />
          <div className="h-4 w-1/3 bg-paper-200 dark:bg-forest-700 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-paper-200 dark:bg-forest-700 rounded" />
            <div className="h-4 bg-paper-200 dark:bg-forest-700 rounded w-5/6" />
            <div className="h-4 bg-paper-200 dark:bg-forest-700 rounded w-4/6" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-paper-200 dark:bg-forest-700 rounded-2xl" />
          <div className="h-24 bg-paper-200 dark:bg-forest-700 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied — silently ignore
    }
  };

  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied!' : `Copy ${label}`}
      className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-forest-300 hover:text-accent dark:hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1 py-0.5"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function ShareButton({ title, url }: { title: string; url: string }) {
  const { toast } = useToast();

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `TripWise · ${title}`, url });
      } catch {
        // user cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard!', 'success');
      } catch {
        toast('Unable to copy link.', 'error');
      }
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-paper-300 dark:border-forest-600 text-sm text-ink-600 dark:text-forest-200 hover:border-accent/50 hover:text-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  );
}

export function DestinationDetail() {
  const { xid } = useParams<{ xid: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!xid) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([getDestination(xid, ctrl.signal), getItinerary(ctrl.signal)])
      .then(([dest, items]) => {
        setDestination(dest);
        setIsAdded(items.some((i) => i.xid === xid));
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg =
          err instanceof ApiError
            ? err.status === 404
              ? 'This destination could not be found.'
              : err.message
            : 'Failed to load destination details.';
        setError(msg);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [xid]);

  const handleAdd = useCallback(async () => {
    if (!destination || isAdded || isAdding) return;
    setIsAdding(true);
    setAddError(null);
    try {
      await addToItinerary(destination.id);
      setIsAdded(true);
      toast(`${destination.name} added to your trip!`, 'success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setIsAdded(true);
        toast(`${destination.name} is already in your trip.`, 'info');
      } else {
        const msg = err instanceof ApiError ? err.message : 'Failed to add to trip.';
        setAddError(msg);
        toast(msg, 'error');
        setTimeout(() => setAddError(null), 4000);
      }
    } finally {
      setIsAdding(false);
    }
  }, [destination, isAdded, isAdding, toast]);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-forest-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!destination) return null;

  const address = formatAddress(destination.address);
  const category = formatKinds(destination.kinds);
  const coords = formatCoordinates(destination.latitude, destination.longitude);
  const allKinds = destination.kinds
    ? destination.kinds.split(',').map((k) => k.trim().replace(/_/g, ' ')).filter(Boolean)
    : [];
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      {/* Back nav */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-forest-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <ShareButton title={destination.name} url={pageUrl} />
      </div>

      {/* Hero image — full bleed, cinematic */}
      <div className="relative rounded-3xl overflow-hidden shadow-editorial" style={{ aspectRatio: '16/7' }}>
        <div
          className={`absolute inset-0 bg-paper-200 dark:bg-forest-700 transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`}
        />
        {destination.image && (
          <img
            src={destination.image}
            alt={destination.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        )}
        {!destination.image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-900/50 dark:bg-forest-900">
            <MapPin className="w-12 h-12 text-forest-400 mb-2" />
            <span className="text-forest-300 text-sm">No image available</span>
          </div>
        )}
        {/* Overlay gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-accent/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {category}
                </span>
                {address && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/80 backdrop-blur-sm bg-ink-900/40 px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {address}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
                {destination.name}
              </h1>
              <p className="coords text-white/60 mt-2">{coords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-7">
          {destination.description ? (
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink-800 dark:text-paper-100 mb-3">About</h2>
              <p className="text-ink-600 dark:text-forest-200 leading-relaxed text-base">{destination.description}</p>
            </div>
          ) : (
            <p className="text-ink-400 dark:text-forest-400 italic text-sm">
              No description available for this destination.
            </p>
          )}

          {allKinds.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink-800 dark:text-paper-100 mb-3">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {allKinds.map((k) => (
                  <span
                    key={k}
                    className="px-3 py-1.5 bg-paper-200 dark:bg-forest-700 text-ink-600 dark:text-forest-200 text-xs rounded-full capitalize font-medium"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location detail */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink-800 dark:text-paper-100 mb-3">Location</h2>
            <div className="space-y-2">
              {address && (
                <div className="flex items-start gap-2.5 text-sm text-ink-600 dark:text-forest-200">
                  <MapPin className="w-4 h-4 text-ink-400 dark:text-forest-400 mt-0.5 shrink-0" />
                  <span>{address}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="text-ink-400 dark:text-forest-400 font-mono text-xs">⊕</span>
                <span className="font-mono text-sm text-ink-600 dark:text-forest-200">{coords}</span>
                <CopyButton text={coords} label="coordinates" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Plan your visit card */}
          <div className="bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl p-5 space-y-4">
            <h2 className="font-serif text-base font-semibold text-ink-700 dark:text-paper-200">Plan your visit</h2>

            <button
              onClick={handleAdd}
              disabled={isAdded || isAdding}
              aria-label={isAdded ? 'Already in your trip' : `Add ${destination.name} to My Trip`}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isAdded
                  ? 'bg-forest-600 dark:bg-forest-500 text-white cursor-default focus-visible:ring-forest-600'
                  : isAdding
                  ? 'bg-paper-200 dark:bg-forest-700 text-ink-500 cursor-wait'
                  : 'bg-ink-900 dark:bg-paper-100 text-white dark:text-ink-900 hover:bg-forest-700 dark:hover:bg-paper-200 focus-visible:ring-ink-900 shadow-card'
              }`}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isAdded ? 'Saved to My Trip' : isAdding ? 'Saving…' : 'Add to My Trip'}
            </button>

            {isAdded && (
              <Link
                to="/my-trip"
                className="flex items-center justify-center gap-1.5 text-sm text-accent hover:text-accent-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded py-1"
              >
                View My Trip →
              </Link>
            )}

            {addError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400 text-center">{addError}</p>
            )}
          </div>

          {/* External link */}
          {destination.wikipedia && (
            <a
              href={destination.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-3 bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl text-sm text-ink-600 dark:text-forest-200 hover:text-ink-900 dark:hover:text-paper-100 hover:border-ink-300 dark:hover:border-forest-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Globe className="w-4 h-4 text-ink-400 dark:text-forest-400 shrink-0" />
              <span>Wikipedia article</span>
              <ExternalLink className="w-3 h-3 ml-auto text-ink-300 dark:text-forest-500 shrink-0" />
            </a>
          )}

          {/* Source attribution */}
          <p className="text-xs text-ink-300 dark:text-forest-500 px-1">
            Data from{' '}
            <a
              href="https://opentripmap.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/70 hover:text-accent underline-offset-2 hover:underline transition-colors"
            >
              OpenTripMap
            </a>
            {' '}(CC BY-SA 4.0)
          </p>
        </div>
      </div>

      {/* Mobile sticky add bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-paper-100/95 dark:bg-forest-900/95 backdrop-blur-xl border-t border-paper-300 dark:border-forest-700">
        <button
          onClick={handleAdd}
          disabled={isAdded || isAdding}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isAdded
              ? 'bg-forest-600 text-white cursor-default'
              : isAdding
              ? 'bg-paper-200 dark:bg-forest-700 text-ink-500 cursor-wait'
              : 'bg-ink-900 dark:bg-paper-100 text-white dark:text-ink-900 hover:bg-forest-700 shadow-card'
          }`}
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdded ? 'Saved to My Trip' : isAdding ? 'Saving…' : `Add ${destination.name} to My Trip`}
        </button>
      </div>
      {/* Spacer for mobile sticky bar */}
      <div className="lg:hidden h-24" aria-hidden="true" />
    </motion.div>
  );
}
