import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { uploadProfile, setUploadType } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', userController.list);
router.get('/technicians', userController.getTechnicians);
router.get('/departments', userController.getDepartmentUsers);
router.get('/:id', userController.getById);
router.post('/', setUploadType('profile'), uploadProfile, userController.create);
router.put('/:id', setUploadType('profile'), uploadProfile, userController.update);
router.put('/:id/status', userController.updateStatus);
router.delete('/:id', userController.remove);

export default router;
