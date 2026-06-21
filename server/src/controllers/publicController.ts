
import { Request, Response } from 'express';
import { userRepository, vehicleRepository } from '../repositories';
import { analytics } from '../services/analyticsService';
import { ensureCatalogLoaded } from '../services/catalogService';
import { ok } from '../utils/respond';

export async function getPublicStats(_req: Request, res: Response): Promise<void> {
  await ensureCatalogLoaded();
  const [vehicles, users] = await Promise.all([
    vehicleRepository.count(),
    userRepository.count(),
  ]);
  ok(res, {
    vehiclesMonitored: vehicles,
    calculationsMade: analytics.calculations,
    driversOnboard: users,
  });
}
