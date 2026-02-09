import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from '../middleware/error-handler';

interface TokenPayload {
  id: number;
  username: string;
  role: string;
}

export class AuthService {
  static async login(username: string, password: string) {
    const user = db.select().from(users).where(eq(users.username, username)).get();
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: TokenPayload = { id: user.id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessExpiry as string });
    const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry as string });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        displayNameEn: user.displayNameEn,
        displayNameAr: user.displayNameAr,
        role: user.role,
        preferredLang: user.preferredLang,
        preferredTheme: user.preferredTheme,
      },
    };
  }

  static refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
      const user = db.select().from(users).where(eq(users.id, payload.id)).get();
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      const newPayload: TokenPayload = { id: user.id, username: user.username, role: user.role };
      const accessToken = jwt.sign(newPayload, env.jwtSecret, { expiresIn: env.jwtAccessExpiry as string });
      const newRefreshToken = jwt.sign(newPayload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry as string });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newHash = await hashPassword(newPassword);
    db.update(users).set({ passwordHash: newHash, updatedAt: new Date().toISOString() }).where(eq(users.id, userId)).run();

    return { message: 'Password changed successfully' };
  }

  static getMe(userId: number) {
    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
