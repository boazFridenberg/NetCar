
import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  
  duration?: number;
  action?: ToastAction;
}

export interface Toast extends Required<Pick<ToastOptions, 'variant' | 'duration'>> {
  id: string;
  title: string;
  description?: string;
  action?: ToastAction;
  leaving: boolean;
}

export interface ToastContextValue {
  notify: (options: ToastOptions) => string;
  success: (title: string, description?: string, options?: ToastOptions) => string;
  error: (title: string, description?: string, options?: ToastOptions) => string;
  warning: (title: string, description?: string, options?: ToastOptions) => string;
  info: (title: string, description?: string, options?: ToastOptions) => string;
  
  showApiError: (err: unknown, fallbackTitle?: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
