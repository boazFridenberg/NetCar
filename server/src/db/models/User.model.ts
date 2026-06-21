import { Schema, model, models, type InferSchemaType } from 'mongoose';
import { UserRole } from '../../types';

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.User,
      index: true,
    },
    passwordHash: { type: String, required: true, select: true },
    passwordResetTokenHash: { type: String, default: null, index: true, sparse: true },
    passwordResetExpiresAt: { type: String, default: null },
    favorites: { type: [String], default: [], index: true },
    comparison: { type: [String], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
    collection: 'users',
  },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };

export const UserModel = models.User ?? model<UserDoc>('User', UserSchema);
