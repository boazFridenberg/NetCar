
import { ALLOWED_YEARS } from '../config/constants';
import { env } from '../config/env';
import { makeToEnglish } from '../data/makeDictionary';
import { modelToEnglish } from '../data/modelDictionary';
import {
  FuelType,
  IVehicle,
  IVehicleQuery,
  Paginated,
  VehicleClass,
} from '../types';
import { vehicleRepository } from '../repositories';
import { fetchJson } from '../utils/http';
import { logger } from '../utils/logger';
import { resolveManyImages } from './imageService';
import {
  getGovPriceLookup,
  resolveRegistryImporter,
  resolveRegistryPrice,
  type GovPriceLookup,
} from './govPriceService';
import {
  getGovSpecsLookup,
  mapFuelTypeFromRegistry,
  resolveRegistrySpecs,
  type GovSpecsLookup,
} from './govSpecsService';

interface CkanResponse {
  success: boolean;
  result?: {
    records?: RawRecord[];
    total?: number;
  };
}

type RawRecord = Record<string, string | number | null | undefined>;

export const NEW_VEHICLE_YEAR_FILTER = {
  shnat_yitzur: [...ALLOWED_YEARS],
} as const;

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;
const MAX_RAW_ROWS_PER_SEARCH = 20_000;

function str(rec: RawRecord, key: string): string {
  const v = rec[key];
  return v === undefined || v === null ? '' : String(v).trim();
}

function num(rec: RawRecord, key: string): number | null {
  const v = rec[key];
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapFuelType(he: string, techHe?: string, modelName?: string): FuelType {
  const mapped = mapFuelTypeFromRegistry(he, techHe, modelName);
  if (mapped !== FuelType.Unknown) return mapped;
  return mapFuelTypeLegacy(he);
}

function mapFuelTypeLegacy(he: string): FuelType {
  const f = he.trim();
  if (!f) return FuelType.Unknown;
  if (f.includes('חשמל') && f.includes('בנזין')) {
    return f.includes('נטען') ? FuelType.PluginHybrid : FuelType.Hybrid;
  }
  if (f.includes('היבריד')) {
    return f.includes('נטען') ? FuelType.PluginHybrid : FuelType.Hybrid;
  }
  if (f.includes('חשמל')) return FuelType.Electric;
  if (f.includes('דיזל') || f.includes('סולר')) return FuelType.Diesel;
  if (f.includes('בנזין') || f.includes('גז')) return FuelType.Gasoline;
  return FuelType.Unknown;
}

function deriveClass(modelEn: string, displacementCc: number | null): VehicleClass {
  const m = modelEn.toLowerCase();
  if (/\b(suv|crossover|x-trail|tucson|sportage|rav4|qashqai|kuga|tiguan)\b/.test(m)) {
    return VehicleClass.SUV;
  }
  if (/\b(transit|partner|berlingo|doblo|caddy|vito|sprinter|van)\b/.test(m)) {
    return VehicleClass.Commercial;
  }
  if (displacementCc !== null) {
    if (displacementCc <= 1200) return VehicleClass.Mini;
    if (displacementCc <= 1600) return VehicleClass.Compact;
    if (displacementCc <= 2000) return VehicleClass.Family;
    if (displacementCc <= 3000) return VehicleClass.Executive;
    return VehicleClass.Luxury;
  }
  return VehicleClass.Family;
}

function slug(...parts: Array<string | number>): string {
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalize(
  rec: RawRecord,
  priceLookup?: GovPriceLookup,
  specsLookup?: GovSpecsLookup,
): Omit<IVehicle, 'imageUrl' | 'imageSource'> | null {
  const year = num(rec, 'shnat_yitzur');
  if (year === null || !ALLOWED_YEARS.includes(year as 2025 | 2026)) {
    return null;
  }

  const rawMake = str(rec, 'tozeret_nm') || str(rec, 'tozar');
  const make = rawMake.split(/\s+/)[0] || rawMake;
  const model =
    str(rec, 'kinuy_mishari') || str(rec, 'degem_nm') || str(rec, 'sug_degem');
  if (!make || !model) return null;

  const trim = str(rec, 'ramat_gimur') || undefined;
  const specs = specsLookup ? resolveRegistrySpecs(rec, specsLookup) : null;
  const fuelType = specs
    ? mapFuelType(
        specs.delekNm || str(rec, 'sug_delek_nm'),
        specs.technologiatHanaaNm,
        model,
      )
    : mapFuelTypeLegacy(str(rec, 'sug_delek_nm'));
  const isElectric = fuelType === FuelType.Electric;
  const displacementCc = specs?.engineDisplacementCc ?? num(rec, 'nefah_manoa');

  const makeEn = makeToEnglish(make);
  const modelEn = modelToEnglish(model);
  const vehicleClass = deriveClass(modelEn, displacementCc);
  const importer = priceLookup ? resolveRegistryImporter(rec, priceLookup) : null;

  return {
    id: slug(make, model, year, trim ?? ''),
    make,
    model,
    makeEn,
    modelEn,
    trim,
    year,
    fuelType,
    engineDisplacementCc: isElectric ? null : displacementCc,
    enginePowerHp: specs?.enginePowerHp ?? num(rec, 'koah_sus'),
    consumption: specs?.consumption ?? null,
    isElectric,
    vehicleClass,
    priceIls: priceLookup ? resolveRegistryPrice(rec, priceLookup) : num(rec, 'mechir'),
    seats: specs?.seats ?? num(rec, 'mispar_moshavim'),
    doors: specs?.doors ?? null,
    countryOfOrigin:
      specs?.countryOfOrigin ||
      str(rec, 'tozeret_eretz') ||
      undefined,
    drivetrain: specs?.drivetrain || undefined,
    weightKg: specs?.weightKg ?? null,
    bodyType: specs?.bodyType || undefined,
    heightMm: specs?.heightMm ?? null,
    safetyRating:
      specs?.safetyRating ??
      num(rec, 'ramat_eivzur_betihuty') ??
      num(rec, 'ramat_eivzur_betihuti'),
    pollutionLevel:
      specs?.pollutionLevel ??
      num(rec, 'kvutzat_zihum'),
    importerName: importer?.name,
    importerUrl: importer?.url,
    raw: rec,
  };
}

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://data.gov.il/dataset/private-and-commercial-vehicles',
  Origin: 'https://data.gov.il',
  Connection: 'keep-alive',
};

interface GovFetchParams {
  q?: string;
  offset: number;
  limit: number;
}

interface GovFetchResult {
  records: RawRecord[];
  total: number;
}

async function fetchGovRecords(params: GovFetchParams): Promise<GovFetchResult> {
  const urlParams: Record<string, string> = {
    resource_id: env.GOV_RESOURCE_ID,
    limit: String(params.limit),
    offset: String(params.offset),
    filters: JSON.stringify(NEW_VEHICLE_YEAR_FILTER),
  };
  if (params.q?.trim()) urlParams.q = params.q.trim();

  const url = `${env.GOV_API_BASE}?${new URLSearchParams(urlParams).toString()}`;

  const res = await fetchJson<CkanResponse>(url, {
    timeoutMs: 15_000,
    headers: BROWSER_HEADERS,
  });
  if (!res.success || !res.result?.records) {
    throw new Error('Gov.il returned an unsuccessful response');
  }
  return {
    records: res.result.records,
    total: res.result.total ?? res.result.records.length,
  };
}

export function buildGovSearchQuery(search?: string, make?: string): string {
  const terms: string[] = [];

  if (make?.trim()) {
    terms.push(make.trim());
  }

  if (search?.trim()) {
    const term = search.trim();
    const modelEn = modelToEnglish(term);
    terms.push(modelEn || term);
  }

  return [...new Set(terms)].join(' ').trim();
}

function applyClientFilters(
  vehicles: Omit<IVehicle, 'imageUrl' | 'imageSource'>[],
  q: IVehicleQuery,
): Omit<IVehicle, 'imageUrl' | 'imageSource'>[] {
  let items = vehicles;

  if (q.fuelType) {
    items = items.filter((v) => v.fuelType === q.fuelType);
  }
  if (q.fuelTypes && q.fuelTypes.length > 0) {
    const allowed = new Set(q.fuelTypes);
    items = items.filter((v) => allowed.has(v.fuelType));
  }
  if (typeof q.year === 'number') {
    items = items.filter((v) => v.year === q.year);
  }
  if (typeof q.minPrice === 'number') {
    items = items.filter((v) => (v.priceIls ?? 0) >= q.minPrice!);
  }
  if (typeof q.maxPrice === 'number') {
    items = items.filter((v) => (v.priceIls ?? Infinity) <= q.maxPrice!);
  }
  if (typeof q.minDisplacement === 'number') {
    items = items.filter(
      (v) => (v.engineDisplacementCc ?? 0) >= q.minDisplacement!,
    );
  }
  if (typeof q.maxDisplacement === 'number') {
    items = items.filter(
      (v) => (v.engineDisplacementCc ?? Infinity) <= q.maxDisplacement!,
    );
  }

  return items;
}

function sortVehicles<
  T extends Pick<IVehicle, 'make' | 'year' | 'priceIls'>,
>(items: T[], sort?: IVehicleQuery['sort']): T[] {
  const copy = [...items];
  switch (sort) {
    case 'price_asc':
      return copy.sort(
        (a, b) => (a.priceIls ?? Infinity) - (b.priceIls ?? Infinity),
      );
    case 'price_desc':
      return copy.sort(
        (a, b) => (b.priceIls ?? -Infinity) - (a.priceIls ?? -Infinity),
      );
    case 'year_desc':
      return copy.sort((a, b) => b.year - a.year);
    case 'make_asc':
      return copy.sort((a, b) => a.make.localeCompare(b.make, 'he'));
    default:
      return copy.sort((a, b) => b.year - a.year || a.make.localeCompare(b.make, 'he'));
  }
}

async function enrichWithImages(
  base: Omit<IVehicle, 'imageUrl' | 'imageSource'>[],
  withImages: boolean,
): Promise<IVehicle[]> {
  if (!withImages) {
    return base.map((v) => ({
      ...v,
      imageUrl: env.FALLBACK_IMAGE_URL,
      imageSource: 'fallback' as const,
    }));
  }

  const images = await resolveManyImages(
    base.map((v) => ({
      makeHe: v.make,
      modelHe: v.model,
      makeEn: v.makeEn,
      modelEn: v.modelEn,
      year: v.year,
    })),
  );

  return base.map((v, i) => ({
    ...v,
    imageUrl: images[i].url,
    imageSource: images[i].source,
  }));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function cacheVehiclesInBackground(vehicles: IVehicle[]): void {
  if (vehicles.length === 0) return;
  vehicleRepository.upsertMany(vehicles).catch((err) => {
    logger.warn('Failed to cache live search vehicles', {
      message: (err as Error).message,
    });
  });
}

export async function searchGovVehicles(
  query: IVehicleQuery,
): Promise<Paginated<IVehicle>> {
  const pageSize = clamp(query.pageSize ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const page = query.page ?? 1;

  if (query.year && !ALLOWED_YEARS.includes(query.year as 2025 | 2026)) {
    return {
      items: [],
      meta: { page: 1, pageSize, total: 0, totalPages: 1 },
    };
  }

  const govQ = buildGovSearchQuery(query.search, query.make);
  const batchSize = Math.min(env.GOV_PAGE_SIZE, 1000);
  const deduped = new Map<string, Omit<IVehicle, 'imageUrl' | 'imageSource'>>();
  const [priceLookup, specsLookup] = await Promise.all([
    getGovPriceLookup(),
    getGovSpecsLookup(),
  ]);

  let offset = 0;
  let fetchedRaw = 0;
  let govTotal = 0;
  const needDistinct = page * pageSize;

  while (fetchedRaw < MAX_RAW_ROWS_PER_SEARCH) {
    let batch: GovFetchResult;
    try {
      batch = await fetchGovRecords({ q: govQ || undefined, offset, limit: batchSize });
    } catch (err) {
      logger.error('Gov.il live search failed', {
        q: govQ,
        offset,
        message: (err as Error).message,
      });
      break;
    }

    govTotal = batch.total;
    if (batch.records.length === 0) break;

    for (const rec of batch.records) {
      const v = normalize(rec, priceLookup, specsLookup);
      if (v) deduped.set(v.id, v);
    }

    fetchedRaw += batch.records.length;
    offset += batch.records.length;

    const filtered = applyClientFilters([...deduped.values()], query);
    const done =
      filtered.length >= needDistinct ||
      batch.records.length < batchSize ||
      fetchedRaw >= govTotal;

    if (done) break;
  }

  let results = applyClientFilters([...deduped.values()], query);
  results = sortVehicles(results, query.sort);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 1, totalPages);
  const pageSlice = results.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const items = await enrichWithImages(pageSlice, false);
  cacheVehiclesInBackground(items);

  logger.info('Gov.il live search complete', {
    q: govQ || '(browse)',
    rawRows: fetchedRaw,
    govTotal,
    distinct: total,
    returned: items.length,
  });

  return {
    items,
    meta: { page: safePage, pageSize, total, totalPages },
  };
}

export async function fetchNewVehicleCatalog(
  options: { maxRecords?: number; withImages?: boolean } = {},
): Promise<IVehicle[]> {
  const pageSize = env.GOV_PAGE_SIZE;
  const maxRecords = options.maxRecords ?? pageSize * 10;
  const withImages = options.withImages ?? false;

  const [priceLookup, specsLookup] = await Promise.all([
    getGovPriceLookup(),
    getGovSpecsLookup(),
  ]);

  const deduped = new Map<string, Omit<IVehicle, 'imageUrl' | 'imageSource'>>();
  let offset = 0;
  let fetched = 0;

  while (fetched < maxRecords) {
    let batch: GovFetchResult;
    try {
      batch = await fetchGovRecords({ offset, limit: pageSize });
    } catch (err) {
      logger.error('Gov.il page fetch failed; stopping sync', {
        offset,
        message: (err as Error).message,
      });
      break;
    }

    if (batch.records.length === 0) break;
    fetched += batch.records.length;
    offset += batch.records.length;

    for (const rec of batch.records) {
      const v = normalize(rec, priceLookup, specsLookup);
      if (v && !deduped.has(v.id)) deduped.set(v.id, v);
    }

    if (batch.records.length < pageSize) break;
  }

  logger.info(`Gov.il sync: processed ${fetched} raw rows, ${deduped.size} distinct models`);

  return enrichWithImages([...deduped.values()], withImages);
}
