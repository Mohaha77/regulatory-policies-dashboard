import { db } from '../config/database';
import { comments, users, subjects, subjectAssignments } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler';
import { NotificationService } from './notification.service';

export class CommentService {
  static getBySubjectId(subjectId: number) {
    const allComments = db.select().from(comments)
      .where(eq(comments.subjectId, subjectId))
      .orderBy(desc(comments.createdAt))
      .all();

    return allComments.map(c => {
      const author = db.select({
        id: users.id,
        username: users.username,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, c.authorId)).get();
      return { ...c, author };
    });
  }

  static create(subjectId: number, authorId: number, content: string) {
    const subject = db.select().from(subjects).where(eq(subjects.id, subjectId)).get();
    if (!subject) throw new AppError('Subject not found', 404);

    const result = db.insert(comments).values({
      subjectId,
      authorId,
      content,
    }).run();

    const comment = db.select().from(comments).where(eq(comments.id, Number(result.lastInsertRowid))).get();
    const author = db.select({ displayNameEn: users.displayNameEn }).from(users).where(eq(users.id, authorId)).get();

    // Notify assignees and creator (except the comment author)
    const assignees = db.select({ userId: subjectAssignments.userId })
      .from(subjectAssignments)
      .where(eq(subjectAssignments.subjectId, subjectId))
      .all();

    const notifyUserIds = new Set([subject.createdById, ...assignees.map(a => a.userId)]);
    if (subject.reviewerId) notifyUserIds.add(subject.reviewerId);
    notifyUserIds.delete(authorId);

    for (const uid of notifyUserIds) {
      NotificationService.notifyComment(uid, subjectId, subject.title, author?.displayNameEn || 'Someone');
    }

    return CommentService.getBySubjectId(subjectId).find(c => c.id === Number(result.lastInsertRowid));
  }

  static update(id: number, content: string, userId: number) {
    const comment = db.select().from(comments).where(eq(comments.id, id)).get();
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.authorId !== userId) throw new AppError('Not authorized to edit this comment', 403);

    db.update(comments).set({ content, updatedAt: new Date().toISOString() }).where(eq(comments.id, id)).run();
    return db.select().from(comments).where(eq(comments.id, id)).get();
  }

  static delete(id: number, userId: number, userRole: string) {
    const comment = db.select().from(comments).where(eq(comments.id, id)).get();
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.authorId !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this comment', 403);
    }
    db.delete(comments).where(eq(comments.id, id)).run();
    return { message: 'Comment deleted' };
  }
}
