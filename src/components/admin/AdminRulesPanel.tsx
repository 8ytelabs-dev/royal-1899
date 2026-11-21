import { useMemo, useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { RULE_CATEGORIES } from '../../data/rules';
import type { RuleCategoryId, ServerRule } from '../../types';

const RULE_CATEGORY_OPTIONS = RULE_CATEGORIES.filter((c) => c.id !== 'all') as Array<{
  id: ServerRule['category'];
  label: string;
}>;

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 hover:border-[#ece2cc]/25 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none transition-colors';
const labelClass = 'block text-xs font-medium text-[#dcb975] mb-1.5';

function buildEmptyRule(): ServerRule {
  return {
    id: '',
    code: '§1.5',
    category: 'general',
    categoryLabel: 'ძირითადი წესები',
    title: '',
    summary: '',
    details: '',
    example: '',
    penalty: 'გაფრთხილება ან დროებითი ბანი',
  };
}

export function AdminRulesPanel() {
  const { content, saveRule, removeRule } = useSiteContent();
  const [filterCat, setFilterCat] = useState<RuleCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<ServerRule>(() => buildEmptyRule());
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleRules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return content.rules.filter((r) => {
      if (filterCat !== 'all' && r.category !== filterCat) return false;
      if (!q) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
      );
    });
  }, [content.rules, filterCat, searchQuery]);

  const selectForEdit = (rule: ServerRule) => {
    setEditing({ ...rule, example: rule.example ?? '' });
    setIsEditingExisting(true);
    setError(null);
    setNotice(null);
  };

  const resetToNew = () => {
    setEditing(buildEmptyRule());
    setIsEditingExisting(false);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing.code.trim() || !editing.title.trim() || !editing.summary.trim()) {
      setError('შეავსეთ წესის კოდი, სათაური და მოკლე აღწერა.');
      return;
    }

    const catMeta =
      RULE_CATEGORY_OPTIONS.find((c) => c.id === editing.category) ??
      RULE_CATEGORY_OPTIONS[0];
    const id = editing.id || `rule-${Date.now().toString(36)}`;

    const payload: ServerRule = {
      id,
      code: editing.code.trim(),
      category: editing.category,
      categoryLabel: catMeta.label,
      title: editing.title.trim(),
      summary: editing.summary.trim(),
      details: editing.details.trim() || editing.summary.trim(),
      example: editing.example?.trim() || undefined,
      penalty: editing.penalty.trim() || 'ადმინისტრაციული გაფრთხილება',
    };

    saveRule(payload);
    setError(null);
    setNotice(
      isEditingExisting
        ? `წესი ${payload.code} განახლდა.`
        : `ახალი წესი ${payload.code} დაემატა კოდექსში.`,
    );
    resetToNew();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-7 items-start">
      {/* Left: Existing Rules Directory */}
      <div className="xl:col-span-5 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#ece2cc]/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#ece2cc]">
              წესების კოდექსი
            </h2>
            <p className="text-xs text-[#c2b398] tabular-nums mt-0.5">
              ნაჩვენებია {visibleRules.length} / {content.rules.length} მუხლი
            </p>
          </div>
          <button
            type="button"
            onClick={resetToNew}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ახალი წესი</span>
          </button>
        </div>

        {/* Search + Chapter Filter */}
        <div className="px-4 py-3 border-b border-[#ece2cc]/8 bg-[#1b100a]/60 space-y-2.5">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#c2b398]/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="admin-rules-search" className="sr-only">
              წესის ძიება
            </label>
            <input
              id="admin-rules-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება კოდით (§1.1) ან სათაურით..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#140c07] border border-[#ece2cc]/12 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {RULE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCat(c.id)}
                className={`px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                  filterCat === c.id
                    ? 'bg-[#dcb975] text-[#1a1009] font-semibold'
                    : 'bg-[#140c07] border border-[#ece2cc]/10 text-[#c2b398] hover:text-[#ece2cc]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#ece2cc]/8 max-h-[640px] overflow-y-auto royal-scroll">
          {visibleRules.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[#c2b398]">
              მოთხოვნით წესი ვერ მოიძებნა.
            </div>
          ) : (
            visibleRules.map((rule) => {
              const selected = isEditingExisting && editing.id === rule.id;
              return (
                <div
                  key={rule.id}
                  className={`px-4 py-3.5 flex items-start justify-between gap-3 transition-colors ${
                    selected ? 'bg-[#2e1d13]' : 'hover:bg-[#281910]/80'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#dcb975] tabular-nums">
                        {rule.code}
                      </span>
                      <span className="text-[11px] text-[#c2b398]">
                        {rule.categoryLabel}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#ece2cc]">
                      {rule.title}
                    </p>
                    <p className="text-xs text-[#c2b398] line-clamp-2 leading-relaxed">
                      {rule.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => selectForEdit(rule)}
                      aria-label={`რედაქტირება: ${rule.title}`}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#dcb975]/15 text-[#dcb975]'
                          : 'text-[#c2b398] hover:text-[#dcb975] hover:bg-[#140c07]'
                      }`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeRule(rule.id);
                        if (editing.id === rule.id) resetToNew();
                        setNotice(`წესი ${rule.code} წაიშალა.`);
                      }}
                      aria-label={`წაშლა: ${rule.title}`}
                      className="p-2 text-[#c2b398] hover:text-[#e68a73] rounded-md hover:bg-[#140c07] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Spacious Add / Edit Rule Form */}
      <form
        onSubmit={handleSubmit}
        className="xl:col-span-7 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-5"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ece2cc]/10">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
              {isEditingExisting
                ? `წესის რედაქტირება (${editing.code})`
                : 'ახალი წესის დამატება'}
            </h3>
            <p className="text-xs text-[#c2b398] mt-0.5">
              ცვლილებები მყისიერად განახლდება წესების კოდექსის გვერდზე.
            </p>
          </div>
          {isEditingExisting && (
            <button
              type="button"
              onClick={resetToNew}
              className="px-3 py-1.5 text-xs font-medium text-[#c2b398] hover:text-[#ece2cc] bg-[#140c07] border border-[#ece2cc]/12 rounded-md cursor-pointer"
            >
              გაუქმება
            </button>
          )}
        </div>

        {notice && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[#140c07] border border-[#dcb975]/40 text-xs text-[#dcb975]">
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="px-3.5 py-2.5 rounded-md bg-[#3c1b15] border border-[#e68a73]/40 text-xs text-[#f2b5a4]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rule-code" className={labelClass}>
              წესის კოდი *
            </label>
            <input
              id="rule-code"
              type="text"
              value={editing.code}
              onChange={(e) => setEditing({ ...editing, code: e.target.value })}
              placeholder="მაგ. §2.4"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="rule-category" className={labelClass}>
              თავი / კატეგორია
            </label>
            <select
              id="rule-category"
              value={editing.category}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category: e.target.value as ServerRule['category'],
                })
              }
              className={inputClass}
            >
              {RULE_CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="rule-title" className={labelClass}>
            წესის სათაური *
          </label>
          <input
            id="rule-title"
            type="text"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="მაგ. უსაფრთხო ზონების წესები"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="rule-summary" className={labelClass}>
            მოკლე აღწერა *
          </label>
          <textarea
            id="rule-summary"
            rows={2}
            value={editing.summary}
            onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="rule-details" className={labelClass}>
            სრული განმარტება
          </label>
          <textarea
            id="rule-details"
            rows={4}
            value={editing.details}
            onChange={(e) => setEditing({ ...editing, details: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rule-example" className={labelClass}>
              მაგალითი (არასავალდებულო)
            </label>
            <input
              id="rule-example"
              type="text"
              value={editing.example ?? ''}
              onChange={(e) =>
                setEditing({ ...editing, example: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rule-penalty" className={labelClass}>
              სანქცია / სასჯელი
            </label>
            <input
              id="rule-penalty"
              type="text"
              value={editing.penalty}
              onChange={(e) =>
                setEditing({ ...editing, penalty: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#ece2cc]/10 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md cursor-pointer"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>
              {isEditingExisting ? 'ცვლილებების შენახვა' : 'წესის დამატება'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
