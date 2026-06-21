
import { request, requestWithMeta } from '@/lib/apiClient';
import type {
  AdminStats,
  AdminUser,
  AuthPayload,
  ContactMessage,
  ContactMessageInput,
  ICalculation,
  ICalculationInput,
  IUser,
  IVehicle,
  IVehicleQuery,
  LoginInput,
  PageMeta,
  PublicStats,
  RegisterInput,
  UserRole,
  VehicleFilters,
} from '@/types';

export const authApi = {
  register: (input: RegisterInput) =>
    request<AuthPayload>({ method: 'POST', url: '/auth/register', data: input }),

  login: (input: LoginInput) =>
    request<AuthPayload>({ method: 'POST', url: '/auth/login', data: input }),

  logout: () => request<{ message: string }>({ method: 'POST', url: '/auth/logout' }),

  forgotPassword: (email: string) =>
    request<{ message: string }>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    }),

  resetPassword: (input: { token: string; password: string }) =>
    request<{ message: string }>({
      method: 'POST',
      url: '/auth/reset-password',
      data: input,
    }),

  me: () => request<{ user: IUser }>({ method: 'GET', url: '/auth/me' }),
};

export const vehicleApi = {
  list: async (query: IVehicleQuery = {}) => {
    const { data, meta } = await requestWithMeta<IVehicle[]>({
      method: 'GET',
      url: '/vehicles',
      params: query,
    });
    return { items: data, meta: meta as unknown as PageMeta };
  },

  get: (id: string) =>
    request<IVehicle>({ method: 'GET', url: `/vehicles/${id}` }),

  resolveImage: (id: string) =>
    request<{ url: string; source: string }>({
      method: 'GET',
      url: `/vehicles/${id}/image`,
    }),

  filters: () => request<VehicleFilters>({ method: 'GET', url: '/vehicles/filters' }),
};

export const calculatorApi = {
  estimate: (input: ICalculationInput) =>
    request<ICalculation>({
      method: 'POST',
      url: '/calculator/estimate',
      data: input,
    }),
};

export const userApi = {
  favorites: () => request<IVehicle[]>({ method: 'GET', url: '/me/favorites' }),
  addFavorite: (id: string) =>
    request<IUser>({ method: 'POST', url: `/me/favorites/${id}` }),
  removeFavorite: (id: string) =>
    request<IUser>({ method: 'DELETE', url: `/me/favorites/${id}` }),

  comparison: () => request<IVehicle[]>({ method: 'GET', url: '/me/comparison' }),
  addToComparison: (id: string) =>
    request<IUser>({ method: 'POST', url: `/me/comparison/${id}` }),
  removeFromComparison: (id: string) =>
    request<IUser>({ method: 'DELETE', url: `/me/comparison/${id}` }),
};

export const statsApi = {
  publicStats: () => request<PublicStats>({ method: 'GET', url: '/stats' }),
};

export const contactApi = {
  send: (input: ContactMessageInput) =>
    request<{ message: string; id: string }>({
      method: 'POST',
      url: '/contact',
      data: input,
    }),
};

export const adminApi = {
  stats: () => request<AdminStats>({ method: 'GET', url: '/admin/stats' }),

  users: () => request<AdminUser[]>({ method: 'GET', url: '/admin/users' }),

  updateUser: (id: string, body: { fullName: string; email: string }) =>
    request<AdminUser>({ method: 'PATCH', url: `/admin/users/${id}`, data: body }),

  updateRole: (id: string, role: UserRole) =>
    request<AdminUser>({
      method: 'PATCH',
      url: `/admin/users/${id}/role`,
      data: { role },
    }),

  messages: () => request<ContactMessage[]>({ method: 'GET', url: '/admin/messages' }),

  markMessageRead: (id: string, read: boolean) =>
    request<ContactMessage>({
      method: 'PATCH',
      url: `/admin/messages/${id}/read`,
      data: { read },
    }),
};
