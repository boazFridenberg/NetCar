
import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  ImageCacheModel,
  RefreshTokenModel,
  UserModel,
  VehicleModel,
} from './models';

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) return;

  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { message: err.message });
  });

  await mongoose.connect(env.MONGO_URI, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });

  await Promise.all([
    UserModel.syncIndexes(),
    VehicleModel.syncIndexes(),
    RefreshTokenModel.syncIndexes(),
    ImageCacheModel.syncIndexes(),
  ]);

  connected = true;
  logger.info('MongoDB connected', { host: mongoose.connection.host });
}

export async function disconnectDatabase(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
  logger.info('MongoDB connection closed');
}

export function isDatabaseConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}
