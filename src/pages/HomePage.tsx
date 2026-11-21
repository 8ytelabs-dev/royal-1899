import { motion } from 'motion/react';
import { ArrowRight, Check, ShieldAlert } from 'lucide-react';
import { DiscordIcon } from '../components/DiscordIcon';
import { HeroSection } from '../components/HeroSection';
import { MediaImage } from '../components/MediaImage';
import { useSiteContent } from '../context/SiteContentContext';
import { formatUsdReward } from '../lib/portalLogic';
import { formatGelPrice } from '../lib/storeLogic';
import type { AppRoute, StoreProduct } from '../types';

interface HomePageProps {
  onNavigate: (route: AppRoute) => void;
  onSelectProduct: (product: StoreProduct) => void;
}

export function HomePage({
  onNavigate,
  onSelectProduct,
}: HomePageProps) {
  const { content } = useSiteContent();
  const homeCopy = content.copy.home;
  const featuredProduct =
    content.products.find((product) => product.featured) ?? content.products[0];
  const featuredBounties = content.wantedSuspects.slice(0, 3);

  return (
    <div>
      {/* 1. Integrated Full-Bleed Hero (with live server status & player count inside) */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Short Server Description + Quick Link to Rules */}
      <section
        id="server-overview"
        aria-labelledby="server-overview-heading"
        className="max-w-6xl mx-auto px-6 py-24 md:py-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left: Server Story & Editorial Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="text-xs font-medium tracking-wider text-[#dcb975]">
              {homeCopy.overviewEyebrow}
            </p>
            <h2
              id="server-overview-heading"
              className="font-display text-3xl md:text-4xl font-semibold leading-tight text-[#ece2cc]"
            >
              {homeCopy.overviewHeading}
            </h2>
            <p className="text-base leading-relaxed text-[#c2b398] max-w-2xl">
              {homeCopy.overviewBody}
            </p>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#ece2cc]/12">
              {homeCopy.pillars.map((pillar) => (
                <div key={pillar.index} className="space-y-2">
                  <p className="font-mono text-xs text-[#dcb975]">{pillar.index}.</p>
                  <h3 className="font-display text-base font-semibold text-[#ece2cc]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#c2b398]">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Dedicated Quick Link to Server Rules */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby="quick-rules-heading"
            className="lg:col-span-5 bg-[#2c1c12] border border-[#dcb975]/25 rounded-xl p-7 md:p-9 space-y-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#dcb975]">
                {homeCopy.quickRulesEyebrow}
              </p>
              <h3
                id="quick-rules-heading"
                className="font-display text-2xl font-semibold text-[#ece2cc]"
              >
                {homeCopy.quickRulesHeading}
              </h3>
              <p className="text-sm leading-relaxed text-[#c2b398]">
                {homeCopy.quickRulesBody}
              </p>
            </div>

            <ul className="space-y-3 text-sm text-[#ece2cc]/90 pt-2 border-t border-[#ece2cc]/10">
              {homeCopy.quickRulesHighlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/rules"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/rules');
              }}
              className="group w-full inline-flex items-center justify-between px-5 py-3.5 text-sm font-semibold bg-[#22150d] border border-[#dcb975]/45 text-[#ece2cc] hover:bg-[#dcb975] hover:text-[#22150d] transition-colors duration-200 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcb975]"
            >
              <span>{homeCopy.quickRulesCta}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </motion.aside>
        </div>
      </section>

      {/* 4. Featured Product Showcase + Direct Navigation to Store */}
      <section
        aria-labelledby="featured-product-heading"
        className="border-t border-[#ece2cc]/10 bg-[#1d110a]"
      >
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wider text-[#dcb975]">
                {homeCopy.featuredEyebrow}
              </p>
              <h2
                id="featured-product-heading"
                className="font-display text-3xl md:text-4xl font-semibold text-[#ece2cc]"
              >
                {homeCopy.featuredHeading}
              </h2>
            </div>

            <a
              href="/store"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/store');
              }}
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#dcb975] hover:text-[#e7c98b] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{homeCopy.featuredAllLink}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </motion.div>

          {featuredProduct && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl overflow-hidden"
          >
            {/* Left Image Column */}
            <div className="lg:col-span-6 overflow-hidden bg-[#180e08]">
              <button
                type="button"
                onClick={() => onSelectProduct(featuredProduct)}
                aria-label={`დეტალურად ნახვა: ${featuredProduct.name}`}
                className="block w-full h-full cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#dcb975]"
              >
                <MediaImage
                  src={featuredProduct.imageUrl}
                  alt={featuredProduct.imageAlt}
                  fallbackTitle={featuredProduct.name}
                  className="w-full h-72 sm:h-96 lg:h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </button>
            </div>

            {/* Right Editorial Details Column */}
            <div className="lg:col-span-6 p-7 md:p-10 lg:p-12 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs text-[#dcb975]">
                  <span>{featuredProduct.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredProduct.billingCycle}</span>
                  <span aria-hidden="true">·</span>
                  <span>გადახდა Discord-ში</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]">
                  {featuredProduct.name}
                </h3>

                <p className="text-sm md:text-base leading-relaxed text-[#c2b398]">
                  {featuredProduct.shortDescription}
                </p>

                <ul className="space-y-2.5 text-sm text-[#ece2cc]/85 pt-2">
                  {featuredProduct.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-[#ece2cc]/12 flex flex-col gap-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs text-[#c2b398]">პაკეტის ღირებულება</p>
                  <p className="font-mono text-2xl font-semibold text-[#dcb975] tabular-nums whitespace-nowrap shrink-0">
                    {formatGelPrice(featuredProduct.priceGel)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/store"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/store');
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md whitespace-nowrap shrink-0"
                  >
                    <span>მაღაზიაში გადასვლა</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(featuredProduct)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#22150d] border border-[#ece2cc]/20 text-[#ece2cc] hover:border-[#dcb975] hover:text-[#dcb975] transition-colors rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <DiscordIcon className="w-4 h-4 shrink-0" />
                    <span>შეძენა Discord-ში</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
          )}
        </div>
      </section>

      {/* 4. Frontier Wanted Bounty Board Spotlight */}
      <section
        aria-labelledby="world-pulse-heading"
        className="border-t border-[#ece2cc]/10 bg-[#22150d]"
      >
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wider text-[#dcb975]">
                {homeCopy.archiveEyebrow}
              </p>
              <h2
                id="world-pulse-heading"
                className="font-display text-3xl md:text-4xl font-semibold text-[#ece2cc]"
              >
                {homeCopy.archiveHeading}
              </h2>
            </div>

            <a
              href="/bounties"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/bounties');
              }}
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#dcb975] hover:text-[#e7c98b] whitespace-nowrap shrink-0"
            >
              <span>ყველა ძებნილის ნახვა</span>
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {featuredBounties.map((bounty) => (
              <article
                key={bounty.id}
                className="bg-[#e6d7b8] text-[#22150d] rounded-xl p-5 border border-[#dcb975]/45 flex flex-col justify-between shadow-xl"
              >
                <div className="border-2 border-[#22150d]/80 p-4 flex flex-col justify-between h-full gap-4">
                  <div className="flex items-center justify-between border-b border-[#22150d]/35 pb-2.5">
                    <span className="inline-flex items-center gap-1.5 font-display text-base font-bold tracking-[0.14em]">
                      <ShieldAlert className="w-4 h-4 text-[#8c2318]" aria-hidden="true" />
                      იძებნება
                    </span>
                    <span className="font-mono text-base font-bold tabular-nums">
                      {formatUsdReward(bounty.rewardUsd)}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-3.5 items-center">
                    <div className="col-span-5 aspect-[3/4] overflow-hidden border border-[#22150d]/75 bg-[#180e08]">
                      <MediaImage
                        src={bounty.portraitUrl}
                        alt={bounty.portraitAlt}
                        fallbackTitle={bounty.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="col-span-7 space-y-1.5">
                      <h3 className="font-display text-base font-bold leading-snug">
                        {bounty.name}
                      </h3>
                      <p className="text-xs text-[#543820]">{bounty.lastSeenRegion}</p>
                      <p className="text-xs leading-relaxed text-[#3b2719] line-clamp-3">
                        {bounty.charges[0]}
                        {bounty.charges[1] ? ` · ${bounty.charges[1]}` : ''}
                      </p>
                    </div>
                  </div>

                  <a
                    href="/bounties"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/bounties');
                    }}
                    className="group w-full inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold bg-[#22150d] text-[#ece2cc] hover:bg-[#382315] rounded-xs transition-colors"
                  >
                    <span>საქმის ნახვა</span>
                    <ArrowRight
                      className="w-4 h-4 text-[#dcb975] transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
