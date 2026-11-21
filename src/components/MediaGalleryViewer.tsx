import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaImage } from './MediaImage';

interface MediaGalleryViewerProps {
  images: string[];
  alt: string;
  fallbackTitle?: string;
  variant?: 'modal' | 'card';
  testId?: string;
}

/**
 * Displays ONLY uploaded photos (1..4).
 * - When 1 photo exists: renders a clean single photo with zero arrows or empty thumbnails.
 * - When 2..4 photos exist: renders active photo + prev/next arrows + exact thumbnail strip.
 */
export function MediaGalleryViewer({
  images,
  alt,
  fallbackTitle,
  variant = 'card',
  testId,
}: MediaGalleryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const signature = images.join('|');
  useEffect(() => {
    setActiveIndex(0);
  }, [signature]);

  const safeIndex =
    images.length > 0 ? Math.min(activeIndex, images.length - 1) : 0;
  const activeSrc = images[safeIndex] ?? '';
  const hasMultiple = images.length > 1;

  const handlePrev = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  if (variant === 'modal') {
    return (
      <div
        data-testid={testId}
        className="flex flex-col h-full bg-[#180e08]"
      >
        <div className="relative flex-1 min-h-[260px] md:min-h-[340px] bg-[#140c07] overflow-hidden">
          <MediaImage
            src={activeSrc}
            alt={hasMultiple ? `${alt} — ფოტო ${safeIndex + 1}` : alt}
            fallbackTitle={fallbackTitle}
            className="w-full h-full object-cover"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="წინა ფოტო"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-md bg-[#1a1009]/85 border border-[#ece2cc]/15 text-[#ece2cc] hover:text-[#dcb975] hover:border-[#dcb975]/50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="შემდეგი ფოტო"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-md bg-[#1a1009]/85 border border-[#ece2cc]/15 text-[#ece2cc] hover:text-[#dcb975] hover:border-[#dcb975]/50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#1a1009]/85 border border-[#ece2cc]/12 font-mono text-[11px] text-[#ece2cc] tabular-nums">
                {safeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {hasMultiple && (
          <div
            data-testid={testId ? `${testId}-thumbs` : undefined}
            className="p-3 bg-[#1c110a] border-t border-[#ece2cc]/10 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))`,
            }}
          >
            {images.map((imgUrl, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`ფოტო ${idx + 1} ნახვა`}
                  aria-pressed={active}
                  className={`relative aspect-[16/10] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    active
                      ? 'border-[#dcb975] opacity-100'
                      : 'border-transparent opacity-65 hover:opacity-100 hover:border-[#ece2cc]/30'
                  }`}
                >
                  <MediaImage
                    src={imgUrl}
                    alt={`${alt} — მინიატურა ${idx + 1}`}
                    fallbackTitle={fallbackTitle}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Card variant (used in MapPage floating Location Detail Card)
  return (
    <div data-testid={testId} className="bg-[#180e08]">
      <div className="relative aspect-[16/10] bg-[#140c07] overflow-hidden">
        <MediaImage
          src={activeSrc}
          alt={hasMultiple ? `${alt} — ფოტო ${safeIndex + 1}` : alt}
          fallbackTitle={fallbackTitle}
          className="w-full h-full object-cover"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="წინა ფოტო"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md bg-[#1a1009]/85 border border-[#ece2cc]/15 text-[#ece2cc] hover:text-[#dcb975] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="შემდეგი ფოტო"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md bg-[#1a1009]/85 border border-[#ece2cc]/15 text-[#ece2cc] hover:text-[#dcb975] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-[#1a1009]/85 border border-[#ece2cc]/12 font-mono text-[11px] text-[#ece2cc] tabular-nums">
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          data-testid={testId ? `${testId}-thumbs` : undefined}
          className="p-2.5 bg-[#1b110a] border-b border-[#ece2cc]/10 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))`,
          }}
        >
          {images.map((imgUrl, idx) => {
            const active = idx === safeIndex;
            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`ფოტო ${idx + 1} ნახვა`}
                aria-pressed={active}
                className={`relative aspect-[16/10] rounded overflow-hidden border-2 transition-all cursor-pointer ${
                  active
                    ? 'border-[#dcb975] opacity-100'
                    : 'border-transparent opacity-65 hover:opacity-100 hover:border-[#ece2cc]/30'
                }`}
              >
                <MediaImage
                  src={imgUrl}
                  alt={`${alt} — მინიატურა ${idx + 1}`}
                  fallbackTitle={fallbackTitle}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
