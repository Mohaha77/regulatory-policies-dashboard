import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@rp/shared';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(UserRole.ADMIN)(req, res, next);
}

export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(UserRole.ADMIN, UserRole.MANAGER)(req, res, next);
}
