import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { subjects } from './subjects';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['assignment', 'status_change', 'review_request', 'comment'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
