
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenStore } from './tokenStore';
import type { ApiResponse, RefreshPayload } from '@/types';

export const SESSION_EXPIRED_EVENT = 'netcar:session-expired';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

function resolveApiBaseUrl(): string {
  const origin = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
  if (origin) return `${origin}/api`;
  return '/api';
}

const baseURL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post<ApiResponse<RefreshPayload>>(
    `${baseURL}/auth/refresh`,
    null,
    { withCredentials: true },
  );
  if (!data.success) throw new Error('Refresh failed');
  const token = data.data.accessToken;
  tokenStore.set(token);
  return token;
}

function broadcastSessionExpired(): void {
  tokenStore.clear();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const shouldAttemptRefresh =
      status === 401 &&
      original !== undefined &&
      !original._retry &&
      !original._skipAuthRefresh &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login');

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      refreshPromise = null;
      broadcastSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await api.request<ApiResponse<T>>(config);
  if (!data.success) {
    throw new Error(data.error.message);
  }
  return data.data;
}

export async function requestWithMeta<T>(
  config: AxiosRequestConfig,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { data } = await api.request<ApiResponse<T>>(config);
  if (!data.success) throw new Error(data.error.message);
  return { data: data.data, meta: data.meta };
}
