
import { logger } from './logger';

export interface FetchJsonOptions extends RequestInit {
  
  timeoutMs?: number;
  
  retry?: boolean;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { timeoutMs = 8000, retry = true, ...init } = options;

  const attempt = async (): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = new Error(
          `HTTP ${res.status} ${res.statusText} from ${safeHost(url)}`,
        ) as Error & { status?: number; body?: string };
        err.status = res.status;
        err.body = body.slice(0, 500);
        throw err;
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt();
  } catch (err) {
    const status = (err as { status?: number }).status;
    const transient = status === undefined || status >= 500;
    if (retry && transient) {
      logger.warn(`fetchJson retrying ${safeHost(url)}`, {
        reason: (err as Error).message,
      });
      return attempt();
    }
    throw err;
  }
}

function safeHost(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return 'unknown-host';
  }
}
