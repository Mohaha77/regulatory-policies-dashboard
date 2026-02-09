import { Router } from 'express';
import { NotificationService } from '../services/notification.service';
import { authMiddleware } from '../middleware/auth';
import { addSSEClient } from '../utils/sse';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const notifications = NotificationService.getByUserId(req.user!.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authMiddleware, (req, res, next) => {
  try {
    const result = NotificationService.markAsRead(Number(req.params.id), req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', authMiddleware, (req, res, next) => {
  try {
    const result = NotificationService.markAllAsRead(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/stream', authMiddleware, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write('event: connected\ndata: {}\n\n');

  addSSEClient(req.user!.id, res);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(':keepalive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

export default router;
