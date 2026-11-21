import { useRef, useState, type ChangeEvent } from 'react';
import { Film, Image as ImageIcon, Loader2, RotateCcw, Upload } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import {
  uploadImageFile,
  uploadVideoFile,
  useResolvedMediaUrl,
} from '../../lib/mediaUpload';
import type { HeroMediaConfig } from '../../types';
import { MediaImage } from '../MediaImage';

interface HeroMediaUploadFieldProps {
  media: HeroMediaConfig;
  onChange: (nextMedia: HeroMediaConfig) => void;
}

export function HeroMediaUploadField({
  media,
  onChange,
}: HeroMediaUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = media.type === 'video';
  const resolvedVideoSrc = useResolvedMediaUrl(isVideo ? media.src : '');
  const resolvedPosterSrc = useResolvedMediaUrl(
    isVideo ? media.poster : media.src,
  );
  const hasUploadedVideo =
    isVideo && Boolean(media.src) && media.src !== media.poster;

  const handleModeSwitch = (nextType: 'image' | 'video') => {
    setError(null);
    if (nextType === media.type) return;
    if (nextType === 'video') {
      onChange({
        type: 'video',
        src: '',
        poster: media.type === 'video' ? media.poster : media.src,
        alt: media.alt,
      });
    } else {
      onChange({
        type: 'image',
        src:
          media.type === 'video'
            ? media.poster || SITE_CONFIG.heroMedia.src
            : media.src,
        alt: media.alt,
      });
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      if (isVideo) {
        const videoRef = await uploadVideoFile(file);
        onChange({
          type: 'video',
          src: videoRef,
          poster: media.type === 'video' ? media.poster : SITE_CONFIG.heroMedia.src,
          alt: media.alt,
        });
      } else {
        const imageRef = await uploadImageFile(file);
        onChange({
          type: 'image',
          src: imageRef,
          alt: media.alt,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ფაილის ატვირთვა ვერ მოხერხდა.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleResetDefault = () => {
    setError(null);
    onChange({
      type: 'image',
      src: SITE_CONFIG.heroMedia.src,
      alt: SITE_CONFIG.heroMedia.alt,
    });
  };

  return (
    <div
      data-testid="admin-hero-media-upload"
      className="p-4 sm:p-5 rounded-lg bg-[#1a1009] border border-[#ece2cc]/10 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#dcb975]">
            Hero ფონის ფოტო ან ვიდეო (ატვირთვა)
          </p>
          <p className="text-[11px] text-[#c2b398] mt-0.5">
            აირჩიეთ ფორმატი და ატვირთეთ ფოტო (JPG, PNG, WebP) ან ვიდეო (MP4, WebM) პირდაპირ მოწყობილობიდან.
          </p>
        </div>

        {/* Mode Switcher: Photo vs Video */}
        <div
          role="tablist"
          aria-label="Hero ფონის ტიპი"
          className="inline-flex items-center gap-1 p-1 bg-[#140c07] border border-[#ece2cc]/12 rounded-md w-fit shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isVideo}
            onClick={() => handleModeSwitch('image')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              !isVideo
                ? 'bg-[#dcb975] text-[#1a1009]'
                : 'text-[#c2b398] hover:text-[#ece2cc]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ფოტო</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isVideo}
            onClick={() => handleModeSwitch('video')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              isVideo
                ? 'bg-[#dcb975] text-[#1a1009]'
                : 'text-[#c2b398] hover:text-[#ece2cc]'
            }`}
          >
            <Film className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ვიდეო</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-md bg-[#3c1b15] border border-[#e68a73]/40 text-xs text-[#f2b5a4]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Live Preview */}
        <div className="lg:col-span-6 relative aspect-[16/9] rounded-md overflow-hidden bg-[#140c07] border border-[#ece2cc]/12">
          {isVideo && hasUploadedVideo && resolvedVideoSrc ? (
            <video
              key={resolvedVideoSrc}
              src={resolvedVideoSrc}
              poster={resolvedPosterSrc || undefined}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <MediaImage
              src={isVideo ? media.poster : media.src}
              alt={media.alt}
              fallbackTitle="Hero ფონი"
              className="w-full h-full object-cover"
            />
          )}

          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#140c07]/90 border border-[#ece2cc]/15 text-[11px] font-medium text-[#dcb975]">
            {isVideo
              ? hasUploadedVideo
                ? 'ვიდეო ატვირთულია'
                : 'აირჩიეთ ვიდეო ფაილი'
              : 'აქტიური ფოტო'}
          </span>
        </div>

        {/* Upload Action Zone */}
        <div className="lg:col-span-6 space-y-3">
          <input
            ref={fileInputRef}
            id="admin-hero-media-file"
            type="file"
            accept={isVideo ? 'video/mp4,video/webm,video/*' : 'image/*'}
            aria-label={
              isVideo ? 'Hero ვიდეოს ატვირთვა' : 'Hero ფოტოს ატვირთვა'
            }
            onChange={handleFileChange}
            className="sr-only"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-5 rounded-lg border border-dashed border-[#dcb975]/45 hover:border-[#dcb975] bg-[#140c07] hover:bg-[#1e130b] transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-[#dcb975] animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="w-6 h-6 text-[#dcb975]" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-[#ece2cc]">
              {uploading
                ? 'იტვირთება...'
                : isVideo
                  ? 'ვიდეოს ატვირთვა (MP4 / WebM)'
                  : 'ფოტოს ატვირთვა (JPG / PNG / WebP)'}
            </span>
            <span className="text-xs text-[#c2b398]">
              დააკლიკეთ მოწყობილობიდან ფაილის ასარჩევად
            </span>
          </button>

          <div className="flex items-center justify-between gap-2 text-[11px] text-[#c2b398]">
            <span>რეკომენდებული: 1920×1080 (16:9)</span>
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1 text-[#c2b398] hover:text-[#dcb975] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>საწყისი ფოტო</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
