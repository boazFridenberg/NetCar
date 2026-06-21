import { Router } from 'express';
import * as admin from '../controllers/adminController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', asyncHandler(admin.getStats));
router.post('/sync', asyncHandler(admin.triggerSync));

router.get('/users', asyncHandler(admin.listUsers));
router.patch('/users/:id', asyncHandler(admin.updateUser));
router.patch('/users/:id/role', asyncHandler(admin.updateUserRole));

router.get('/messages', asyncHandler(admin.listContactMessages));
router.patch('/messages/:id/read', asyncHandler(admin.markContactMessageRead));

export default router;
