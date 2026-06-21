import { Router } from 'express';
import * as user from '../controllers/userController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/favorites', asyncHandler(user.getFavorites));
router.post('/favorites/:id', asyncHandler(user.addFavorite));
router.delete('/favorites/:id', asyncHandler(user.removeFavorite));

router.get('/comparison', asyncHandler(user.getComparison));
router.post('/comparison/:id', asyncHandler(user.addToComparison));
router.delete('/comparison/:id', asyncHandler(user.removeFromComparison));

export default router;
