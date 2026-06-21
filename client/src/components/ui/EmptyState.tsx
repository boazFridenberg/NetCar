import { SearchX, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = SearchX, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-empty">
      <span className="glass-icon-wrap h-14 w-14 rounded-2xl">
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
