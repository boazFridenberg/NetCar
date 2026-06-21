
import { Request, Response } from 'express';
import { vehicleRepository } from '../repositories';
import { ensureCatalogLoaded } from '../services/catalogService';
import { queryVehicles } from '../services/vehicleSearchService';
import {
  ensureVehicleImage,
  stripImageForCatalogList,
} from '../services/vehicleImageService';
import { analytics } from '../services/analyticsService';
import { vehicleQuerySchema, idParamSchema } from '../validators/schemas';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/respond';
import { FuelType } from '../types';

export async function listVehicles(req: Request, res: Response): Promise<void> {
  const query = vehicleQuerySchema.parse(req.query);
  if (query.search) analytics.recordSearch(query.search);

  const result = await queryVehicles(query);
  const items = result.items.map(stripImageForCatalogList);
  ok(res, items, { ...result.meta });
}

export async function getVehicle(req: Request, res: Response): Promise<void> {
  await ensureCatalogLoaded();
  const { id } = idParamSchema.parse(req.params);
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw ApiError.notFound('We could not find that vehicle');
  ok(res, vehicle);
}

export async function getVehicleImage(req: Request, res: Response): Promise<void> {
  await ensureCatalogLoaded();
  const { id } = idParamSchema.parse(req.params);
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw ApiError.notFound('We could not find that vehicle');

  const withImage = await ensureVehicleImage(vehicle);
  ok(res, { url: withImage.imageUrl, source: withImage.imageSource });
}

export async function getFilters(_req: Request, res: Response): Promise<void> {
  await ensureCatalogLoaded();
  const makes = await vehicleRepository.distinctMakes();
  ok(res, {
    makes,
    fuelTypes: Object.values(FuelType).filter((f) => f !== FuelType.Unknown),
    sortOptions: ['price_asc', 'price_desc', 'year_desc', 'make_asc'],
  });
}
