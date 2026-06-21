import type { Filter } from 'mongodb';
import { IVehicle, IVehicleQuery, Paginated } from '../../types';
import { IVehicleRepository } from '../types';
import { fromIVehicle, toIVehicle } from '../../db/mappers';
import { VehicleDoc, VehicleModel } from '../../db/models';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export class MongoVehicleRepository implements IVehicleRepository {
  
  async replaceAll(vehicles: IVehicle[]): Promise<void> {
    if (vehicles.length === 0) {
      await VehicleModel.deleteMany({});
      return;
    }

    const ids = vehicles.map((v) => v.id);
    const bulkOps = vehicles.map((v) => ({
      replaceOne: {
        filter: { _id: v.id },
        replacement: fromIVehicle(v),
        upsert: true,
      },
    }));

    await VehicleModel.bulkWrite(bulkOps, { ordered: false });
    await VehicleModel.deleteMany({ _id: { $nin: ids } });
  }

  async upsertMany(vehicles: IVehicle[]): Promise<void> {
    if (vehicles.length === 0) return;
    await VehicleModel.bulkWrite(
      vehicles.map((v) => ({
        replaceOne: {
          filter: { _id: v.id },
          replacement: fromIVehicle(v),
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async findById(id: string): Promise<IVehicle | null> {
    const doc = await VehicleModel.findById(id).lean();
    return doc ? toIVehicle(doc) : null;
  }

  async findManyByIds(ids: string[]): Promise<IVehicle[]> {
    if (ids.length === 0) return [];
    const docs = await VehicleModel.find({ _id: { $in: ids } }).lean();
    const byId = new Map(docs.map((d) => [d._id, d]));
    return ids
      .map((id) => byId.get(id))
      .filter((d): d is VehicleDoc => Boolean(d))
      .map(toIVehicle);
  }

  async query(q: IVehicleQuery): Promise<Paginated<IVehicle>> {
    const filter = buildVehicleFilter(q);
    const sort = buildVehicleSort(q.sort);
    const pageSize = clamp(q.pageSize ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

    const total = await VehicleModel.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = clamp(q.page ?? 1, 1, totalPages);
    const skip = (page - 1) * pageSize;

    const docs = await VehicleModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean();

    return {
      items: docs.map(toIVehicle),
      meta: { page, pageSize, total, totalPages },
    };
  }

  async distinctMakes(): Promise<string[]> {
    const makes = await VehicleModel.distinct('make');
    return makes
      .filter((m): m is string => Boolean(m))
      .sort((a, b) => a.localeCompare(b, 'he'));
  }

  async count(): Promise<number> {
    return VehicleModel.countDocuments();
  }

  async isEmpty(): Promise<boolean> {
    return (await VehicleModel.estimatedDocumentCount()) === 0;
  }
}

function buildVehicleFilter(q: IVehicleQuery): Filter<VehicleDoc> {
  const and: Filter<VehicleDoc>[] = [];

  if (q.make) {
    const pattern = new RegExp(`^${escapeRegex(q.make.trim())}$`, 'i');
    and.push({ $or: [{ make: pattern }, { makeEn: pattern }] });
  }
  if (q.fuelType) and.push({ fuelType: q.fuelType });
  if (q.fuelTypes && q.fuelTypes.length > 0) {
    and.push({ fuelType: { $in: q.fuelTypes } });
  }
  if (typeof q.year === 'number') and.push({ year: q.year });

  if (typeof q.minPrice === 'number' || typeof q.maxPrice === 'number') {
    const price: Record<string, number> = {};
    if (typeof q.minPrice === 'number') price.$gte = q.minPrice;
    if (typeof q.maxPrice === 'number') price.$lte = q.maxPrice;
    and.push({ priceIls: price });
  }

  if (
    typeof q.minDisplacement === 'number' ||
    typeof q.maxDisplacement === 'number'
  ) {
    const displacement: Record<string, number> = {};
    if (typeof q.minDisplacement === 'number') {
      displacement.$gte = q.minDisplacement;
    }
    if (typeof q.maxDisplacement === 'number') {
      displacement.$lte = q.maxDisplacement;
    }
    and.push({ engineDisplacementCc: displacement });
  }

  if (q.search) {
    const pattern = new RegExp(escapeRegex(q.search.trim()), 'i');
    and.push({
      $or: [
        { make: pattern },
        { model: pattern },
        { makeEn: pattern },
        { modelEn: pattern },
        { trim: pattern },
      ],
    });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { $and: and };
}

function buildVehicleSort(
  sort?: IVehicleQuery['sort'],
): Record<string, 1 | -1> {
  switch (sort) {
    case 'price_asc':
      return { priceIls: 1, make: 1 };
    case 'price_desc':
      return { priceIls: -1, make: 1 };
    case 'year_desc':
      return { year: -1, make: 1 };
    case 'make_asc':
      return { make: 1, model: 1 };
    default:
      return { year: -1, make: 1 };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
