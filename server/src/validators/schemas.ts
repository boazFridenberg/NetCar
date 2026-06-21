
import { z } from 'zod';
import { ANNUAL_KM_BOUNDS } from '../config/constants';
import { FuelType, UserRole } from '../types';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Add at least one lowercase letter')
  .regex(/[A-Z]/, 'Add at least one uppercase letter')
  .regex(/[0-9]/, 'Add at least one number');

export const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: strongPassword,
  fullName: z.string().min(2, 'Please enter your full name').max(80),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Reset token is required'),
  password: strongPassword,
});

export const contactMessageSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  category: z.enum(['bug', 'question', 'feedback', 'other']),
  subject: z.string().trim().min(3, 'Subject is too short').max(120),
  body: z.string().trim().min(10, 'Message is too short').max(4000),
});

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  make: z.string().trim().min(1).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  fuelTypes: z
    .string()
    .optional()
    .transform((s) => {
      if (!s) return undefined;
      const valid = Object.values(FuelType) as string[];
      const arr = s
        .split(',')
        .map((t) => t.trim())
        .filter((t): t is FuelType => valid.includes(t));
      return arr.length > 0 ? arr : undefined;
    }),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minDisplacement: z.coerce.number().nonnegative().optional(),
  maxDisplacement: z.coerce.number().nonnegative().optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().trim().min(1).optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'year_desc', 'make_asc'])
    .optional(),
});

export const calculatorSchema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  annualKm: z.coerce
    .number()
    .int()
    .min(ANNUAL_KM_BOUNDS.min, `Minimum ${ANNUAL_KM_BOUNDS.min} km/year`)
    .max(ANNUAL_KM_BOUNDS.max, `Maximum ${ANNUAL_KM_BOUNDS.max} km/year`),
  yearsHeld: z.coerce.number().int().min(1).max(15).optional(),
  insuranceTier: z.enum(['basic', 'standard', 'premium']).optional(),
  ownershipMode: z.enum(['purchase', 'leasing']).optional(),
  leaseTermMonths: z.coerce
    .number()
    .int()
    .refine((n) => n === 36 || n === 48 || n === 60, 'Lease term must be 36, 48 or 60 months')
    .optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const adminUpdateUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter a full name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
});

export const adminRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type CalculatorDto = z.infer<typeof calculatorSchema>;
