
import { Request, Response } from 'express';
import { vehicleRepository } from '../repositories';
import { ensureCatalogLoaded } from '../services/catalogService';
import { calculateOwnership } from '../services/calculatorService';
import { analytics } from '../services/analyticsService';
import { calculatorSchema } from '../validators/schemas';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/respond';

export async function estimate(req: Request, res: Response): Promise<void> {
  await ensureCatalogLoaded();
  const dto = calculatorSchema.parse(req.body);

  const vehicle = await vehicleRepository.findById(dto.vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('That vehicle is no longer in the catalog');
  }

  const result = calculateOwnership(vehicle, dto.annualKm, {
    yearsHeld: dto.yearsHeld,
    insuranceTier: dto.insuranceTier,
    ownershipMode: dto.ownershipMode,
    leaseTermMonths: dto.leaseTermMonths,
  });
  analytics.recordCalculation(result.vehicleLabel);
  ok(res, result);
}
