
import { FuelType, VehicleClass } from '../types';

export const ALLOWED_YEARS = [2025, 2026] as const;

export const ENERGY_RATES = {
  
  petrolPerLitre: 7.4,
  
  dieselPerLitre: 7.1,
  
  electricityPerKwh: 0.64,
} as const;

export const LICENSING = {
  electricFlat: 530,
  hybridFlat: 1180,
  iceBase: 1450,
  icePerLitreOver1_6: 850,
} as const;

export const DEPRECIATION_RATE: Record<VehicleClass, number> = {
  [VehicleClass.Mini]: 0.13,
  [VehicleClass.Compact]: 0.15,
  [VehicleClass.Family]: 0.16,
  [VehicleClass.Executive]: 0.19,
  [VehicleClass.SUV]: 0.17,
  [VehicleClass.Luxury]: 0.22,
  [VehicleClass.Commercial]: 0.12,
};

export const INSURANCE: Record<
  VehicleClass,
  { comprehensive: number; thirdParty: number }
> = {
  [VehicleClass.Mini]: { comprehensive: 3200, thirdParty: 1500 },
  [VehicleClass.Compact]: { comprehensive: 3800, thirdParty: 1700 },
  [VehicleClass.Family]: { comprehensive: 4400, thirdParty: 1900 },
  [VehicleClass.Executive]: { comprehensive: 5600, thirdParty: 2300 },
  [VehicleClass.SUV]: { comprehensive: 5200, thirdParty: 2200 },
  [VehicleClass.Luxury]: { comprehensive: 8200, thirdParty: 3000 },
  [VehicleClass.Commercial]: { comprehensive: 4800, thirdParty: 2100 },
};

export const MAINTENANCE_PER_1000KM: Record<FuelType, number> = {
  [FuelType.Gasoline]: 95,
  [FuelType.Diesel]: 110,
  [FuelType.Hybrid]: 80,
  [FuelType.PluginHybrid]: 85,
  [FuelType.Electric]: 55,
  [FuelType.Unknown]: 95,
};

export const INSURANCE_TIERS = {
  basic: 0.85,
  standard: 1,
  premium: 1.25,
} as const;

export type InsuranceTier = keyof typeof INSURANCE_TIERS;

export const DEFAULT_YEARS_HELD = 1;

export const LEASE_BASE_KM = 20_000;

export const LEASE_KM_SURCHARGE_PER_1000 = 42;

export const LEASE_RESIDUAL_BY_CLASS: Record<VehicleClass, number> = {
  [VehicleClass.Mini]: 0.55,
  [VehicleClass.Compact]: 0.52,
  [VehicleClass.Family]: 0.5,
  [VehicleClass.Executive]: 0.46,
  [VehicleClass.SUV]: 0.48,
  [VehicleClass.Luxury]: 0.4,
  [VehicleClass.Commercial]: 0.58,
};

export const LEASE_SERVICE_MONTHLY: Record<VehicleClass, number> = {
  [VehicleClass.Mini]: 880,
  [VehicleClass.Compact]: 980,
  [VehicleClass.Family]: 1080,
  [VehicleClass.Executive]: 1280,
  [VehicleClass.SUV]: 1180,
  [VehicleClass.Luxury]: 1550,
  [VehicleClass.Commercial]: 1050,
};

export const LEASING_ANNUAL_RATE = 0.055;

export const LEASE_TERM_MULTIPLIER: Record<number, number> = {
  36: 1,
  48: 0.88,
  60: 0.78,
};

export const LEASE_TERM_OPTIONS = [36, 48, 60] as const;
export type LeaseTermMonths = (typeof LEASE_TERM_OPTIONS)[number];

export const ANNUAL_KM_BOUNDS = { min: 1000, max: 100_000 } as const;

export const MAX_COMPARISON = 4;
