
import { env } from '../config/env';
import { vehicleRepository } from '../repositories';
import { fetchNewVehicleCatalog } from './govApiService';
import { clearGovPriceCache } from './govPriceService';
import { clearGovSpecsCache } from './govSpecsService';
import { SEED_VEHICLES } from '../data/seedVehicles';
import { resolveMakeImporterFallback } from '../data/importerLinks';
import { IVehicle } from '../types';
import { logger } from '../utils/logger';

let lastSyncedAt: string | null = null;
let usingSeed = false;
let syncing: Promise<void> | null = null;

async function loadSeed(): Promise<void> {
  const vehicles: IVehicle[] = SEED_VEHICLES.map((v) => {
    const importer = resolveMakeImporterFallback(v.make);
    return {
      ...v,
      importerName: importer?.name,
      importerUrl: importer?.url,
      imageUrl: env.FALLBACK_IMAGE_URL,
      imageSource: 'fallback',
    };
  });
  await vehicleRepository.replaceAll(vehicles);
  usingSeed = true;
  lastSyncedAt = new Date().toISOString();
  logger.info(`Loaded curated seed catalog: ${vehicles.length} vehicles`);
}

async function runSync(): Promise<void> {
  logger.info('Starting catalog sync from gov.il…');
  clearGovPriceCache();
  clearGovSpecsCache();
  const vehicles = await fetchNewVehicleCatalog({ withImages: false });
  if (vehicles.length > 0) {
    await vehicleRepository.replaceAll(vehicles);
    usingSeed = false;
    lastSyncedAt = new Date().toISOString();
    logger.info(`Catalog sync complete: ${vehicles.length} vehicles`);
    return;
  }

  logger.warn('Gov.il sync returned 0 vehicles');
  if (await vehicleRepository.isEmpty()) {
    logger.warn('Falling back to curated seed catalog');
    await loadSeed();
  }
}

export function syncCatalog(): Promise<void> {
  if (syncing) return syncing;
  syncing = runSync()
    .catch((err) => {
      logger.error('Catalog sync failed', { message: (err as Error).message });
    })
    .finally(() => {
      syncing = null;
    });
  return syncing;
}

export async function ensureCatalogLoaded(): Promise<void> {
  if (await vehicleRepository.isEmpty()) {
    await syncCatalog();
  }
}

export function getLastSyncedAt(): string | null {
  return lastSyncedAt;
}

export function isUsingSeed(): boolean {
  return usingSeed;
}
