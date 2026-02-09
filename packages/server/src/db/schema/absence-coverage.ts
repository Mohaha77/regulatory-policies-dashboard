import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const absenceCoverage = sqliteTable('absence_coverage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  absentUserId: integer('absent_user_id').notNull().references(() => users.id),
  coveringUserId: integer('covering_user_id').notNull().references(() => users.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
