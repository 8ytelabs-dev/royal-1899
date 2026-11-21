import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4-ში async ჰენდლერების შეცდომები ავტომატურად არ გადაეცემა
 * error middleware-ს — ეს wrapper ამას აგვარებს.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * არასავალდებულო დაცვა ადმინის mutation ენდპოინტებზე.
 * თუ ADMIN_API_TOKEN გარემოს ცვლადი დაყენებულია, მოთხოვნას უნდა ჰქონდეს
 * შესაბამისი `x-admin-token` ჰედერი. თუ ცვლადი არ არის — დაშვებულია (dev რეჟიმი).
 */
export const adminGuard: RequestHandler = (req, res, next) => {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    next();
    return;
  }
  if (req.headers['x-admin-token'] === expected) {
    next();
    return;
  }
  res.status(401).json({ error: 'არასწორი ან აკლია ადმინის ტოკენი' });
};
