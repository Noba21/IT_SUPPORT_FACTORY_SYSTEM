import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:issueId/messages', chatController.getMessages);
router.post('/:issueId/messages', chatController.sendMessage);

export default router;
