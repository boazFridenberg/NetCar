
import type {
  IRefreshTokenRecord,
  IContactMessage,
  IUser,
  IVehicle,
  ImageSource,
  UserRole,
} from '../types';
import type { ContactMessageDoc } from './models/ContactMessage.model';
import type { ImageCacheDoc } from './models/ImageCache.model';
import type { RefreshTokenDoc } from './models/RefreshToken.model';
import type { UserDoc } from './models/User.model';
import type { VehicleDoc } from './models/Vehicle.model';

export function toIUser(doc: UserDoc): IUser {
  return {
    id: doc._id,
    email: doc.email,
    fullName: doc.fullName,
    role: doc.role as UserRole,
    passwordHash: doc.passwordHash,
    favorites: doc.favorites ?? [],
    comparison: doc.comparison ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function fromIUser(user: IUser): Omit<UserDoc, '__v'> {
  return {
    _id: user.id,
    email: user.email.toLowerCase(),
    fullName: user.fullName,
    role: user.role,
    passwordHash: user.passwordHash,
    favorites: user.favorites,
    comparison: user.comparison,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toIVehicle(doc: VehicleDoc): IVehicle {
  return {
    id: doc._id,
    make: doc.make,
    model: doc.model,
    makeEn: doc.makeEn,
    modelEn: doc.modelEn,
    trim: doc.trim ?? undefined,
    year: doc.year,
    fuelType: doc.fuelType,
    engineDisplacementCc: doc.engineDisplacementCc ?? null,
    enginePowerHp: doc.enginePowerHp ?? null,
    consumption: doc.consumption ?? null,
    isElectric: doc.isElectric,
    vehicleClass: doc.vehicleClass,
    priceIls: doc.priceIls ?? null,
    seats: doc.seats ?? null,
    doors: doc.doors ?? null,
    countryOfOrigin: doc.countryOfOrigin ?? undefined,
    drivetrain: doc.drivetrain ?? undefined,
    weightKg: doc.weightKg ?? null,
    bodyType: doc.bodyType ?? undefined,
    heightMm: doc.heightMm ?? null,
    safetyRating: doc.safetyRating ?? null,
    pollutionLevel: doc.pollutionLevel ?? null,
    importerName: doc.importerName ?? undefined,
    importerUrl: doc.importerUrl ?? undefined,
    imageUrl: doc.imageUrl,
    imageSource: doc.imageSource as ImageSource,
    raw: doc.raw as Record<string, unknown> | undefined,
  };
}

export function fromIVehicle(vehicle: IVehicle): Omit<VehicleDoc, '__v'> {
  return {
    _id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    makeEn: vehicle.makeEn,
    modelEn: vehicle.modelEn,
    trim: vehicle.trim,
    year: vehicle.year,
    fuelType: vehicle.fuelType,
    engineDisplacementCc: vehicle.engineDisplacementCc,
    enginePowerHp: vehicle.enginePowerHp,
    consumption: vehicle.consumption,
    isElectric: vehicle.isElectric,
    vehicleClass: vehicle.vehicleClass,
    priceIls: vehicle.priceIls,
    seats: vehicle.seats,
    doors: vehicle.doors,
    countryOfOrigin: vehicle.countryOfOrigin,
    drivetrain: vehicle.drivetrain,
    weightKg: vehicle.weightKg,
    bodyType: vehicle.bodyType,
    heightMm: vehicle.heightMm,
    safetyRating: vehicle.safetyRating,
    pollutionLevel: vehicle.pollutionLevel,
    importerName: vehicle.importerName,
    importerUrl: vehicle.importerUrl,
    imageUrl: vehicle.imageUrl,
    imageSource: vehicle.imageSource,
    raw: vehicle.raw,
  };
}

export function toRefreshTokenRecord(doc: RefreshTokenDoc): IRefreshTokenRecord {
  return {
    jti: doc._id,
    userId: doc.userId,
    expiresAt: doc.expiresAt,
    revoked: doc.revoked,
  };
}

export function fromRefreshTokenRecord(
  record: IRefreshTokenRecord,
): Omit<RefreshTokenDoc, '__v'> {
  return {
    _id: record.jti,
    userId: record.userId,
    expiresAt: record.expiresAt,
    revoked: record.revoked,
  };
}

export function parseImageCacheKey(key: string): {
  makeEn: string;
  modelEn: string;
  year: number;
} {
  const [makeEn = '', modelEn = '', yearStr = '0'] = key.split('|');
  return { makeEn, modelEn, year: Number(yearStr) || 0 };
}

export function toCachedImage(doc: ImageCacheDoc): {
  url: string;
  source: ImageSource;
} {
  return { url: doc.url, source: doc.source as ImageSource };
}

export function toIContactMessage(doc: ContactMessageDoc): IContactMessage {
  return {
    id: doc._id,
    userId: doc.userId ?? undefined,
    fullName: doc.fullName,
    email: doc.email,
    category: doc.category,
    subject: doc.subject,
    body: doc.body,
    read: doc.read,
    createdAt: doc.createdAt,
  };
}

export function fromIContactMessage(msg: IContactMessage): Omit<ContactMessageDoc, '__v'> {
  return {
    _id: msg.id,
    userId: msg.userId,
    fullName: msg.fullName,
    email: msg.email.toLowerCase(),
    category: msg.category,
    subject: msg.subject,
    body: msg.body,
    read: msg.read,
    createdAt: msg.createdAt,
  };
}
