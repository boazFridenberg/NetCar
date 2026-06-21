
import {
  IContactMessageRepository,
  IImageCacheRepository,
  IRefreshTokenRepository,
  IUserRepository,
  IVehicleRepository,
} from './types';
import { MongoUserRepository } from './mongo/userRepository';
import { MongoVehicleRepository } from './mongo/vehicleRepository';
import { MongoRefreshTokenRepository } from './mongo/refreshTokenRepository';
import { MongoImageCacheRepository } from './mongo/imageCacheRepository';
import { MongoContactMessageRepository } from './mongo/contactMessageRepository';

export const userRepository: IUserRepository = new MongoUserRepository();
export const vehicleRepository: IVehicleRepository = new MongoVehicleRepository();
export const refreshTokenRepository: IRefreshTokenRepository =
  new MongoRefreshTokenRepository();
export const imageCacheRepository: IImageCacheRepository =
  new MongoImageCacheRepository();
export const contactMessageRepository: IContactMessageRepository =
  new MongoContactMessageRepository();

export * from './types';
