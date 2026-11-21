import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MapPin, Search, X } from 'lucide-react';
import { MediaImage } from '../components/MediaImage';
import { useSiteContent } from '../context/SiteContentContext';
import { WANTED_STATUS_FILTERS } from '../data/serverPortal';
import { filterWantedSuspects, formatUsdReward } from '../lib/portalLogic';
import type { WantedStatus, WantedSuspect } from '../types';

interface BountiesPageProps {
  onOpenMapLocation: (locationId: string, realm: 'mainland' | 'cuba') => void;
}

export function BountiesPage({ onOpenMapLocation }: BountiesPageProps) {
  const { content } = useSiteContent();
  const bountiesCopy = content.copy.bounties;
  const [statusFilter, setStatusFilter] = useState<WantedStatus>('all');
  const [query, setQuery] = useState('');
  const [selectedSuspect, setSelectedSuspect] = useState<WantedSuspect | null>(null);

  const filteredSuspects = useMemo(
    () => filterWantedSuspects(content.wantedSuspects, statusFilter, query),
    [content.wantedSuspects, statusFilter, query],
  );

  return (
    <div className="pt-28 md:pt-36 pb-24">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pb-10 border-b border-[#ece2cc]/12">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-medium tracking-wider text-[#dcb975]">
            {bountiesCopy.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#ece2cc] leading-tight">
            {bountiesCopy.heading}
          </h1>
          <p className="text-base leading-relaxed text-[#c2b398]">
            {bountiesCopy.subtitle}
          </p>
        </div>
      </section>

      {/* AUTHENTIC 1899 WANTED POSTERS BOARD */}
      <section className="max-w-6xl mx-auto px-6 pt-10 space-y-10">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="ძებნილების სტატუსი"
              className="flex flex-wrap items-center gap-1 p-1 bg-[#180e08] border border-[#ece2cc]/10 rounded-lg w-fit"
            >
              {WANTED_STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#dcb975] text-[#22150d]'
                        : 'text-[#c2b398] hover:text-[#ece2cc]'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-80">
              <Search
                className="w-4 h-4 text-[#c2b398] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="wanted-search" className="sr-only">
                ძებნილის ძიება
              </label>
              <input
                id="wanted-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ძიება სახელით ან რეგიონით..."
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="ძიების გასუფთავება"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c2b398] hover:text-[#ece2cc] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Authentic Parchment Wanted Posters Grid */}
          {filteredSuspects.length === 0 ? (
            <div className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-12 text-center space-y-3">
              <p className="font-display text-xl text-[#ece2cc]">
                ძებნილი ვერ მოიძებნა
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#dcb975] text-[#22150d] rounded-md cursor-pointer"
              >
                ყველა საქმის ჩვენება
              </button>
            </div>
          ) : (
            <div
              data-testid="wanted-posters-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredSuspects.map((suspect, idx) => (
                <motion.article
                  key={suspect.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative bg-[#e6d7b8] text-[#22150d] rounded-sm p-3.5 shadow-2xl border border-[#b79a66] transition-transform duration-300 hover:-translate-y-1.5"
                >
                  {/* Brass Nail Rivet at top center */}
                  <span
                    aria-hidden="true"
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#3a2416] border border-[#dcb975]/70 shadow-xs"
                  />

                  {/* Classic Victorian Double-Line Poster Frame */}
                  <div className="border-2 border-[#22150d]/85 p-3.5 flex flex-col justify-between h-full space-y-3.5 relative">
                    {/* Captured Crimson Ink Stamp */}
                    {suspect.status === 'captured' && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20 px-4 py-1.5 border-2 border-[#8c2318] bg-[#e6d7b8]/92 text-[#8c2318] font-display text-sm font-bold tracking-[0.18em] uppercase shadow-md"
                      >
                        დაკავებულია
                      </div>
                    )}

                    {/* Poster Masthead */}
                    <div className="text-center border-b-2 border-[#22150d]/75 pb-2 pt-1">
                      <p className="font-display text-2xl font-bold tracking-[0.16em] text-[#22150d] leading-none">
                        იძებნება
                      </p>
                      <p className="text-[11px] font-mono tracking-wider text-[#543820] mt-1">
                        ცოცხალი ან მკვდარი
                      </p>
                    </div>

                    {/* Wet-Plate Daguerreotype Portrait */}
                    <div className="aspect-[3/4] w-full overflow-hidden border border-[#22150d]/80 bg-[#180e08]">
                      <MediaImage
                        src={suspect.portraitUrl}
                        alt={suspect.portraitAlt}
                        fallbackTitle={suspect.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                          suspect.status === 'captured' ? 'grayscale opacity-75' : ''
                        }`}
                      />
                    </div>

                    {/* Suspect Name & Region */}
                    <div className="text-center space-y-1">
                      <h2 className="font-display text-base font-bold text-[#22150d] leading-snug">
                        {suspect.name}
                      </h2>
                      <p className="text-xs text-[#543820] truncate">
                        {suspect.lastSeenRegion}
                      </p>
                    </div>

                    {/* Reward Readout */}
                    <div className="border-t-2 border-[#22150d]/75 pt-2.5 text-center space-y-2">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#543820]">
                          ჯილდო
                        </p>
                        <p className="font-mono text-2xl font-bold text-[#22150d] tabular-nums leading-tight">
                          {formatUsdReward(suspect.rewardUsd)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSuspect(suspect)}
                        aria-label={`საქმის დოსიეს ნახვა: ${suspect.name}`}
                        className="w-full py-2 px-3 text-xs font-semibold bg-[#22150d] text-[#ece2cc] hover:bg-[#382315] rounded-xs transition-colors cursor-pointer"
                      >
                        საქმის დოსიე
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
      </section>

      {/* Wanted Suspect Dossier Modal */}
      <AnimatePresence>
        {selectedSuspect && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSuspect(null)}
              className="absolute inset-0 bg-[#120a06]/82 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto md:overflow-hidden royal-scroll bg-[#2c1c12] border border-[#dcb975]/35 rounded-xl text-[#ece2cc] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedSuspect(null)}
                aria-label="დოსიეს დახურვა"
                className="absolute top-4 right-5 z-20 w-10 h-10 inline-flex items-center justify-center rounded-md bg-[#22150d]/85 text-[#ece2cc] hover:text-[#dcb975] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch md:max-h-[88vh]">
                <div className="md:col-span-5 bg-[#180e08]">
                  <MediaImage
                    src={selectedSuspect.portraitUrl}
                    alt={selectedSuspect.portraitAlt}
                    fallbackTitle={selectedSuspect.name}
                    className="w-full h-72 md:h-full object-cover"
                  />
                </div>

                <div className="md:col-span-7 p-6 md:p-8 md:max-h-[88vh] md:overflow-y-auto royal-scroll flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#dcb975]">
                      <span>{selectedSuspect.issuedBy}</span>
                      <span aria-hidden="true" className="text-[#c2b398]">·</span>
                      <span
                        className={
                          selectedSuspect.status === 'active'
                            ? 'text-[#e3967d] font-medium'
                            : 'text-[#c2b398]'
                        }
                      >
                        {selectedSuspect.dangerLevel}
                      </span>
                    </div>

                    <div>
                      <h2
                        id="dossier-modal-title"
                        className="font-display text-2xl font-semibold text-[#ece2cc]"
                      >
                        {selectedSuspect.name}
                      </h2>
                      <p className="text-xs text-[#c2b398] mt-1">
                        მეტსახელი: „{selectedSuspect.alias}“ · ბოლოს ნახეს:{' '}
                        {selectedSuspect.lastSeenRegion}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-[#ece2cc]/85">
                      {selectedSuspect.dossier}
                    </p>

                    <div className="pt-3 border-t border-[#ece2cc]/10 space-y-2">
                      <h3 className="text-xs font-semibold text-[#dcb975]">
                        წაყენებული ბრალდებები
                      </h3>
                      <ul className="space-y-1.5 text-sm text-[#c2b398]">
                        {selectedSuspect.charges.map((charge) => (
                          <li key={charge} className="flex items-start gap-2">
                            <span className="text-[#dcb975]" aria-hidden="true">
                              ·
                            </span>
                            <span>{charge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[#ece2cc]/12 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#c2b398]">დაწესებული ჯილდო</p>
                      <p className="font-mono text-2xl font-semibold text-[#dcb975] tabular-nums">
                        {formatUsdReward(selectedSuspect.rewardUsd)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedSuspect;
                        setSelectedSuspect(null);
                        onOpenMapLocation(target.linkedMapId, target.linkedMapRealm);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      <span>ლოკაცია რუკაზე</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
