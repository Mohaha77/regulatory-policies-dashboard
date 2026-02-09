import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { subjects } from './subjects';

export const activityLog = sqliteTable('activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  details: text('details', { mode: 'json' }),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
