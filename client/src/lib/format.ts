
import { FuelType, VehicleClass } from '@/types';

const FALLBACK_IMAGE = '/assets/vehicle-silhouette.svg';

export const CATALOG_PLACEHOLDER = '/assets/catalog-placeholder.png';

export const DETAIL_IMAGE_FALLBACK = '/assets/vehicle-detail-fallback.png';
export { FALLBACK_IMAGE };

export const FUEL_LABELS: Record<FuelType, string> = {
  [FuelType.Gasoline]: 'בנזין',
  [FuelType.Diesel]: 'דיזל',
  [FuelType.Hybrid]: 'היברידי',
  [FuelType.PluginHybrid]: 'היברידי נטען',
  [FuelType.Electric]: 'חשמלי',
  [FuelType.Unknown]: 'אחר',
};

export const VEHICLE_CLASS_LABELS: Record<VehicleClass, string> = {
  [VehicleClass.Mini]: 'עירוני קטן',
  [VehicleClass.Compact]: 'משפחתי קומפקטי',
  [VehicleClass.Family]: 'משפחתי',
  [VehicleClass.Executive]: 'יוקרה בכירה',
  [VehicleClass.SUV]: 'פנאי שטח (SUV)',
  [VehicleClass.Luxury]: 'יוקרה',
  [VehicleClass.Commercial]: 'מסחרי',
};

export const FUEL_GROUPS: Array<{ id: string; label: string; types: FuelType[] }> = [
  { id: 'electric', label: 'חשמלי', types: [FuelType.Electric] },
  { id: 'hybrid', label: 'היברידי', types: [FuelType.Hybrid, FuelType.PluginHybrid] },
  { id: 'fuel', label: 'בנזין / דיזל', types: [FuelType.Gasoline, FuelType.Diesel] },
];

export function fuelGroupToParam(groupId: string): string | undefined {
  const group = FUEL_GROUPS.find((g) => g.id === groupId);
  return group ? group.types.join(',') : undefined;
}

export function formatPriceILS(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('he-IL').format(value);
}

export function formatConsumption(
  value: number | null | undefined,
  fuel: FuelType,
): string {
  if (value === null || value === undefined) return '—';
  const unit = fuel === FuelType.Electric ? 'קוט״ש/100ק״מ' : 'ליטר/100ק״מ';
  return `${value} ${unit}`;
}

export function formatDrivetrain(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/X/gi, '×');
}

export function formatWeightKg(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value)} ק״ג`;
}

export function formatHeightMm(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value)} מ״מ (גובה)`;
}

export function formatDimensions(
  heightMm: number | null | undefined,
  bodyType?: string,
): string {
  if (heightMm !== null && heightMm !== undefined) return formatHeightMm(heightMm);
  if (bodyType) return bodyType;
  return '—';
}

export function vehicleTitle(make: string, model: string): string {
  return `${make} ${model}`.trim();
}
