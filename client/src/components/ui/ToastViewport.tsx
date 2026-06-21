
import { ToastCard } from './ToastCard';
import type { Toast } from '@/context/toast-types';

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:end-6 sm:top-6 sm:items-end sm:px-0"
      aria-label="התראות"
    >
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
