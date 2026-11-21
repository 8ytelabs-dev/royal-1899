import { useMemo, useState, useEffect, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { extractSavedGallery, resolveGalleryImages } from '../../lib/mediaGallery';
import { formatGelPrice } from '../../lib/storeLogic';
import type { StoreCategory, StoreProduct } from '../../types';
import { MediaImage } from '../MediaImage';
import { MultiImageUploadField } from './MultiImageUploadField';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 hover:border-[#ece2cc]/25 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none transition-colors';
const labelClass = 'block text-xs font-medium text-[#dcb975] mb-1.5';

function buildEmptyProduct(): StoreProduct {
  return {
    id: '',
    slug: '',
    name: '',
    category: 'property',
    categoryLabel: 'ქონება',
    priceGel: 65,
    billingCycle: 'ერთჯერადი',
    shortDescription: '',
    fullDescription: '',
    imageUrl: '',
    galleryImages: [],
    imageAlt: 'ROYAL 1899 მაღაზიის პაკეტი',
    featured: false,
    deliveryNote: 'გადახდის დადასტურებიდან 15–30 წუთში Discord ტიკეტით',
    perks: ['პერსონალური წვდომა სერვერზე', 'სწრაფი გააქტიურება Discord-ით'],
  };
}

export function AdminStorePanel() {
  const {
    content,
    saveProduct,
    removeProduct,
    updateStoreCategories,
  } = useSiteContent();
  const storeCategories = content.storeCategories;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editing, setEditing] = useState<StoreProduct>(() => buildEmptyProduct());
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [perksText, setPerksText] = useState(editing.perks.join('\n'));
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* --- მაღაზიის კატეგორიების მართვა --- */
  const [categoryDrafts, setCategoryDrafts] = useState<StoreCategory[]>(() =>
    storeCategories.map((c) => ({ ...c })),
  );
  const [categoriesDirty, setCategoriesDirty] = useState(false);
  const [categoryNotice, setCategoryNotice] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // სერვერიდან ჩატვირთვისას დრაფტების სინქრონიზაცია (თუ ლოკალური ცვლილება არ არის)
  useEffect(() => {
    if (!categoriesDirty) {
      setCategoryDrafts(storeCategories.map((c) => ({ ...c })));
    }
  }, [storeCategories, categoriesDirty]);

  const editCategory = (
    index: number,
    patch: Partial<StoreCategory>,
  ) => {
    setCategoryDrafts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
    setCategoriesDirty(true);
    setCategoryNotice(null);
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    setCategoryDrafts((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setCategoriesDirty(true);
    setCategoryNotice(null);
  };

  const addCategory = () => {
    setCategoryDrafts((prev) => [
      ...prev,
      {
        id: `store-category-${Date.now().toString(36)}`,
        label: '',
      },
    ]);
    setCategoriesDirty(true);
    setCategoryNotice(null);
  };

  const removeCategory = (index: number) => {
    const category = categoryDrafts[index];
    const usedBy = content.products.filter(
      (p) => p.category === category.id,
    ).length;
    if (usedBy > 0) {
      setCategoryError(
        `კატეგორია „${category.label}" ვერ წაიშლება — მასში ${usedBy} პროდუქტია. ჯერ გადაიტანეთ ან წაშალეთ პროდუქტები.`,
      );
      return;
    }
    setCategoryDrafts((prev) => prev.filter((_, i) => i !== index));
    setCategoriesDirty(true);
    setCategoryError(null);
    setCategoryNotice(null);
  };

  const saveCategories = () => {
    const cleaned = categoryDrafts.map((c) => ({
      id: c.id,
      label: c.label.trim(),
    }));
    if (cleaned.length === 0 || cleaned.some((c) => !c.label)) {
      setCategoryError(
        'ყველა კატეგორიას სჭირდება სახელი და მინიმუმ ერთი კატეგორია უნდა არსებობდეს.',
      );
      return;
    }
    // obnovit categoryLabel ყველა პროდუქტზე გადარქმეულ კატეგორიებისათვის
    for (const product of content.products) {
      const category = cleaned.find((c) => c.id === product.category);
      if (category && category.label !== product.categoryLabel) {
        saveProduct({ ...product, categoryLabel: category.label });
      }
    }
    updateStoreCategories(cleaned);
    setCategoriesDirty(false);
    setCategoryError(null);
    setCategoryNotice('კატეგორია შენახულია — ცვლილებები აისახა მაღაზიაზე.');
  };

  const resetCategories = () => {
    setCategoryDrafts(storeCategories.map((c) => ({ ...c })));
    setCategoriesDirty(false);
    setCategoryError(null);
    setCategoryNotice(null);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return content.products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    });
  }, [content.products, searchQuery, selectedCategory]);

  const selectForEdit = (product: StoreProduct) => {
    const gallery = resolveGalleryImages(product.imageUrl, product.galleryImages);
    setEditing({
      ...product,
      imageUrl: gallery[0] ?? '',
      galleryImages: gallery,
      perks: [...product.perks],
    });
    setPerksText(product.perks.join('\n'));
    setIsEditingExisting(true);
    setError(null);
    setNotice(null);
  };

  const resetToNew = () => {
    const fresh = buildEmptyProduct();
    setEditing(fresh);
    setPerksText(fresh.perks.join('\n'));
    setIsEditingExisting(false);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing.name.trim()) {
      setError('შეიყვანეთ პროდუქტის სახელწოდება.');
      return;
    }
    if (!editing.shortDescription.trim()) {
      setError('შეიყვანეთ პროდუქტის მოკლე აღწერა.');
      return;
    }
    if (editing.priceGel <= 0) {
      setError('ფასი უნდა იყოს 0-ზე მეტი.');
      return;
    }

    const catMeta =
      storeCategories.find((c) => c.id === editing.category) ??
      storeCategories[0] ?? { id: 'property', label: 'ქონება' };
    const generatedId =
      editing.id || `product-${Date.now().toString(36)}`;
    const parsedPerks = perksText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const { imageUrl, galleryImages } = extractSavedGallery(
      editing.galleryImages ?? (editing.imageUrl ? [editing.imageUrl] : []),
    );

    const payload: StoreProduct = {
      ...editing,
      id: generatedId,
      slug: editing.slug || generatedId,
      name: editing.name.trim(),
      categoryLabel: catMeta.label,
      shortDescription: editing.shortDescription.trim(),
      fullDescription:
        editing.fullDescription.trim() || editing.shortDescription.trim(),
      imageUrl,
      galleryImages,
      imageAlt: editing.imageAlt.trim() || editing.name.trim(),
      perks: parsedPerks.length > 0 ? parsedPerks : ['გააქტიურება Discord ტიკეტით'],
    };

    saveProduct(payload);
    setError(null);
    setNotice(
      isEditingExisting
        ? `პროდუქტი „${payload.name}“ განახლდა.`
        : `ახალი პროდუქტი „${payload.name}“ დაემატა მაღაზიაში.`,
    );
    resetToNew();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-7 items-start">
      {/* Store Categories Management */}
      <div className="col-span-full bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-5 lg:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#ece2cc]">
              მაღაზიის კატეგორიები
            </h2>
            <p className="text-xs text-[#c2b398] mt-0.5">
              დაამატეთ, რედაქტირეთ ან გადაალაგეთ კატეგორიები — თანმიმდევრობა
              ზუსტად ასე გამოჩნდება მაღაზიის გვერდზე.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {categoriesDirty && (
              <button
                type="button"
                onClick={resetCategories}
                className="px-3 py-2 text-xs font-medium text-[#c2b398] hover:text-[#ece2cc] bg-[#140c07] border border-[#ece2cc]/12 rounded-md cursor-pointer"
              >
                გაუქმება
              </button>
            )}
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#140c07] border border-[#dcb975]/40 text-[#dcb975] hover:border-[#dcb975] rounded-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>კატეგორიის დამატება</span>
            </button>
            <button
              type="button"
              onClick={saveCategories}
              disabled={!categoriesDirty}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:cursor-default"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>კატეგორიების შენახვა</span>
            </button>
          </div>
        </div>

        {categoryNotice && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[#140c07] border border-[#dcb975]/40 text-xs text-[#dcb975]">
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{categoryNotice}</span>
          </div>
        )}
        {categoryError && (
          <div className="px-3.5 py-2.5 rounded-md bg-[#3c1b15] border border-[#e68a73]/40 text-xs text-[#f2b5a4]">
            {categoryError}
          </div>
        )}

        <div className="space-y-2">
          {categoryDrafts.map((category, index) => {
            const productsInCategory = content.products.filter(
              (p) => p.category === category.id,
            ).length;
            return (
              <div
                key={category.id}
                className="flex flex-wrap items-center gap-2 bg-[#140c07] border border-[#ece2cc]/10 rounded-md px-3 py-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveCategory(index, -1)}
                    disabled={index === 0}
                    aria-label={`კატეგორიის აწევა: ${category.label}`}
                    className="p-1 text-[#c2b398] hover:text-[#dcb975] disabled:opacity-25 disabled:cursor-default cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categoryDrafts.length - 1}
                    aria-label={`კატეგორიის ჩაწევა: ${category.label}`}
                    className="p-1 text-[#c2b398] hover:text-[#dcb975] disabled:opacity-25 disabled:cursor-default cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <input
                  type="text"
                  value={category.label}
                  onChange={(e) =>
                    editCategory(index, { label: e.target.value })
                  }
                  placeholder="კატეგორიის სახელი (მაგ. ქონება)"
                  aria-label="კატეგორიის სახელი"
                  className="flex-1 min-w-40 px-3 py-2 text-sm bg-[#22150d] border border-[#ece2cc]/14 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none"
                />
                <span className="text-[11px] font-mono tabular-nums text-[#c2b398] whitespace-nowrap">
                  {productsInCategory} პროდუქტი
                </span>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  aria-label={`კატეგორიის წაშლა: ${category.label}`}
                  className="p-2 text-[#c2b398] hover:text-[#e68a73] rounded-md hover:bg-[#22150d] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Left: Existing Products Catalog Rail */}
      <div className="xl:col-span-5 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#ece2cc]/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#ece2cc]">
              მაღაზიის პაკეტები
            </h2>
            <p className="text-xs text-[#c2b398] tabular-nums mt-0.5">
              სულ {content.products.length} პროდუქტი კატალოგში
            </p>
          </div>
          <button
            type="button"
            onClick={resetToNew}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ახალი პროდუქტი</span>
          </button>
        </div>

        {/* Live Search Filter */}
        <div className="px-4 py-3 border-b border-[#ece2cc]/8 bg-[#1b100a]/60">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#c2b398]/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="admin-store-search" className="sr-only">
              პროდუქტის ძიება
            </label>
            <input
              id="admin-store-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="პროდუქტის ძიება სახელით ან კატეგორიით..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#140c07] border border-[#ece2cc]/12 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-3 border-b border-[#ece2cc]/8 bg-[#1b100a]/60">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'ყველა კატეგორია' },
              ...storeCategories,
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-[#dcb975] text-[#1a1009] font-semibold'
                    : 'bg-[#140c07] border border-[#ece2cc]/10 text-[#c2b398] hover:text-[#ece2cc]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#ece2cc]/8 max-h-[680px] overflow-y-auto royal-scroll">
          {filteredProducts.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[#c2b398]">
              მოთხოვნით პროდუქტი ვერ მოიძებნა.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const selected = isEditingExisting && editing.id === product.id;
              return (
                <div
                  key={product.id}
                  className={`px-4 py-3.5 flex items-center gap-3.5 transition-colors ${
                    selected
                      ? 'bg-[#2e1d13]'
                      : 'hover:bg-[#281910]/80'
                  }`}
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-[#140c07] border border-[#ece2cc]/10 shrink-0">
                    <MediaImage
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {product.featured && (
                        <Star
                          className="w-3.5 h-3.5 text-[#dcb975] fill-[#dcb975] shrink-0"
                          aria-label="რჩეული პროდუქტი"
                        />
                      )}
                      <p className="text-sm font-semibold text-[#ece2cc] truncate">
                        {product.name}
                      </p>
                    </div>
                    <p className="text-xs text-[#c2b398]">
                      {product.categoryLabel} · {product.billingCycle}
                      {resolveGalleryImages(product.imageUrl, product.galleryImages).length > 1 && (
                        <span className="text-[#dcb975]">
                          {' '}· {resolveGalleryImages(product.imageUrl, product.galleryImages).length} ფოტო
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[#dcb975] tabular-nums">
                      {formatGelPrice(product.priceGel)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => selectForEdit(product)}
                      aria-label={`რედაქტირება: ${product.name}`}
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
                        removeProduct(product.id);
                        if (editing.id === product.id) resetToNew();
                        setNotice(`პროდუქტი „${product.name}“ წაიშალა.`);
                      }}
                      aria-label={`წაშლა: ${product.name}`}
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

      {/* Right: Spacious Add / Edit Product Form */}
      <form
        onSubmit={handleSubmit}
        className="xl:col-span-7 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-5"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ece2cc]/10">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
              {isEditingExisting
                ? `რედაქტირება: ${editing.name}`
                : 'ახალი პროდუქტის დამატება'}
            </h3>
            <p className="text-xs text-[#c2b398] mt-0.5">
              შეავსეთ პაკეტის დეტალები — დამატებისთანავე გამოჩნდება მაღაზიაში.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prod-name" className={labelClass}>
              პროდუქტის სახელწოდება *
            </label>
            <input
              id="prod-name"
              type="text"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="მაგ. VIP რანჩოს პაკეტი"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="prod-category" className={labelClass}>
              კატეგორია
            </label>
            <select
              id="prod-category"
              value={editing.category}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category: e.target.value as StoreProduct['category'],
                })
              }
              className={inputClass}
            >
              {storeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              {storeCategories.length === 0 && (
                <option value="" disabled>
                  კატეგორიაარ არსებობს — మొద대로 დაამატეთ კატეგორია
                </option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="prod-price" className={labelClass}>
              ფასი (₾) *
            </label>
            <input
              id="prod-price"
              type="number"
              min={1}
              value={editing.priceGel}
              onChange={(e) =>
                setEditing({ ...editing, priceGel: Number(e.target.value) || 0 })
              }
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label htmlFor="prod-billing" className={labelClass}>
              გადახდის ტიპი
            </label>
            <input
              id="prod-billing"
              type="text"
              value={editing.billingCycle}
              onChange={(e) =>
                setEditing({ ...editing, billingCycle: e.target.value })
              }
              placeholder="ერთჯერადი / თვიური"
              className={inputClass}
            />
          </div>
        </div>

        {/* 4-Slot Photo Upload Studio (Upload Only — No URL Input) */}
        <MultiImageUploadField
          idPrefix="prod-gallery"
          label="პროდუქტის ფოტოები (მაქს. 4 ფოტო)"
          images={resolveGalleryImages(editing.imageUrl, editing.galleryImages)}
          fallbackTitle={editing.name || 'პაკეტი'}
          onChange={(nextGallery) =>
            setEditing((prev) => ({
              ...prev,
              imageUrl: nextGallery[0] ?? '',
              galleryImages: nextGallery,
            }))
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prod-short" className={labelClass}>
              მოკლე აღწერა (ბარათზე) *
            </label>
            <textarea
              id="prod-short"
              rows={3}
              value={editing.shortDescription}
              onChange={(e) =>
                setEditing({ ...editing, shortDescription: e.target.value })
              }
              placeholder="მოკლე და მიმზიდველი აღწერა მაღაზიის ბარათისთვის..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="prod-full" className={labelClass}>
              სრული აღწერა (დეტალურ ფანჯარაში)
            </label>
            <textarea
              id="prod-full"
              rows={3}
              value={editing.fullDescription}
              onChange={(e) =>
                setEditing({ ...editing, fullDescription: e.target.value })
              }
              placeholder="ვრცელი აღწერა..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prod-perks" className={labelClass}>
            რას მოიცავს პაკეტი (თითო ხაზზე თითო პუნქტი)
          </label>
          <textarea
            id="prod-perks"
            rows={3}
            value={perksText}
            onChange={(e) => setPerksText(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label htmlFor="prod-delivery" className={labelClass}>
              მიწოდების / გააქტიურების შენიშვნა
            </label>
            <input
              id="prod-delivery"
              type="text"
              value={editing.deliveryNote}
              onChange={(e) =>
                setEditing({ ...editing, deliveryNote: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <label className="inline-flex items-center gap-2.5 pt-5 text-sm text-[#ece2cc] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editing.featured}
              onChange={(e) =>
                setEditing({ ...editing, featured: e.target.checked })
              }
              className="w-4 h-4 accent-[#dcb975]"
            />
            <span>მთავარ გვერდზე რჩეულად ჩვენება</span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#ece2cc]/10 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md cursor-pointer"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>
              {isEditingExisting ? 'ცვლილებების შენახვა' : 'პროდუქტის დამატება'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
