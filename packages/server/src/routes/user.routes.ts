import { Router } from 'express';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, userPreferencesSchema } from '@rp/shared';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const users = UserService.getAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const user = UserService.getById(Number(req.params.id));
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, requireAdmin, validate(createUserSchema), async (req, res, next) => {
  try {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, requireAdmin, validate(updateUserSchema), (req, res, next) => {
  try {
    const user = UserService.update(Number(req.params.id), req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireAdmin, (req, res, next) => {
  try {
    const result = UserService.delete(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/preferences', authMiddleware, validate(userPreferencesSchema), (req, res, next) => {
  try {
    const user = UserService.updatePreferences(Number(req.params.id), req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/absence', authMiddleware, requireManagerOrAdmin, (req, res, next) => {
  try {
    const user = UserService.setAbsence(Number(req.params.id), req.body.isAbsent);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
