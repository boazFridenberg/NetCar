
import { Response } from 'express';
import { ApiSuccess } from '../types';

export function ok<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  status = 200,
): Response<ApiSuccess<T>> {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
): Response<ApiSuccess<T>> {
  return ok(res, data, meta, 201);
}
