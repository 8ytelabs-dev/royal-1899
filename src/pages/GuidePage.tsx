import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Keyboard,
  Search,
  X,
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { KEYBIND_CATEGORIES } from '../data/serverPortal';
import { filterKeybinds } from '../lib/portalLogic';
import type { AppRoute, KeybindCategory } from '../types';

interface GuidePageProps {
  onNavigate: (route: AppRoute) => void;
}

export function GuidePage({ onNavigate }: GuidePageProps) {
  const { content } = useSiteContent();
  const guideCopy = content.copy.guide;

  const [keybindCategory, setKeybindCategory] = useState<KeybindCategory>('all');
  const [keybindQuery, setKeybindQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    content.guideFaqs[0]?.id ?? null,
  );

  const filteredKeybinds = useMemo(
    () => filterKeybinds(content.keybinds, keybindCategory, keybindQuery),
    [content.keybinds, keybindCategory, keybindQuery],
  );

  return (
    <div className="pt-28 md:pt-32 pb-24">
      {/* Page Header */}
      <section className="max-w-6xl mx-auto px-6 pb-12 border-b border-[#ece2cc]/10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-xs font-medium tracking-wider text-[#dcb975]">
            {guideCopy.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#ece2cc] leading-tight">
            {guideCopy.heading}
          </h1>
          <p className="text-base leading-relaxed text-[#c2b398]">
            {guideCopy.subtitle}
          </p>
        </motion.div>
      </section>

      {/* 1. 4-Step Launch Roadmap */}
      <section
        aria-labelledby="guide-steps-heading"
        className="max-w-6xl mx-auto px-6 py-14 border-b border-[#ece2cc]/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#dcb975]">
              {guideCopy.stepsEyebrow}
            </p>
            <h2
              id="guide-steps-heading"
              className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]"
            >
              {guideCopy.stepsHeading}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={content.serverStatus.redmLaunchUrl}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md whitespace-nowrap shrink-0"
            >
              <span>RedM-ით შესვლა</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.guideSteps.map((step, idx) => (
            <motion.article
              key={step.stepNumber}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[#2c1c12] border border-[#ece2cc]/12 hover:border-[#dcb975]/35 transition-colors rounded-xl p-7 flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#dcb975] tracking-wider">
                    ნაბიჯი {step.stepNumber}
                  </span>
                  <span className="h-px flex-1 bg-[#ece2cc]/12" aria-hidden="true" />
                </div>

                <h3 className="font-display text-xl font-semibold text-[#ece2cc]">
                  {step.title}
                </h3>

                <p className="text-sm font-medium text-[#ece2cc]/90 leading-relaxed">
                  {step.summary}
                </p>

                <p className="text-sm text-[#c2b398] leading-relaxed">
                  {step.details}
                </p>
              </div>

              {step.actionLabel && (
                <div className="pt-4 border-t border-[#ece2cc]/10">
                  {step.actionType === 'external' && step.actionHref && (
                    <a
                      href={step.actionHref}
                      target={step.actionHref.startsWith('http') ? '_blank' : undefined}
                      rel={
                        step.actionHref.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#dcb975] hover:text-[#e7c98b] transition-colors"
                    >
                      <span>{step.actionLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}

                  {step.actionType === 'route' && step.actionRoute && (
                    <a
                      href={step.actionRoute}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(step.actionRoute!);
                      }}
                      className="group inline-flex items-center gap-2 text-xs font-semibold text-[#dcb975] hover:text-[#e7c98b] transition-colors"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Keybinds Reference (Basics) */}
      <section
        aria-labelledby="keybinds-heading"
        className="max-w-6xl mx-auto px-6 py-14 border-b border-[#ece2cc]/10"
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-[#dcb975]">
                <Keyboard className="w-4 h-4" aria-hidden="true" />
                <span>{guideCopy.keybindsEyebrow}</span>
              </p>
              <h2
                id="keybinds-heading"
                className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]"
              >
                {guideCopy.keybindsHeading}
              </h2>
            </div>

            <div className="relative w-full md:w-72">
              <Search
                className="w-4 h-4 text-[#c2b398] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="keybinds-search" className="sr-only">
                კლავიშის ძიება
              </label>
              <input
                id="keybinds-search"
                type="search"
                value={keybindQuery}
                onChange={(e) => setKeybindQuery(e.target.value)}
                placeholder="მოქმედების ან ღილაკის ძიება..."
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/60 focus:outline-none"
              />
              {keybindQuery && (
                <button
                  type="button"
                  onClick={() => setKeybindQuery('')}
                  aria-label="ძიების გასუფთავება"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c2b398] hover:text-[#ece2cc] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div
            role="tablist"
            aria-label="კლავიშების კატეგორიები"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#180e08] border border-[#ece2cc]/10 rounded-lg w-fit"
          >
            {KEYBIND_CATEGORIES.map((cat) => {
              const active = keybindCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setKeybindCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#dcb975] text-[#22150d]'
                      : 'text-[#c2b398] hover:text-[#ece2cc]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {filteredKeybinds.length === 0 ? (
            <div className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-10 text-center space-y-3">
              <p className="text-sm text-[#c2b398]">
                მითითებული ფილტრით კლავიში ვერ მოიძებნა.
              </p>
              <button
                type="button"
                onClick={() => {
                  setKeybindCategory('all');
                  setKeybindQuery('');
                }}
                className="text-xs font-medium text-[#dcb975] hover:underline cursor-pointer"
              >
                ყველა კლავიშის ჩვენება
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKeybinds.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-lg p-5 flex items-start justify-between gap-5"
                >
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-[11px] text-[#dcb975]/85">
                      {item.categoryLabel}
                    </p>
                    <h3 className="text-sm font-semibold text-[#ece2cc]">
                      {item.action}
                    </h3>
                    <p className="text-xs text-[#c2b398] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {item.keys.map((keyLabel) => (
                      <kbd
                        key={keyLabel}
                        className="min-w-9 h-9 px-2.5 inline-flex items-center justify-center bg-[#180e08] border border-[#dcb975]/40 border-b-2 rounded-md font-mono text-xs font-semibold text-[#dcb975] shadow-inner"
                      >
                        {keyLabel}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Frequently Asked Questions Accordion */}
      <section aria-labelledby="guide-faq-heading" className="max-w-4xl mx-auto px-6 pt-14">
        <div className="space-y-1.5 mb-8">
          <p className="text-xs font-medium text-[#dcb975]">
            {guideCopy.faqEyebrow}
          </p>
          <h2
            id="guide-faq-heading"
            className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]"
          >
            {guideCopy.faqHeading}
          </h2>
        </div>

        <div className="space-y-3">
          {content.guideFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#352216]/60 transition-colors cursor-pointer"
                >
                  <span className="font-display text-base font-semibold text-[#ece2cc]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#dcb975] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 pt-1 text-sm leading-relaxed text-[#c2b398] border-t border-[#ece2cc]/8">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
