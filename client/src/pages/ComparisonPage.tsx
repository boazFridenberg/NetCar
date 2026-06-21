
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, GitCompareArrows, Trash2 } from 'lucide-react';
import { calculatorApi, userApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { FullScreenLoader } from '@/components/ui/Spinner';
import { FUEL_LABELS, formatPriceILS, vehicleTitle } from '@/lib/format';
import type { ICalculation, IVehicle } from '@/types';

const DEFAULT_ANNUAL_KM = 15000;

interface Row {
  label: string;
  emphasize?: boolean;
  get: (v: IVehicle, e?: ICalculation) => string;
}

const ROWS: Row[] = [
  { label: 'מחיר מחירון', get: (v) => formatPriceILS(v.priceIls) },
  {
    label: 'עלות חודשית נטו',
    emphasize: true,
    get: (_v, e) => (e ? formatPriceILS(e.monthlyTotal) : '—'),
  },
  { label: 'עלות שנתית כוללת', get: (_v, e) => (e ? formatPriceILS(e.annualTotal) : '—') },
  { label: 'דלק / חשמל שנתי', get: (_v, e) => (e ? formatPriceILS(e.breakdown.energyAnnual) : '—') },
  { label: 'אגרת רישוי שנתית', get: (_v, e) => (e ? formatPriceILS(e.breakdown.licensingAnnual) : '—') },
  { label: 'כוח מנוע', get: (v) => (v.enginePowerHp ? `${v.enginePowerHp} כ״ס` : '—') },
  { label: 'סוג מנוע', get: (v) => FUEL_LABELS[v.fuelType] },
  { label: 'ציון בטיחות', get: (v) => (v.safetyRating !== null ? `${v.safetyRating}/8` : '—') },
];

export function ComparisonPage() {
  const toast = useToast();
  const { updateUser } = useAuth();

  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [estimates, setEstimates] = useState<Record<string, ICalculation>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    userApi
      .comparison()
      .then(async (list) => {
        if (!active) return;
        setVehicles(list);
        const results = await Promise.all(
          list.map((v) =>
            calculatorApi
              .estimate({ vehicleId: v.id, annualKm: DEFAULT_ANNUAL_KM })
              .then((r) => [v.id, r] as const)
              .catch(() => null),
          ),
        );
        if (!active) return;
        const map: Record<string, ICalculation> = {};
        for (const entry of results) if (entry) map[entry[0]] = entry[1];
        setEstimates(map);
      })
      .catch((err) => toast.showApiError(err, 'טעינת ההשוואה נכשלה'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bestId = useMemo(() => {
    let best: string | null = null;
    let min = Infinity;
    for (const v of vehicles) {
      const e = estimates[v.id];
      if (e && e.monthlyTotal < min) {
        min = e.monthlyTotal;
        best = v.id;
      }
    }
    return best;
  }, [vehicles, estimates]);

  const remove = useCallback(
    async (id: string) => {
      try {
        const updated = await userApi.removeFromComparison(id);
        updateUser(updated);
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        toast.success('הוסר מההשוואה');
      } catch (err) {
        toast.showApiError(err);
      }
    },
    [toast, updateUser],
  );

  if (loading) return <FullScreenLoader label="טוען השוואה…" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          השוואת רכבים
        </h1>
        <p className="mt-2 text-slate-500">
          השוו עלויות זה לצד זה לפי {DEFAULT_ANNUAL_KM.toLocaleString('he-IL')} ק״מ בשנה. הרכב הזול ביותר מסומן כבחירת NetCar.
        </p>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="אין רכבים בהשוואה"
          description="הוסיפו רכבים להשוואה מתוך עמוד הרכב, ונשווה עבורכם את העלויות בקלות."
          action={
            <Link to="/catalog" className="btn-primary">
              מעבר לקטלוג
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="comparison-grid" data-vehicles={String(vehicles.length)}>
            
            <div className="glass-table-header" />
            {vehicles.map((v) => {
              const isBest = v.id === bestId;
              return (
                <div
                  key={v.id}
                  className={[
                    'relative glass-table-cell p-4',
                    isBest ? 'ring-2 ring-inset ring-brand-500' : '',
                  ].join(' ')}
                >
                  {isBest && (
                    <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      <Award className="h-3 w-3" />
                      בחירת NetCar
                    </span>
                  )}
                  <Link to={`/vehicles/${v.id}`}>
                    <VehicleImage
                      src={v.imageUrl}
                      alt={vehicleTitle(v.make, v.model)}
                      className="aspect-[16/10] w-full rounded-xl"
                    />
                  </Link>
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="mt-3 block text-sm font-bold leading-tight text-slate-900 hover:text-brand-700"
                  >
                    {vehicleTitle(v.make, v.model)}
                  </Link>
                  <p className="text-xs text-slate-400">{v.year}</p>
                  <button
                    type="button"
                    onClick={() => remove(v.id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    הסר
                  </button>
                </div>
              );
            })}

            
            {ROWS.map((row) => (
              <FragmentRow
                key={row.label}
                row={row}
                vehicles={vehicles}
                estimates={estimates}
                bestId={bestId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FragmentRow({
  row,
  vehicles,
  estimates,
  bestId,
}: {
  row: Row;
  vehicles: IVehicle[];
  estimates: Record<string, ICalculation>;
  bestId: string | null;
}) {
  return (
    <>
      <div className="glass-table-header flex items-center px-4 py-3.5 text-xs font-bold text-slate-500">
        {row.label}
      </div>
      {vehicles.map((v) => {
        const isBest = v.id === bestId;
        return (
          <div
            key={v.id}
            className={[
              'flex items-center px-4 py-3.5 text-sm',
              isBest ? 'glass-table-best' : 'glass-table-cell',
              row.emphasize ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700',
              row.emphasize && isBest ? 'text-brand-700' : '',
            ].join(' ')}
          >
            {row.get(v, estimates[v.id])}
          </div>
        );
      })}
    </>
  );
}
