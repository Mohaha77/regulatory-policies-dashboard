import { Router } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { ActivityService } from '../services/activity.service';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { getUploadPath } from '../utils/file-utils';
import path from 'path';

const router = Router();

router.get('/subjects/:id/attachments', authMiddleware, (req, res, next) => {
  try {
    const attachments = AttachmentService.getBySubjectId(Number(req.params.id));
    res.json(attachments);
  } catch (error) {
    next(error);
  }
});

router.post('/subjects/:id/attachments', authMiddleware, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const attachment = AttachmentService.create(Number(req.params.id), req.user!.id, req.file);
    ActivityService.log(req.user!.id, 'attachment_uploaded', Number(req.params.id), { fileName: req.file.originalname });
    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
});

router.get('/attachments/:id/download', authMiddleware, (req, res, next) => {
  try {
    const attachment = AttachmentService.getById(Number(req.params.id));
    const filePath = getUploadPath(attachment.storedName);

    // RFC 5987 encoding for non-ASCII filenames
    const encodedName = encodeURIComponent(attachment.originalName).replace(/'/g, '%27');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.setHeader('Content-Type', attachment.mimeType);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
});

router.delete('/attachments/:id', authMiddleware, (req, res, next) => {
  try {
    const result = AttachmentService.delete(Number(req.params.id), req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
