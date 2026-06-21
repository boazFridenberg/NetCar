
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { vehicleApi } from '@/services';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatPriceILS, vehicleTitle } from '@/lib/format';
import type { IVehicle } from '@/types';

const BROWSE_PAGE_SIZE = 80;
const SEARCH_PAGE_SIZE = 15;
const MIN_SEARCH_LEN = 2;

interface VehiclePickerProps {
  selected: IVehicle | null;
  onSelect: (vehicle: IVehicle) => void;
  onClear?: () => void;
}

export function VehiclePicker({ selected, onSelect, onClear }: VehiclePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'search' | 'list'>('search');
  const [browseList, setBrowseList] = useState<IVehicle[]>([]);
  const [searchResults, setSearchResults] = useState<IVehicle[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const isSearching = debouncedQuery.length >= MIN_SEARCH_LEN;

  useEffect(() => {
    let active = true;
    setBrowseLoading(true);
    vehicleApi
      .list({ pageSize: BROWSE_PAGE_SIZE, sort: 'make_asc' })
      .then((r) => active && setBrowseList(r.items))
      .catch(() => active && setBrowseList([]))
      .finally(() => active && setBrowseLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);
    vehicleApi
      .list({ search: debouncedQuery, pageSize: SEARCH_PAGE_SIZE })
      .then((r) => active && setSearchResults(r.items))
      .catch(() => active && setSearchResults([]))
      .finally(() => active && setSearchLoading(false));

    return () => {
      active = false;
    };
  }, [debouncedQuery, isSearching]);

  const displayed = isSearching ? searchResults : browseList;

  const pick = useCallback(
    (vehicle: IVehicle) => {
      onSelect(vehicle);
      setQuery('');
      setOpen(false);
    },
    [onSelect],
  );

  const clear = useCallback(() => {
    setQuery('');
    setOpen(false);
    onClear?.();
  }, [onClear]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const comboboxClassName = 'input-field ps-11 pe-10';

  return (
    <div ref={rootRef} className="space-y-3">
      
      <div className="glass-surface flex rounded-xl p-1">
        <button
          type="button"
          onClick={() => setMode('search')}
          className={mode === 'search' ? 'glass-chip-active flex-1 py-2 text-xs font-bold' : 'glass-chip flex-1 py-2 text-xs font-bold'}
        >
          חיפוש
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('list');
            setOpen(false);
            setQuery('');
          }}
          className={mode === 'list' ? 'glass-chip-active flex-1 py-2 text-xs font-bold' : 'glass-chip flex-1 py-2 text-xs font-bold'}
        >
          רשימה
        </button>
      </div>

      {mode === 'search' ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ width: 18, height: 18 }}
            aria-hidden
          />
          {open ? (
            <input
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-label="חיפוש רכב"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => setOpen(true)}
              placeholder="חפשו יצרן, דגם או שנה (למשל: יונדאי ELANTRA)..."
              className={comboboxClassName}
            />
          ) : (
            <input
              type="text"
              role="combobox"
              aria-expanded="false"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-label="חיפוש רכב"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => setOpen(true)}
              placeholder="חפשו יצרן, דגם או שנה (למשל: יונדאי ELANTRA)..."
              className={comboboxClassName}
            />
          )}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="נקה חיפוש"
              className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100/40 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {open && (
            <div
              id={listboxId}
              className="glass-surface-strong absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl p-1.5 shadow-glass-lg"
            >
              {searchLoading || (!isSearching && browseLoading) ? (
                <p role="status" className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  טוען…
                </p>
              ) : displayed.length === 0 ? (
                <p role="status" className="px-3 py-6 text-center text-sm text-slate-500">
                  {isSearching
                    ? 'לא נמצאו רכבים — נסו מונח אחר'
                    : 'הקלידו לפחות 2 תווים לחיפוש, או עברו לרשימה'}
                </p>
              ) : (
                <>
                  <ul role="listbox" aria-label="תוצאות חיפוש רכב">
                    {displayed.map((v) => {
                      const isSelected = selected?.id === v.id;
                      const optionClassName = [
                        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-start transition-colors',
                        isSelected
                          ? 'bg-brand-50/80 text-brand-800'
                          : 'hover:bg-slate-100/60',
                      ].join(' ');

                      return isSelected ? (
                        <li
                          key={v.id}
                          role="option"
                          aria-selected="true"
                          onClick={() => pick(v)}
                          className={optionClassName}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {vehicleTitle(v.make, v.model)}
                              {v.trim ? ` · ${v.trim}` : ''}
                            </span>
                            <span className="text-xs text-slate-500">{v.year}</span>
                          </span>
                          <span className="shrink-0 text-xs font-bold text-slate-600">
                            {formatPriceILS(v.priceIls)}
                          </span>
                        </li>
                      ) : (
                        <li
                          key={v.id}
                          role="option"
                          aria-selected="false"
                          onClick={() => pick(v)}
                          className={optionClassName}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {vehicleTitle(v.make, v.model)}
                              {v.trim ? ` · ${v.trim}` : ''}
                            </span>
                            <span className="text-xs text-slate-500">{v.year}</span>
                          </span>
                          <span className="shrink-0 text-xs font-bold text-slate-600">
                            {formatPriceILS(v.priceIls)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {!isSearching && (
                    <p className="border-t border-slate-300/40 px-3 py-2 text-center text-[11px] text-slate-400">
                      מציג {displayed.length} רכבים · הקלידו לחיפוש מלא
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <select
            value={selected?.id ?? ''}
            aria-label="בחירת רכב מהרשימה"
            onChange={(e) => {
              const id = e.target.value;
              if (!id) {
                clear();
                return;
              }
              const found = browseList.find((v) => v.id === id);
              if (found) pick(found);
              else {
                vehicleApi.get(id).then(pick).catch(() => undefined);
              }
            }}
            className="input-field appearance-none pe-10"
          >
            <option value="">— בחרו רכב —</option>
            {browseList.map((v) => (
              <option key={v.id} value={v.id}>
                {vehicleTitle(v.make, v.model)} · {v.year}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ width: 18, height: 18 }}
            aria-hidden
          />
          {browseLoading && (
            <Loader2
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
              aria-hidden
            />
          )}
        </div>
      )}

      {selected && onClear && (
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-slate-500 transition-colors hover:text-brand-700"
        >
          נקה בחירה
        </button>
      )}
    </div>
  );
}
