
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userRepository, refreshTokenRepository } from '../repositories';
import {
  ITokenPair,
  IUser,
  PublicUser,
  UserRole,
} from '../types';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import ms from '../utils/ms';
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken } from './tokenService';
import { sendPasswordResetEmail } from './emailService';

const BCRYPT_ROUNDS = 12;

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function toPublicUser(user: IUser): PublicUser {
  const { passwordHash: _omit, ...rest } = user;
  void _omit;
  return rest;
}

export interface AuthResult {
  user: PublicUser;
  tokens: ITokenPair;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const now = new Date().toISOString();
  const user: IUser = {
    id: crypto.randomUUID(),
    email,
    fullName: input.fullName.trim(),
    role: UserRole.User,
    passwordHash,
    favorites: [],
    comparison: [],
    createdAt: now,
    updatedAt: now,
  };

  await userRepository.create(user);
  logger.info('New user registered', { id: user.id, email: user.email });

  const tokens = await issueTokenPair(user);
  return { user: toPublicUser(user), tokens };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await userRepository.findByEmail(email.trim().toLowerCase());

  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinv';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user);
  return { user: toPublicUser(user), tokens };
}

export async function refreshSession(refreshToken: string): Promise<ITokenPair> {
  return rotateRefreshToken(refreshToken, (id) => userRepository.findById(id));
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (refreshToken) await revokeRefreshToken(refreshToken);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalized);
  if (!user) {
    logger.info('Password reset requested for unknown email', { email: normalized });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + ms(env.PASSWORD_RESET_TTL)).toISOString();

  await userRepository.setPasswordReset(user.id, tokenHash, expiresAt);

  const resetUrl = `${env.CLIENT_ORIGIN.replace(/\/$/, '')}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, resetUrl, user.fullName);

  logger.info('Password reset flow started', { email: user.email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const tokenHash = hashResetToken(token.trim());
  const user = await userRepository.findByPasswordResetTokenHash(tokenHash);
  if (!user) {
    throw ApiError.badRequest('קישור האיפוס אינו תקף או שפג תוקפו. נסו לבקש קישור חדש.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await userRepository.updatePasswordHash(user.id, passwordHash);
  await refreshTokenRepository.revokeAllForUser(user.id);

  logger.info('Password reset completed', { userId: user.id, email: user.email });
}

export async function ensureAdminBootstrap(
  email: string,
  password: string,
): Promise<void> {
  const existing = await userRepository.findByEmail(email.toLowerCase());
  if (existing) return;

  const now = new Date().toISOString();
  await userRepository.create({
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    fullName: 'NetCar Admin',
    role: UserRole.Admin,
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    favorites: [],
    comparison: [],
    createdAt: now,
    updatedAt: now,
  });
  logger.info('Bootstrap admin account created', { email });
}
