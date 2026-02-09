import { z } from 'zod';
import { UserRole } from '../types/enums';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
  password: z.string().min(6).max(100),
  displayNameEn: z.string().min(1).max(100),
  displayNameAr: z.string().min(1).max(100),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z.object({
  displayNameEn: z.string().min(1).max(100).optional(),
  displayNameAr: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const userPreferencesSchema = z.object({
  preferredLang: z.enum(['en', 'ar']).optional(),
  preferredTheme: z.enum(['light', 'dark']).optional(),
});

export type CreateUserSchemaInput = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaInput = z.infer<typeof updateUserSchema>;
export type UserPreferencesSchemaInput = z.infer<typeof userPreferencesSchema>;
