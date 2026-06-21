
import {
  DEFAULT_YEARS_HELD,
  DEPRECIATION_RATE,
  ENERGY_RATES,
  INSURANCE,
  INSURANCE_TIERS,
  type InsuranceTier,
  type LeaseTermMonths,
  LICENSING,
  MAINTENANCE_PER_1000KM,
} from '../config/constants';
import {
  FuelType,
  ICalculation,
  ICostBreakdown,
  IVehicle,
  VehicleClass,
} from '../types';
import { estimateOperationalLease } from './leasingService';

const DEFAULT_CONSUMPTION: Record<FuelType, number> = {
  [FuelType.Gasoline]: 6.5,
  [FuelType.Diesel]: 5.5,
  [FuelType.Hybrid]: 4.5,
  [FuelType.PluginHybrid]: 3.0,
  [FuelType.Electric]: 16,
  [FuelType.Unknown]: 6.5,
};

const PRICE_FALLBACK: Record<VehicleClass, number> = {
  [VehicleClass.Mini]: 95_000,
  [VehicleClass.Compact]: 130_000,
  [VehicleClass.Family]: 165_000,
  [VehicleClass.Executive]: 240_000,
  [VehicleClass.SUV]: 210_000,
  [VehicleClass.Luxury]: 420_000,
  [VehicleClass.Commercial]: 150_000,
};

const round = (n: number): number => Math.round(n);

function energyCost(vehicle: IVehicle, annualKm: number): number {
  const consumption =
    vehicle.consumption ?? DEFAULT_CONSUMPTION[vehicle.fuelType];
  const per100 = consumption * (annualKm / 100);

  switch (vehicle.fuelType) {
    case FuelType.Electric:
      return per100 * ENERGY_RATES.electricityPerKwh;
    case FuelType.Diesel:
      return per100 * ENERGY_RATES.dieselPerLitre;
    case FuelType.Hybrid:
    case FuelType.PluginHybrid:
    case FuelType.Gasoline:
    case FuelType.Unknown:
    default:
      return per100 * ENERGY_RATES.petrolPerLitre;
  }
}

function licensingFee(vehicle: IVehicle): number {
  if (vehicle.fuelType === FuelType.Electric) return LICENSING.electricFlat;
  if (
    vehicle.fuelType === FuelType.Hybrid ||
    vehicle.fuelType === FuelType.PluginHybrid
  ) {
    return LICENSING.hybridFlat;
  }
  const litres = (vehicle.engineDisplacementCc ?? 1600) / 1000;
  const over = Math.max(0, litres - 1.6);
  return round(LICENSING.iceBase + over * LICENSING.icePerLitreOver1_6);
}

function depreciation(vehicle: IVehicle): number {
  const price = vehicle.priceIls ?? PRICE_FALLBACK[vehicle.vehicleClass];
  return price * DEPRECIATION_RATE[vehicle.vehicleClass];
}

function maintenance(vehicle: IVehicle, annualKm: number): number {
  const rate = MAINTENANCE_PER_1000KM[vehicle.fuelType];
  return (annualKm / 1000) * rate;
}

export interface CalculateOptions {
  yearsHeld?: number;
  insuranceTier?: InsuranceTier;
  ownershipMode?: 'purchase' | 'leasing';
  leaseTermMonths?: LeaseTermMonths;
}

export function calculateOwnership(
  vehicle: IVehicle,
  annualKm: number,
  options: CalculateOptions = {},
): ICalculation {
  const yearsHeld = options.yearsHeld ?? DEFAULT_YEARS_HELD;
  const insuranceTier = options.insuranceTier ?? 'standard';
  const ownershipMode = options.ownershipMode ?? 'purchase';
  const leaseTermMonths = options.leaseTermMonths ?? 36;

  const label = [vehicle.makeEn || vehicle.make, vehicle.modelEn || vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(' ');

  const energyAnnual = round(energyCost(vehicle, annualKm));

  if (ownershipMode === 'leasing') {
    const lease = estimateOperationalLease(vehicle, annualKm, leaseTermMonths);

    const breakdown: ICostBreakdown = {
      energyAnnual,
      licensingAnnual: 0,
      depreciationAnnual: 0,
      insuranceComprehensive: 0,
      insuranceThirdParty: 0,
      maintenanceAnnual: 0,
      leasingMonthly: lease.monthlyPayment,
      leasingAnnual: lease.annualPayment,
    };

    const annualTotal = breakdown.leasingAnnual! + breakdown.energyAnnual;

    return {
      vehicleId: vehicle.id,
      vehicleLabel: label,
      annualKm,
      yearsHeld,
      ownershipMode: 'leasing',
      leaseTermMonths: lease.termMonths,
      residualValue: lease.residualValue,
      leasingOffers: lease.offers,
      breakdown,
      annualTotal: round(annualTotal),
      monthlyTotal: round(annualTotal / 12),
      costPerKm: Number((annualTotal / annualKm).toFixed(2)),
      currency: 'ILS',
      computedAt: new Date().toISOString(),
    };
  }

  const insurance = INSURANCE[vehicle.vehicleClass];
  const tierMultiplier = INSURANCE_TIERS[insuranceTier] ?? 1;

  const breakdown: ICostBreakdown = {
    energyAnnual,
    licensingAnnual: round(licensingFee(vehicle)),
    depreciationAnnual: round(depreciation(vehicle)),
    insuranceComprehensive: round(insurance.comprehensive * tierMultiplier),
    insuranceThirdParty: insurance.thirdParty,
    maintenanceAnnual: round(maintenance(vehicle, annualKm)),
    leasingMonthly: null,
    leasingAnnual: null,
  };

  const annualTotal =
    breakdown.energyAnnual +
    breakdown.licensingAnnual +
    breakdown.depreciationAnnual +
    breakdown.insuranceComprehensive +
    breakdown.maintenanceAnnual;

  return {
    vehicleId: vehicle.id,
    vehicleLabel: label,
    annualKm,
    yearsHeld,
    ownershipMode: 'purchase',
    breakdown,
    annualTotal: round(annualTotal),
    monthlyTotal: round(annualTotal / 12),
    costPerKm: Number((annualTotal / annualKm).toFixed(2)),
    currency: 'ILS',
    computedAt: new Date().toISOString(),
  };
}
