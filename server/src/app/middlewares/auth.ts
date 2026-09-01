import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  console.log("--- AUTH DEBUG ---");
  console.log("Headers:", req.headers.authorization);
  console.log("Auth Object:", auth);
  console.log("------------------");

  if (!auth?.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
  next();
};
