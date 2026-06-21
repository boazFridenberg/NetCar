
import { ALLOWED_YEARS } from '../config/constants';
import { env } from '../config/env';
import { FuelType } from '../types';
import { fetchJson } from '../utils/http';
import { logger } from '../utils/logger';

type RawRecord = Record<string, string | number | null | undefined>;

interface CkanResponse {
  success: boolean;
  result?: {
    records?: RawRecord[];
    total?: number;
  };
}

export interface WltpSpecs {
  engineDisplacementCc: number | null;
  enginePowerHp: number | null;
  seats: number | null;
  doors: number | null;
  countryOfOrigin: string;
  safetyRating: number | null;
  pollutionLevel: number | null;
  drivetrain: string;
  weightKg: number | null;
  bodyType: string;
  heightMm: number | null;
  delekNm: string;
  technologiatHanaaNm: string;
  consumption: number | null;
}

export interface GovSpecsLookup {
  
  exact: Map<string, WltpSpecs>;
  
  byModel: Map<string, WltpSpecs>;
}

const SPECS_YEAR_FILTER = { shnat_yitzur: [...ALLOWED_YEARS] } as const;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cached: { lookup: GovSpecsLookup; at: number } | null = null;

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

function normTrim(trim: string): string {
  return trim.trim().toUpperCase();
}

function exactKey(
  tozeretCd: number,
  degemCd: number,
  year: number,
  trim: string,
): string {
  return `${tozeretCd}|${degemCd}|${year}|${normTrim(trim)}`;
}

function modelKey(tozeretCd: number, degemCd: number, year: number): string {
  return `${tozeretCd}|${degemCd}|${year}`;
}

function estimateFuelConsumption(rec: RawRecord): number | null {
  const city = num(rec, 'kamut_CO2_city');
  const hway = num(rec, 'kamut_CO2_hway');
  const direct = num(rec, 'CO2_WLTP');
  const values = [city, hway, direct].filter((v): v is number => v !== null && v > 0);
  if (values.length === 0) return null;
  const avgCo2 = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round((avgCo2 / 23.1) * 10) / 10;
}

function recordToSpecs(rec: RawRecord): WltpSpecs {
  const tech = str(rec, 'technologiat_hanaa_nm');
  const delek = str(rec, 'delek_nm');
  const isElectric =
    tech.includes('חשמל') && !tech.includes('היבריד') && !delek.includes('היבריד');

  return {
    engineDisplacementCc: isElectric ? null : num(rec, 'nefah_manoa'),
    enginePowerHp: num(rec, 'koah_sus'),
    seats: num(rec, 'mispar_moshavim'),
    doors: num(rec, 'mispar_dlatot'),
    countryOfOrigin: str(rec, 'tozeret_eretz_nm'),
    safetyRating: num(rec, 'ramat_eivzur_betihuty'),
    pollutionLevel: num(rec, 'kvutzat_zihum'),
    drivetrain: str(rec, 'hanaa_nm'),
    weightKg: num(rec, 'mishkal_kolel'),
    bodyType: str(rec, 'merkav'),
    heightMm: num(rec, 'gova'),
    delekNm: delek,
    technologiatHanaaNm: tech,
    consumption: isElectric ? null : estimateFuelConsumption(rec),
  };
}

function ingestRecord(rec: RawRecord, lookup: GovSpecsLookup): void {
  const year = num(rec, 'shnat_yitzur');
  const tozeretCd = num(rec, 'tozeret_cd');
  const degemCd = num(rec, 'degem_cd');
  if (year === null || tozeretCd === null || degemCd === null) return;
  if (!ALLOWED_YEARS.includes(year as 2025 | 2026)) return;

  const specs = recordToSpecs(rec);
  const trim = str(rec, 'ramat_gimur');
  lookup.exact.set(exactKey(tozeretCd, degemCd, year, trim), specs);

  const mk = modelKey(tozeretCd, degemCd, year);
  if (!lookup.byModel.has(mk)) {
    lookup.byModel.set(mk, specs);
  }
}

async function fetchSpecsBatch(offset: number, limit: number): Promise<RawRecord[]> {
  const urlParams = new URLSearchParams({
    resource_id: env.GOV_SPECS_RESOURCE_ID,
    limit: String(limit),
    offset: String(offset),
    filters: JSON.stringify(SPECS_YEAR_FILTER),
  });

  const res = await fetchJson<CkanResponse>(`${env.GOV_API_BASE}?${urlParams}`, {
    timeoutMs: 30_000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; NetCar/1.0; +https://data.gov.il)',
      Accept: 'application/json',
    },
  });

  if (!res.success || !res.result?.records) {
    throw new Error('Gov.il WLTP specs catalog returned an unsuccessful response');
  }
  return res.result.records;
}

export async function buildGovSpecsLookup(): Promise<GovSpecsLookup> {
  const lookup: GovSpecsLookup = { exact: new Map(), byModel: new Map() };
  const batchSize = Math.min(env.GOV_PAGE_SIZE, 1000);
  let offset = 0;
  let totalIngested = 0;

  while (true) {
    const records = await fetchSpecsBatch(offset, batchSize);
    if (records.length === 0) break;

    for (const rec of records) ingestRecord(rec, lookup);
    totalIngested += records.length;
    offset += records.length;
    if (records.length < batchSize) break;
  }

  logger.info('Gov.il WLTP specs catalog loaded', {
    rows: totalIngested,
    exact: lookup.exact.size,
    byModel: lookup.byModel.size,
  });

  return lookup;
}

export async function getGovSpecsLookup(): Promise<GovSpecsLookup> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.lookup;
  }
  const lookup = await buildGovSpecsLookup();
  cached = { lookup, at: Date.now() };
  return lookup;
}

export function clearGovSpecsCache(): void {
  cached = null;
}

export function resolveRegistrySpecs(
  rec: RawRecord,
  lookup: GovSpecsLookup,
): WltpSpecs | null {
  const year = num(rec, 'shnat_yitzur');
  const tozeretCd = num(rec, 'tozeret_cd');
  const degemCd = num(rec, 'degem_cd');
  if (year === null || tozeretCd === null || degemCd === null) return null;

  const trim = str(rec, 'ramat_gimur');
  return (
    lookup.exact.get(exactKey(tozeretCd, degemCd, year, trim)) ??
    lookup.byModel.get(modelKey(tozeretCd, degemCd, year)) ??
    null
  );
}

export function mapFuelTypeFromRegistry(
  delekHe: string,
  techHe?: string,
  modelName?: string,
): FuelType {
  const blob = `${delekHe} ${techHe ?? ''} ${modelName ?? ''}`.toUpperCase();

  if (/PHEV|PLUG.?IN|נטען/.test(blob)) return FuelType.PluginHybrid;
  if (/HEV|HYBRID|היבריד/.test(blob)) return FuelType.Hybrid;
  if (/חשמל|EV\b|ELECTRIC|BEV/.test(blob) && !/היבריד|HEV/.test(blob)) {
    return FuelType.Electric;
  }
  if (/דיזל|סולר|DIESEL/.test(blob)) return FuelType.Diesel;
  if (/בנזין|גז|GAS/.test(blob)) return FuelType.Gasoline;
  return FuelType.Unknown;
}
