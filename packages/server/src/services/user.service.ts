import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error-handler';
import { CreateUserSchemaInput, UpdateUserSchemaInput, UserPreferencesSchemaInput } from '@rp/shared';

export class UserService {
  static getAll() {
    const allUsers = db.select({
      id: users.id,
      username: users.username,
      displayNameEn: users.displayNameEn,
      displayNameAr: users.displayNameAr,
      role: users.role,
      isActive: users.isActive,
      isAbsent: users.isAbsent,
      preferredLang: users.preferredLang,
      preferredTheme: users.preferredTheme,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).all();
    return allUsers;
  }

  static getById(id: number) {
    const user = db.select({
      id: users.id,
      username: users.username,
      displayNameEn: users.displayNameEn,
      displayNameAr: users.displayNameAr,
      role: users.role,
      isActive: users.isActive,
      isAbsent: users.isAbsent,
      preferredLang: users.preferredLang,
      preferredTheme: users.preferredTheme,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async create(data: CreateUserSchemaInput) {
    const existing = db.select().from(users).where(eq(users.username, data.username)).get();
    if (existing) {
      throw new AppError('Username already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const result = db.insert(users).values({
      username: data.username,
      passwordHash,
      displayNameEn: data.displayNameEn,
      displayNameAr: data.displayNameAr,
      role: data.role,
    }).run();

    return UserService.getById(Number(result.lastInsertRowid));
  }

  static update(id: number, data: UpdateUserSchemaInput) {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    db.update(users).set({
      ...data,
      updatedAt: new Date().toISOString(),
    }).where(eq(users.id, id)).run();

    return UserService.getById(id);
  }

  static delete(id: number) {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.role === 'admin') {
      const adminCount = db.select().from(users).where(eq(users.role, 'admin')).all().length;
      if (adminCount <= 1) {
        throw new AppError('Cannot delete the last admin user', 400);
      }
    }
    db.update(users).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(users.id, id)).run();
    return { message: 'User deactivated successfully' };
  }

  static updatePreferences(id: number, prefs: UserPreferencesSchemaInput) {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    db.update(users).set({
      ...prefs,
      updatedAt: new Date().toISOString(),
    }).where(eq(users.id, id)).run();
    return UserService.getById(id);
  }

  static setAbsence(id: number, isAbsent: boolean) {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    db.update(users).set({ isAbsent, updatedAt: new Date().toISOString() }).where(eq(users.id, id)).run();
    return UserService.getById(id);
  }
}
