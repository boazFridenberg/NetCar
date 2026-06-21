
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageWindow(page: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | '…'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="עימוד">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="העמוד הקודם"
        className="glass-pagination-btn"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className="px-1.5 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={[
              'glass-pagination-btn',
              p === page ? 'glass-pagination-active' : '',
            ].join(' ')}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="העמוד הבא"
        className="glass-pagination-btn"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  );
}
