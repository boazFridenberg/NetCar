
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Bad request', details?: unknown): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this resource'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Resource already exists'): ApiError {
    return new ApiError(409, 'CONFLICT', message);
  }

  static tooMany(message = 'Too many requests, please slow down'): ApiError {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static upstream(
    message = 'An upstream service failed',
    details?: unknown,
  ): ApiError {
    return new ApiError(502, 'UPSTREAM_ERROR', message, details);
  }

  static internal(message = 'Something went wrong on our end'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
