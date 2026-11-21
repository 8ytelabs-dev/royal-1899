import { useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react';
import {
  MAX_GALLERY_IMAGES,
  appendGalleryUploads,
  promoteGallerySlot,
  removeGallerySlot,
  resolveGalleryImages,
  setGallerySlot,
  toGallerySlots,
} from '../../lib/mediaGallery';
import { uploadImageFile } from '../../lib/mediaUpload';
import { MediaImage } from '../MediaImage';

interface MultiImageUploadFieldProps {
  idPrefix: string;
  label?: string;
  images: string[];
  onChange: (nextGalleryImages: string[]) => void;
  fallbackTitle?: string;
}

export function MultiImageUploadField({
  idPrefix,
  label = 'ფოტოების ატვირთვა (მაქს. 4 ფოტო)',
  images,
  onChange,
  fallbackTitle = 'ფოტო',
}: MultiImageUploadFieldProps) {
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const slotInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | 'bulk' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const slots = toGallerySlots(undefined, images);
  const uploadedCount = resolveGalleryImages(undefined, slots).length;
  const remainingSlots = MAX_GALLERY_IMAGES - uploadedCount;

  const handleSlotFileChange = async (
    slotIndex: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingSlot(slotIndex);
    setUploadError(null);
    try {
      const ref = await uploadImageFile(file);
      const nextSlots = setGallerySlot(slots, slotIndex, ref);
      onChange(resolveGalleryImages(undefined, nextSlots));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'ფოტოს ატვირთვა ვერ მოხერხდა.',
      );
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleBulkFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, remainingSlots);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadingSlot('bulk');
    setUploadError(null);
    try {
      const refs: string[] = [];
      for (const file of files) {
        const ref = await uploadImageFile(file);
        refs.push(ref);
      }
      const nextSlots = appendGalleryUploads(slots, refs);
      onChange(resolveGalleryImages(undefined, nextSlots));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'ფოტოების ატვირთვა ვერ მოხერხდა.',
      );
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemove = (slotIndex: number) => {
    const nextSlots = removeGallerySlot(slots, slotIndex);
    onChange(resolveGalleryImages(undefined, nextSlots));
    setUploadError(null);
  };

  const handlePromote = (slotIndex: number) => {
    const nextSlots = promoteGallerySlot(slots, slotIndex);
    onChange(resolveGalleryImages(undefined, nextSlots));
  };

  return (
    <div
      data-testid={`${idPrefix}-multi-upload`}
      className="p-4 sm:p-5 rounded-lg bg-[#1a1009] border border-[#ece2cc]/10 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#dcb975]">
            {label}{' '}
            <span className="font-mono text-[#c2b398] ml-1 tabular-nums">
              ({uploadedCount}/{MAX_GALLERY_IMAGES})
            </span>
          </p>
          <p className="text-[11px] text-[#c2b398] mt-0.5">
            ატვირთეთ 1-დან 4-მდე ფოტო — საიტზე გამოჩნდება მხოლოდ ატვირთული ფოტოები.
          </p>
        </div>

        {remainingSlots > 0 && (
          <div className="shrink-0">
            <input
              ref={bulkInputRef}
              id={`${idPrefix}-bulk-upload`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkFileChange}
              className="sr-only"
            />
            <button
              type="button"
              disabled={uploadingSlot !== null}
              onClick={() => bulkInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2c1c12] hover:bg-[#3a2518] border border-[#dcb975]/40 text-[#ece2cc] hover:text-[#dcb975] rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploadingSlot === 'bulk' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
              )}
              <span>ფოტოების ატვირთვა</span>
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="px-3 py-2 rounded-md bg-[#3c1b15] border border-[#e68a73]/40 text-xs text-[#f2b5a4]">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slotUrl, idx) => {
          const isFilled = Boolean(slotUrl);
          const isUploading = uploadingSlot === idx;
          const slotInputId = `${idPrefix}-slot-${idx + 1}`;

          return (
            <div
              key={slotInputId}
              data-testid={`${idPrefix}-slot-${idx + 1}`}
              data-filled={isFilled ? 'true' : 'false'}
              className={`relative rounded-lg overflow-hidden border transition-colors ${
                isFilled
                  ? idx === 0
                    ? 'border-[#dcb975]/60 bg-[#140c07]'
                    : 'border-[#ece2cc]/15 bg-[#140c07]'
                  : 'border-dashed border-[#ece2cc]/20 hover:border-[#dcb975]/55 bg-[#140c07]/70'
              }`}
            >
              <input
                ref={(el) => {
                  slotInputRefs.current[idx] = el;
                }}
                id={slotInputId}
                type="file"
                accept="image/*"
                aria-label={`ფოტო ${idx + 1} ატვირთვა`}
                onChange={(e) => handleSlotFileChange(idx, e)}
                className="sr-only"
              />

              {isFilled ? (
                <div className="flex flex-col h-full">
                  <div className="relative aspect-[4/3] bg-[#120a06]">
                    <MediaImage
                      src={slotUrl}
                      alt={`${fallbackTitle} — ფოტო ${idx + 1}`}
                      fallbackTitle={fallbackTitle}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#1a1009]/90 border border-[#dcb975]/50 text-[10px] font-semibold text-[#dcb975]">
                        მთავარი
                      </span>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-[#120a06]/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-[#dcb975] animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-1.5 bg-[#140c07] border-t border-[#ece2cc]/10 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-[#c2b398]/80 tabular-nums pl-0.5">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => slotInputRefs.current[idx]?.click()}
                        aria-label={`ფოტო ${idx + 1} შეცვლა`}
                        title="ფოტოს შეცვლა"
                        className="p-1.5 text-[#c2b398] hover:text-[#dcb975] hover:bg-[#22150d] rounded transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handlePromote(idx)}
                          aria-label={`ფოტო ${idx + 1} მთავარ ფოტოდ დაყენება`}
                          title="მთავარ ფოტოდ დაყენება"
                          className="p-1.5 text-[#c2b398] hover:text-[#dcb975] hover:bg-[#22150d] rounded transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        aria-label={`ფოტო ${idx + 1} წაშლა`}
                        title="ფოტოს წაშლა"
                        className="p-1.5 text-[#c2b398] hover:text-[#e68a73] hover:bg-[#22150d] rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingSlot !== null}
                  onClick={() => slotInputRefs.current[idx]?.click()}
                  className="w-full h-full min-h-[116px] p-3 flex flex-col items-center justify-center gap-1.5 text-[#c2b398] hover:text-[#dcb975] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-[#dcb975] animate-spin" aria-hidden="true" />
                  ) : (
                    <ImagePlus className="w-5 h-5 opacity-80" aria-hidden="true" />
                  )}
                  <span className="text-[11px] font-medium">ფოტო {idx + 1}</span>
                  <span className="text-[10px] text-[#c2b398]/70">ატვირთვა</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
