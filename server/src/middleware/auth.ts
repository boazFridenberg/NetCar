
import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../services/tokenService';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearer(req);
  if (!token) {
    throw ApiError.unauthorized('You must be signed in to do that');
  }
  req.user = verifyAccessToken(token);
  next();
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) throw ApiError.unauthorized();
  if (req.user.role !== UserRole.Admin) {
    throw ApiError.forbidden('Admin privileges are required for this action');
  }
  next();
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearer(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
    }
  }
  next();
}
