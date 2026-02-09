import { Router } from 'express';
import { ExportService } from '../services/export.service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/subjects/excel', authMiddleware, async (req, res, next) => {
  try {
    const workbook = await ExportService.exportToExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const encodedName = encodeURIComponent('المواضيع_subjects.xlsx');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

router.get('/my-work/excel', authMiddleware, async (req, res, next) => {
  try {
    const workbook = await ExportService.exportMyWorkToExcel(req.user!.id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const encodedName = encodeURIComponent('أعمالي_my-work.xlsx');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

router.get('/my-work/word', authMiddleware, async (req, res, next) => {
  try {
    const buffer = await ExportService.exportMyWorkToWord(req.user!.id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const encodedName = encodeURIComponent('أعمالي_my-work.docx');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
