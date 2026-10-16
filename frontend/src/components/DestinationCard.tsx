import { motion } from 'framer-motion';
import { MapPin, Plus, Check, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Destination } from '@/types';
import { ImageWithFallback } from './ImageWithFallback';
import { formatAddress, formatKinds, formatDistance } from '@/utils/formatters';

export type CardVariant = 'default' | 'featured' | 'list';

interface Props {
  destination: Destination;
  onAdd: (dest: Destination) => void;
  isAdded?: boolean;
  isAdding?: boolean;
  index?: number;
  variant?: CardVariant;
}

function AddButton({
  onAdd,
  destination,
  isAdded,
  isAdding,
  compact = false,
}: {
  onAdd: (d: Destination) => void;
  destination: Destination;
  isAdded: boolean;
  isAdding: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(destination); }}
      disabled={isAdded || isAdding}
      aria-label={isAdded ? `${destination.name} is in your trip` : `Add ${destination.name} to My Trip`}
      className={`flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
        compact ? 'px-3 py-2 text-xs' : 'w-full py-3 text-sm'
      } ${
        isAdded
          ? 'bg-forest-600 dark:bg-forest-500 text-white cursor-default focus-visible:ring-forest-600'
          : isAdding
          ? 'bg-paper-200 dark:bg-forest-700 text-ink-400 cursor-wait focus-visible:ring-paper-300'
          : 'bg-ink-900 dark:bg-paper-100 text-white dark:text-ink-900 hover:bg-forest-700 dark:hover:bg-paper-200 focus-visible:ring-ink-900'
      }`}
    >
      {isAdding ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      ) : isAdded ? (
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      {!compact && (isAdded ? 'In My Trip' : isAdding ? 'Adding…' : 'Add to My Trip')}
    </button>
  );
}

// FEATURED card — large, full editorial
function FeaturedCard({ destination, onAdd, isAdded, isAdding }: Props) {
  const location = formatAddress(destination.address);
  const category = formatKinds(destination.kinds);
  const distance = formatDistance(destination.distance);

  return (
    <article className="group relative rounded-3xl overflow-hidden shadow-editorial bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 flex flex-col sm:flex-row h-full min-h-[300px]">
      <Link
        to={`/destinations/${destination.id}`}
        className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent focus-visible:ring-inset"
        aria-label={`View details for ${destination.name}`}
        tabIndex={-1}
      />
      {/* Image — left 55% */}
      <div className="relative w-full sm:w-[55%] overflow-hidden min-h-[200px]">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-paper-50/10 dark:to-forest-800/10" />
        {distance && (
          <span className="absolute top-4 left-4 bg-ink-900/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {distance}
          </span>
        )}
        <span className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {category}
        </span>
      </div>

      {/* Content — right */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative z-10">
        <div>
          {location && (
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-ink-400 dark:text-forest-400 shrink-0" aria-hidden="true" />
              <span className="text-xs text-ink-400 dark:text-forest-400 line-clamp-1">{location}</span>
            </div>
          )}
          <Link
            to={`/destinations/${destination.id}`}
            className="focus:outline-none focus-visible:underline"
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-paper-100 leading-tight group-hover:text-forest-600 dark:group-hover:text-forest-200 transition-colors mb-3">
              {destination.name}
            </h3>
          </Link>
          {destination.description && (
            <p className="text-ink-500 dark:text-forest-300 text-sm leading-relaxed line-clamp-3">
              {destination.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-5">
          <div className="flex-1">
            <AddButton onAdd={onAdd} destination={destination} isAdded={isAdded!} isAdding={isAdding!} />
          </div>
          <Link
            to={`/destinations/${destination.id}`}
            className="shrink-0 p-3 rounded-xl border border-paper-300 dark:border-forest-600 text-ink-600 dark:text-forest-300 hover:border-accent hover:text-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`Details for ${destination.name}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// DEFAULT card — regular grid tile
function DefaultCard({ destination, onAdd, isAdded, isAdding, index = 0 }: Props) {
  const location = formatAddress(destination.address);
  const category = formatKinds(destination.kinds);
  const distance = formatDistance(destination.distance);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      className="group bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark card-lift flex flex-col"
    >
      <Link
        to={`/destinations/${destination.id}`}
        className="relative block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        aria-label={`View details for ${destination.name}`}
      >
        <div className="h-48 overflow-hidden">
          <ImageWithFallback
            src={destination.image}
            alt={destination.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-108"
          />
        </div>
        {distance && (
          <span className="absolute top-3 left-3 bg-ink-900/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
            {distance}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {category}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-ink-300 dark:text-forest-500 shrink-0" aria-hidden="true" />
            <span className="text-xs text-ink-400 dark:text-forest-400 line-clamp-1">{location}</span>
          </div>
        )}
        <Link to={`/destinations/${destination.id}`} className="flex-1 focus:outline-none focus-visible:underline">
          <h3 className="font-serif text-ink-900 dark:text-paper-100 text-lg leading-snug line-clamp-2 group-hover:text-forest-600 dark:group-hover:text-forest-200 transition-colors">
            {destination.name}
          </h3>
        </Link>
        <div className="mt-1">
          <AddButton onAdd={onAdd} destination={destination} isAdded={isAdded!} isAdding={isAdding!} />
        </div>
      </div>
    </motion.article>
  );
}

// LIST view card — horizontal compact
function ListCard({ destination, onAdd, isAdded, isAdding, index = 0 }: Props) {
  const location = formatAddress(destination.address);
  const category = formatKinds(destination.kinds);
  const distance = formatDistance(destination.distance);

  return (
    <motion.article
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="group flex gap-4 bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl overflow-hidden hover:border-paper-400 dark:hover:border-forest-600 shadow-card dark:shadow-card-dark transition-all"
    >
      <Link
        to={`/destinations/${destination.id}`}
        className="shrink-0 w-24 sm:w-32 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        aria-label={`View ${destination.name}`}
      >
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full min-h-[6rem] transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="flex-1 py-3 pr-4 min-w-0 flex flex-col justify-between gap-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[11px] font-medium text-accent bg-accent/10 dark:bg-accent/15 px-2 py-0.5 rounded-full">{category}</span>
            {distance && <span className="text-[11px] text-ink-400 dark:text-forest-400">{distance}</span>}
            {location && (
              <span className="flex items-center gap-1 text-[11px] text-ink-400 dark:text-forest-400 hidden sm:flex">
                <MapPin className="w-2.5 h-2.5" />
                {location}
              </span>
            )}
          </div>
          <Link to={`/destinations/${destination.id}`} className="focus:outline-none focus-visible:underline">
            <h3 className="font-serif text-base font-semibold text-ink-900 dark:text-paper-100 line-clamp-1 group-hover:text-forest-600 dark:group-hover:text-forest-200 transition-colors">
              {destination.name}
            </h3>
          </Link>
        </div>
        <AddButton onAdd={onAdd} destination={destination} isAdded={isAdded!} isAdding={isAdding!} compact />
      </div>
    </motion.article>
  );
}

export function DestinationCard(props: Props) {
  const { variant = 'default', isAdded = false, isAdding = false } = props;
  const p = { ...props, isAdded, isAdding };

  if (variant === 'featured') return <FeaturedCard {...p} />;
  if (variant === 'list') return <ListCard {...p} />;
  return <DefaultCard {...p} />;
}
