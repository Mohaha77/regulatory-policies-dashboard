import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.token && typeof req.query.token === 'string') {
    // Support token via query param for SSE (EventSource can't set headers)
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    const user = db.select().from(users).where(eq(users.id, payload.id)).get();
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = { id: user.id, username: user.username, role: user.role as AuthUser['role'] };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
