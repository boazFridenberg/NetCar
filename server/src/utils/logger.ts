
import { isProd } from '../config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<Level, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

function emit(level: Level, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();

  if (isProd) {
    const line = JSON.stringify({ timestamp, level, message, meta });
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](line);
    return;
  }

  const color = COLORS[level];
  const prefix = `${color}${timestamp} [${level.toUpperCase()}]${RESET}`;
  // eslint-disable-next-line no-console
  const fn = console[level === 'debug' ? 'log' : level];
  if (meta !== undefined) {
    fn(`${prefix} ${message}`, meta);
  } else {
    fn(`${prefix} ${message}`);
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => emit('debug', msg, meta),
  info: (msg: string, meta?: unknown) => emit('info', msg, meta),
  warn: (msg: string, meta?: unknown) => emit('warn', msg, meta),
  error: (msg: string, meta?: unknown) => emit('error', msg, meta),
};
