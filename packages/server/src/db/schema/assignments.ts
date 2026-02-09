import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { subjects } from './subjects';
import { users } from './users';

export const subjectAssignments = sqliteTable('subject_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  assignedAt: text('assigned_at').notNull().default(sql`(datetime('now'))`),
  assignedById: integer('assigned_by_id').references(() => users.id),
});
