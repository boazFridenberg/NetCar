
import { Request, Response } from 'express';
import { MAX_COMPARISON } from '../config/constants';
import { userRepository, vehicleRepository } from '../repositories';
import { toPublicUser } from '../services/authService';
import { idParamSchema } from '../validators/schemas';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/respond';

async function loadUser(req: Request) {
  const user = await userRepository.findById(req.user!.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return user;
}

export async function getFavorites(req: Request, res: Response): Promise<void> {
  const user = await loadUser(req);
  const vehicles = await vehicleRepository.findManyByIds(user.favorites);
  ok(res, vehicles);
}

export async function addFavorite(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const user = await loadUser(req);

  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  if (!user.favorites.includes(id)) {
    await userRepository.update(user.id, {
      favorites: [...user.favorites, id],
    });
  }
  const updated = await loadUser(req);
  ok(res, toPublicUser(updated));
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const user = await loadUser(req);
  await userRepository.update(user.id, {
    favorites: user.favorites.filter((f) => f !== id),
  });
  const updated = await loadUser(req);
  ok(res, toPublicUser(updated));
}

export async function getComparison(req: Request, res: Response): Promise<void> {
  const user = await loadUser(req);
  const vehicles = await vehicleRepository.findManyByIds(user.comparison);
  ok(res, vehicles);
}

export async function addToComparison(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const user = await loadUser(req);

  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  if (user.comparison.includes(id)) {
    ok(res, toPublicUser(user));
    return;
  }
  if (user.comparison.length >= MAX_COMPARISON) {
    throw ApiError.badRequest(
      `You can compare up to ${MAX_COMPARISON} vehicles at once`,
    );
  }
  await userRepository.update(user.id, {
    comparison: [...user.comparison, id],
  });
  const updated = await loadUser(req);
  ok(res, toPublicUser(updated));
}

export async function removeFromComparison(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const user = await loadUser(req);
  await userRepository.update(user.id, {
    comparison: user.comparison.filter((c) => c !== id),
  });
  const updated = await loadUser(req);
  ok(res, toPublicUser(updated));
}
