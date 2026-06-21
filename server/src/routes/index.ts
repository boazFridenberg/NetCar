
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPublicStats } from '../controllers/publicController';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import calculatorRoutes from './calculatorRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import contactRoutes from './contactRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', ts: new Date().toISOString() } });
});

router.get('/stats', asyncHandler(getPublicStats));

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/me', userRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

export default router;
