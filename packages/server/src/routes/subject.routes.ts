import { Router } from 'express';
import { SubjectService } from '../services/subject.service';
import { NotificationService } from '../services/notification.service';
import { ActivityService } from '../services/activity.service';
import { authMiddleware } from '../middleware/auth';
import { requireManagerOrAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createSubjectSchema, updateSubjectSchema, statusChangeSchema, assignmentSchema, reviewerSchema } from '@rp/shared';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const result = SubjectService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/my-work', authMiddleware, (req, res, next) => {
  try {
    const subjects = SubjectService.getMyWork(req.user!.id);
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.get('/my-reviews', authMiddleware, (req, res, next) => {
  try {
    const subjects = SubjectService.getMyReviews(req.user!.id);
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const subject = SubjectService.getById(Number(req.params.id));
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, validate(createSubjectSchema), (req, res, next) => {
  try {
    const subject = SubjectService.create(req.body, req.user!.id);
    ActivityService.log(req.user!.id, 'subject_created', subject.id, { title: subject.title });

    // Notify assignees
    if (req.body.assigneeIds) {
      for (const userId of req.body.assigneeIds) {
        if (userId !== req.user!.id) {
          NotificationService.notifyAssignment(userId, subject.id, subject.title);
        }
      }
    }
    // Notify reviewer
    if (req.body.reviewerId && req.body.reviewerId !== req.user!.id) {
      NotificationService.notifyReviewRequest(req.body.reviewerId, subject.id, subject.title);
    }

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, validate(updateSubjectSchema), (req, res, next) => {
  try {
    const subject = SubjectService.update(Number(req.params.id), req.body);
    ActivityService.log(req.user!.id, 'subject_updated', subject.id, { changes: req.body });
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireManagerOrAdmin, (req, res, next) => {
  try {
    ActivityService.log(req.user!.id, 'subject_deleted', Number(req.params.id));
    const result = SubjectService.delete(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authMiddleware, validate(statusChangeSchema), (req, res, next) => {
  try {
    const subject = SubjectService.changeStatus(Number(req.params.id), req.body.status, req.user!.id, req.user!.role);
    ActivityService.log(req.user!.id, 'status_changed', subject.id, { newStatus: req.body.status });

    // Notify assignees and reviewer about status change
    const notifyIds = new Set<number>();
    if (subject.assignees) subject.assignees.forEach((a: any) => notifyIds.add(a.id));
    if (subject.reviewer) notifyIds.add(subject.reviewer.id);
    if (subject.createdBy) notifyIds.add(subject.createdBy.id);
    notifyIds.delete(req.user!.id);

    for (const uid of notifyIds) {
      NotificationService.notifyStatusChange(uid, subject.id, subject.title, req.body.status);
    }

    // If moved to under_review, notify reviewer
    if (req.body.status === 'under_review' && subject.reviewerId && subject.reviewerId !== req.user!.id) {
      NotificationService.notifyReviewRequest(subject.reviewerId, subject.id, subject.title);
    }

    res.json(subject);
  } catch (error) {
    next(error);
  }
});

// Assignments
router.post('/:id/assignments', authMiddleware, requireManagerOrAdmin, validate(assignmentSchema), (req, res, next) => {
  try {
    const subject = SubjectService.addAssignment(Number(req.params.id), req.body.userId, req.user!.id);
    ActivityService.log(req.user!.id, 'user_assigned', subject.id, { assignedUserId: req.body.userId });
    if (req.body.userId !== req.user!.id) {
      NotificationService.notifyAssignment(req.body.userId, subject.id, subject.title);
    }
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/assignments', authMiddleware, requireManagerOrAdmin, validate(assignmentSchema), (req, res, next) => {
  try {
    const subject = SubjectService.removeAssignment(Number(req.params.id), req.body.userId);
    ActivityService.log(req.user!.id, 'user_unassigned', subject.id, { unassignedUserId: req.body.userId });
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/reviewer', authMiddleware, requireManagerOrAdmin, validate(reviewerSchema), (req, res, next) => {
  try {
    const subject = SubjectService.setReviewer(Number(req.params.id), req.body.reviewerId);
    ActivityService.log(req.user!.id, 'reviewer_set', subject.id, { reviewerId: req.body.reviewerId });
    if (req.body.reviewerId && req.body.reviewerId !== req.user!.id) {
      NotificationService.notifyReviewRequest(req.body.reviewerId, subject.id, subject.title);
    }
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

export default router;
