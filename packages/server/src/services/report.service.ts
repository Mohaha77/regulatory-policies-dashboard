import { db } from '../config/database';
import { subjects, subjectAssignments, users, activityLog } from '../db/schema';
import { eq, sql, desc, and, lt } from 'drizzle-orm';

export class ReportService {
  static getOverview() {
    const totalSubjects = db.select({ count: sql<number>`count(*)` }).from(subjects).get()?.count || 0;
    const byStatus = db.select({
      status: subjects.status,
      count: sql<number>`count(*)`,
    }).from(subjects).groupBy(subjects.status).all();
    const byType = db.select({
      type: subjects.type,
      count: sql<number>`count(*)`,
    }).from(subjects).groupBy(subjects.type).all();
    const byPriority = db.select({
      priority: subjects.priority,
      count: sql<number>`count(*)`,
    }).from(subjects).groupBy(subjects.priority).all();

    const now = new Date().toISOString();
    const overdue = db.select({ count: sql<number>`count(*)` }).from(subjects)
      .where(and(lt(subjects.dueDate, now), sql`${subjects.status} NOT IN ('completed', 'approved')`))
      .get()?.count || 0;

    return { totalSubjects, byStatus, byType, byPriority, overdue };
  }

  static getWorkload() {
    const userWorkloads = db.select({
      userId: subjectAssignments.userId,
      count: sql<number>`count(*)`,
    }).from(subjectAssignments)
      .innerJoin(subjects, eq(subjectAssignments.subjectId, subjects.id))
      .where(sql`${subjects.status} NOT IN ('completed')`)
      .groupBy(subjectAssignments.userId)
      .all();

    return userWorkloads.map(w => {
      const user = db.select({
        id: users.id,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, w.userId)).get();
      return { ...w, user };
    });
  }

  static getPerformance() {
    const completed = db.select({
      userId: subjectAssignments.userId,
      count: sql<number>`count(*)`,
    }).from(subjectAssignments)
      .innerJoin(subjects, eq(subjectAssignments.subjectId, subjects.id))
      .where(eq(subjects.status, 'completed'))
      .groupBy(subjectAssignments.userId)
      .all();

    return completed.map(c => {
      const user = db.select({
        id: users.id,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, c.userId)).get();
      return { ...c, user };
    });
  }

  static getOverdue() {
    const now = new Date().toISOString();
    const overdueSubjects = db.select().from(subjects)
      .where(and(lt(subjects.dueDate, now), sql`${subjects.status} NOT IN ('completed', 'approved')`))
      .orderBy(subjects.dueDate)
      .all();

    return overdueSubjects;
  }

  static getRecentActivity(limit = 20) {
    const recent = db.select().from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .all();

    return recent.map(a => {
      const user = db.select({
        id: users.id,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, a.userId)).get();
      return { ...a, user };
    });
  }
}
