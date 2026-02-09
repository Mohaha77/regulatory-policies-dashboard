import { Router } from 'express';
import { ReportService } from '../services/report.service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/overview', authMiddleware, (req, res, next) => {
  try {
    const data = ReportService.getOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/workload', authMiddleware, (req, res, next) => {
  try {
    const data = ReportService.getWorkload();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/performance', authMiddleware, (req, res, next) => {
  try {
    const data = ReportService.getPerformance();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/overdue', authMiddleware, (req, res, next) => {
  try {
    const data = ReportService.getOverdue();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/recent-activity', authMiddleware, (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const data = ReportService.getRecentActivity(limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
