
import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

const handler = (): never => {
  throw ApiError.tooMany();
};

export const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
