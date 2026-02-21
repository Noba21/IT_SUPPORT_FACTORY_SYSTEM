import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadProfile, setUploadType } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', setUploadType('profile'), uploadProfile, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
