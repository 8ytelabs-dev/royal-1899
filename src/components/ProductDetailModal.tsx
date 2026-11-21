import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveGalleryImages } from '../lib/mediaGallery';
import { buildDiscordPurchaseMessage, formatGelPrice } from '../lib/storeLogic';
import type { StoreProduct } from '../types';
import { DiscordIcon } from './DiscordIcon';
import { MediaGalleryViewer } from './MediaGalleryViewer';

interface ProductDetailModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { content } = useSiteContent();
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const handleCopyTicketText = async () => {
    if (!product) return;
    try {
      await navigator.clipboard.writeText(buildDiscordPurchaseMessage(product));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#120a06]/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto md:overflow-hidden royal-scroll bg-[#2c1c12] border border-[#ece2cc]/15 rounded-xl text-[#ece2cc] shadow-2xl"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="პროდუქტის ფანჯრის დახურვა"
              className="absolute top-4 right-5 z-20 w-10 h-10 inline-flex items-center justify-center rounded-md bg-[#22150d]/85 text-[#ece2cc] hover:text-[#dcb975] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch md:max-h-[90vh]">
              <div className="md:col-span-5 bg-[#180e08]">
                <MediaGalleryViewer
                  variant="modal"
                  testId="product-modal-gallery"
                  images={resolveGalleryImages(product.imageUrl, product.galleryImages)}
                  alt={product.imageAlt}
                  fallbackTitle={product.name}
                />
              </div>

              <div className="md:col-span-7 p-6 md:p-8 md:max-h-[90vh] md:overflow-y-auto royal-scroll flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#dcb975] mb-2">
                    <span>{product.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.billingCycle}</span>
                  </div>

                  <h2
                    id="product-modal-title"
                    className="font-display text-2xl font-semibold text-[#ece2cc] mb-3"
                  >
                    {product.name}
                  </h2>

                  <p className="text-sm leading-relaxed text-[#c2b398] mb-5">
                    {product.fullDescription}
                  </p>

                  <h3 className="text-xs font-semibold text-[#ece2cc]/90 mb-3">
                    რას მოიცავს პაკეტი
                  </h3>
                  <ul className="space-y-2.5 text-sm text-[#ece2cc]/85 mb-5">
                    {product.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <Check
                          className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Discord Payment Instruction Snippet */}
                  <div className="bg-[#22150d]/85 rounded-lg p-4 space-y-2.5">
                    <p className="text-xs font-medium text-[#dcb975]">
                      გადახდა Discord-ში
                    </p>
                    <p className="text-xs leading-relaxed text-[#c2b398]">
                      პაკეტის შესაძენად გადადით ჩვენს Discord სერვერზე და გახსენით
                      შეკვეთის ტიკეტი. სურვილისამებრ დააკოპირეთ პაკეტის ტექსტი:
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <code className="text-xs font-mono text-[#ece2cc]/85 truncate">
                        {buildDiscordPurchaseMessage(product)}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyTicketText}
                        aria-label="შეკვეთის ტექსტის კოპირება"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2c1c12] border border-[#ece2cc]/15 hover:border-[#dcb975] text-[#ece2cc] rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
                            <span>დაკოპირდა</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#c2b398]" aria-hidden="true" />
                            <span>კოპირება</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contiguous Discord Purchase Module */}
                <div className="pt-5 border-t border-[#ece2cc]/12 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#c2b398]">ღირებულება</p>
                    <p className="font-mono text-2xl font-medium text-[#dcb975] tabular-nums whitespace-nowrap">
                      {formatGelPrice(product.priceGel)}
                    </p>
                  </div>

                  <a
                    href={content.copy.general.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md whitespace-nowrap shrink-0"
                  >
                    <DiscordIcon className="w-4 h-4 shrink-0" />
                    <span>შეძენა Discord-ში</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-75" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
