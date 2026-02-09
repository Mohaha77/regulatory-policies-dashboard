import { db } from '../config/database';
import { subjects, subjectAssignments, users } from '../db/schema';
import { eq, and, like, desc, asc, sql, inArray, gte, lte, or } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler';
import { VALID_STATUS_TRANSITIONS, SubjectStatus, CreateSubjectSchemaInput, UpdateSubjectSchemaInput } from '@rp/shared';
import { absenceCoverage } from '../db/schema';

export class SubjectService {
  static getAll(filters: Record<string, any> = {}) {
    let query = db.select().from(subjects);
    const conditions: any[] = [];

    if (filters.type) conditions.push(eq(subjects.type, filters.type));
    if (filters.status) conditions.push(eq(subjects.status, filters.status));
    if (filters.priority) conditions.push(eq(subjects.priority, filters.priority));
    if (filters.createdById) conditions.push(eq(subjects.createdById, Number(filters.createdById)));
    if (filters.search) conditions.push(like(subjects.title, `%${filters.search}%`));
    if (filters.dueDateFrom) conditions.push(gte(subjects.dueDate, filters.dueDateFrom));
    if (filters.dueDateTo) conditions.push(lte(subjects.dueDate, filters.dueDateTo));

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? asc : desc;

    const sortColumn = sortBy === 'title' ? subjects.title
      : sortBy === 'dueDate' ? subjects.dueDate
      : sortBy === 'priority' ? subjects.priority
      : sortBy === 'status' ? subjects.status
      : sortBy === 'type' ? subjects.type
      : subjects.createdAt;

    let allSubjects: any[];
    let total: number;

    if (conditions.length > 0) {
      const where = and(...conditions);
      allSubjects = db.select().from(subjects).where(where!).orderBy(sortOrder(sortColumn)).limit(limit).offset(offset).all();
      const countResult = db.select({ count: sql<number>`count(*)` }).from(subjects).where(where!).get();
      total = countResult?.count || 0;
    } else {
      allSubjects = db.select().from(subjects).orderBy(sortOrder(sortColumn)).limit(limit).offset(offset).all();
      const countResult = db.select({ count: sql<number>`count(*)` }).from(subjects).get();
      total = countResult?.count || 0;
    }

    // Enrich with assignees and creator
    const enriched = allSubjects.map(s => SubjectService.enrichSubject(s));

    return {
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static getById(id: number) {
    const subject = db.select().from(subjects).where(eq(subjects.id, id)).get();
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }
    return SubjectService.enrichSubject(subject);
  }

  static enrichSubject(subject: any) {
    const creator = db.select({
      id: users.id,
      username: users.username,
      displayNameEn: users.displayNameEn,
      displayNameAr: users.displayNameAr,
    }).from(users).where(eq(users.id, subject.createdById)).get();

    let reviewer = null;
    if (subject.reviewerId) {
      reviewer = db.select({
        id: users.id,
        username: users.username,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, subject.reviewerId)).get();
    }

    const assignments = db.select({
      userId: subjectAssignments.userId,
    }).from(subjectAssignments).where(eq(subjectAssignments.subjectId, subject.id)).all();

    const assignees = assignments.map(a => {
      return db.select({
        id: users.id,
        username: users.username,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, a.userId)).get();
    }).filter(Boolean);

    return { ...subject, createdBy: creator, reviewer, assignees };
  }

  static create(data: CreateSubjectSchemaInput, createdById: number) {
    const result = db.insert(subjects).values({
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      dueDate: data.dueDate || null,
      createdById,
      reviewerId: data.reviewerId || null,
    }).run();

    const subjectId = Number(result.lastInsertRowid);

    if (data.assigneeIds && data.assigneeIds.length > 0) {
      for (const userId of data.assigneeIds) {
        db.insert(subjectAssignments).values({
          subjectId,
          userId,
          assignedById: createdById,
        }).run();
      }
    }

    return SubjectService.getById(subjectId);
  }

  static update(id: number, data: UpdateSubjectSchemaInput) {
    const subject = db.select().from(subjects).where(eq(subjects.id, id)).get();
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    db.update(subjects).set({
      ...data,
      updatedAt: new Date().toISOString(),
    }).where(eq(subjects.id, id)).run();

    return SubjectService.getById(id);
  }

  static delete(id: number) {
    const subject = db.select().from(subjects).where(eq(subjects.id, id)).get();
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }
    db.delete(subjects).where(eq(subjects.id, id)).run();
    return { message: 'Subject deleted successfully' };
  }

  static changeStatus(id: number, newStatus: SubjectStatus, userId: number, userRole: string) {
    const subject = db.select().from(subjects).where(eq(subjects.id, id)).get();
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const currentStatus = subject.status as SubjectStatus;
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      throw new AppError(`Cannot transition from ${currentStatus} to ${newStatus}`, 400);
    }

    // Role-based rules
    if (newStatus === SubjectStatus.APPROVED && userRole === 'user') {
      throw new AppError('Only managers and admins can approve subjects', 403);
    }

    db.update(subjects).set({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }).where(eq(subjects.id, id)).run();

    return SubjectService.getById(id);
  }

  static getMyWork(userId: number) {
    const assignedIds = db.select({ subjectId: subjectAssignments.subjectId })
      .from(subjectAssignments)
      .where(eq(subjectAssignments.userId, userId))
      .all()
      .map(a => a.subjectId);

    // Also include subjects from absent users the current user is covering
    const coverages = db.select()
      .from(absenceCoverage)
      .where(and(eq(absenceCoverage.coveringUserId, userId), eq(absenceCoverage.isActive, true)))
      .all();

    const coveredUserIds = coverages.map(c => c.absentUserId);

    let coveredSubjectIds: number[] = [];
    if (coveredUserIds.length > 0) {
      coveredSubjectIds = db.select({ subjectId: subjectAssignments.subjectId })
        .from(subjectAssignments)
        .where(inArray(subjectAssignments.userId, coveredUserIds))
        .all()
        .map(a => a.subjectId);
    }

    const allSubjectIds = [...new Set([...assignedIds, ...coveredSubjectIds])];
    if (allSubjectIds.length === 0) return [];

    const mySubjects = db.select().from(subjects)
      .where(inArray(subjects.id, allSubjectIds))
      .orderBy(desc(subjects.updatedAt))
      .all();

    return mySubjects.map(s => SubjectService.enrichSubject(s));
  }

  static getMyReviews(userId: number) {
    const reviewSubjects = db.select().from(subjects)
      .where(eq(subjects.reviewerId, userId))
      .orderBy(desc(subjects.updatedAt))
      .all();

    return reviewSubjects.map(s => SubjectService.enrichSubject(s));
  }

  static addAssignment(subjectId: number, userId: number, assignedById: number) {
    const subject = db.select().from(subjects).where(eq(subjects.id, subjectId)).get();
    if (!subject) throw new AppError('Subject not found', 404);

    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) throw new AppError('User not found', 404);

    const existing = db.select().from(subjectAssignments)
      .where(and(eq(subjectAssignments.subjectId, subjectId), eq(subjectAssignments.userId, userId)))
      .get();
    if (existing) throw new AppError('User already assigned', 409);

    db.insert(subjectAssignments).values({ subjectId, userId, assignedById }).run();
    return SubjectService.getById(subjectId);
  }

  static removeAssignment(subjectId: number, userId: number) {
    db.delete(subjectAssignments)
      .where(and(eq(subjectAssignments.subjectId, subjectId), eq(subjectAssignments.userId, userId)))
      .run();
    return SubjectService.getById(subjectId);
  }

  static setReviewer(subjectId: number, reviewerId: number | null) {
    const subject = db.select().from(subjects).where(eq(subjects.id, subjectId)).get();
    if (!subject) throw new AppError('Subject not found', 404);

    if (reviewerId) {
      const reviewer = db.select().from(users).where(eq(users.id, reviewerId)).get();
      if (!reviewer) throw new AppError('Reviewer not found', 404);
    }

    db.update(subjects).set({ reviewerId, updatedAt: new Date().toISOString() }).where(eq(subjects.id, subjectId)).run();
    return SubjectService.getById(subjectId);
  }
}
