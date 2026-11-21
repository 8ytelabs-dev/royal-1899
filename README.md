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

## RedM ლაივ სტატუსი

Hero სექციაში რეალური მოთამაშეების რაოდენობის საჩვენებლად `.env`-ში (ან Railway Variables-ში) მიუთითეთ ერთ-ერთი:

- `REDM_SERVER_URL=http://<სერვერის-IP>:30120` — სერვერის პირდაპირი მისამართი (`dynamic.json` ენდპოინტი)
- `REDM_CFX_CODE=abc123` — cfx.re join კოდი (`https://cfx.re/join/abc123`-დან)

ბექენდი მონაცემებს ყოველ 15 წამში აახლებს (cache), ფრონტი — ყოველ 30 წამში. თუ RedM სერვერი მიუწვდომელია, სტატუსი ავტომატურად „offline" ხდება.

## Discord OAuth

რეგისტრაციისთვის შეავსეთ `.env`-ში `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
და `DISCORD_REDIRECT_URI` ([Discord Developer Portal](https://discord.com/developers/applications)).
Redirect URI უნდა ემთხვეოდეს `/api/auth/discord/callback` მისამართს.

## Railway Deploy

ერთი სერვისი ემსახურება ფრონტსაც და API-საც:

1. **Variables**: დაამატეთ `DATABASE_URL` (Railway Postgres-ის internal URL).
2. **Volume**: მიამაგრეთ volume mount path-ით `/storage` — ატვირთული ფოტოები/ვიდეოები აქ ინახება და deploy-ებს შორის არ იკარგება.
3. **Build**: `npm run build` (ავტომატურად), **Start**: `npm start` — start სკრიპტი ჯერ სქემას აწევს ბაზაში (`drizzle-kit push`), შემდეგ უშვებს Express სერვერს, რომელიც production-ში `dist/`-საც ემსახურება.

შენიშვნა: `postgres.railway.internal` ჰოსტი მხოლოდ Railway-ის შიდა ქსელიდან მუშაობს — ლოკალური dev-ისთვის გამოიყენეთ ცალკე ბაზა (მაგ. Neon) `.env`-ში.

---
Made by DevraStudio
