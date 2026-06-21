import { Schema, model, models, type InferSchemaType } from 'mongoose';

const ImageCacheSchema = new Schema(
  {
    _id: { type: String, required: true },
    makeEn: { type: String, required: true, trim: true },
    modelEn: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    url: { type: String, required: true },
    source: {
      type: String,
      enum: ['wikipedia', 'google', 'bing', 'fallback', 'cache'],
      required: true,
    },
    createdAt: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
    collection: 'image_cache',
  },
);

ImageCacheSchema.index({ makeEn: 1, modelEn: 1, year: 1 }, { unique: true });

export type ImageCacheDoc = InferSchemaType<typeof ImageCacheSchema> & {
  _id: string;
};

export const ImageCacheModel =
  models.ImageCache ?? model<ImageCacheDoc>('ImageCache', ImageCacheSchema);
