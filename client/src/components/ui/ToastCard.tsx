
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Toast, ToastVariant } from '@/context/toast-types';

interface VariantStyle {
  icon: LucideIcon;
  iconWrap: string;
  ring: string;
  accent: string;
}

const VARIANTS: Record<ToastVariant, VariantStyle> = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-brand-50 text-brand-600',
    ring: 'ring-brand-100',
    accent: 'bg-brand-500',
  },
  error: {
    icon: XCircle,
    iconWrap: 'bg-rose-50 text-rose-600',
    ring: 'ring-rose-100',
    accent: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50 text-amber-600',
    ring: 'ring-amber-100',
    accent: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-sky-50 text-sky-600',
    ring: 'ring-sky-100',
    accent: 'bg-sky-500',
  },
};

interface ToastCardProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const style = VARIANTS[toast.variant];
  const Icon = style.icon;
  const isError = toast.variant === 'error';

  const cardClassName = [
    'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden',
    'glass-surface-strong rounded-2xl p-4 pe-3 shadow-toast ring-1',
    style.ring,
    toast.leaving ? 'animate-toast-out' : 'animate-toast-in',
  ].join(' ');

  const content = (
    <>
      
      <span
        aria-hidden
        className={`absolute inset-y-0 start-0 w-1 ${style.accent}`}
      />

      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 break-words text-sm leading-relaxed text-slate-500">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label="סגירת התראה"
        onClick={() => onDismiss(toast.id)}
        className="ms-1 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100/40 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </>
  );

  if (isError) {
    return (
      <div role="alert" aria-live="assertive" className={cardClassName}>
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className={cardClassName}>
      {content}
    </div>
  );
}
