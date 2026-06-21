
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, SESSION_EXPIRED_EVENT } from '@/lib/apiClient';
import { tokenStore } from '@/lib/tokenStore';
import { authApi } from '@/services';
import type {
  ApiResponse,
  IUser,
  LoginInput,
  RefreshPayload,
  RegisterInput,
} from '@/types';
import { AuthContext } from './auth-types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await api.post<ApiResponse<RefreshPayload>>(
          '/auth/refresh',
        );
        if (data.success) {
          tokenStore.set(data.data.accessToken);
          const { user: me } = await authApi.me();
          if (active) setUser(me);
        }
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<IUser> => {
    const { user: me, accessToken } = await authApi.login(input);
    tokenStore.set(accessToken);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<IUser> => {
    const { user: me, accessToken } = await authApi.register(input);
    tokenStore.set(accessToken);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((next: IUser) => setUser(next), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
