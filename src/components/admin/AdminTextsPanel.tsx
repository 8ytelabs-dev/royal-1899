import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import type { KeybindItem } from '../../types';
import { HeroMediaUploadField } from './HeroMediaUploadField';

type TextSectionTab = 'home' | 'pages' | 'guide' | 'general';

const TEXT_TABS: Array<{ id: TextSectionTab; label: string }> = [
  { id: 'home', label: 'მთავარი & Hero' },
  { id: 'pages', label: 'მაღაზია, წესები & რუკა' },
  { id: 'guide', label: 'დაწყება, კლავიშები & FAQ' },
  { id: 'general', label: 'ძებნილები, კაბინეტი & ფუთერი' },
];

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 hover:border-[#ece2cc]/25 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none transition-colors';
const labelClass = 'block text-xs font-medium text-[#dcb975] mb-1.5';
const panelClass =
  'bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-5';

export function AdminTextsPanel() {
  const {
    content,
    updateCopy,
    updateGuideSteps,
    updateKeybinds,
    updateGuideFaqs,
  } = useSiteContent();

  const [subTab, setSubTab] = useState<TextSectionTab>('home');
  const [savedToast, setSavedToast] = useState(false);

  const flashSaved = () => {
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1800);
  };

  const { copy, guideSteps, keybinds, guideFaqs } = content;

  const handleAddKeybind = () => {
    const next: KeybindItem = {
      id: `kb-${Date.now()}`,
      keys: ['F'],
      action: 'ახალი მოქმედება',
      description: 'მოქმედების აღწერა',
      category: 'roleplay',
      categoryLabel: 'როლფლეი',
    };
    updateKeybinds([...keybinds, next]);
    flashSaved();
  };

  const handleAddFaq = () => {
    updateGuideFaqs([
      ...guideFaqs,
      {
        id: `faq-${Date.now()}`,
        question: 'ახალი კითხვა?',
        answer: 'პასუხის ტექსტი...',
      },
    ]);
    flashSaved();
  };

  return (
    <div className="space-y-6">
      {/* Full-Width Sub-tabs Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#ece2cc]/10">
        <div
          role="tablist"
          aria-label="ტექსტების სექციები"
          className="flex items-center gap-1 overflow-x-auto -mb-px royal-scroll"
        >
          {TEXT_TABS.map((tab) => {
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#dcb975] text-[#dcb975]'
                    : 'border-transparent text-[#c2b398] hover:text-[#ece2cc] hover:border-[#ece2cc]/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-1.5 pb-2.5 xl:pb-0 text-xs text-[#c2b398] shrink-0">
          <Check className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
          <span>{savedToast ? 'შენახულია!' : 'ავტომატური შენახვა'}</span>
        </span>
      </div>

      {/* TAB 1: HOME & HERO */}
      {subTab === 'home' && (
        <div className="space-y-6">
          {/* Hero Texts & Media */}
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                Hero სექციის ტექსტები და მედია
              </h2>
              <p className="text-xs text-[#c2b398] mt-0.5">
                მთავარი სათაური, აღწერა, ღილაკების ტექსტები და ფონის ფოტოს ან ვიდეოს ატვირთვა.
              </p>
            </div>

            <div>
              <label htmlFor="admin-hero-era" className={labelClass}>
                ზედა წარწერა (Eyebrow)
              </label>
              <input
                id="admin-hero-era"
                type="text"
                value={copy.general.eraLabel}
                onChange={(e) => {
                  updateCopy('general', { eraLabel: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-hero-title" className={labelClass}>
                მთავარი სათაური (H1)
              </label>
              <input
                id="admin-hero-title"
                type="text"
                value={copy.hero.title}
                onChange={(e) => {
                  updateCopy('hero', { title: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-hero-subtitle" className={labelClass}>
                ქვესათაური / აღწერა
              </label>
              <textarea
                id="admin-hero-subtitle"
                rows={3}
                value={copy.hero.subtitle}
                onChange={(e) => {
                  updateCopy('hero', { subtitle: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-hero-cta1" className={labelClass}>
                  მთავარი ღილაკი
                </label>
                <input
                  id="admin-hero-cta1"
                  type="text"
                  value={copy.hero.primaryCtaLabel}
                  onChange={(e) => {
                    updateCopy('hero', { primaryCtaLabel: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-hero-cta2" className={labelClass}>
                  მეორადი ბმული
                </label>
                <input
                  id="admin-hero-cta2"
                  type="text"
                  value={copy.hero.secondaryCtaLabel}
                  onChange={(e) => {
                    updateCopy('hero', { secondaryCtaLabel: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <HeroMediaUploadField
              media={copy.hero.media}
              onChange={(nextMedia) => {
                updateCopy('hero', { media: nextMedia });
                flashSaved();
              }}
            />
          </section>

          {/* Home Overview & Quick Rules Card */}
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                მთავარი გვერდის აღწერა და ბლოკები
              </h2>
              <p className="text-xs text-[#c2b398] mt-0.5">
                სერვერის მოკლე აღწერა, სამი უპირატესობის ბარათი და წესების სწრაფი ბლოკი.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-home-ov-eyebrow" className={labelClass}>
                  სერვერის აღწერა — ქვესათაური
                </label>
                <input
                  id="admin-home-ov-eyebrow"
                  type="text"
                  value={copy.home.overviewEyebrow}
                  onChange={(e) => {
                    updateCopy('home', { overviewEyebrow: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-home-ov-heading" className={labelClass}>
                  სერვერის აღწერა — სათაური
                </label>
                <input
                  id="admin-home-ov-heading"
                  type="text"
                  value={copy.home.overviewHeading}
                  onChange={(e) => {
                    updateCopy('home', { overviewHeading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-home-ov-body" className={labelClass}>
                სერვერის აღწერის ტექსტი
              </label>
              <textarea
                id="admin-home-ov-body"
                rows={3}
                value={copy.home.overviewBody}
                onChange={(e) => {
                  updateCopy('home', { overviewBody: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {copy.home.pillars.map((pillar, index) => (
                <div
                  key={pillar.index}
                  className="bg-[#1a1009] border border-[#ece2cc]/10 rounded-lg p-4 space-y-2.5"
                >
                  <p className="font-mono text-xs text-[#dcb975]">{pillar.index}. უპირატესობა</p>
                  <input
                    type="text"
                    aria-label={`უპირატესობა ${pillar.index} სათაური`}
                    value={pillar.title}
                    onChange={(e) => {
                      const next = copy.home.pillars.map((p, i) =>
                        i === index ? { ...p, title: e.target.value } : p,
                      );
                      updateCopy('home', { pillars: next });
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                  <textarea
                    rows={3}
                    aria-label={`უპირატესობა ${pillar.index} აღწერა`}
                    value={pillar.description}
                    onChange={(e) => {
                      const next = copy.home.pillars.map((p, i) =>
                        i === index ? { ...p, description: e.target.value } : p,
                      );
                      updateCopy('home', { pillars: next });
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#ece2cc]/10">
              <div>
                <label htmlFor="admin-qr-heading" className={labelClass}>
                  წესების ბარათი — სათაური
                </label>
                <input
                  id="admin-qr-heading"
                  type="text"
                  value={copy.home.quickRulesHeading}
                  onChange={(e) => {
                    updateCopy('home', { quickRulesHeading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-featured-heading" className={labelClass}>
                  გამორჩეული შეთავაზების სათაური
                </label>
                <input
                  id="admin-featured-heading"
                  type="text"
                  value={copy.home.featuredHeading}
                  onChange={(e) => {
                    updateCopy('home', { featuredHeading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="admin-qr-body" className={labelClass}>
                  წესების ბარათი — ტექსტი
                </label>
                <textarea
                  id="admin-qr-body"
                  rows={2}
                  value={copy.home.quickRulesBody}
                  onChange={(e) => {
                    updateCopy('home', { quickRulesBody: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="admin-qr-bullets" className={labelClass}>
                  წესების მოკლე პუნქტები (თითო ხაზზე თითო)
                </label>
                <textarea
                  id="admin-qr-bullets"
                  rows={3}
                  value={copy.home.quickRulesHighlights.join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean);
                    updateCopy('home', {
                      quickRulesHighlights: lines.length > 0 ? lines : [''],
                    });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: STORE, RULES, MAP HEADERS */}
      {subTab === 'pages' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                მაღაზიის გვერდის ტექსტები (/store)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-store-eyebrow" className={labelClass}>
                  ზედა წარწერა
                </label>
                <input
                  id="admin-store-eyebrow"
                  type="text"
                  value={copy.store.eyebrow}
                  onChange={(e) => {
                    updateCopy('store', { eyebrow: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-store-heading" className={labelClass}>
                  სათაური
                </label>
                <input
                  id="admin-store-heading"
                  type="text"
                  value={copy.store.heading}
                  onChange={(e) => {
                    updateCopy('store', { heading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-store-subtitle" className={labelClass}>
                აღწერა
              </label>
              <textarea
                id="admin-store-subtitle"
                rows={3}
                value={copy.store.subtitle}
                onChange={(e) => {
                  updateCopy('store', { subtitle: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="admin-store-ticket" className={labelClass}>
                Discord ტიკეტის ღილაკის ტექსტი
              </label>
              <input
                id="admin-store-ticket"
                type="text"
                value={copy.store.discordTicketLabel}
                onChange={(e) => {
                  updateCopy('store', { discordTicketLabel: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>
          </section>

          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                წესების გვერდის ტექსტები (/rules)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-rules-eyebrow" className={labelClass}>
                  ზედა წარწერა
                </label>
                <input
                  id="admin-rules-eyebrow"
                  type="text"
                  value={copy.rules.eyebrow}
                  onChange={(e) => {
                    updateCopy('rules', { eyebrow: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-rules-heading" className={labelClass}>
                  სათაური
                </label>
                <input
                  id="admin-rules-heading"
                  type="text"
                  value={copy.rules.heading}
                  onChange={(e) => {
                    updateCopy('rules', { heading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-rules-subtitle" className={labelClass}>
                აღწერა
              </label>
              <textarea
                id="admin-rules-subtitle"
                rows={3}
                value={copy.rules.subtitle}
                onChange={(e) => {
                  updateCopy('rules', { subtitle: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>
          </section>

          </div>

          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                რუკის გვერდის სათაური (/map)
              </h2>
            </div>
            <div>
              <label htmlFor="admin-map-title" className={labelClass}>
                გვერდითი პანელის სათაური
              </label>
              <input
                id="admin-map-title"
                type="text"
                value={copy.map.sidebarTitle}
                onChange={(e) => {
                  updateCopy('map', { sidebarTitle: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: GUIDE (STEPS, KEYBINDS, FAQ) */}
      {subTab === 'guide' && (
        <div className="space-y-6">
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                დაწყების გვერდის სათაურები (/guide)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-guide-eyebrow" className={labelClass}>
                  ზედა წარწერა
                </label>
                <input
                  id="admin-guide-eyebrow"
                  type="text"
                  value={copy.guide.eyebrow}
                  onChange={(e) => {
                    updateCopy('guide', { eyebrow: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-guide-heading" className={labelClass}>
                  მთავარი სათაური
                </label>
                <input
                  id="admin-guide-heading"
                  type="text"
                  value={copy.guide.heading}
                  onChange={(e) => {
                    updateCopy('guide', { heading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="admin-guide-subtitle" className={labelClass}>
                  აღწერა
                </label>
                <textarea
                  id="admin-guide-subtitle"
                  rows={2}
                  value={copy.guide.subtitle}
                  onChange={(e) => {
                    updateCopy('guide', { subtitle: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* 4 Steps */}
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                შეერთების 4 ნაბიჯი
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
              {guideSteps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="bg-[#1a1009] border border-[#ece2cc]/10 rounded-lg p-4 space-y-2.5"
                >
                  <p className="font-mono text-xs text-[#dcb975]">
                    ნაბიჯი {step.stepNumber}
                  </p>
                  <input
                    type="text"
                    aria-label={`ნაბიჯი ${step.stepNumber} სათაური`}
                    value={step.title}
                    onChange={(e) => {
                      const next = guideSteps.map((s, i) =>
                        i === idx ? { ...s, title: e.target.value } : s,
                      );
                      updateGuideSteps(next);
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    aria-label={`ნაბიჯი ${step.stepNumber} მოკლე აღწერა`}
                    value={step.summary}
                    onChange={(e) => {
                      const next = guideSteps.map((s, i) =>
                        i === idx ? { ...s, summary: e.target.value } : s,
                      );
                      updateGuideSteps(next);
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                  <textarea
                    rows={2}
                    aria-label={`ნაბიჯი ${step.stepNumber} დეტალები`}
                    value={step.details}
                    onChange={(e) => {
                      const next = guideSteps.map((s, i) =>
                        i === idx ? { ...s, details: e.target.value } : s,
                      );
                      updateGuideSteps(next);
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Keybinds */}
          <section className={panelClass}>
            <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                ძირითადი კლავიშები ({keybinds.length})
              </h2>
              <button
                type="button"
                onClick={handleAddKeybind}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>კლავიშის დამატება</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {keybinds.map((kb, idx) => (
                <div
                  key={kb.id}
                  className="bg-[#1a1009] border border-[#ece2cc]/10 rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      aria-label="კლავიშები (მძიმით)"
                      value={kb.keys.join(', ')}
                      onChange={(e) => {
                        const keys = e.target.value
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean);
                        updateKeybinds(
                          keybinds.map((item, i) =>
                            i === idx ? { ...item, keys: keys.length ? keys : ['?'] } : item,
                          ),
                        );
                        flashSaved();
                      }}
                      className={`${inputClass} font-mono text-center`}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      aria-label="მოქმედების სახელი"
                      value={kb.action}
                      onChange={(e) => {
                        updateKeybinds(
                          keybinds.map((item, i) =>
                            i === idx ? { ...item, action: e.target.value } : item,
                          ),
                        );
                        flashSaved();
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      aria-label="მოქმედების აღწერა"
                      value={kb.description}
                      onChange={(e) => {
                        updateKeybinds(
                          keybinds.map((item, i) =>
                            i === idx ? { ...item, description: e.target.value } : item,
                          ),
                        );
                        flashSaved();
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        updateKeybinds(keybinds.filter((_, i) => i !== idx));
                        flashSaved();
                      }}
                      aria-label={`წაშლა: ${kb.action}`}
                      className="p-2 text-[#c2b398] hover:text-[#e68a73] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className={panelClass}>
            <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                ხშირად დასმული კითხვები ({guideFaqs.length})
              </h2>
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>კითხვის დამატება</span>
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {guideFaqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  className="bg-[#1a1009] border border-[#ece2cc]/10 rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      aria-label={`კითხვა ${idx + 1}`}
                      value={faq.question}
                      onChange={(e) => {
                        updateGuideFaqs(
                          guideFaqs.map((item, i) =>
                            i === idx ? { ...item, question: e.target.value } : item,
                          ),
                        );
                        flashSaved();
                      }}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateGuideFaqs(guideFaqs.filter((_, i) => i !== idx));
                        flashSaved();
                      }}
                      aria-label={`წაშლა: ${faq.question}`}
                      className="p-2 text-[#c2b398] hover:text-[#e68a73] shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    aria-label={`პასუხი ${idx + 1}`}
                    value={faq.answer}
                    onChange={(e) => {
                      updateGuideFaqs(
                        guideFaqs.map((item, i) =>
                          i === idx ? { ...item, answer: e.target.value } : item,
                        ),
                      );
                      flashSaved();
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: BOUNTIES, CABINET, FOOTER & GENERAL */}
      {subTab === 'general' && (
        <div className="space-y-6">
          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                ძებნილები & კაბინეტი
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-bounties-heading" className={labelClass}>
                  ძებნილების გვერდის სათაური
                </label>
                <input
                  id="admin-bounties-heading"
                  type="text"
                  value={copy.bounties.heading}
                  onChange={(e) => {
                    updateCopy('bounties', { heading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-cabinet-heading" className={labelClass}>
                  კაბინეტის გვერდის სათაური
                </label>
                <input
                  id="admin-cabinet-heading"
                  type="text"
                  value={copy.cabinet.heading}
                  onChange={(e) => {
                    updateCopy('cabinet', { heading: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-bounties-sub" className={labelClass}>
                  ძებნილების აღწერა
                </label>
                <textarea
                  id="admin-bounties-sub"
                  rows={2}
                  value={copy.bounties.subtitle}
                  onChange={(e) => {
                    updateCopy('bounties', { subtitle: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-cabinet-sub" className={labelClass}>
                  კაბინეტის აღწერა
                </label>
                <textarea
                  id="admin-cabinet-sub"
                  rows={2}
                  value={copy.cabinet.subtitle}
                  onChange={(e) => {
                    updateCopy('cabinet', { subtitle: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={panelClass}>
            <div className="pb-3.5 border-b border-[#ece2cc]/8">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
                ფუთერი, Discord და კონტაქტი
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="admin-discord-url" className={labelClass}>
                  Discord მოწვევის ბმული
                </label>
                <input
                  id="admin-discord-url"
                  type="url"
                  value={copy.general.discordInvite}
                  onChange={(e) => {
                    updateCopy('general', { discordInvite: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-discord-label" className={labelClass}>
                  Discord ტექსტი ფუთერში
                </label>
                <input
                  id="admin-discord-label"
                  type="text"
                  value={copy.general.discordDisplay}
                  onChange={(e) => {
                    updateCopy('general', { discordDisplay: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="admin-support-email" className={labelClass}>
                  მხარდაჭერის ელ-ფოსტა
                </label>
                <input
                  id="admin-support-email"
                  type="email"
                  value={copy.general.supportEmail}
                  onChange={(e) => {
                    updateCopy('general', { supportEmail: e.target.value });
                    flashSaved();
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-footer-desc" className={labelClass}>
                ფუთერის აღწერა
              </label>
              <textarea
                id="admin-footer-desc"
                rows={2}
                value={copy.general.footerDescription}
                onChange={(e) => {
                  updateCopy('general', { footerDescription: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-footer-disclaimer" className={labelClass}>
                სამართლებრივი შენიშვნა (Disclaimer)
              </label>
              <input
                id="admin-footer-disclaimer"
                type="text"
                value={copy.general.footerDisclaimer}
                onChange={(e) => {
                  updateCopy('general', { footerDisclaimer: e.target.value });
                  flashSaved();
                }}
                className={inputClass}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
