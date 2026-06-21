
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, TriangleAlert, X } from 'lucide-react';
import { vehicleApi } from '@/services';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { fuelGroupToParam } from '@/lib/format';
import {
  CatalogFilters,
  EMPTY_FILTERS,
  type CatalogFilterState,
} from '@/components/vehicles/CatalogFilters';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleGridSkeleton } from '@/components/vehicles/VehicleCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import type { IVehicle, IVehicleQuery, PageMeta } from '@/types';

const PAGE_SIZE = 12;

function readFilters(params: URLSearchParams): CatalogFilterState {
  return {
    search: params.get('search') ?? '',
    make: params.get('make') ?? '',
    fuelGroup: params.get('fuel') ?? '',
    year: params.get('year') ?? '',
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    sort: params.get('sort') ?? '',
  };
}

function buildApiQuery(f: CatalogFilterState, page: number): IVehicleQuery {
  return {
    page,
    pageSize: PAGE_SIZE,
    search: f.search.trim() || undefined,
    make: f.make || undefined,
    fuelTypes: f.fuelGroup ? fuelGroupToParam(f.fuelGroup) : undefined,
    year: f.year ? Number(f.year) : undefined,
    minPrice: f.minPrice ? Number(f.minPrice) : undefined,
    maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
    sort: (f.sort || undefined) as IVehicleQuery['sort'],
  };
}

export function CatalogPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<CatalogFilterState>(() =>
    readFilters(searchParams),
  );
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);

  const [makes, setMakes] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    vehicleApi
      .filters()
      .then((f) => setMakes(f.makes))
      .catch(() => {
        
      });
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    if (filters.make) next.set('make', filters.make);
    if (filters.fuelGroup) next.set('fuel', filters.fuelGroup);
    if (filters.year) next.set('year', filters.year);
    if (filters.minPrice) next.set('min', filters.minPrice);
    if (filters.maxPrice) next.set('max', filters.maxPrice);
    if (filters.sort) next.set('sort', filters.sort);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [filters, page, setSearchParams]);

  const apiQuery = useMemo(() => buildApiQuery(filters, page), [filters, page]);
  const debouncedQuery = useDebouncedValue(apiQuery, 350);
  const queryKey = JSON.stringify(debouncedQuery);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    vehicleApi
      .list(debouncedQuery)
      .then((res) => {
        if (!active) return;
        setVehicles(res.items);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(true);
        toast.showApiError(err, 'טעינת הקטלוג נכשלה');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const handleChange = useCallback((patch: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const total = meta?.total ?? 0;
  const hasActiveFilters =
    filters.make ||
    filters.fuelGroup ||
    filters.year ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          קטלוג רכבים חכם
        </h1>
        <p className="mt-2 text-slate-500">
          כל הרכבים החדשים מדגמי 2025–2026, עם מפרט אמיתי ממשרד התחבורה.
        </p>
      </div>

      
      <div className="mb-6 flex items-center gap-3">
        <div className="glass-surface-strong relative flex flex-1 items-center rounded-full pe-1.5">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" style={{ width: 18, height: 18 }} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange({ search: e.target.value })}
            placeholder="חפש יצרן, דגם או שנת ייצור (למשל: יונדאי איוניק 5)..."
            className="w-full rounded-full border-0 bg-transparent py-3 pe-4 ps-11 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-secondary shrink-0 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          סינון
        </button>
      </div>

      <div className="flex gap-8">
        
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="card sticky top-[4.75rem] p-6">
            <CatalogFilters
              value={filters}
              makes={makes}
              onChange={handleChange}
              onClear={handleClear}
            />
          </div>
        </aside>

        
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              {loading ? 'טוען רכבים…' : `נמצאו ${total} רכבים`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <VehicleGridSkeleton count={PAGE_SIZE} />
            </div>
          ) : error ? (
            <EmptyState
              icon={TriangleAlert}
              title="לא הצלחנו לטעון את הקטלוג"
              description="אירעה תקלה זמנית. נא לנסות שוב בעוד רגע."
              action={
                <button className="btn-primary" onClick={() => goToPage(page)}>
                  נסה שוב
                </button>
              }
            />
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="לא נמצאו רכבים מתאימים"
              description="נסו להסיר חלק מהמסננים או לשנות את טווח המחיר."
              action={
                hasActiveFilters ? (
                  <button className="btn-secondary" onClick={handleClear}>
                    ניקוי כל המסננים
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
              {meta && (
                <div className="mt-10">
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onChange={goToPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 end-0 w-[88%] max-w-sm overflow-y-auto glass-surface-strong p-6 shadow-glass-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">סינון רכבים</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="סגירה"
                className="glass-surface flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CatalogFilters
              value={filters}
              makes={makes}
              onChange={handleChange}
              onClear={handleClear}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-6 w-full justify-center"
            >
              הצג {total} רכבים
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
