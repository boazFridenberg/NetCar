import { Schema, model, models, type InferSchemaType } from 'mongoose';

const RefreshTokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Number, required: true, index: true },
    revoked: { type: Boolean, required: true, default: false, index: true },
  },
  {
    _id: false,
    versionKey: false,
    collection: 'refresh_tokens',
  },
);

RefreshTokenSchema.index({ userId: 1, revoked: 1 });

export type RefreshTokenDoc = InferSchemaType<typeof RefreshTokenSchema> & {
  _id: string;
};

export const RefreshTokenModel =
  models.RefreshToken ??
  model<RefreshTokenDoc>('RefreshToken', RefreshTokenSchema);
