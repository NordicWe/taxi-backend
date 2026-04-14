import { Router } from 'express';
import { adminLogin } from '../controller/adminController';

const router = Router();

// POST /api/admin/login
router.post('/login', adminLogin);

export default router;
