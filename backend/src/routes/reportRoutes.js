import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/summary', reportController.summary);
router.get('/by-department', reportController.byDepartment);
router.get('/by-technician', reportController.byTechnician);
router.get('/monthly', reportController.monthly);
router.get('/export-csv', reportController.exportCsv);

export default router;
