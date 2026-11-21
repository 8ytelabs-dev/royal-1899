import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Search, X } from 'lucide-react';
import { DiscordIcon } from '../components/DiscordIcon';
import { MediaImage } from '../components/MediaImage';
import { useSiteContent } from '../context/SiteContentContext';
import { formatGelPrice } from '../lib/storeLogic';
import type { StoreProduct } from '../types';

interface StorePageProps {
  onSelectProduct: (product: StoreProduct) => void;
}

export function StorePage({ onSelectProduct }: StorePageProps) {
  const { content } = useSiteContent();
  const storeCopy = content.copy.store;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalize = (query: string) => query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    const q = normalize(searchQuery);
    return content.products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      if (!matchesCategory) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = [
        product.name,
        product.categoryLabel,
        product.shortDescription,
        product.fullDescription,
        ...product.perks,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [content.products, selectedCategory, searchQuery]);

  const isDefaultView = selectedCategory === 'all' && searchQuery.trim() === '';
  const spotlightProduct = isDefaultView
    ? filteredProducts.find((p) => p.featured) ?? null
    : null;
  const gridProducts = spotlightProduct
    ? filteredProducts.filter((p) => p.id !== spotlightProduct.id)
    : filteredProducts;

  return (
    <div className="pt-28 md:pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Editorial Store Header */}
        <header className="pb-10 border-b border-[#ece2cc]/12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium tracking-wider text-[#dcb975]">
              {storeCopy.eyebrow}
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-[#ece2cc]">
              {storeCopy.heading}
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-[#c2b398]">
              {storeCopy.subtitle}
            </p>
          </div>

          <a
            href={content.copy.general.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 self-start md:self-end px-5 py-3 text-sm font-medium bg-[#2c1c12] border border-[#dcb975]/35 text-[#ece2cc] hover:border-[#dcb975] hover:text-[#dcb975] transition-colors rounded-md whitespace-nowrap shrink-0"
          >
            <DiscordIcon className="w-4 h-4 text-[#dcb975] shrink-0" />
            <span>{storeCopy.discordTicketLabel}</span>
          </a>
        </header>

        {/* Filter Tabs + Search Toolbar */}
        <div className="py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div
            role="tablist"
            aria-label="პროდუქტების კატეგორიები"
            className="flex flex-1 flex-wrap items-center gap-1.5"
          >
            {[
              { id: 'all', label: 'ყველა' },
              ...content.storeCategories,
            ].map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#dcb975] text-[#22150d]'
                      : 'text-[#c2b398] hover:text-[#ece2cc] hover:bg-[#2c1c12]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full shrink-0 lg:w-72">
            <Search
              className="w-4 h-4 text-[#c2b398] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="store-search" className="sr-only">
              მაღაზიაში ძიება
            </label>
            <input
              id="store-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნეთ პაკეტი..."
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

        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div
            className="my-12 py-16 px-6 text-center bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl space-y-3"
            data-testid="store-empty-state"
          >
            <p className="font-display text-xl text-[#ece2cc]">პროდუქტი ვერ მოიძებნა</p>
            <p className="text-sm text-[#c2b398]">
              სცადეთ სხვა საკვანძო სიტყვა ან დააბრუნეთ ყველა კატეგორია.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md transition-colors cursor-pointer"
            >
              ფილტრის გასუფთავება
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Spotlight Featured Item on Default Store View */}
            {spotlightProduct && (
              <motion.article
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#2c1c12] border border-[#dcb975]/25 rounded-xl overflow-hidden"
              >
                <div className="lg:col-span-6 bg-[#180e08] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(spotlightProduct)}
                    aria-label={`დეტალების ნახვა: ${spotlightProduct.name}`}
                    className="block w-full h-full group cursor-pointer"
                  >
                    <MediaImage
                      src={spotlightProduct.imageUrl}
                      alt={spotlightProduct.imageAlt}
                      fallbackTitle={spotlightProduct.name}
                      className="w-full h-72 lg:h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </button>
                </div>

                <div className="lg:col-span-6 p-7 md:p-10 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-[#dcb975]">
                      <span>რჩეული პაკეტი</span>
                      <span aria-hidden="true">·</span>
                      <span>{spotlightProduct.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{spotlightProduct.billingCycle}</span>
                    </div>

                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]">
                      {spotlightProduct.name}
                    </h2>

                    <p className="text-sm leading-relaxed text-[#c2b398]">
                      {spotlightProduct.shortDescription}
                    </p>

                    <ul className="space-y-2 text-sm text-[#ece2cc]/85">
                      {spotlightProduct.perks.slice(0, 3).map((perk) => (
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

                  <div className="pt-5 border-t border-[#ece2cc]/12 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-mono text-2xl font-semibold text-[#dcb975] tabular-nums whitespace-nowrap shrink-0">
                      {formatGelPrice(spotlightProduct.priceGel)}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(spotlightProduct)}
                        className="px-4 py-2.5 text-sm font-medium text-[#ece2cc] border border-[#ece2cc]/20 hover:border-[#dcb975] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        დეტალურად
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Balanced Product Catalog Grid */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${
                spotlightProduct ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
              } gap-8`}
              data-testid="store-product-grid"
            >
              {gridProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group flex flex-col bg-[#2c1c12] border border-[#ece2cc]/12 hover:border-[#dcb975]/35 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    aria-label={`დეტალების ნახვა: ${product.name}`}
                    className="block w-full aspect-[4/3] overflow-hidden bg-[#180e08] cursor-pointer text-left"
                  >
                    <MediaImage
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </button>

                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-[#c2b398]">
                        <span className="text-[#dcb975]">{product.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.billingCycle}</span>
                      </div>

                      <h3 className="font-display text-xl font-semibold text-[#ece2cc]">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="text-left hover:text-[#dcb975] transition-colors cursor-pointer"
                        >
                          {product.name}
                        </button>
                      </h3>

                      <p className="text-sm leading-relaxed text-[#c2b398]">
                        {product.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#ece2cc]/10 flex items-center justify-between gap-4">
                      <span className="font-mono text-lg font-semibold text-[#dcb975] tabular-nums whitespace-nowrap shrink-0">
                        {formatGelPrice(product.priceGel)}
                      </span>

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="px-3.5 py-2 text-xs font-medium text-[#ece2cc]/85 hover:text-[#dcb975] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          დეტალები
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
