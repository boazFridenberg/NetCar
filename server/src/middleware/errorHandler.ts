
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { isProd } from '../config/env';
import { ApiFailure } from '../types';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let status = 500;
  let body: ApiFailure;

  if (err instanceof ApiError) {
    status = err.statusCode;
    body = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
  } else if (err instanceof ZodError) {
    status = 400;
    body = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the highlighted fields and try again',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    };
  } else {
    const message =
      err instanceof Error ? err.message : 'Unexpected server error';
    logger.error('Unhandled error', { message, stack: (err as Error)?.stack });
    body = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isProd ? 'Something went wrong on our end' : message,
      },
    };
  }

  if (status >= 500) {
    logger.error('Request failed', { status, code: body.error.code });
  }

  res.status(status).json(body);
}
