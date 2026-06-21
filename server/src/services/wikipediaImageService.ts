
import { fetchJson } from '../utils/http';
import { logger } from '../utils/logger';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const THUMB_SIZE = 960;

const TRIM_NOISE = new Set([
  'TFSI',
  'TFSIE',
  'TSI',
  'TDI',
  'SB',
  'QUATTRO',
  'HYBRID',
  'E-HYBRID',
  'PHEV',
  'EV',
  'LUXURY',
  'STANDARD',
  'DESIGN',
  'SPORT',
  'SPORTBACK',
  'SEDAN',
  'LIMOUSINE',
  'COUPE',
  'CABRIOLET',
  'LONG',
  'PLUS',
  'PRO',
  'STYLE',
  'LINE',
  'S-LINE',
  'RS',
  'TFSI',
]);

interface WikiQueryResponse {
  query?: {
    pages?: Record<
      string,
      { pageid?: number; thumbnail?: { source?: string }; missing?: string }
    >;
    search?: Array<{ pageid?: number; title?: string }>;
  };
}

function isValidImageUrl(url: string): boolean {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w.length <= 3 && /^[A-Z0-9-]+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

export function buildWikiModelVariants(modelEn: string, makeEn?: string): string[] {
  let cleaned = modelEn.trim();
  if (makeEn) {
    const makePrefix = new RegExp(`^${makeEn}\\s+`, 'i');
    cleaned = cleaned.replace(makePrefix, '').trim();
  }
  cleaned = cleaned.replace(/^(audi|bmw|mercedes|toyota|hyundai|kia|volkswagen|vw)\s+/i, '').trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const kept: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const upper = t.toUpperCase();
    if (TRIM_NOISE.has(upper)) continue;
    if (/^\d+$/.test(t)) continue;
    kept.push(t);
  }

  if (tokens[0]?.toLowerCase() === 'model' && tokens[1]) {
    kept.length = 0;
    kept.push(`${tokens[0]} ${tokens[1]}`);
  }

  const variants: string[] = [];
  if (kept.length >= 2) variants.push(kept.slice(0, 2).join(' '));
  if (kept.length >= 1) variants.push(kept[0]);
  if (tokens.length >= 1 && !variants.includes(tokens[0])) {
    variants.push(tokens[0]);
  }

  return [...new Set(variants.map(titleCase).filter(Boolean))];
}

function wikiTitle(makeEn: string, modelVariant: string): string {
  return `${makeEn} ${modelVariant}`.trim().replace(/\s+/g, '_');
}

async function fetchThumbForTitle(title: string): Promise<string | null> {
  const url =
    `${WIKI_API}?` +
    new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: String(THUMB_SIZE),
      origin: '*',
    }).toString();

  try {
    const data = await fetchJson<WikiQueryResponse>(url, {
      timeoutMs: 6000,
      headers: { 'User-Agent': 'NetCar/1.0 (vehicle image resolver; contact@netcar.local)' },
    });

    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.pageid && page.thumbnail?.source && isValidImageUrl(page.thumbnail.source)) {
        return page.thumbnail.source;
      }
    }
    return null;
  } catch (err) {
    logger.warn('Wikipedia title lookup failed', {
      title,
      message: (err as Error).message,
    });
    return null;
  }
}

async function searchAndFetchThumb(query: string): Promise<string | null> {
  const searchUrl =
    `${WIKI_API}?` +
    new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      srlimit: '3',
      origin: '*',
    }).toString();

  try {
    const data = await fetchJson<WikiQueryResponse>(searchUrl, {
      timeoutMs: 6000,
      headers: { 'User-Agent': 'NetCar/1.0 (vehicle image resolver; contact@netcar.local)' },
    });

    const hits = data.query?.search ?? [];
    for (const hit of hits) {
      if (!hit.pageid) continue;
      const pageUrl =
        `${WIKI_API}?` +
        new URLSearchParams({
          action: 'query',
          pageids: String(hit.pageid),
          prop: 'pageimages',
          format: 'json',
          pithumbsize: String(THUMB_SIZE),
          origin: '*',
        }).toString();

      const pageData = await fetchJson<WikiQueryResponse>(pageUrl, {
        timeoutMs: 6000,
        headers: { 'User-Agent': 'NetCar/1.0 (vehicle image resolver; contact@netcar.local)' },
      });

      const page = pageData.query?.pages?.[String(hit.pageid)];
      if (page?.thumbnail?.source && isValidImageUrl(page.thumbnail.source)) {
        return page.thumbnail.source;
      }
    }
    return null;
  } catch (err) {
    logger.warn('Wikipedia search failed', {
      query,
      message: (err as Error).message,
    });
    return null;
  }
}

export async function resolveWikipediaImage(
  makeEn: string,
  modelEn: string,
): Promise<string | null> {
  const make = makeEn.trim();
  const model = modelEn.trim();
  if (!make || !model) return null;

  const variants = buildWikiModelVariants(model, make);
  if (variants.length === 0) return null;

  for (const variant of variants) {
    const title = wikiTitle(make, variant);
    const thumb = await fetchThumbForTitle(title);
    if (thumb) return thumb;
  }

  for (const variant of variants) {
    const thumb = await searchAndFetchThumb(`${make} ${variant} car`);
    if (thumb) return thumb;
  }

  return null;
}
