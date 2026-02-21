import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadProfile, setUploadType } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.put('/', setUploadType('profile'), uploadProfile, profileController.updateMe);

export default router;
