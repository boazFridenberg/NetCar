
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { toAppError } from '@/lib/errors';
import { SESSION_EXPIRED_EVENT } from '@/lib/apiClient';
import {
  ToastContext,
  type Toast,
  type ToastOptions,
  type ToastVariant,
} from './toast-types';

const EXIT_MS = 260;
const DEFAULT_DURATION = 5000;

let counter = 0;
const nextId = (): string => `t_${Date.now()}_${counter++}`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, EXIT_MS);
    },
    [clearTimer],
  );

  const notify = useCallback(
    (options: ToastOptions): string => {
      const id = nextId();
      const duration = options.duration ?? DEFAULT_DURATION;
      const toast: Toast = {
        id,
        title: options.title ?? '',
        description: options.description,
        variant: options.variant ?? 'info',
        duration,
        action: options.action,
        leaving: false,
      };

      setToasts((prev) => [toast, ...prev].slice(0, 5));

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const make = useCallback(
    (variant: ToastVariant) =>
      (title: string, description?: string, options?: ToastOptions) =>
        notify({ ...options, title, description, variant }),
    [notify],
  );

  const success = useMemo(() => make('success'), [make]);
  const error = useMemo(() => make('error'), [make]);
  const warning = useMemo(() => make('warning'), [make]);
  const info = useMemo(() => make('info'), [make]);

  const showApiError = useCallback(
    (err: unknown, fallbackTitle = 'אופס, משהו השתבש'): string => {
      const appError = toAppError(err);
      const isValidation = appError.code === 'VALIDATION_ERROR';
      return notify({
        variant: isValidation ? 'warning' : 'error',
        title: isValidation ? 'נא לבדוק את הפרטים שהוזנו' : fallbackTitle,
        description: appError.message,
        duration: 7000,
      });
    },
    [notify],
  );

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      notify({
        variant: 'warning',
        title: 'תוקף ההתחברות פג',
        description: 'יש להתחבר מחדש כדי להמשיך מהמקום שבו הפסקת.',
        duration: 8000,
      });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [notify]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ notify, success, error, warning, info, showApiError, dismiss, clear }),
    [notify, success, error, warning, info, showApiError, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
