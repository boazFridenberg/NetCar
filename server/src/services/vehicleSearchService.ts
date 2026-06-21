
import { IVehicle, IVehicleQuery, Paginated } from '../types';
import { vehicleRepository } from '../repositories';
import { ensureCatalogLoaded } from './catalogService';
import { searchGovVehicles } from './govApiService';
import { logger } from '../utils/logger';

function isLiveGovQuery(q: IVehicleQuery): boolean {
  return Boolean(q.search?.trim() || q.make?.trim());
}

export async function queryVehicles(
  query: IVehicleQuery,
): Promise<Paginated<IVehicle>> {
  if (isLiveGovQuery(query)) {
    logger.info('Live Gov.il vehicle search', {
      search: query.search,
      make: query.make,
      page: query.page,
    });
    return searchGovVehicles(query);
  }

  await ensureCatalogLoaded();
  return vehicleRepository.query(query);
}
