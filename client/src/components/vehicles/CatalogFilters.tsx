
import { RotateCcw } from 'lucide-react';
import { FUEL_GROUPS } from '@/lib/format';

export interface CatalogFilterState {
  search: string;
  make: string;
  fuelGroup: string;
  year: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export const EMPTY_FILTERS: CatalogFilterState = {
  search: '',
  make: '',
  fuelGroup: '',
  year: '',
  minPrice: '',
  maxPrice: '',
  sort: '',
};

export const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'מיון: ברירת מחדל' },
  { value: 'price_asc', label: 'מחיר: מהנמוך לגבוה' },
  { value: 'price_desc', label: 'מחיר: מהגבוה לנמוך' },
  { value: 'year_desc', label: 'שנה: החדש ביותר' },
  { value: 'make_asc', label: 'יצרן: א׳–ת׳' },
];

const YEARS = ['2025', '2026'];

interface CatalogFiltersProps {
  value: CatalogFilterState;
  makes: string[];
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onClear: () => void;
}

function Section({
  title,
  controlId,
  children,
}: {
  title: string;
  controlId?: string;
  children: React.ReactNode;
}) {
  const headingClass = 'mb-3 text-sm font-bold text-slate-900';

  return (
    <div className="border-b border-slate-300/30 py-5 first:pt-0 last:border-b-0 last:pb-0">
      {controlId ? (
        <label htmlFor={controlId} className={headingClass}>
          {title}
        </label>
      ) : (
        <h3 className={headingClass}>{title}</h3>
      )}
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'glass-chip-active' : 'glass-chip'}
    >
      {children}
    </button>
  );
}

export function CatalogFilters({ value, makes, onChange, onClear }: CatalogFiltersProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-900">סינון</h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          ניקוי
        </button>
      </div>

      
      <Section title="יצרן" controlId="catalog-filter-make">
        <select
          id="catalog-filter-make"
          aria-label="יצרן"
          title="יצרן"
          value={value.make}
          onChange={(e) => onChange({ make: e.target.value })}
          className="input-field appearance-none"
        >
          <option value="">כל היצרנים</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Section>

      
      <Section title="סוג מנוע">
        <div className="flex flex-wrap gap-2">
          <Chip active={value.fuelGroup === ''} onClick={() => onChange({ fuelGroup: '' })}>
            הכל
          </Chip>
          {FUEL_GROUPS.map((g) => (
            <Chip
              key={g.id}
              active={value.fuelGroup === g.id}
              onClick={() => onChange({ fuelGroup: g.id })}
            >
              {g.label}
            </Chip>
          ))}
        </div>
      </Section>

      
      <Section title="שנת ייצור">
        <div className="flex flex-wrap gap-2">
          <Chip active={value.year === ''} onClick={() => onChange({ year: '' })}>
            הכל
          </Chip>
          {YEARS.map((y) => (
            <Chip key={y} active={value.year === y} onClick={() => onChange({ year: y })}>
              {y}
            </Chip>
          ))}
        </div>
      </Section>

      
      <Section title="טווח מחיר (₪)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="ממחיר"
            value={value.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="input-field"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="עד מחיר"
            value={value.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="input-field"
          />
        </div>
      </Section>

      
      <Section title="מיון" controlId="catalog-filter-sort">
        <select
          id="catalog-filter-sort"
          aria-label="מיון"
          title="מיון"
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="input-field appearance-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Section>
    </div>
  );
}
