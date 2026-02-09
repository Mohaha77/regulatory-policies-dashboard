import { Router } from 'express';
import { CommentService } from '../services/comment.service';
import { ActivityService } from '../services/activity.service';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { commentSchema } from '@rp/shared';

const router = Router();

router.get('/subjects/:id/comments', authMiddleware, (req, res, next) => {
  try {
    const comments = CommentService.getBySubjectId(Number(req.params.id));
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.post('/subjects/:id/comments', authMiddleware, validate(commentSchema), (req, res, next) => {
  try {
    const comment = CommentService.create(Number(req.params.id), req.user!.id, req.body.content);
    ActivityService.log(req.user!.id, 'comment_added', Number(req.params.id));
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.put('/comments/:id', authMiddleware, validate(commentSchema), (req, res, next) => {
  try {
    const comment = CommentService.update(Number(req.params.id), req.body.content, req.user!.id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

router.delete('/comments/:id', authMiddleware, (req, res, next) => {
  try {
    const result = CommentService.delete(Number(req.params.id), req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
