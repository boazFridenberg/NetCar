
import { env } from '../config/env';
import { vehicleRepository } from '../repositories';
import { IVehicle } from '../types';
import { resolveVehicleImage } from './imageService';

function needsImageResolution(vehicle: IVehicle): boolean {
  return (
    vehicle.imageSource === 'fallback' ||
    vehicle.imageUrl === env.FALLBACK_IMAGE_URL ||
    !vehicle.imageUrl
  );
}

export function stripImageForCatalogList(vehicle: IVehicle): IVehicle {
  return {
    ...vehicle,
    imageUrl: env.FALLBACK_IMAGE_URL,
    imageSource: 'fallback',
  };
}

export async function ensureVehicleImage(vehicle: IVehicle): Promise<IVehicle> {
  if (!needsImageResolution(vehicle)) return vehicle;

  const resolved = await resolveVehicleImage({
    makeHe: vehicle.make,
    modelHe: vehicle.model,
    makeEn: vehicle.makeEn,
    modelEn: vehicle.modelEn,
    year: vehicle.year,
  });

  if (resolved.source === 'fallback') return vehicle;

  const enriched: IVehicle = {
    ...vehicle,
    imageUrl: resolved.url,
    imageSource: resolved.source,
  };

  await vehicleRepository.upsertMany([enriched]);
  return enriched;
}
