import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['consultation', 'review', 'studies', 'other'] }).notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  status: text('status', { enum: ['new', 'in_progress', 'under_review', 'approved', 'completed'] }).notNull().default('new'),
  dueDate: text('due_date'),
  createdById: integer('created_by_id').notNull().references(() => users.id),
  reviewerId: integer('reviewer_id').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});
