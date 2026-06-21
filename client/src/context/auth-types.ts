
import { createContext } from 'react';
import type { IUser, LoginInput, RegisterInput } from '@/types';

export interface AuthContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  
  isLoading: boolean;
  login: (input: LoginInput) => Promise<IUser>;
  register: (input: RegisterInput) => Promise<IUser>;
  logout: () => Promise<void>;
  
  updateUser: (user: IUser) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
