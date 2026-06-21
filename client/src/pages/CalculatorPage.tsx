
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calculator as CalcIcon,
  Car,
  FileText,
  Fuel,
  KeyRound,
  ShieldCheck,
  TrendingDown,
  Wrench,
  Zap,
} from 'lucide-react';
import { calculatorApi, vehicleApi } from '@/services';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCountUp } from '@/hooks/useCountUp';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { VehiclePicker } from '@/components/vehicles/VehiclePicker';
import { LeasingOffers } from '@/components/vehicles/LeasingOffers';
import { EmptyState } from '@/components/ui/EmptyState';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { formatNumber, formatPriceILS, vehicleTitle } from '@/lib/format';
import { FuelType, type ICalculation, type IVehicle } from '@/types';

type Tier = 'basic' | 'standard' | 'premium';
type OwnershipMode = 'purchase' | 'leasing';
type LeaseTerm = 36 | 48 | 60;

const LEASE_TERMS: Array<{ months: LeaseTerm; label: string }> = [
  { months: 36, label: '3 שנים' },
  { months: 48, label: '4 שנים' },
  { months: 60, label: '5 שנים' },
];

const KM_MIN = 5000;
const KM_MAX = 60000;
const KM_STEP = 1000;

const TIERS: Array<{ id: Tier; label: string; hint: string }> = [
  { id: 'basic', label: 'חסכוני', hint: 'השתתפות עצמית גבוהה' },
  { id: 'standard', label: 'רגיל', hint: 'כיסוי סטנדרטי' },
  { id: 'premium', label: 'מורחב', hint: 'כיסוי מלא / נהג צעיר' },
];

export function CalculatorPage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [annualKm, setAnnualKm] = useState(15000);
  const [tier, setTier] = useState<Tier>('standard');
  const [ownershipMode, setOwnershipMode] = useState<OwnershipMode>('purchase');
  const [leaseTermMonths, setLeaseTermMonths] = useState<LeaseTerm>(36);
  const [result, setResult] = useState<ICalculation | null>(null);
  const [calculating, setCalculating] = useState(false);

  const selectedId = selectedVehicle?.id ?? '';

  useEffect(() => {
    const id = searchParams.get('vehicle');
    if (!id) return;
    let active = true;
    vehicleApi
      .get(id)
      .then((v) => active && setSelectedVehicle(v))
      .catch(() => active && toast.showApiError(new Error('not found'), 'טעינת הרכב נכשלה'));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParams.get('mode') === 'leasing') {
      setOwnershipMode('leasing');
    }
  }, [searchParams]);

  const debouncedKm = useDebouncedValue(annualKm, 350);

  useEffect(() => {
    if (!selectedId) {
      setResult(null);
      return;
    }
    let active = true;
    setCalculating(true);
    calculatorApi
      .estimate({
        vehicleId: selectedId,
        annualKm: debouncedKm,
        insuranceTier: tier,
        ownershipMode,
        leaseTermMonths: ownershipMode === 'leasing' ? leaseTermMonths : undefined,
      })
      .then((r) => active && setResult(r))
      .catch((err) => {
        if (!active) return;
        setResult(null);
        toast.showApiError(err, 'חישוב העלות נכשל');
      })
      .finally(() => active && setCalculating(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, debouncedKm, tier, ownershipMode, leaseTermMonths]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          מחשבון עלות בעלות
        </h1>
        <p className="mt-2 text-slate-500">
          כמה באמת עולה להחזיק את הרכב? השוו בין רכישה לליסינג תפעולי עם פירוט שקוף.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px,1fr]">
        
        <aside>
          <div className="card sticky top-[4.75rem] p-6">
            
            <label className="mb-2 block text-sm font-bold text-slate-900">בחירת רכב</label>
            <VehiclePicker
              selected={selectedVehicle}
              onSelect={setSelectedVehicle}
              onClear={() => setSelectedVehicle(null)}
            />

            {selectedVehicle && (
              <div className="glass-surface mt-4 flex items-center gap-3 rounded-2xl p-3">
                <VehicleImage
                  src={selectedVehicle.imageUrl}
                  alt={vehicleTitle(selectedVehicle.make, selectedVehicle.model)}
                  className="h-16 w-24 shrink-0 rounded-xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {vehicleTitle(selectedVehicle.make, selectedVehicle.model)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPriceILS(selectedVehicle.priceIls)}
                  </p>
                </div>
              </div>
            )}

            
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-slate-900">סוג החזקה</label>
              <div className="glass-surface flex rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setOwnershipMode('purchase')}
                  className={
                    ownershipMode === 'purchase'
                      ? 'glass-chip-active flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold'
                      : 'glass-chip flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold'
                  }
                >
                  <Car className="h-3.5 w-3.5" />
                  רכישה
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipMode('leasing')}
                  className={
                    ownershipMode === 'leasing'
                      ? 'glass-chip-active flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold'
                      : 'glass-chip flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold'
                  }
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  ליסינג
                </button>
              </div>
            </div>

            {ownershipMode === 'leasing' && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-slate-900">תקופת ליסינג</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEASE_TERMS.map((t) => (
                    <button
                      key={t.months}
                      type="button"
                      onClick={() => setLeaseTermMonths(t.months)}
                      className={
                        leaseTermMonths === t.months ? 'glass-chip-active text-center' : 'glass-chip text-center'
                      }
                    >
                      <span className="block text-sm font-bold">{t.label}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">{t.months} חודשים</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="calculator-annual-km" className="text-sm font-bold text-slate-900">
                  קילומטראז' שנתי
                </label>
                <span className="text-sm font-extrabold text-brand-700" aria-hidden>
                  {formatNumber(annualKm)} ק״מ
                </span>
              </div>
              <input
                id="calculator-annual-km"
                type="range"
                min={KM_MIN}
                max={KM_MAX}
                step={KM_STEP}
                value={annualKm}
                onChange={(e) => setAnnualKm(Number(e.target.value))}
                aria-label="קילומטראז' שנתי"
                title="קילומטראז' שנתי"
                className="netcar-range w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{formatNumber(KM_MIN)}</span>
                <span>{formatNumber(KM_MAX)}</span>
              </div>
            </div>

            
            {ownershipMode === 'purchase' && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-slate-900">
                מדרגת ביטוח (אופציונלי)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={tier === t.id ? 'glass-chip-active text-center' : 'glass-chip text-center'}
                  >
                    <span
                      className={[
                        'block text-sm font-bold',
                        tier === t.id ? 'text-brand-700' : 'text-slate-700',
                      ].join(' ')}
                    >
                      {t.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-slate-400">
                      {t.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            )}
          </div>
        </aside>

        
        <div className="min-w-0">
          {!selectedVehicle ? (
            <EmptyState
              icon={CalcIcon}
              title="בחרו רכב כדי להתחיל"
              description="חפשו רכב לפי יצרן ודגם, או בחרו מהרשימה — ואז התאימו את הקילומטראז' והביטוח."
              action={
                <Link to="/catalog" className="btn-primary">
                  מעבר לקטלוג
                </Link>
              }
            />
          ) : result ? (
            <ResultsDashboard
              result={result}
              vehicle={selectedVehicle}
              loading={calculating}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-64 rounded-2xl sm:col-span-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsDashboard({
  result,
  vehicle,
  loading,
}: {
  result: ICalculation;
  vehicle: IVehicle;
  loading: boolean;
}) {
  const monthly = useCountUp(result.monthlyTotal);
  const annual = useCountUp(result.annualTotal);
  const isElectric = vehicle.fuelType === FuelType.Electric;
  const isLeasing = result.ownershipMode === 'leasing';

  const purchaseRows = [
    {
      icon: isElectric ? Zap : Fuel,
      label: isElectric ? 'חשמל שנתי' : 'דלק שנתי',
      value: result.breakdown.energyAnnual,
      tip: 'מחושב לפי צריכת היצרן והקילומטראז\u05F3 השנתי שהזנת, במחירי האנרגיה העדכניים.',
    },
    {
      icon: FileText,
      label: 'אגרת רישוי',
      value: result.breakdown.licensingAnnual,
      tip: 'אגרת הרישוי הממשלתית, נגזרת מקבוצת הזיהום וסוג ההנעה של הרכב.',
    },
    {
      icon: TrendingDown,
      label: 'ירידת ערך (פחת)',
      value: result.breakdown.depreciationAnnual,
      tip: 'הערכת אובדן הערך השנתי של הרכב לפי המחירון ודרגת הרכב.',
    },
    {
      icon: ShieldCheck,
      label: 'ביטוח מקיף',
      value: result.breakdown.insuranceComprehensive,
      tip: 'פרמיית ביטוח מקיף שנתית משוערת לפי דרגת הרכב ומדרגת הביטוח שבחרת.',
    },
    {
      icon: Wrench,
      label: 'תחזוקה וטיפולים',
      value: result.breakdown.maintenanceAnnual,
      tip: 'טיפולים, צמיגים ובלאי שוטף, נגזר מהקילומטראז\u05F3 השנתי וסוג ההנעה.',
    },
  ];

  const leasingRows = [
    {
      icon: KeyRound,
      label: 'תשלום ליסינג שנתי',
      value: result.breakdown.leasingAnnual ?? 0,
      tip: 'ליסינג תפעולי — כולל ביטוח מקיף, טיפולים, אגרת רישוי ומימון. ללא ירידת ערך (הרכב אינו בבעלותך).',
    },
    {
      icon: isElectric ? Zap : Fuel,
      label: isElectric ? 'חשמל שנתי' : 'דלק שנתי',
      value: result.breakdown.energyAnnual,
      tip: 'דלק/חשמל אינם כלולים בליסינג תפעולי — מחושב בנפרד לפי צריכה וקילומטראז\u05F3.',
    },
  ];

  const rows = isLeasing ? leasingRows : purchaseRows;

  return (
    <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-page-card-brand">
          <p className="text-sm font-semibold text-brand-700">
            {isLeasing ? 'עלות חודשית (ליסינג + אנרגיה)' : 'עלות חודשית נטו'}
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-brand-700 sm:text-5xl">
            {formatPriceILS(monthly)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isLeasing
              ? `ליסינג ${formatPriceILS(result.breakdown.leasingMonthly ?? 0)}/ח׳ + אנרגיה`
              : 'כולל פחת, ביטוח, אגרה, אנרגיה ותחזוקה'}
          </p>
        </div>
        <div className="glass-page-card">
          <p className="text-sm font-semibold text-slate-500">עלות שנתית כוללת</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {formatPriceILS(annual)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            עלות ל-ק״מ: {formatPriceILS(result.costPerKm)} · {formatNumber(result.annualKm)} ק״מ בשנה
          </p>
        </div>
      </div>

      
      <div className="card mt-6 p-6">
        <h2 className="mb-1 text-lg font-extrabold text-slate-900">לאן הכסף הולך?</h2>
        <p className="mb-5 text-sm text-slate-500">
          {isLeasing
            ? 'בליסינג אין ירידת ערך — התשלום החודשי מחליף פחת, ביטוח ותחזוקה.'
            : 'פירוט שנתי שקוף של כל מרכיבי העלות.'}
        </p>

        <ul className="space-y-2">
          {rows.map((row) => {
            const pct = result.annualTotal > 0 ? (row.value / result.annualTotal) * 100 : 0;
            const Icon = row.icon;
            return (
              <li key={row.label} className="glass-row">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="glass-icon-wrap h-9 w-9">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      {row.label}
                      <InfoTooltip text={row.tip} />
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatPriceILS(row.value)}
                  </span>
                </div>
                <div className="cost-bar-track" aria-hidden>
                  <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="h-full w-full">
                    <rect
                      x={100 - pct}
                      y={0}
                      width={pct}
                      height={1}
                      rx={0.5}
                      className="fill-brand-500"
                    />
                  </svg>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-center text-xs text-slate-400">
          ההערכות מבוססות על מחירי שוק ממוצעים בישראל ל-2026 ועשויות להשתנות בפועל.
        </p>
      </div>

      {isLeasing && result.leasingOffers && result.breakdown.leasingMonthly !== null && (
        <LeasingOffers
          offers={result.leasingOffers}
          baselineMonthly={result.breakdown.leasingMonthly}
          termMonths={result.leaseTermMonths ?? 36}
          kmPackage={result.leasingOffers[0]?.kmPackage ?? 20000}
          residualValue={result.residualValue}
        />
      )}
    </div>
  );
}
