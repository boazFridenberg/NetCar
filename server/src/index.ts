
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './db/connection';
import { logger } from './utils/logger';
import { ensureAdminBootstrap } from './services/authService';
import { syncCatalog } from './services/catalogService';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  await ensureAdminBootstrap(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  const server = app.listen(env.PORT, () => {
    logger.info(`NetCar API listening on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  syncCatalog().catch((err) =>
    logger.error('Initial catalog warm-up failed', {
      message: (err as Error).message,
    }),
  );

  if (env.CATALOG_SYNC_HOURS > 0) {
    const intervalMs = env.CATALOG_SYNC_HOURS * 60 * 60 * 1000;
    setInterval(() => {
      logger.info('Scheduled catalog re-sync starting…');
      syncCatalog().catch((err) =>
        logger.error('Scheduled catalog sync failed', {
          message: (err as Error).message,
        }),
      );
    }, intervalMs).unref();
  }

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down gracefully…`);
    server.close(async () => {
      try {
        await disconnectDatabase();
        logger.info('HTTP server closed');
        process.exit(0);
      } catch (err) {
        logger.error('Shutdown error', { message: (err as Error).message });
        process.exit(1);
      }
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: (err as Error).message });
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.error('Fatal: failed to start server', {
    message: (err as Error).message,
  });
  process.exit(1);
});
