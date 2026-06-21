import { Schema, model, models, type InferSchemaType } from 'mongoose';
import { FuelType, VehicleClass } from '../../types';

const VehicleSchema = new Schema(
  {
    _id: { type: String, required: true },
    make: { type: String, required: true, index: true },
    model: { type: String, required: true },
    makeEn: { type: String, required: true, index: true },
    modelEn: { type: String, required: true },
    trim: { type: String },
    year: { type: Number, required: true, index: true },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      required: true,
      index: true,
    },
    engineDisplacementCc: { type: Number, default: null },
    enginePowerHp: { type: Number, default: null },
    consumption: { type: Number, default: null },
    isElectric: { type: Boolean, required: true, index: true },
    vehicleClass: {
      type: String,
      enum: Object.values(VehicleClass),
      required: true,
    },
    priceIls: { type: Number, default: null, index: true },
    seats: { type: Number, default: null },
    doors: { type: Number, default: null },
    countryOfOrigin: { type: String },
    drivetrain: { type: String },
    weightKg: { type: Number, default: null },
    bodyType: { type: String },
    heightMm: { type: Number, default: null },
    safetyRating: { type: Number, default: null },
    pollutionLevel: { type: Number, default: null },
    importerName: { type: String },
    importerUrl: { type: String },
    imageUrl: { type: String, required: true },
    imageSource: { type: String, required: true },
    raw: { type: Schema.Types.Mixed },
  },
  {
    _id: false,
    versionKey: false,
    collection: 'vehicles',
  },
);

VehicleSchema.index({ year: 1, fuelType: 1 });
VehicleSchema.index({ make: 1, year: 1 });
VehicleSchema.index({ priceIls: 1, year: 1 });

export type VehicleDoc = InferSchemaType<typeof VehicleSchema> & { _id: string };

export const VehicleModel =
  models.Vehicle ?? model<VehicleDoc>('Vehicle', VehicleSchema);
