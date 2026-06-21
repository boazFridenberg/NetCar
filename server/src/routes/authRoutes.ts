import { Router } from 'express';
import * as auth from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, asyncHandler(auth.register));
router.post('/login', authLimiter, asyncHandler(auth.login));
router.post('/forgot-password', authLimiter, asyncHandler(auth.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(auth.resetPasswordHandler));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));
router.get('/me', requireAuth, asyncHandler(auth.me));

export default router;
