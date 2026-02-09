import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayNameEn: text('display_name_en').notNull(),
  displayNameAr: text('display_name_ar').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'user'] }).notNull().default('user'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isAbsent: integer('is_absent', { mode: 'boolean' }).notNull().default(false),
  preferredLang: text('preferred_lang', { enum: ['en', 'ar'] }).notNull().default('en'),
  preferredTheme: text('preferred_theme', { enum: ['light', 'dark'] }).notNull().default('light'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});
