import { IRefreshTokenRecord } from '../../types';
import { IRefreshTokenRepository } from '../types';
import { RefreshTokenModel } from '../../db/models';

export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
  async save(record: IRefreshTokenRecord): Promise<void> {
    await RefreshTokenModel.findByIdAndUpdate(
      record.jti,
      {
        _id: record.jti,
        userId: record.userId,
        expiresAt: record.expiresAt,
        revoked: record.revoked,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async find(jti: string): Promise<IRefreshTokenRecord | null> {
    const doc = await RefreshTokenModel.findById(jti).lean();
    if (!doc) return null;
    return {
      jti: doc._id,
      userId: doc.userId,
      expiresAt: doc.expiresAt,
      revoked: doc.revoked,
    };
  }

  async revoke(jti: string): Promise<void> {
    await RefreshTokenModel.findByIdAndUpdate(jti, { revoked: true });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revoked: false },
      { $set: { revoked: true } },
    );
  }

  async purgeExpired(): Promise<void> {
    await RefreshTokenModel.deleteMany({ expiresAt: { $lt: Date.now() } });
  }
}
