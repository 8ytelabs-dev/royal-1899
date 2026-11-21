import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { isStoredMediaRef, useResolvedMediaUrl } from '../lib/mediaUpload';

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export function MediaImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
}: MediaImageProps) {
  const resolvedSrc = useResolvedMediaUrl(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src, resolvedSrc]);

  // While an IndexedDB blob is hydrating asynchronously, render a clean dark frame
  if (isStoredMediaRef(src) && !resolvedSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-[#180e08] animate-pulse ${className}`}
      />
    );
  }

  if (hasError || !resolvedSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2c1c12] via-[#22150d] to-[#180e08] text-[#dcb975]/80 p-6 text-center ${className}`}
      >
        <Compass className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
        {fallbackTitle && (
          <span className="font-display text-sm text-[#ece2cc]/85 max-w-[20ch]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
