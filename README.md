# ROYAL 1899 — RDR2 Roleplay საიტი

React + Vite ფრონტენდი და Express + Drizzle ORM (PostgreSQL/Neon) ბექენდი.
ადმინ პანელის მთელი კონტენტი (ტექსტები, მედია, პროდუქტები, წესები, რუკის
ლოკაციები, გზამკვლევი, ძებნილები) ინახება PostgreSQL ბაზაში.

## ლოკალურად გაშვება

**წინაპირობები:** Node.js, PostgreSQL connection string (Neon)

1. დააინსტალირეთ პაკეტები:
   ```
   npm install
   ```
2. შექმენით `.env` ფაილი `.env.example`-ის მიხედვით და ჩაწერეთ `DATABASE_URL`.
3. აწიეთ ბაზის სქემა:
   ```
   npm run db:push
   ```
4. გაუშვით API სერვერი (პირველ გაშვებაზე ბაზა ავტომატურად შეივსება default კონტენტით):
   ```
   npm run server
   ```
5. ცალკე ტერმინალში გაუშვით ფრონტენდი:
   ```
   npm run dev
   ```
   Vite dev სერვერი `/api` მოთხოვნებს ავტომატურად გადაამისამართებს API სერვერზე (პორტი 3001).

## სტრუქტურა

- `server/schema.ts` — Drizzle სქემები (users, sessions, site_copy, media_assets, products, rules, map_locations, server_status, guide_*, wanted_suspects)
- `server/actions/` — API ენდპოინტები დომენებად დაყოფილი:
  - `auth.ts` — რეგისტრაცია/ავტორიზაცია Discord OAuth-ით
  - `siteCopy.ts` — საიტის ტექსტები და hero მედია
  - `media.ts` — ატვირთული ფოტო/ვიდეო URL-ების რეესტრი
  - `products.ts` — მაღაზიის პროდუქტები
  - `rules.ts` — სერვერის წესები
  - `mapLocations.ts` — სახლები/რანჩოები რუკაზე
  - `serverStatus.ts` — ლაივ სტატუსი
  - `guide.ts` — გზამკვლევის ნაბიჯები, კლავიშები, FAQ
  - `wanted.ts` — ძებნილთა დაფა
  - `content.ts` — მთლიანი კონტენტის აგრეგატი, import/reset, seed
- `src/services/cmsApi.ts` — ფრონტის API კლიენტი

## სკრიპტები

| ბრძანება | აღწერა |
| --- | --- |
| `npm run dev` | ფრონტენდი (Vite, პორტი 3000) |
| `npm run server` | API სერვერი watch რეჟიმში (პორტი 3001) |
| `npm run server:start` | API სერვერი production რეჟიმში |
| `npm run db:push` | Drizzle სქემის აწევა ბაზაში |
| `npm run build` | ფრონტის production build |
| `npm run lint` | ტიპების შემოწმება |

## Discord OAuth

რეგისტრაციისთვის შეავსეთ `.env`-ში `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
და `DISCORD_REDIRECT_URI` ([Discord Developer Portal](https://discord.com/developers/applications)).
Redirect URI უნდა ემთხვეოდეს `/api/auth/discord/callback` მისამართს.

---
Made by DevraStudio
