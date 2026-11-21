import type { HeroMediaConfig } from '../types';

/**
 * სერვერის მთავარი კონფიგურაცია — ROYAL 1899.
 * Hero-ს მედიის შესაცვლელად შეცვალეთ `heroMedia.type`:
 *  - 'image' -> გამოიყენებს სტატიკურ/ანიმაციურ ფოტოს
 *  - 'video' -> ჩასვამს ფონურ MP4/WebM ვიდეოს `poster` ფოტოთი და ავტომატური fallback-ით
 */
export const SITE_CONFIG = {
  brandName: 'ROYAL 1899',
  logoUrl: '/assets/aistudio/266e8d5409f2b9dab7794f54274b32c5_0b941030.webp',
  eraLabel: '1899 · RedM სერვერი · სერიოზული როლფლეი',
  discordInvite: 'https://discord.gg/royal1899',
  discordStoreUrl: 'https://discord.gg/royal1899',
  discordDisplay: 'discord.gg/royal1899',
  supportEmail: 'support@royal1899.ge',
  mapImageUrl: '/assets/aistudio/335489_5df41c4a.jpg',
  cubaMapImageUrl: '/src/assets/images/rdr2_cuba_guarma_map_1795133435123.jpg',
  heroMedia: {
    type: 'image',
    src: '/src/assets/images/hero_royal_1899_clean_1795132408333.jpg',
    alt: 'მხედარი 1899 წლის ამერიკულ ფრონტიერზე დაბინდებისას, წინ განათებული ხის თაღი წარწერით ROYAL 1899',
  } as HeroMediaConfig,
  /**
   * ვიდეოს მაგალითი (გასააქტიურებლად ჩაანაცვლეთ ზემოთ heroMedia):
   * heroMedia: {
   *   type: 'video',
   *   src: '/videos/frontier-hero.mp4',
   *   poster: '/src/assets/images/hero_royal_1899_1795131518445.jpg',
   *   alt: 'ROYAL 1899 სერვერის ვიდეო პრევიუ',
   * } as HeroMediaConfig,
   */
} as const;
