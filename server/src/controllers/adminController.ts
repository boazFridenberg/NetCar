
import { Request, Response } from 'express';
import { z } from 'zod';
import { userRepository, vehicleRepository, contactMessageRepository } from '../repositories';
import { analytics } from '../services/analyticsService';
import { toPublicUser } from '../services/authService';
import { getLastSyncedAt, syncCatalog } from '../services/catalogService';
import {
  adminRoleSchema,
  adminUpdateUserSchema,
  idParamSchema,
} from '../validators/schemas';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/respond';
import { FuelType, IUser, UserRole } from '../types';

type EngineGroup = 'electric' | 'hybrid' | 'ice';

function engineGroup(fuel: FuelType): EngineGroup {
  if (fuel === FuelType.Electric) return 'electric';
  if (fuel === FuelType.Hybrid || fuel === FuelType.PluginHybrid) return 'hybrid';
  return 'ice';
}

function toAdminUser(user: IUser) {
  return {
    ...toPublicUser(user),
    favoritesCount: user.favorites.length,
    comparisonCount: user.comparison.length,
  };
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [users, vehiclesPage, unreadMessages] = await Promise.all([
    userRepository.list(),
    vehicleRepository.query({ page: 1, pageSize: 100 }),
    contactMessageRepository.countUnread(),
  ]);
  const vehicles = vehiclesPage.items;

  const bookmarked = users.reduce((sum, u) => sum + u.favorites.length, 0);

  const brandCounts = new Map<string, number>();
  for (const v of vehicles) {
    brandCounts.set(v.make, (brandCounts.get(v.make) ?? 0) + 1);
  }
  const topBrands = [...brandCounts.entries()]
    .map(([make, count]) => ({ make, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const split: Record<EngineGroup, number> = { electric: 0, hybrid: 0, ice: 0 };
  for (const v of vehicles) split[engineGroup(v.fuelType)] += 1;
  const engineSplit = [
    { group: 'electric' as const, count: split.electric },
    { group: 'hybrid' as const, count: split.hybrid },
    { group: 'ice' as const, count: split.ice },
  ];

  ok(res, {
    totals: {
      users: users.length,
      vehicles: vehicles.length,
      calculations: analytics.calculations,
      bookmarked,
      unreadMessages,
    },
    topBrands,
    engineSplit,
    recentActivity: analytics.recentActivity(),
    catalog: { lastSyncedAt: getLastSyncedAt() },
  });
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await userRepository.list();
  const rows = users
    .map(toAdminUser)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  ok(res, rows);
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const { role } = adminRoleSchema.parse(req.body);

  const target = await userRepository.findById(id);
  if (!target) throw ApiError.notFound('User not found');

  if (id === req.user!.sub && role !== UserRole.Admin) {
    throw ApiError.forbidden('לא ניתן להסיר את הרשאות הניהול מעצמך');
  }

  const updated = await userRepository.update(id, { role });
  ok(res, toAdminUser(updated!));
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const { fullName, email } = adminUpdateUserSchema.parse(req.body);

  const target = await userRepository.findById(id);
  if (!target) throw ApiError.notFound('User not found');

  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== id) {
    throw ApiError.conflict('כתובת האימייל כבר בשימוש על ידי משתמש אחר');
  }

  const updated = await userRepository.update(id, {
    fullName,
    email: email.toLowerCase(),
  });
  ok(res, toAdminUser(updated!));
}

export async function triggerSync(_req: Request, res: Response): Promise<void> {
  await syncCatalog();
  ok(res, {
    message: 'Catalog sync complete',
    lastSyncedAt: getLastSyncedAt(),
    vehicles: await vehicleRepository.count(),
  });
}

export async function listContactMessages(_req: Request, res: Response): Promise<void> {
  const messages = await contactMessageRepository.list();
  ok(res, messages);
}

export async function markContactMessageRead(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const read = z.boolean().parse(req.body.read ?? true);

  const updated = await contactMessageRepository.markRead(id, read);
  if (!updated) throw ApiError.notFound('Message not found');
  ok(res, updated);
}
