import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { Router, type Request } from 'express';
import { db } from '../db';
import { asyncHandler } from '../http';
import { sessions, users } from '../schema';

/**
 * რეგისტრაცია / ავტორიზაცია Discord OAuth2-ით.
 *
 * საჭირო გარემოს ცვლადები:
 *   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI
 *
 * ენდპოინტები:
 *   GET  /api/auth/discord           → გადამისამართება Discord-ის ავტორიზაციაზე
 *   GET  /api/auth/discord/callback  → code-ის გაცვლა, მომხმარებლის რეგისტრაცია, სესიის cookie
 *   GET  /api/auth/me                → მიმდინარე სესიის მომხმარებელი
 *   POST /api/auth/logout            → სესიის წაშლა
 */

const SESSION_COOKIE = 'royal_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 დღე

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

export async function getSessionUser(req: Request) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) {
    return null;
  }
  const rows = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  const row = rows[0];
  if (!row || row.session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return row.user;
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

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      })
      .returning();

    res.cookie(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS,
    });
    res.redirect('/cabinet');
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
    res.json({
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      globalName: user.globalName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  }),
);
