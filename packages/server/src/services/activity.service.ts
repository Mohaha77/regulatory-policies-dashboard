import { db } from '../config/database';
import { activityLog } from '../db/schema';

export class ActivityService {
  static log(userId: number, action: string, subjectId?: number, details?: Record<string, unknown>) {
    db.insert(activityLog).values({
      userId,
      subjectId: subjectId || null,
      action,
      details: details ? JSON.stringify(details) : null,
    }).run();
  }
}
