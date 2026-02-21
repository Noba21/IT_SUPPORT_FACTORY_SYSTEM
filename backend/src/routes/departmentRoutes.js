import { Router } from 'express';
import * as departmentController from '../controllers/departmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', departmentController.list);
router.get('/:id', authMiddleware, departmentController.getById);

router.post('/', authMiddleware, roleMiddleware(['admin']), departmentController.create);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.remove);

export default router;
