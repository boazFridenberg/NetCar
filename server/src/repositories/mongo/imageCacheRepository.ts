import { CachedImage, IImageCacheRepository } from '../types';
import { parseImageCacheKey, toCachedImage } from '../../db/mappers';
import { ImageCacheModel } from '../../db/models';

export class MongoImageCacheRepository implements IImageCacheRepository {
  async get(key: string): Promise<CachedImage | null> {
    const doc = await ImageCacheModel.findById(key.toLowerCase()).lean();
    return doc ? toCachedImage(doc) : null;
  }

  async set(key: string, image: CachedImage): Promise<void> {
    const normalizedKey = key.toLowerCase();
    const { makeEn, modelEn, year } = parseImageCacheKey(normalizedKey);

    await ImageCacheModel.findByIdAndUpdate(
      normalizedKey,
      {
        _id: normalizedKey,
        makeEn,
        modelEn,
        year,
        url: image.url,
        source: image.source,
        createdAt: new Date().toISOString(),
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async clear(): Promise<void> {
    await ImageCacheModel.deleteMany({});
  }
}
