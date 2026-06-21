import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />;
}

export function FullScreenLoader({ label = 'טוען…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
