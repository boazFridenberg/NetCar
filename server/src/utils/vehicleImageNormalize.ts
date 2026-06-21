
import { makeToEnglish } from '../data/makeDictionary';
import { modelToEnglish } from '../data/modelDictionary';

export interface NormalizedImageIdentity {
  makeEn: string;
  modelEn: string;
  year: number;
}

export interface ImageNormalizeInput {
  year: number;
  
  makeHe?: string;
  
  modelHe?: string;
  
  makeEn?: string;
  modelEn?: string;
}

export function extractEnglishModel(raw: string): string {
  let cleaned = raw.trim();

  cleaned = cleaned
    .replace(/\bדגם\s+\S+/gi, ' ')
    .replace(/[\u0590-\u05FF]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const latinTokens = cleaned.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
  if (latinTokens.length > 0) {
    return latinTokens.slice(0, 2).join(' ');
  }

  const firstToken = raw.trim().split(/\s+/)[0] ?? '';
  return modelToEnglish(firstToken) || modelToEnglish(raw) || '';
}

export function extractEnglishMake(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const ABBREV: Record<string, string> = {
    'ב': 'BMW',
    'מ': 'Mercedes-Benz',
  };
  if (ABBREV[trimmed]) return ABBREV[trimmed];

  const firstWord = trimmed.split(/\s+/)[0] ?? '';
  if (ABBREV[firstWord]) return ABBREV[firstWord];

  const en = makeToEnglish(firstWord);
  if (en && !/[\u0590-\u05FF]/.test(en)) return en;

  if (/^[A-Za-z]/.test(trimmed) && !/[\u0590-\u05FF]/.test(trimmed)) {
    return trimmed.split(/\s+/)[0] ?? trimmed;
  }

  return '';
}

export function normalizeImageIdentity(
  input: ImageNormalizeInput,
): NormalizedImageIdentity {
  const makeHe = input.makeHe ?? input.makeEn ?? '';
  const modelHe = input.modelHe ?? input.modelEn ?? '';

  const makeEn =
    (input.makeEn && !/[\u0590-\u05FF]/.test(input.makeEn) ? input.makeEn.trim() : '') ||
    (makeHe ? extractEnglishMake(makeHe) : '') ||
    '';
  let modelEn =
    (modelHe ? extractEnglishModel(modelHe) : '') ||
    input.modelEn?.trim() ||
    '';

  if (makeEn && modelEn.toLowerCase().startsWith(makeEn.toLowerCase())) {
    modelEn = modelEn.slice(makeEn.length).trim();
  }

  return { makeEn, modelEn, year: input.year };
}

export function imageCacheKey(identity: NormalizedImageIdentity): string {
  return `${identity.makeEn}|${identity.modelEn}|${identity.year}`.toLowerCase();
}

export function buildStudioSearchQuery(
  identity: NormalizedImageIdentity,
): string {
  return `${identity.year} ${identity.makeEn} ${identity.modelEn} official studio white background`.trim();
}

export function buildAlternateSearchQueries(
  identity: NormalizedImageIdentity,
): string[] {
  const { year, makeEn, modelEn } = identity;
  const queries = [
    buildStudioSearchQuery(identity),
    `${year} ${makeEn} ${modelEn} official press photo car`.trim(),
    `${year} ${makeEn} ${modelEn} car`.trim(),
  ];
  if (modelEn && !makeEn) {
    queries.push(`${year} ${modelEn} official press photo car`.trim());
  }
  return [...new Set(queries.filter(Boolean))];
}
