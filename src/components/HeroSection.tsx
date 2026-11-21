import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Users } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useResolvedMediaUrl } from '../lib/mediaUpload';
import {
  calculateServerOccupancyPct,
  getServerStatusLabel,
} from '../lib/portalLogic';
import { resolveHeroMedia } from '../lib/rulesLogic';
import type { AppRoute, HeroMediaConfig } from '../types';
import { MediaImage } from './MediaImage';

interface HeroSectionProps {
  media?: HeroMediaConfig;
  onNavigate: (route: AppRoute) => void;
}

export function HeroSection({ media, onNavigate }: HeroSectionProps) {
  const { content } = useSiteContent();
  const [videoFailed, setVideoFailed] = useState(false);

  const heroCopy = content.copy.hero;
  const generalCopy = content.copy.general;
  const status = content.serverStatus;
  const activeMedia = media ?? heroCopy.media;
  const resolved = resolveHeroMedia(activeMedia, videoFailed);
  const resolvedMediaSrc = useResolvedMediaUrl(resolved.src);
  const resolvedPosterSrc = useResolvedMediaUrl(
    resolved.renderKind === 'video' ? resolved.poster : '',
  );

  useEffect(() => {
    setVideoFailed(false);
  }, [activeMedia.type, activeMedia.src]);

  const occupancyPct = calculateServerOccupancyPct(
    status.playersOnline,
    status.maxPlayers,
  );
  const statusLabel = getServerStatusLabel(status.online);

  return (
    <section
      aria-label="მთავარი ბანერი"
      className="relative min-h-[92vh] w-full flex items-end md:items-center overflow-hidden bg-[#180e08]"
    >
      {/* Background Photo OR Video Layer */}
      <div className="absolute inset-0 z-0" data-testid="hero-media-layer">
        {resolved.renderKind === 'video' && resolvedMediaSrc ? (
          <video
            key={resolvedMediaSrc}
            className="w-full h-full object-cover object-center"
            src={resolvedMediaSrc}
            poster={resolvedPosterSrc || undefined}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            aria-label={resolved.alt}
          />
        ) : (
          <MediaImage
            src={(resolved.renderKind === 'video' ? resolved.poster : resolved.src) ?? ''}
            alt={resolved.alt}
            loading="eager"
            fallbackTitle={generalCopy.brandName}
            className="w-full h-full object-cover object-center animate-hero-drift"
          />
        )}

        {/* Measured multi-stop scrims ensuring >= 4.5:1 contrast for Navbar & Hero typography */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#22150d]/72 via-[#22150d]/35 to-[#22150d]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#22150d]/85 via-[#22150d]/40 to-transparent"
        />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-32 pb-20 md:pt-36 md:pb-24">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs md:text-sm font-medium tracking-wider text-[#dcb975] mb-5"
          >
            {generalCopy.eraLabel}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.25rem,4.6vw,3.9rem)] font-semibold leading-[1.14] tracking-tight text-[#ece2cc] mb-6"
          >
            {heroCopy.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg leading-relaxed text-[#ece2cc]/85 max-w-xl mb-10"
          >
            {heroCopy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-5"
          >
            <a
              href="/guide"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/guide');
              }}
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm md:text-base font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all duration-150 rounded-md whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ece2cc]"
            >
              {heroCopy.primaryCtaLabel}
            </a>

            <a
              href="/rules"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/rules');
              }}
              className="group inline-flex items-center gap-2 py-3 text-sm md:text-base font-medium text-[#ece2cc] hover:text-[#dcb975] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcb975] rounded-sm"
            >
              <span>{heroCopy.secondaryCtaLabel}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </motion.div>

          {/* Integrated Live Server Status & Online Player Count */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            data-testid="hero-server-status"
            aria-label="სერვერის სტატუსი და ონლაინ მოთამაშეები"
            className="mt-9 pt-6 border-t border-[#ece2cc]/15 max-w-xl flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <div className="inline-flex items-center gap-2.5 text-sm">
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.online ? 'bg-[#86c27e]' : 'bg-[#c86f58]'
                }`}
              />
              <span className="font-medium text-[#ece2cc]">{statusLabel}</span>
            </div>

            <span
              aria-hidden="true"
              className="hidden sm:block w-px h-4 bg-[#ece2cc]/20"
            />

            <div className="inline-flex items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2">
                <Users
                  className="w-4 h-4 text-[#dcb975] shrink-0"
                  aria-hidden="true"
                />
                <span className="font-mono font-semibold text-[#ece2cc] tabular-nums">
                  {status.playersOnline}
                </span>
                <span className="font-mono text-[#c2b398] tabular-nums">
                  / {status.maxPlayers}
                </span>
                <span className="text-[#c2b398]">მოთამაშე</span>
              </div>

              <div
                aria-hidden="true"
                className="hidden sm:block w-20 h-1 bg-[#ece2cc]/15 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-[#dcb975] rounded-full transition-all duration-500"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <a
        href="#server-overview"
        aria-label="გადასვლა სერვერის აღწერაზე"
        className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1.5 text-[#ece2cc]/65 hover:text-[#dcb975] transition-colors focus-visible:outline-2 focus-visible:outline-[#dcb975] rounded-sm p-1"
      >
        <span className="text-xs tracking-wide">{heroCopy.scrollHintLabel}</span>
        <ChevronDown className="w-4 h-4" aria-hidden="true" />
      </a>
    </section>
  );
}
