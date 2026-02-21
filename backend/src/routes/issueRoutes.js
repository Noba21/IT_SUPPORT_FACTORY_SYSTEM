import { Router } from 'express';
import * as issueController from '../controllers/issueController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { uploadScreenshot, setUploadType } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', issueController.list);
router.get('/:id', issueController.getById);
router.post('/', setUploadType('screenshot'), uploadScreenshot, issueController.create);
router.put('/:id', issueController.update);
router.put('/:id/feedback', roleMiddleware(['department']), issueController.setFeedback);

export default router;
