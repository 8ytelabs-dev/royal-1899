import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { RULE_CATEGORIES } from '../data/rules';
import { countRulesByCategory, filterServerRules } from '../lib/rulesLogic';
import type { RuleCategoryId } from '../types';

const ACK_STORAGE_KEY = 'royal_1899_rules_acknowledged';

export function RulesPage() {
  const { content } = useSiteContent();
  const rulesCopy = content.copy.rules;
  const [selectedCategory, setSelectedCategory] = useState<RuleCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRuleIds, setExpandedRuleIds] = useState<Record<string, boolean>>({
    'rule-1-1': true,
    'rule-2-1': true,
  });
  const [acknowledged, setAcknowledged] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(ACK_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const counts = useMemo(
    () => countRulesByCategory(content.rules),
    [content.rules],
  );
  const filteredRules = useMemo(
    () => filterServerRules(content.rules, selectedCategory, searchQuery),
    [content.rules, selectedCategory, searchQuery],
  );

  const toggleRule = (ruleId: string) => {
    setExpandedRuleIds((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  const handleToggleAcknowledge = () => {
    const next = !acknowledged;
    setAcknowledged(next);
    try {
      window.localStorage.setItem(ACK_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage quota or privacy-mode errors
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="pb-10 border-b border-[#ece2cc]/12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium tracking-wider text-[#dcb975]">
              {rulesCopy.eyebrow}
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-[#ece2cc]">
              {rulesCopy.heading}
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-[#c2b398]">
              {rulesCopy.subtitle}
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search
              className="w-4 h-4 text-[#c2b398] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="rules-search" className="sr-only">
              წესებში ძიება
            </label>
            <input
              id="rules-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება (მაგ. RDM, ბანდა, შერიფი)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="ძიების გასუფთავება"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#c2b398] hover:text-[#ece2cc] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Main 2-Column Editorial Rules Layout */}
        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sticky Chapter Selector */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <nav aria-label="წესების თავები" className="space-y-1.5">
              {RULE_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm rounded-lg transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#2c1c12] text-[#dcb975] border border-[#dcb975]/35 font-semibold'
                        : 'text-[#c2b398] hover:text-[#ece2cc] hover:bg-[#2c1c12]/60 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {category.chapterNumber && (
                        <span className="font-mono text-xs opacity-75">
                          {category.chapterNumber}.
                        </span>
                      )}
                      <span className="truncate">{category.label}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums opacity-80 shrink-0">
                      {counts[category.id]}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Rule Acknowledgment Block */}
            <div className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5">
                <h2 className="font-display text-base font-semibold text-[#ece2cc]">
                  წესების გაცნობა
                </h2>
                <p className="text-xs leading-relaxed text-[#c2b398]">
                  მონიშნეთ წაკითხვის დადასტურება, რათა იცოდეთ, რომ კოდექსის
                  მიმდინარე ვერსია გავლილი გაქვთ.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleAcknowledge}
                aria-pressed={acknowledged}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  acknowledged
                    ? 'bg-[#dcb975] text-[#22150d]'
                    : 'bg-[#22150d] border border-[#dcb975]/40 text-[#ece2cc] hover:border-[#dcb975]'
                }`}
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>
                  {acknowledged ? 'წესები გაცნობილია' : 'ვადასტურებ გაცნობას'}
                </span>
              </button>
            </div>
          </aside>

          {/* Right Rules Ledger */}
          <section className="lg:col-span-8 space-y-4" aria-label="წესების ჩამონათვალი">
            {filteredRules.length === 0 ? (
              <div
                className="py-16 px-6 text-center bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl space-y-3"
                data-testid="rules-empty-state"
              >
                <p className="font-display text-xl text-[#ece2cc]">
                  შესაბამისი წესი ვერ მოიძებნა
                </p>
                <p className="text-sm text-[#c2b398]">
                  შეცვალეთ საძიებო სიტყვა ან აირჩიეთ ყველა თავი.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md transition-colors cursor-pointer"
                >
                  ყველა წესის ჩვენება
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="rules-list">
                {filteredRules.map((rule) => {
                  const isExpanded = Boolean(expandedRuleIds[rule.id]);
                  return (
                    <article
                      key={rule.id}
                      className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl overflow-hidden transition-colors hover:border-[#dcb975]/30"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleRule(rule.id)}
                        className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#dcb975]"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#c2b398]">
                            <span className="font-mono text-[#dcb975] font-medium">
                              მუხლი {rule.code}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{rule.categoryLabel}</span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
                            {rule.title}
                          </h3>
                          <p className="text-sm text-[#c2b398] leading-relaxed">
                            {rule.summary}
                          </p>
                        </div>

                        <ChevronDown
                          className={`w-5 h-5 text-[#dcb975] shrink-0 mt-1 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-4 border-t border-[#ece2cc]/10 space-y-4 text-sm">
                              <p className="leading-relaxed text-[#ece2cc]/90">
                                {rule.details}
                              </p>

                              {rule.example && (
                                <div className="bg-[#22150d]/85 rounded-lg p-4 space-y-1">
                                  <p className="text-xs font-medium text-[#dcb975]">
                                    პრაქტიკული მაგალითი
                                  </p>
                                  <p className="text-sm text-[#c2b398] leading-relaxed">
                                    {rule.example}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-xs text-[#c2b398]">
                                <span>სავარაუდო სანქცია:</span>
                                <span className="text-[#dcb975] font-medium">
                                  {rule.penalty}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
