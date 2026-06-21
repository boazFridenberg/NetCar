
import { AxiosError } from 'axios';
import type { ApiFailure } from '@/types';

export class AppError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code = 'UNKNOWN',
    status?: number,
    details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function isApiFailure(value: unknown): value is ApiFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false &&
    'error' in value
  );
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof AxiosError) {
    if (isApiFailure(error.response?.data)) {
      const { code, message, details } = error.response!.data.error;
      return new AppError(message, code, error.response!.status, details);
    }

    if (error.code === 'ERR_NETWORK') {
      return new AppError(
        'לא הצלחנו להתחבר לשרת. בדקו את החיבור לאינטרנט ונסו שוב.',
        'NETWORK_ERROR',
      );
    }
    if (error.code === 'ECONNABORTED') {
      return new AppError(
        'הבקשה ארכה זמן רב מדי. נא לנסות שוב בעוד רגע.',
        'TIMEOUT',
      );
    }

    return new AppError(
      error.message || 'אירעה שגיאת רשת בלתי צפויה',
      'HTTP_ERROR',
      error.response?.status,
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('אירעה תקלה בלתי צפויה.');
}
