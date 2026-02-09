import { db } from '../config/database';
import { notifications } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendSSEToUser } from '../utils/sse';
import { NotificationType } from '@rp/shared';

export class NotificationService {
  static getByUserId(userId: number) {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)
      .all();
  }

  static markAsRead(id: number, userId: number) {
    db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .run();
    return { message: 'Notification marked as read' };
  }

  static markAllAsRead(userId: number) {
    db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .run();
    return { message: 'All notifications marked as read' };
  }

  static create(userId: number, type: NotificationType, title: string, message: string, subjectId?: number) {
    const result = db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      subjectId: subjectId || null,
    }).run();

    const notification = db.select().from(notifications).where(eq(notifications.id, Number(result.lastInsertRowid))).get();

    // Push via SSE
    if (notification) {
      sendSSEToUser(userId, 'notification', notification);
    }

    return notification;
  }

  static notifyAssignment(userId: number, subjectId: number, subjectTitle: string) {
    return NotificationService.create(
      userId,
      NotificationType.ASSIGNMENT,
      'New Assignment',
      `You have been assigned to: ${subjectTitle}`,
      subjectId,
    );
  }

  static notifyStatusChange(userId: number, subjectId: number, subjectTitle: string, newStatus: string) {
    return NotificationService.create(
      userId,
      NotificationType.STATUS_CHANGE,
      'Status Changed',
      `Status of "${subjectTitle}" changed to ${newStatus}`,
      subjectId,
    );
  }

  static notifyReviewRequest(userId: number, subjectId: number, subjectTitle: string) {
    return NotificationService.create(
      userId,
      NotificationType.REVIEW_REQUEST,
      'Review Requested',
      `You have been asked to review: ${subjectTitle}`,
      subjectId,
    );
  }

  static notifyComment(userId: number, subjectId: number, subjectTitle: string, commenterName: string) {
    return NotificationService.create(
      userId,
      NotificationType.COMMENT,
      'New Comment',
      `${commenterName} commented on: ${subjectTitle}`,
      subjectId,
    );
  }
}
