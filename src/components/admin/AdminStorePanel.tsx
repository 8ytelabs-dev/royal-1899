import { useMemo, useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { PRODUCT_CATEGORIES } from '../../data/products';
import { extractSavedGallery, resolveGalleryImages } from '../../lib/mediaGallery';
import { formatGelPrice } from '../../lib/storeLogic';
import type { StoreProduct } from '../../types';
import { MediaImage } from '../MediaImage';
import { MultiImageUploadField } from './MultiImageUploadField';

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter((c) => c.id !== 'all') as Array<{
  id: StoreProduct['category'];
  label: string;
}>;

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
  const { content, saveProduct, removeProduct } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<StoreProduct>(() => buildEmptyProduct());
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [perksText, setPerksText] = useState(editing.perks.join('\n'));
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return content.products;
    return content.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  }, [content.products, searchQuery]);

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
      CATEGORY_OPTIONS.find((c) => c.id === editing.category) ?? CATEGORY_OPTIONS[0];
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
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
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
