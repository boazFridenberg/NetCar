import { Info } from 'lucide-react';

export function InfoTooltip({ text, label = 'מידע נוסף' }: { text: string; label?: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="text-slate-400 transition-colors hover:text-brand-600 focus-visible:text-brand-600 focus-visible:outline-none"
      >
        <Info className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full end-0 z-30 mb-2 w-56 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium leading-relaxed text-white opacity-0 shadow-elegant-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
