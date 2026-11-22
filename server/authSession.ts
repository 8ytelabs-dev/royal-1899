import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from './db';
import { sessions, users } from './schema';

export const SESSION_COOKIE = 'royal_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

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

export async function createSession(userId: string) {
  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();
  return session;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}
