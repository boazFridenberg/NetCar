import { Router } from 'express';
import * as calculator from '../controllers/calculatorController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/estimate', asyncHandler(calculator.estimate));

export default router;
