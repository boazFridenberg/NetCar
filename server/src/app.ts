
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, isDev } from './config/env';
import apiRouter from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (isDev) app.use(morgan('dev'));

  app.use('/api', globalLimiter, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
