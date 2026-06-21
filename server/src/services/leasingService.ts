
import {
  LEASE_BASE_KM,
  LEASE_KM_SURCHARGE_PER_1000,
  LEASE_RESIDUAL_BY_CLASS,
  LEASE_SERVICE_MONTHLY,
  LEASE_TERM_MULTIPLIER,
  LEASING_ANNUAL_RATE,
  type LeaseTermMonths,
} from '../config/constants';
import { LEASING_COMPANIES } from '../data/leasingCompanies';
import { FuelType, ILeasingOffer, IVehicle, VehicleClass } from '../types';

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

export interface LeaseEstimate {
  monthlyPayment: number;
  annualPayment: number;
  termMonths: number;
  residualValue: number;
  kmPackage: number;
  offers: ILeasingOffer[];
}

function residualRate(vehicleClass: VehicleClass, termMonths: number): number {
  const base = LEASE_RESIDUAL_BY_CLASS[vehicleClass];
  if (termMonths <= 36) return base;
  if (termMonths <= 48) return Math.min(base + 0.05, 0.65);
  return Math.min(base + 0.08, 0.68);
}

function kmAdjustment(annualKm: number): number {
  const deltaKm = annualKm - LEASE_BASE_KM;
  return (deltaKm / 1000) * LEASE_KM_SURCHARGE_PER_1000;
}

export function estimateOperationalLease(
  vehicle: IVehicle,
  annualKm: number,
  termMonths: LeaseTermMonths = 36,
): LeaseEstimate {
  const price = vehicle.priceIls ?? PRICE_FALLBACK[vehicle.vehicleClass];
  const residual = round(price * residualRate(vehicle.vehicleClass, termMonths));
  const months = termMonths;

  const depreciationFee = (price - residual) / months;
  const moneyFactor = LEASING_ANNUAL_RATE / 24;
  const financeFee = (price + residual) * moneyFactor;
  const serviceFee = LEASE_SERVICE_MONTHLY[vehicle.vehicleClass];

  const termMult = LEASE_TERM_MULTIPLIER[termMonths] ?? 1;
  const baseMonthly = (depreciationFee + financeFee + serviceFee) * termMult + kmAdjustment(annualKm);

  const greenDiscount =
    vehicle.fuelType === FuelType.Electric
      ? 0.94
      : vehicle.fuelType === FuelType.Hybrid || vehicle.fuelType === FuelType.PluginHybrid
        ? 0.97
        : 1;

  const monthlyPayment = round(Math.max(baseMonthly * greenDiscount, price * 0.011));

  const offers: ILeasingOffer[] = LEASING_COMPANIES.map((co) => ({
    companyId: co.id,
    companyName: co.name,
    url: co.url,
    monthlyPayment: round(monthlyPayment * co.rateMultiplier),
    termMonths,
    kmPackage: LEASE_BASE_KM,
    includesInsurance: true,
    includesMaintenance: true,
  })).sort((a, b) => a.monthlyPayment - b.monthlyPayment);

  return {
    monthlyPayment,
    annualPayment: round(monthlyPayment * 12),
    termMonths,
    residualValue: residual,
    kmPackage: LEASE_BASE_KM,
    offers,
  };
}
