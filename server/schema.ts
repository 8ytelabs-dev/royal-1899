import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/* ------------------------------------------------------------------ */
/* Auth — Discord-ით რეგისტრაცია                                       */
/* ------------------------------------------------------------------ */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),
  username: varchar('username', { length: 128 }).notNull(),
  globalName: varchar('global_name', { length: 128 }),
  email: varchar('email', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 16 }).notNull().default('member'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  token: uuid('token').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* საიტის ტექსტები (SiteCopyState სექციები — general, hero, home...)   */
/* ------------------------------------------------------------------ */

export const siteCopy = pgTable('site_copy', {
  section: varchar('section', { length: 64 }).primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* ატვირთული მედია — ფოტოების/ვიდეოების URL-ების რეესტრი               */
/* ------------------------------------------------------------------ */

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  type: varchar('type', { length: 16 }).notNull().default('image'), // image | video
  alt: text('alt'),
  context: varchar('context', { length: 64 }), // hero | product | map | gallery | wanted ...
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* მაღაზიის პროდუქტები                                                 */
/* ------------------------------------------------------------------ */

export const products = pgTable('products', {
  id: varchar('id', { length: 128 }).primaryKey(),
  slug: varchar('slug', { length: 128 }).notNull(),
  name: text('name').notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  categoryLabel: varchar('category_label', { length: 64 }).notNull(),
  priceGel: doublePrecision('price_gel').notNull(),
  billingCycle: varchar('billing_cycle', { length: 64 }).notNull(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  imageUrl: text('image_url').notNull(),
  galleryImages: jsonb('gallery_images').$type<string[]>(),
  imageAlt: text('image_alt').notNull(),
  featured: boolean('featured').notNull().default(false),
  deliveryNote: text('delivery_note').notNull(),
  perks: jsonb('perks').$type<string[]>().notNull().default([]),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* მაღაზიის კატეგორიები                                                */
/* ------------------------------------------------------------------ */

export const storeCategories = pgTable('store_categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  label: text('label').notNull(),
  position: integer('position').notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* სერვერის წესები                                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* წესების თავები (კატეგორიები)                                        */
/* ------------------------------------------------------------------ */

export const ruleCategories = pgTable('rule_categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  label: text('label').notNull(),
  chapterNumber: varchar('chapter_number', { length: 8 }),
  position: integer('position').notNull().default(0),
});

export const rules = pgTable('rules', {
  id: varchar('id', { length: 128 }).primaryKey(),
  code: varchar('code', { length: 32 }).notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  categoryLabel: varchar('category_label', { length: 64 }).notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  details: text('details').notNull(),
  example: text('example'),
  penalty: text('penalty').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* რუკის ლოკაციები — სახლები, რანჩოები, ლენდმარკები                    */
/* ------------------------------------------------------------------ */

export const mapLocations = pgTable('map_locations', {
  id: varchar('id', { length: 128 }).primaryKey(),
  realm: varchar('realm', { length: 16 }).notNull(), // mainland | cuba
  name: text('name').notNull(),
  category: varchar('category', { length: 32 }).notNull(), // house | ranch | special_ranch | landmark
  categoryLabel: varchar('category_label', { length: 64 }).notNull(),
  region: varchar('region', { length: 64 }).notNull(),
  regionLabel: varchar('region_label', { length: 64 }),
  status: varchar('status', { length: 16 }).notNull(), // available | occupied | public
  priceGel: doublePrecision('price_gel'),
  coordX: doublePrecision('coord_x').notNull(),
  coordY: doublePrecision('coord_y').notNull(),
  mapPosX: doublePrecision('map_pos_x').notNull(),
  mapPosY: doublePrecision('map_pos_y').notNull(),
  summary: text('summary').notNull(),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  imageUrl: text('image_url').notNull(),
  galleryImages: jsonb('gallery_images').$type<string[]>(),
  imageAlt: text('image_alt').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* ლაივ სერვერის სტატუსი (ერთი ჩანაწერი)                               */
/* ------------------------------------------------------------------ */

export const serverStatus = pgTable('server_status', {
  id: integer('id').primaryKey().default(1),
  online: boolean('online').notNull().default(true),
  playersOnline: integer('players_online').notNull().default(0),
  maxPlayers: integer('max_players').notNull().default(0),
  queueCount: integer('queue_count').notNull().default(0),
  inGameTime: varchar('in_game_time', { length: 32 }).notNull().default(''),
  nextRestart: varchar('next_restart', { length: 64 }).notNull().default(''),
  redmLaunchUrl: text('redm_launch_url').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* გზამკვლევი — ნაბიჯები, კლავიშები, FAQ                                */
/* ------------------------------------------------------------------ */

export const guideSteps = pgTable('guide_steps', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  stepNumber: varchar('step_number', { length: 8 }).notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  details: text('details').notNull(),
  actionLabel: text('action_label'),
  actionHref: text('action_href'),
  actionType: varchar('action_type', { length: 16 }), // external | copy-connect | route
  actionRoute: varchar('action_route', { length: 32 }),
  position: integer('position').notNull().default(0),
});

export const keybinds = pgTable('keybinds', {
  id: varchar('id', { length: 128 }).primaryKey(),
  keys: jsonb('keys').$type<string[]>().notNull().default([]),
  action: text('action').notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  categoryLabel: varchar('category_label', { length: 64 }).notNull(),
  position: integer('position').notNull().default(0),
});

export const guideFaqs = pgTable('guide_faqs', {
  id: varchar('id', { length: 128 }).primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  position: integer('position').notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* ძებნილთა დაფა                                                        */
/* ------------------------------------------------------------------ */

export const wantedSuspects = pgTable('wanted_suspects', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: text('name').notNull(),
  alias: text('alias').notNull(),
  rewardUsd: doublePrecision('reward_usd').notNull(),
  status: varchar('status', { length: 16 }).notNull(), // active | captured
  dangerLevel: varchar('danger_level', { length: 64 }).notNull(),
  lastSeenRegion: varchar('last_seen_region', { length: 64 }).notNull(),
  linkedMapId: varchar('linked_map_id', { length: 128 }).notNull(),
  linkedMapRealm: varchar('linked_map_realm', { length: 16 }).notNull(),
  charges: jsonb('charges').$type<string[]>().notNull().default([]),
  dossier: text('dossier').notNull(),
  issuedBy: text('issued_by').notNull(),
  portraitUrl: text('portrait_url').notNull(),
  portraitAlt: text('portrait_alt').notNull(),
  position: integer('position').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
