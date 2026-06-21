

export enum FuelType {
  Gasoline = 'gasoline',
  Diesel = 'diesel',
  Hybrid = 'hybrid',
  PluginHybrid = 'plugin_hybrid',
  Electric = 'electric',
  Unknown = 'unknown',
}

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum VehicleClass {
  Mini = 'mini',
  Compact = 'compact',
  Family = 'family',
  Executive = 'executive',
  SUV = 'suv',
  Luxury = 'luxury',
  Commercial = 'commercial',
}

export type ImageSource =
  | 'wikipedia'
  | 'google'
  | 'bing'
  | 'fallback'
  | 'cache';

export interface IVehicle {
  id: string;

  make: string;
  model: string;
  makeEn: string;
  modelEn: string;
  trim?: string;

  year: number;

  fuelType: FuelType;
  engineDisplacementCc: number | null;
  enginePowerHp: number | null;
  consumption: number | null;
  isElectric: boolean;

  vehicleClass: VehicleClass;
  priceIls: number | null;

  seats: number | null;
  doors: number | null;
  countryOfOrigin?: string;
  drivetrain?: string;
  weightKg?: number | null;
  bodyType?: string;
  heightMm?: number | null;
  safetyRating: number | null;
  pollutionLevel: number | null;

  importerName?: string;
  importerUrl?: string;

  imageUrl: string;
  imageSource: ImageSource;

  raw?: Record<string, unknown>;
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  favorites: string[];
  comparison: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICalculationInput {
  vehicleId: string;
  annualKm: number;
  yearsHeld?: number;
  insuranceTier?: 'basic' | 'standard' | 'premium';
  ownershipMode?: 'purchase' | 'leasing';
  leaseTermMonths?: 36 | 48 | 60;
}

export interface ILeasingOffer {
  companyId: string;
  companyName: string;
  url: string;
  monthlyPayment: number;
  termMonths: number;
  kmPackage: number;
  includesInsurance: boolean;
  includesMaintenance: boolean;
}

export interface ICostBreakdown {
  energyAnnual: number;
  licensingAnnual: number;
  depreciationAnnual: number;
  insuranceComprehensive: number;
  insuranceThirdParty: number;
  maintenanceAnnual: number;
  leasingMonthly: number | null;
  leasingAnnual: number | null;
}

export interface ICalculation {
  vehicleId: string;
  vehicleLabel: string;
  annualKm: number;
  yearsHeld: number;
  ownershipMode: 'purchase' | 'leasing';
  leaseTermMonths?: number;
  residualValue?: number;
  leasingOffers?: ILeasingOffer[];
  breakdown: ICostBreakdown;
  annualTotal: number;
  monthlyTotal: number;
  costPerKm: number;
  currency: 'ILS';
  computedAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IVehicleQuery {
  page?: number;
  pageSize?: number;
  make?: string;
  fuelType?: FuelType;
  
  fuelTypes?: string;
  minPrice?: number;
  maxPrice?: number;
  minDisplacement?: number;
  maxDisplacement?: number;
  year?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'make_asc';
}

export interface AuthPayload {
  user: IUser;
  accessToken: string;
}

export interface RefreshPayload {
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicStats {
  vehiclesMonitored: number;
  calculationsMade: number;
  driversOnboard: number;
}

export interface VehicleFilters {
  makes: string[];
  fuelTypes: FuelType[];
  sortOptions: Array<IVehicleQuery['sort']>;
}

export type EngineGroup = 'electric' | 'hybrid' | 'ice';

export type ActivityType = 'search' | 'calculation' | 'signup' | 'login';

export interface AdminStats {
  totals: {
    users: number;
    vehicles: number;
    calculations: number;
    bookmarked: number;
    unreadMessages: number;
  };
  topBrands: Array<{ make: string; count: number }>;
  engineSplit: Array<{ group: EngineGroup; count: number }>;
  recentActivity: Array<{ at: string; type: ActivityType; detail: string }>;
  catalog: { lastSyncedAt: string | null };
}

export interface AdminUser extends IUser {
  favoritesCount: number;
  comparisonCount: number;
}

export type ContactCategory = 'bug' | 'question' | 'feedback' | 'other';

export interface ContactMessage {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  category: ContactCategory;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ContactMessageInput {
  fullName: string;
  email: string;
  category: ContactCategory;
  subject: string;
  body: string;
}
