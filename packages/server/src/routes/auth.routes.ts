import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, changePasswordSchema, refreshTokenSchema } from '@rp/shared';

const router = Router();

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body.username, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const result = AuthService.refreshToken(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', authMiddleware, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await AuthService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, (req, res, next) => {
  try {
    const user = AuthService.getMe(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
