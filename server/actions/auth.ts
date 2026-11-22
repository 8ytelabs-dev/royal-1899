import crypto from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import {
  createSession,
  getSessionUser,
  SESSION_COOKIE,
  setSessionCookie,
} from '../authSession';
import { hashPassword, verifyPassword } from '../passwordAuth';
import { passwordAccounts, sessions, users } from '../schema';

/**
 * Discord OAuth2 და ელფოსტა/პაროლით ავტორიზაცია.
 *
 * საჭირო გარემოს ცვლადები:
 *   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI
 *
 * ენდპოინტები:
 *   GET  /api/auth/discord           → გადამისამართება Discord-ის ავტორიზაციაზე
 *   GET  /api/auth/discord/callback  → code-ის გაცვლა, მომხმარებლის რეგისტრაცია, სესიის cookie
 *   POST /api/auth/login             → ელფოსტა/პაროლით შესვლა
 *   GET  /api/auth/me                → მიმდინარე სესიის მომხმარებელი
 *   POST /api/auth/logout            → სესიის წაშლა
 */

const MIN_PASSWORD_LENGTH = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const DUMMY_PASSWORD_HASH = `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`;
const loginAttempts = new Map<
  string,
  { count: number; windowStartedAt: number; lockedUntil: number }
>();

const DISCORD_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

function getDiscordConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }
  return { clientId, clientSecret, redirectUri };
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function objectBody(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function userResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    discordId: user.discordId,
    username: user.username,
    globalName: user.globalName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

export async function ensureInitialAdminAccount() {
  const rawEmail = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!rawEmail || !password) {
    console.warn(
      '[auth] ADMIN_EMAIL / ADMIN_PASSWORD are not configured; no initial admin account was created.',
    );
    return;
  }

  const email = normalizeEmail(rawEmail);
  if (
    !isValidEmail(email) ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > 256
  ) {
    throw new Error(
      `Initial admin configuration is invalid: use a valid ADMIN_EMAIL and an ADMIN_PASSWORD with at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  const [existingAccount] = await db
    .select({ userId: passwordAccounts.userId })
    .from(passwordAccounts)
    .where(eq(passwordAccounts.email, email))
    .limit(1);
  if (existingAccount) {
    await db
      .update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.id, existingAccount.userId));
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    const [existingUser] = await tx
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    const [user] = existingUser
      ? await tx
          .update(users)
          .set({ role: 'admin', updatedAt: new Date() })
          .where(eq(users.id, existingUser.id))
          .returning({ id: users.id })
      : await tx
          .insert(users)
          .values({
            discordId: null,
            username: email,
            email,
            role: 'admin',
          })
          .returning({ id: users.id });
    await tx.insert(passwordAccounts).values({ userId: user.id, email, passwordHash });
  });
}

export const authRouter = Router();

authRouter.get('/discord', (req, res) => {
  const config = getDiscordConfig();
  if (!config) {
    res.status(501).json({
      error:
        'Discord OAuth არ არის კონფიგურირებული — საჭიროა DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET და DISCORD_REDIRECT_URI.',
    });
    return;
  }
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('discord_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state,
  });
  res.redirect(`${DISCORD_AUTHORIZE_URL}?${params.toString()}`);
});

authRouter.get(
  '/discord/callback',
  asyncHandler(async (req, res) => {
    const config = getDiscordConfig();
    if (!config) {
      res.status(501).json({ error: 'Discord OAuth არ არის კონფიგურირებული' });
      return;
    }
    const { code, state } = req.query as { code?: string; state?: string };
    const expectedState = req.cookies?.discord_oauth_state as string | undefined;
    if (!code || !state || !expectedState || state !== expectedState) {
      res.status(400).json({ error: 'არასწორი OAuth state ან code' });
      return;
    }
    res.clearCookie('discord_oauth_state');

    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
      }),
    });
    if (!tokenResponse.ok) {
      res.status(502).json({ error: 'Discord token-ის გაცვლა ვერ მოხერხდა' });
      return;
    }
    const tokenJson = (await tokenResponse.json()) as { access_token: string };

    const userResponse = await fetch(DISCORD_USER_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!userResponse.ok) {
      res.status(502).json({ error: 'Discord პროფილის წამოღება ვერ მოხერხდა' });
      return;
    }
    const profile = (await userResponse.json()) as {
      id: string;
      username: string;
      global_name: string | null;
      email: string | null;
      avatar: string | null;
    };

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null;

    const [user] = await db
      .insert(users)
      .values({
        discordId: profile.id,
        username: profile.username,
        globalName: profile.global_name,
        email: profile.email,
        avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.discordId,
        set: {
          username: profile.username,
          globalName: profile.global_name,
          email: profile.email,
          avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    const session = await createSession(user.id);
    setSessionCookie(res, session.token);
    res.redirect('/login');
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = objectBody(req.body);
    if (
      !body ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string'
    ) {
      res.status(400).json({ error: 'შეიყვანეთ ელფოსტა და პაროლი' });
      return;
    }

    const email = normalizeEmail(body.email);
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let attempts = loginAttempts.get(key);
    if (attempts && attempts.lockedUntil > now) {
      res.status(429).json({ error: 'ძალიან ბევრი მცდელობაა. სცადეთ მოგვიანებით.' });
      return;
    }
    if (
      attempts &&
      (now - attempts.windowStartedAt >= LOGIN_LOCKOUT_MS ||
        (attempts.lockedUntil > 0 && attempts.lockedUntil <= now))
    ) {
      loginAttempts.delete(key);
      attempts = undefined;
    }
    if (!isValidEmail(email)) {
      res.status(401).json({ error: 'ელფოსტა ან პაროლი არასწორია' });
      return;
    }
    if (body.password.length > 256) {
      res.status(401).json({ error: 'ელფოსტა ან პაროლი არასწორია' });
      return;
    }

    const [account] = await db
      .select({ user: users, passwordHash: passwordAccounts.passwordHash })
      .from(passwordAccounts)
      .innerJoin(users, eq(passwordAccounts.userId, users.id))
      .where(eq(passwordAccounts.email, email))
      .limit(1);

    const passwordMatches = await verifyPassword(
      body.password,
      account?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!account || !passwordMatches) {
      const activeAttempts = attempts ? attempts.count : 0;
      const count = activeAttempts + 1;
      loginAttempts.set(key, {
        count,
        windowStartedAt: attempts?.windowStartedAt ?? now,
        lockedUntil: count >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_LOCKOUT_MS : 0,
      });
      res.status(401).json({ error: 'ელფოსტა ან პაროლი არასწორია' });
      return;
    }

    loginAttempts.delete(key);
    const session = await createSession(account.user.id);
    setSessionCookie(res, session.token);
    res.json(userResponse(account.user));
  }),
);

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'ავტორიზაცია საჭიროა' });
      return;
    }
    res.json(userResponse(user));
  }),
);

authRouter.get(
  '/admin/accounts',
  adminGuard,
  asyncHandler(async (_req, res) => {
    const accounts = await db
      .select({
        id: users.id,
        email: passwordAccounts.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(passwordAccounts)
      .innerJoin(users, eq(passwordAccounts.userId, users.id))
      .orderBy(users.createdAt);
    res.json(accounts);
  }),
);

authRouter.post(
  '/admin/accounts',
  adminGuard,
  asyncHandler(async (req, res) => {
    const body = objectBody(req.body);
    if (
      !body ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      (body.role !== 'admin' && body.role !== 'member')
    ) {
      res.status(400).json({ error: 'შეამოწმეთ ანგარიშის მონაცემები' });
      return;
    }

    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'შეიყვანეთ სწორი ელფოსტა' });
      return;
    }
    if (body.password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({
        error: `პაროლი მინიმუმ ${MIN_PASSWORD_LENGTH} სიმბოლოს უნდა შეიცავდეს`,
      });
      return;
    }
    if (body.password.length > 256) {
      res.status(400).json({ error: 'პაროლი ზედმეტად გრძელია' });
      return;
    }

    const [existingAccount] = await db
      .select({ email: passwordAccounts.email })
      .from(passwordAccounts)
      .where(eq(passwordAccounts.email, email))
      .limit(1);
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    if (existingAccount || existingUser) {
      res.status(409).json({ error: 'ამ ელფოსტით ანგარიში უკვე არსებობს' });
      return;
    }

    const passwordHash = await hashPassword(body.password);
    const newUser: typeof users.$inferInsert = {
      discordId: null,
      username: email,
      email,
      role: body.role,
    };
    const newAccount = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values(newUser)
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        });
      await tx.insert(passwordAccounts).values({
        userId: user.id,
        email,
        passwordHash,
      });
      return user;
    });

    res.status(201).json(newAccount);
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  }),
);
