import { IUser } from '../../types';
import { IUserRepository } from '../types';
import { fromIUser, toIUser } from '../../db/mappers';
import { UserModel } from '../../db/models';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? toIUser(doc) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    }).lean();
    return doc ? toIUser(doc) : null;
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<IUser | null> {
    const now = new Date().toISOString();
    const doc = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: now },
    }).lean();
    return doc ? toIUser(doc) : null;
  }

  async create(user: IUser): Promise<IUser> {
    const doc = await UserModel.create(fromIUser(user));
    return toIUser(doc.toObject());
  }

  async update(id: string, patch: Partial<IUser>): Promise<IUser | null> {
    const { id: _omit, ...safePatch } = patch;
    void _omit;

    const doc = await UserModel.findByIdAndUpdate(
      id,
      {
        ...safePatch,
        ...(safePatch.email ? { email: safePatch.email.trim().toLowerCase() } : {}),
        updatedAt: new Date().toISOString(),
      },
      { new: true, runValidators: true },
    ).lean();

    return doc ? toIUser(doc) : null;
  }

  async setPasswordReset(
    userId: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async clearPasswordReset(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  async list(): Promise<IUser[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toIUser);
  }

  async count(): Promise<number> {
    return UserModel.countDocuments();
  }
}
