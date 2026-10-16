import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className = '' }: Props) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-paper-200 dark:bg-forest-700 text-ink-300 dark:text-forest-500 ${className}`}
        aria-label={`No image available for ${alt}`}
        role="img"
      >
        <MapPin className="w-8 h-8 mb-2 opacity-40" aria-hidden="true" />
        <span className="text-xs font-sans opacity-50 text-center px-4">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-paper-200 dark:bg-forest-700 animate-pulse" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        className={`object-cover w-full h-full transition-opacity duration-400 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        loading="lazy"
      />
    </div>
  );
}
