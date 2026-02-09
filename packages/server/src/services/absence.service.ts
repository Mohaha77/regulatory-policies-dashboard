import { db } from '../config/database';
import { absenceCoverage, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler';
import { AbsenceCoverageSchemaInput } from '@rp/shared';

export class AbsenceService {
  static getAll() {
    const all = db.select().from(absenceCoverage).all();
    return all.map(a => {
      const absentUser = db.select({
        id: users.id,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, a.absentUserId)).get();
      const coveringUser = db.select({
        id: users.id,
        displayNameEn: users.displayNameEn,
        displayNameAr: users.displayNameAr,
      }).from(users).where(eq(users.id, a.coveringUserId)).get();
      return { ...a, absentUser, coveringUser };
    });
  }

  static create(data: AbsenceCoverageSchemaInput) {
    if (data.absentUserId === data.coveringUserId) {
      throw new AppError('A user cannot cover for themselves', 400);
    }

    const result = db.insert(absenceCoverage).values({
      absentUserId: data.absentUserId,
      coveringUserId: data.coveringUserId,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
    }).run();

    // Mark user as absent
    db.update(users).set({ isAbsent: true, updatedAt: new Date().toISOString() })
      .where(eq(users.id, data.absentUserId)).run();

    return db.select().from(absenceCoverage).where(eq(absenceCoverage.id, Number(result.lastInsertRowid))).get();
  }

  static update(id: number, data: Partial<AbsenceCoverageSchemaInput & { isActive: boolean }>) {
    const existing = db.select().from(absenceCoverage).where(eq(absenceCoverage.id, id)).get();
    if (!existing) throw new AppError('Absence coverage not found', 404);

    db.update(absenceCoverage).set(data).where(eq(absenceCoverage.id, id)).run();

    if (data.isActive === false) {
      // Check if user has any other active coverage
      const otherActive = db.select().from(absenceCoverage)
        .where(and(eq(absenceCoverage.absentUserId, existing.absentUserId), eq(absenceCoverage.isActive, true)))
        .all();
      if (otherActive.length === 0) {
        db.update(users).set({ isAbsent: false, updatedAt: new Date().toISOString() })
          .where(eq(users.id, existing.absentUserId)).run();
      }
    }

    return db.select().from(absenceCoverage).where(eq(absenceCoverage.id, id)).get();
  }

  static delete(id: number) {
    const existing = db.select().from(absenceCoverage).where(eq(absenceCoverage.id, id)).get();
    if (!existing) throw new AppError('Absence coverage not found', 404);

    db.delete(absenceCoverage).where(eq(absenceCoverage.id, id)).run();

    const otherActive = db.select().from(absenceCoverage)
      .where(and(eq(absenceCoverage.absentUserId, existing.absentUserId), eq(absenceCoverage.isActive, true)))
      .all();
    if (otherActive.length === 0) {
      db.update(users).set({ isAbsent: false, updatedAt: new Date().toISOString() })
        .where(eq(users.id, existing.absentUserId)).run();
    }

    return { message: 'Absence coverage deleted' };
  }
}
