import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, X, SlidersHorizontal, LayoutGrid, AlignJustify } from 'lucide-react';
import { Destination, City, DestinationQuery } from '@/types';
import { searchDestinations } from '@/api/destinations';
import { addToItinerary, getItinerary } from '@/api/itinerary';
import { ApiError } from '@/api/client';
import { DestinationCard } from '@/components/DestinationCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { POPULAR_CITIES, KIND_FILTERS } from '@/data/cities';
import { formatCoordinates } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

type SearchMode = 'text' | 'nearby';
type SortOption = 'distance' | 'name' | 'rate';
type ViewMode = 'grid' | 'list';

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  child: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  },
};

export function Explore() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialise from URL query params
  const initialQ = searchParams.get('q') ?? '';
  const initialLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null;
  const initialLon = searchParams.get('lon') ? Number(searchParams.get('lon')) : null;
  const initialKinds = searchParams.get('kinds') ?? '';
  const initialCity = searchParams.get('city') ?? '';

  const [mode, setMode] = useState<SearchMode>(
    initialLat !== null && initialLon !== null ? 'nearby' : 'text',
  );
  const [query, setQuery] = useState(initialQ);
  const [selectedCity, setSelectedCity] = useState<City | null>(() => {
    if (initialCity && initialLat !== null && initialLon !== null) {
      const found = POPULAR_CITIES.find((c) => c.name === initialCity);
      return found ?? { name: initialCity, country: '', lat: initialLat, lon: initialLon, emoji: '📍' };
    }
    return null;
  });
  const [kindFilter, setKindFilter] = useState(initialKinds);
  const [sort, setSort] = useState<SortOption>('distance');
  const [radius, setRadius] = useState(5000);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [savedXids, setSavedXids] = useState<Set<string>>(new Set());
  const [addingXid, setAddingXid] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getItinerary()
      .then((items) => setSavedXids(new Set(items.map((i) => i.xid))))
      .catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (params: DestinationQuery) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchDestinations(params, ctrl.signal);
      setDestinations(results);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Failed to load destinations.';
      setError(msg);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search when mounted with URL params
  useEffect(() => {
    if (initialQ.length >= 3) {
      doSearch({ q: initialQ, kinds: initialKinds || undefined, sort, limit: 20 });
    } else if (initialLat !== null && initialLon !== null) {
      doSearch({ lat: initialLat, lon: initialLon, radius, kinds: initialKinds || undefined, sort, limit: 20 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text search debounce
  useEffect(() => {
    if (mode !== 'text') return;
    if (!query.trim() || query.trim().length < 3) {
      if (!initialQ) { setDestinations([]); setHasSearched(false); }
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      doSearch({ q: query.trim(), kinds: kindFilter || undefined, sort, limit: 20 });
    }, 420);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, kindFilter, sort, mode, doSearch, initialQ]);

  // Nearby search
  useEffect(() => {
    if (mode !== 'nearby' || !selectedCity) return;
    doSearch({
      lat: selectedCity.lat,
      lon: selectedCity.lon,
      radius,
      kinds: kindFilter || undefined,
      sort,
      limit: 20,
    });
  }, [selectedCity, kindFilter, sort, radius, mode, doSearch]);

  const handleModeToggle = (newMode: SearchMode) => {
    setMode(newMode);
    setDestinations([]);
    setHasSearched(false);
    setError(null);
    setQuery('');
    setSelectedCity(null);
  };

  const handleAdd = async (dest: Destination) => {
    if (!user) {
      toast('Sign in to save destinations to your trip.', 'info');
      return;
    }
    if (savedXids.has(dest.id) || addingXid === dest.id) return;
    setAddingXid(dest.id);
    try {
      await addToItinerary(dest.id);
      setSavedXids((prev) => new Set([...prev, dest.id]));
      toast(`${dest.name} added to your trip!`, 'success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSavedXids((prev) => new Set([...prev, dest.id]));
        toast(`${dest.name} is already in your trip.`, 'info');
      } else {
        const msg = err instanceof ApiError ? err.message : 'Failed to add destination.';
        toast(msg, 'error');
      }
    } finally {
      setAddingXid(null);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setDestinations([]);
    setHasSearched(false);
    setError(null);
  };

  const activeFilters = kindFilter || sort !== 'distance';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Hero bar */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-forest-900 px-6 py-10 sm:px-12 sm:py-14 shadow-editorial">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 50%, rgba(249,115,22,0.6) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(61,107,90,0.8) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-topo-dark opacity-30" />
        <div className="relative z-10">
          <p className="text-accent font-medium tracking-widest uppercase text-xs mb-3">Destination Discovery</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper-100 leading-tight max-w-sm mb-2">
            Where will you <em className="text-accent not-italic">go next?</em>
          </h1>
          <p className="text-forest-200 text-sm sm:text-base max-w-xs font-light">
            Search anywhere, or explore what's near a city.
          </p>
        </div>
        {selectedCity && (
          <div className="absolute bottom-4 right-6 text-forest-500 font-mono text-xs hidden sm:block">
            {formatCoordinates(selectedCity.lat, selectedCity.lon)}
          </div>
        )}
      </div>

      {/* Mode + View controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-paper-200 dark:bg-forest-800 p-1 rounded-xl">
          <button
            onClick={() => handleModeToggle('text')}
            aria-pressed={mode === 'text'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              mode === 'text'
                ? 'bg-white dark:bg-forest-700 shadow-sm text-ink-900 dark:text-paper-100'
                : 'text-ink-500 dark:text-forest-300 hover:text-ink-700 dark:hover:text-paper-200'
            }`}
          >
            <Search className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Search
          </button>
          <button
            onClick={() => handleModeToggle('nearby')}
            aria-pressed={mode === 'nearby'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              mode === 'nearby'
                ? 'bg-white dark:bg-forest-700 shadow-sm text-ink-900 dark:text-paper-100'
                : 'text-ink-500 dark:text-forest-300 hover:text-ink-700 dark:hover:text-paper-200'
            }`}
          >
            <MapPin className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Nearby
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${viewMode === 'grid' ? 'bg-paper-300 dark:bg-forest-700 text-ink-900 dark:text-paper-100' : 'text-ink-400 dark:text-forest-400 hover:text-ink-700 dark:hover:text-paper-200'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${viewMode === 'list' ? 'bg-paper-300 dark:bg-forest-700 text-ink-900 dark:text-paper-100' : 'text-ink-400 dark:text-forest-400 hover:text-ink-700 dark:hover:text-paper-200'}`}
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search controls */}
      <div className="space-y-3">
        {mode === 'text' ? (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 dark:text-forest-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, landmarks, museums…"
              aria-label="Search destinations"
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-forest-800 border border-paper-300 dark:border-forest-600 rounded-2xl text-ink-900 dark:text-paper-100 placeholder-ink-300 dark:placeholder-forest-500 text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-card dark:shadow-card-dark transition-all"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 dark:text-forest-400 hover:text-ink-700 dark:hover:text-paper-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen((v) => !v)}
              aria-expanded={cityDropdownOpen}
              aria-haspopup="listbox"
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-forest-800 border border-paper-300 dark:border-forest-600 rounded-2xl text-left shadow-card dark:shadow-card-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-ink-400 dark:text-forest-400" aria-hidden="true" />
                {selectedCity ? (
                  <span className="text-ink-900 dark:text-paper-100 font-medium">
                    {selectedCity.name}, {selectedCity.country}
                  </span>
                ) : (
                  <span className="text-ink-400 dark:text-forest-400">Select a city to explore nearby…</span>
                )}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-ink-400 dark:text-forest-400 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {cityDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  role="listbox"
                  aria-label="Select a city"
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-forest-800 border border-paper-300 dark:border-forest-600 rounded-2xl shadow-card-hover dark:shadow-card-hover-dark z-20 max-h-72 overflow-y-auto"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 p-2 gap-1">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city.name}
                        role="option"
                        aria-selected={selectedCity?.name === city.name}
                        onClick={() => { setSelectedCity(city); setCityDropdownOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors focus:outline-none focus-visible:bg-paper-100 dark:focus-visible:bg-forest-700 ${
                          selectedCity?.name === city.name
                            ? 'bg-accent/10 dark:bg-accent/15 text-accent font-medium'
                            : 'text-ink-700 dark:text-forest-100 hover:bg-paper-100 dark:hover:bg-forest-700'
                        }`}
                      >
                        <span>{city.name}</span>
                        <span className="text-ink-300 dark:text-forest-500 text-xs ml-auto">{city.country}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Filter row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-forest-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide filters' : 'Filters & Sort'}
            {activeFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-label="Active filters" />
            )}
          </button>
          {hasSearched && !loading && (
            <p className="text-sm text-ink-400 dark:text-forest-400" aria-live="polite">
              {destinations.length} {destinations.length === 1 ? 'place' : 'places'} found
            </p>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                {/* Categories */}
                <div>
                  <p className="text-xs font-medium text-ink-500 dark:text-forest-400 uppercase tracking-wider mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {KIND_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setKindFilter(f.value)}
                        aria-pressed={kindFilter === f.value}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          kindFilter === f.value
                            ? 'bg-ink-900 dark:bg-paper-100 text-white dark:text-ink-900'
                            : 'bg-paper-200 dark:bg-forest-700 text-ink-600 dark:text-forest-200 hover:bg-paper-300 dark:hover:bg-forest-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="sort-select" className="text-xs font-medium text-ink-500 dark:text-forest-400 uppercase tracking-wider mb-2 block">
                      Sort by
                    </label>
                    <select
                      id="sort-select"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="w-full px-3 py-2 bg-white dark:bg-forest-800 border border-paper-300 dark:border-forest-600 rounded-xl text-sm text-ink-700 dark:text-paper-200 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="distance">Distance</option>
                      <option value="name">Name (A–Z)</option>
                      <option value="rate">Rating</option>
                    </select>
                  </div>

                  {mode === 'nearby' && (
                    <div className="flex-1">
                      <label htmlFor="radius-select" className="text-xs font-medium text-ink-500 dark:text-forest-400 uppercase tracking-wider mb-2 block">
                        Search radius
                      </label>
                      <select
                        id="radius-select"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-forest-800 border border-paper-300 dark:border-forest-600 rounded-xl text-sm text-ink-700 dark:text-paper-200 focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value={1000}>1 km</option>
                        <option value={2000}>2 km</option>
                        <option value={5000}>5 km</option>
                        <option value={10000}>10 km</option>
                        <option value={20000}>20 km</option>
                        <option value={50000}>50 km</option>
                      </select>
                    </div>
                  )}
                </div>

                {activeFilters && (
                  <button
                    onClick={() => { setKindFilter(''); setSort('distance'); }}
                    className="text-xs text-accent hover:text-accent-dark underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results area */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={
            mode === 'text' && query
              ? () => doSearch({ q: query.trim(), kinds: kindFilter || undefined, sort, limit: 20 })
              : mode === 'nearby' && selectedCity
              ? () => doSearch({ lat: selectedCity.lat, lon: selectedCity.lon, radius, kinds: kindFilter || undefined, sort, limit: 20 })
              : undefined
          }
        />
      ) : hasSearched && destinations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-6xl mb-5 animate-float">🗺️</div>
          <h3 className="font-serif text-2xl text-ink-700 dark:text-paper-200 mb-2">No destinations found</h3>
          <p className="text-ink-400 dark:text-forest-400 text-sm max-w-sm">
            {mode === 'text'
              ? 'Try a different search term or remove your filters.'
              : 'Try a different city or expand the search radius.'}
          </p>
          {activeFilters && (
            <button
              onClick={() => { setKindFilter(''); setSort('distance'); }}
              className="mt-4 text-sm text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Clear filters and try again
            </button>
          )}
        </motion.div>
      ) : !hasSearched ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-6xl mb-5 animate-float">
            {mode === 'nearby' ? '📍' : '🔍'}
          </div>
          <h3 className="font-serif text-2xl text-ink-700 dark:text-paper-200 mb-2">
            {mode === 'text' ? 'Search for a destination' : 'Select a city to explore'}
          </h3>
          <p className="text-ink-400 dark:text-forest-400 text-sm max-w-sm">
            {mode === 'text'
              ? 'Type at least 3 characters to discover places around the world.'
              : 'Choose from our curated list of cities to discover nearby attractions.'}
          </p>
        </motion.div>
      ) : viewMode === 'list' ? (
        // LIST VIEW
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {destinations.map((dest, i) => (
            <motion.div key={dest.id} variants={stagger.child}>
              <DestinationCard
                destination={dest}
                onAdd={handleAdd}
                isAdded={savedXids.has(dest.id)}
                isAdding={addingXid === dest.id}
                index={i}
                variant="list"
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // EDITORIAL GRID VIEW
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              variants={stagger.child}
              className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
            >
              <DestinationCard
                destination={dest}
                onAdd={handleAdd}
                isAdded={savedXids.has(dest.id)}
                isAdding={addingXid === dest.id}
                index={i}
                variant={i === 0 ? 'featured' : 'default'}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
