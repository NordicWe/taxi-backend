import { Router } from 'express';
import { adminLogin, changeCredentials } from '../controller/adminController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// POST /api/admin/login
router.post('/login', adminLogin);

// POST /api/admin/change-credentials  (admin only)
router.post('/change-credentials', requireAdmin, changeCredentials);

export default router;
