import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { getSessionUser } from './authSession';

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

export const adminGuard: RequestHandler = (req, res, next) => {
  void getSessionUser(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'ადმინად შესვლა საჭიროა' });
        return;
      }
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'ადმინისტრატორის უფლება საჭიროა' });
        return;
      }
      next();
    })
    .catch(next);
};
