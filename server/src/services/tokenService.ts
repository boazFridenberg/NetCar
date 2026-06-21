
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { refreshTokenRepository } from '../repositories';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  ITokenPair,
  IUser,
} from '../types';
import { ApiError } from '../utils/ApiError';

function signAccess(user: IUser): string {
  const payload: IAccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);
}

async function signRefresh(user: IUser): Promise<string> {
  const jti = crypto.randomUUID();
  const payload: IRefreshTokenPayload = { sub: user.id, jti };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  } as SignOptions);

  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now();

  await refreshTokenRepository.save({
    jti,
    userId: user.id,
    expiresAt,
    revoked: false,
  });
  return token;
}

export async function issueTokenPair(user: IUser): Promise<ITokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    Promise.resolve(signAccess(user)),
    signRefresh(user),
  ]);
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): IAccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as IAccessTokenPayload;
  } catch {
    throw ApiError.unauthorized('Your session is invalid or has expired');
  }
}

export function verifyRefreshToken(token: string): IRefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as IRefreshTokenPayload;
  } catch {
    throw ApiError.unauthorized('Your session has expired, please sign in again');
  }
}

export async function rotateRefreshToken(
  presented: string,
  loadUser: (id: string) => Promise<IUser | null>,
): Promise<ITokenPair> {
  const payload = verifyRefreshToken(presented);
  const record = await refreshTokenRepository.find(payload.jti);

  if (!record || record.revoked || record.expiresAt < Date.now()) {
    await refreshTokenRepository.revokeAllForUser(payload.sub);
    throw ApiError.unauthorized('Session expired. Please sign in again.');
  }

  const user = await loadUser(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  await refreshTokenRepository.revoke(payload.jti);
  return issueTokenPair(user);
}

export async function revokeRefreshToken(presented: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(presented);
    await refreshTokenRepository.revoke(payload.jti);
  } catch {
  }
}
