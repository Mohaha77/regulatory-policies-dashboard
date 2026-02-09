import { db } from '../config/database';
import { attachments, users, subjects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler';
import { deleteFile } from '../utils/file-utils';

export class AttachmentService {
  static getBySubjectId(subjectId: number) {
    const all = db.select().from(attachments)
      .where(eq(attachments.subjectId, subjectId))
      .all();

    return all.map(a => {
      const uploadedBy = db.select({
        id: users.id,
        username: users.username,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, a.uploadedById)).get();
      return { ...a, uploadedBy };
    });
  }

  static create(subjectId: number, uploadedById: number, file: { originalname: string; filename: string; mimetype: string; size: number }) {
    const subject = db.select().from(subjects).where(eq(subjects.id, subjectId)).get();
    if (!subject) throw new AppError('Subject not found', 404);

    const result = db.insert(attachments).values({
      subjectId,
      uploadedById,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    }).run();

    return db.select().from(attachments).where(eq(attachments.id, Number(result.lastInsertRowid))).get();
  }

  static getById(id: number) {
    const attachment = db.select().from(attachments).where(eq(attachments.id, id)).get();
    if (!attachment) throw new AppError('Attachment not found', 404);
    return attachment;
  }

  static delete(id: number, userId: number, userRole: string) {
    const attachment = db.select().from(attachments).where(eq(attachments.id, id)).get();
    if (!attachment) throw new AppError('Attachment not found', 404);
    if (attachment.uploadedById !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this attachment', 403);
    }
    deleteFile(attachment.storedName);
    db.delete(attachments).where(eq(attachments.id, id)).run();
    return { message: 'Attachment deleted' };
  }
}
