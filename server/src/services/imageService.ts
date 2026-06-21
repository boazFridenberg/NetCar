
import { env, hasBingImages, hasGoogleImages } from '../config/env';
import { ImageSource } from '../types';
import { imageCacheRepository } from '../repositories';
import { fetchJson } from '../utils/http';
import { logger } from '../utils/logger';
import {
  buildAlternateSearchQueries,
  imageCacheKey,
  normalizeImageIdentity,
  type NormalizedImageIdentity,
} from '../utils/vehicleImageNormalize';
import { resolveWikipediaImage } from './wikipediaImageService';

export interface ImageQuery {
  year: number;
  makeEn?: string;
  modelEn?: string;
  
  makeHe?: string;
  
  modelHe?: string;
}

export interface ResolvedImage {
  url: string;
  source: ImageSource;
}

const GOOGLE_CALL_GAP_MS = 350;
let lastGoogleCallAt = 0;

let googleBlockedUntil = 0;

const fallback = (): ResolvedImage => ({
  url: env.FALLBACK_IMAGE_URL,
  source: 'fallback',
});

function toIdentity(q: ImageQuery): NormalizedImageIdentity {
  return normalizeImageIdentity(q);
}

function isValidImageUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url);
}

interface GoogleCseResponse {
  items?: Array<{ link?: string }>;
}

async function throttleGoogle(): Promise<void> {
  const elapsed = Date.now() - lastGoogleCallAt;
  if (elapsed < GOOGLE_CALL_GAP_MS) {
    await new Promise((r) => setTimeout(r, GOOGLE_CALL_GAP_MS - elapsed));
  }
  lastGoogleCallAt = Date.now();
}

async function fromGoogle(term: string): Promise<string | null> {
  if (!hasGoogleImages) return null;
  if (Date.now() < googleBlockedUntil) return null;

  await throttleGoogle();

  const url =
    'https://www.googleapis.com/customsearch/v1?' +
    new URLSearchParams({
      key: env.GOOGLE_CSE_KEY,
      cx: env.GOOGLE_CSE_CX,
      q: term,
      searchType: 'image',
      num: '2',
      safe: 'active',
      imgSize: 'xlarge',
    }).toString();

  try {
    const data = await fetchJson<GoogleCseResponse>(url, { timeoutMs: 8000 });
    for (const item of data.items ?? []) {
      const link = item.link;
      if (link && isValidImageUrl(link)) return link;
    }
    return null;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 429 || status === 403) {
      googleBlockedUntil = Date.now() + 6 * 60 * 60 * 1000;
      logger.warn('Google image quota exceeded — pausing Google for 6 hours', {
        status,
      });
    } else {
      logger.warn('Google image search failed', {
        message: (err as Error).message,
        status,
      });
    }
    return null;
  }
}

interface BingImageResponse {
  value?: Array<{ contentUrl?: string }>;
}

async function fromBing(term: string): Promise<string | null> {
  if (!hasBingImages) return null;
  const url =
    `${env.BING_IMAGE_ENDPOINT}?` +
    new URLSearchParams({
      q: term,
      count: '2',
      safeSearch: 'Strict',
      imageType: 'Photo',
    }).toString();

  try {
    const data = await fetchJson<BingImageResponse>(url, {
      timeoutMs: 8000,
      headers: { 'Ocp-Apim-Subscription-Key': env.BING_IMAGE_KEY },
    });
    for (const item of data.value ?? []) {
      const link = item.contentUrl;
      if (link && isValidImageUrl(link)) return link;
    }
    return null;
  } catch (err) {
    logger.warn('Bing image search failed', { message: (err as Error).message });
    return null;
  }
}

export async function resolveVehicleImage(
  q: ImageQuery,
): Promise<ResolvedImage> {
  const identity = toIdentity(q);
  const key = imageCacheKey(identity);

  const cached = await imageCacheRepository.get(key);
  if (cached) {
    return { url: cached.url, source: 'cache' };
  }

  if (!identity.makeEn && !identity.modelEn) {
    logger.warn('Image search skipped — could not normalize identity', identity);
    return fallback();
  }

  const searchTerms = identity.makeEn
    ? buildAlternateSearchQueries(identity)
    : [`${identity.year} ${identity.modelEn} official press photo car`.trim()];

  let resolved: ResolvedImage = fallback();

  const wikiHit = await resolveWikipediaImage(identity.makeEn, identity.modelEn);
  if (wikiHit) {
    resolved = { url: wikiHit, source: 'wikipedia' };
  }

  if (resolved.source === 'fallback') {
    for (const term of searchTerms) {
      const googleHit = await fromGoogle(term);
      if (googleHit) {
        resolved = { url: googleHit, source: 'google' };
        break;
      }
      const bingHit = await fromBing(term);
      if (bingHit) {
        resolved = { url: bingHit, source: 'bing' };
        break;
      }
    }
  }

  if (resolved.source !== 'fallback') {
    await imageCacheRepository.set(key, resolved);
    logger.info('Image cached for model', {
      key,
      source: resolved.source,
    });
  }

  return resolved;
}

export async function resolveManyImages(
  queries: ImageQuery[],
  concurrency = 2,
): Promise<ResolvedImage[]> {
  if (queries.length === 0) return [];

  const identities = queries.map(toIdentity);
  const keys = identities.map(imageCacheKey);

  const uniqueByKey = new Map<string, number>();
  for (let i = 0; i < keys.length; i++) {
    if (!uniqueByKey.has(keys[i])) uniqueByKey.set(keys[i], i);
  }

  const uniqueResults = new Map<string, ResolvedImage>();
  const uniqueIndices = [...uniqueByKey.values()];
  const resolvedUnique: ResolvedImage[] = new Array(uniqueIndices.length);

  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < uniqueIndices.length) {
      const slot = cursor++;
      const queryIndex = uniqueIndices[slot];
      resolvedUnique[slot] = await resolveVehicleImage(queries[queryIndex]);
    }
  };

  const pool = Array.from(
    { length: Math.min(concurrency, uniqueIndices.length) },
    () => worker(),
  );
  await Promise.all(pool);

  for (let s = 0; s < uniqueIndices.length; s++) {
    uniqueResults.set(keys[uniqueIndices[s]], resolvedUnique[s]);
  }

  return keys.map((k) => uniqueResults.get(k) ?? fallback());
}

export async function clearImageCache(): Promise<void> {
  await imageCacheRepository.clear();
}
