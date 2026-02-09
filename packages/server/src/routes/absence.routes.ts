import { Router } from 'express';
import { AbsenceService } from '../services/absence.service';
import { authMiddleware } from '../middleware/auth';
import { requireManagerOrAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { absenceCoverageSchema } from '@rp/shared';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const data = AbsenceService.getAll();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, requireManagerOrAdmin, validate(absenceCoverageSchema), (req, res, next) => {
  try {
    const data = AbsenceService.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, requireManagerOrAdmin, (req, res, next) => {
  try {
    const data = AbsenceService.update(Number(req.params.id), req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireManagerOrAdmin, (req, res, next) => {
  try {
    const result = AbsenceService.delete(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
