import type { ProductCategory, StoreProduct } from '../types';

export function filterStoreProducts(
  products: StoreProduct[],
  category: ProductCategory,
  query: string,
): StoreProduct[] {
  const normalized = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalized) {
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
    return haystack.includes(normalized);
  });
}

export function formatGelPrice(amount: number): string {
  return `${amount.toLocaleString('ka-GE')} ₾`;
}

export function buildDiscordPurchaseMessage(product: StoreProduct): string {
  return `ROYAL 1899 — შეძენის მოთხოვნა | პაკეტი: ${product.name} (${product.billingCycle}) | ფასი: ${formatGelPrice(product.priceGel)}`;
}
