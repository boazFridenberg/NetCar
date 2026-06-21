
import {
  IContactMessage,
  IContactMessageInput,
  IRefreshTokenRecord,
  IUser,
  IVehicle,
  IVehicleQuery,
  Paginated,
} from '../types';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByPasswordResetTokenHash(tokenHash: string): Promise<IUser | null>;
  create(user: IUser): Promise<IUser>;
  update(id: string, patch: Partial<IUser>): Promise<IUser | null>;
  setPasswordReset(userId: string, tokenHash: string, expiresAt: string): Promise<void>;
  clearPasswordReset(userId: string): Promise<void>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  list(): Promise<IUser[]>;
  count(): Promise<number>;
}

export interface IVehicleRepository {
  
  replaceAll(vehicles: IVehicle[]): Promise<void>;
  
  upsertMany(vehicles: IVehicle[]): Promise<void>;
  findById(id: string): Promise<IVehicle | null>;
  findManyByIds(ids: string[]): Promise<IVehicle[]>;
  query(q: IVehicleQuery): Promise<Paginated<IVehicle>>;
  distinctMakes(): Promise<string[]>;
  count(): Promise<number>;
  isEmpty(): Promise<boolean>;
}

export interface IRefreshTokenRepository {
  save(record: IRefreshTokenRecord): Promise<void>;
  find(jti: string): Promise<IRefreshTokenRecord | null>;
  revoke(jti: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  purgeExpired(): Promise<void>;
}

export interface CachedImage {
  url: string;
  source: 'wikipedia' | 'google' | 'bing' | 'fallback' | 'cache';
}

export interface IImageCacheRepository {
  get(key: string): Promise<CachedImage | null>;
  set(key: string, image: CachedImage): Promise<void>;
  clear(): Promise<void>;
}

export interface IContactMessageRepository {
  create(input: IContactMessageInput, userId?: string): Promise<IContactMessage>;
  list(): Promise<IContactMessage[]>;
  markRead(id: string, read: boolean): Promise<IContactMessage | null>;
  countUnread(): Promise<number>;
}
