
import { Request, Response } from 'express';
import ms from '../utils/ms';
import { env, isProd } from '../config/env';
import {
  login as loginService,
  logout as logoutService,
  refreshSession,
  register as registerService,
  requestPasswordReset,
  resetPassword,
  toPublicUser,
} from '../services/authService';
import { analytics } from '../services/analyticsService';
import { userRepository } from '../repositories';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/schemas';
import { ApiError } from '../utils/ApiError';
import { ok, created } from '../utils/respond';

const REFRESH_COOKIE = 'netcar_rt';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: ms(env.JWT_REFRESH_TTL),
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const dto = registerSchema.parse(req.body);
  const { user, tokens } = await registerService(dto);
  analytics.recordSignup(user.email);
  setRefreshCookie(res, tokens.refreshToken);
  created(res, { user, accessToken: tokens.accessToken });
}

export async function login(req: Request, res: Response): Promise<void> {
  const dto = loginSchema.parse(req.body);
  const { user, tokens } = await loginService(dto.email, dto.password);
  analytics.recordLogin(user.email);
  setRefreshCookie(res, tokens.refreshToken);
  ok(res, { user, accessToken: tokens.accessToken });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No active session');
  const tokens = await refreshSession(token);
  setRefreshCookie(res, tokens.refreshToken);
  ok(res, { accessToken: tokens.accessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await logoutService(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  ok(res, { message: 'Signed out' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const dto = forgotPasswordSchema.parse(req.body);
  await requestPasswordReset(dto.email);
  ok(res, {
    message:
      'אם קיים חשבון המשויך לכתובת זו, נשלח אליו קישור לאיפוס הסיסמה.',
  });
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  const dto = resetPasswordSchema.parse(req.body);
  await resetPassword(dto.token, dto.password);
  ok(res, { message: 'הסיסמה עודכנה בהצלחה. אפשר להתחבר עם הסיסמה החדשה.' });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const user = await userRepository.findById(req.user.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  ok(res, { user: toPublicUser(user) });
}
