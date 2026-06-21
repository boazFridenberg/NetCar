
import { ALLOWED_YEARS } from '../config/constants';
import { env } from '../config/env';
import { fetchJson } from '../utils/http';
import { logger } from '../utils/logger';
import {
  resolveImporterWebsite,
  resolveMakeImporterFallback,
} from '../data/importerLinks';

type RawRecord = Record<string, string | number | null | undefined>;

interface CkanResponse {
  success: boolean;
  result?: {
    records?: RawRecord[];
    total?: number;
  };
}

export interface GovPriceLookup {
  
  byCode: Map<string, number>;
  
  byName: Map<string, number>;
  
  importerByCode: Map<string, { name: string; code: number }>;
  
  importerByTozeret: Map<number, { name: string; code: number }>;
}

export interface ResolvedImporter {
  name: string;
  url: string;
}

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://data.gov.il/',
};

const PRICE_YEAR_FILTER = { shnat_yitzur: [...ALLOWED_YEARS] } as const;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cached: { lookup: GovPriceLookup; at: number } | null = null;

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

function ingestRecord(rec: RawRecord, lookup: GovPriceLookup): void {
  const mehir = num(rec, 'mehir');
  const year = num(rec, 'shnat_yitzur');
  if (mehir === null || year === null || !ALLOWED_YEARS.includes(year as 2025 | 2026)) {
    return;
  }

  const tozeretCd = num(rec, 'tozeret_cd');
  const degemCd = num(rec, 'degem_cd');
  const importerName = str(rec, 'shem_yevuan');
  const importerCode = num(rec, 'semel_yevuan');

  if (tozeretCd !== null && degemCd !== null) {
    lookup.byCode.set(`${tozeretCd}|${degemCd}|${year}`, mehir);
    if (importerName && importerCode !== null) {
      lookup.importerByCode.set(`${tozeretCd}|${degemCd}|${year}`, {
        name: importerName,
        code: importerCode,
      });
    }
  }

  if (tozeretCd !== null && importerName && importerCode !== null) {
    if (!lookup.importerByTozeret.has(tozeretCd)) {
      lookup.importerByTozeret.set(tozeretCd, {
        name: importerName,
        code: importerCode,
      });
    }
  }

  const make = str(rec, 'tozeret_nm').split(/\s+/)[0] || str(rec, 'tozeret_nm');
  const model = str(rec, 'kinuy_mishari');
  if (make && model) {
    const nameKey = `${make}|${model}|${year}`.toLowerCase();
    const prev = lookup.byName.get(nameKey);
    if (prev === undefined || mehir < prev) {
      lookup.byName.set(nameKey, mehir);
    }
  }
}

async function fetchPriceBatch(offset: number, limit: number): Promise<RawRecord[]> {
  const urlParams = new URLSearchParams({
    resource_id: env.GOV_PRICE_RESOURCE_ID,
    limit: String(limit),
    offset: String(offset),
    filters: JSON.stringify(PRICE_YEAR_FILTER),
  });

  const res = await fetchJson<CkanResponse>(`${env.GOV_API_BASE}?${urlParams}`, {
    timeoutMs: 20_000,
    headers: BROWSER_HEADERS,
  });

  if (!res.success || !res.result?.records) {
    throw new Error('Gov.il price catalog returned an unsuccessful response');
  }
  return res.result.records;
}

export async function buildGovPriceLookup(): Promise<GovPriceLookup> {
  const lookup: GovPriceLookup = {
    byCode: new Map(),
    byName: new Map(),
    importerByCode: new Map(),
    importerByTozeret: new Map(),
  };
  const batchSize = Math.min(env.GOV_PAGE_SIZE, 1000);
  let offset = 0;
  let totalIngested = 0;

  while (true) {
    const records = await fetchPriceBatch(offset, batchSize);
    if (records.length === 0) break;

    for (const rec of records) ingestRecord(rec, lookup);
    totalIngested += records.length;
    offset += records.length;

    if (records.length < batchSize) break;
  }

  logger.info('Gov.il price catalog loaded', {
    rows: totalIngested,
    byCode: lookup.byCode.size,
    byName: lookup.byName.size,
    importers: lookup.importerByCode.size,
  });

  return lookup;
}

export async function getGovPriceLookup(): Promise<GovPriceLookup> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.lookup;
  }
  const lookup = await buildGovPriceLookup();
  cached = { lookup, at: Date.now() };
  return lookup;
}

export function resolveRegistryPrice(
  rec: RawRecord,
  lookup: GovPriceLookup,
): number | null {
  const year = num(rec, 'shnat_yitzur');
  if (year === null) return null;

  const tozeretCd = num(rec, 'tozeret_cd');
  const degemCd = num(rec, 'degem_cd');
  if (tozeretCd !== null && degemCd !== null) {
    const exact = lookup.byCode.get(`${tozeretCd}|${degemCd}|${year}`);
    if (exact !== undefined) return exact;
  }

  const make = str(rec, 'tozeret_nm').split(/\s+/)[0] || str(rec, 'tozeret_nm');
  const model =
    str(rec, 'kinuy_mishari') || str(rec, 'degem_nm') || str(rec, 'sug_degem');
  if (!make || !model) return null;

  return lookup.byName.get(`${make}|${model}|${year}`.toLowerCase()) ?? null;
}

export function resolveRegistryImporter(
  rec: RawRecord,
  lookup: GovPriceLookup,
): ResolvedImporter | null {
  const year = num(rec, 'shnat_yitzur');
  const tozeretCd = num(rec, 'tozeret_cd');
  const degemCd = num(rec, 'degem_cd');
  const rawMake = str(rec, 'tozeret_nm') || str(rec, 'tozar');
  const make = rawMake.split(/\s+/)[0] || rawMake;

  let importer: { name: string; code: number } | null = null;

  if (year !== null && tozeretCd !== null && degemCd !== null) {
    importer = lookup.importerByCode.get(`${tozeretCd}|${degemCd}|${year}`) ?? null;
  }
  if (!importer && tozeretCd !== null) {
    importer = lookup.importerByTozeret.get(tozeretCd) ?? null;
  }

  if (importer) {
    const url = resolveImporterWebsite(importer.code, importer.name);
    if (url) return { name: importer.name, url };
  }

  const fallback = make ? resolveMakeImporterFallback(make) : null;
  return fallback ? { name: fallback.name, url: fallback.url } : null;
}

export function clearGovPriceCache(): void {
  cached = null;
}
