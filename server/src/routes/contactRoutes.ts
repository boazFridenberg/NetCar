import { Router } from 'express';
import * as contact from '../controllers/contactController';
import { asyncHandler } from '../utils/asyncHandler';
import { optionalAuth } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', contactLimiter, optionalAuth, asyncHandler(contact.submitContact));

export default router;
