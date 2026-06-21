
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  Calendar,
  Fuel,
  Gauge,
  GitCompareArrows,
  Heart,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  Wallet,
  Zap,
} from 'lucide-react';
import { calculatorApi, userApi, vehicleApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  DETAIL_IMAGE_FALLBACK,
  FALLBACK_IMAGE,
  FUEL_LABELS,
  VEHICLE_CLASS_LABELS,
  formatConsumption,
  formatDimensions,
  formatDrivetrain,
  formatNumber,
  formatPriceILS,
  formatWeightKg,
  vehicleTitle,
} from '@/lib/format';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { ImporterBuyLink, ImporterSpecValue } from '@/components/vehicles/ImporterBuyLink';
import { LeasingOffers } from '@/components/vehicles/LeasingOffers';
import { EmptyState } from '@/components/ui/EmptyState';
import { FuelType, type ICalculation, type IVehicle } from '@/types';
import type { ReactNode } from 'react';

const DEFAULT_ANNUAL_KM = 15000;

export function VehicleDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [leaseEstimate, setLeaseEstimate] = useState<ICalculation | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  const [favorited, setFavorited] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setImageSrc(null);
    setImageFailed(false);
    setImageLoading(true);
    vehicleApi
      .get(id)
      .then((v) => active && setVehicle(v))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!vehicle) return;

    const cached = vehicle.imageUrl?.trim();
    const hasCachedPhoto =
      cached &&
      cached !== FALLBACK_IMAGE &&
      vehicle.imageSource !== 'fallback';

    if (hasCachedPhoto) {
      setImageSrc(cached);
      setImageFailed(false);
      setImageLoading(false);
      return;
    }

    setImageSrc(null);
    setImageFailed(false);
    setImageLoading(true);
    let active = true;
    vehicleApi
      .resolveImage(id)
      .then(({ url, source }) => {
        if (!active) return;
        if (source !== 'fallback' && url && url !== FALLBACK_IMAGE) {
          setImageSrc(url);
          setImageFailed(false);
        } else {
          setImageFailed(true);
        }
      })
      .catch(() => {
        if (active) setImageFailed(true);
      })
      .finally(() => {
        if (active) setImageLoading(false);
      });
    return () => {
      active = false;
    };
  }, [vehicle, id]);

  useEffect(() => {
    if (!vehicle) return;
    let active = true;
    calculatorApi
      .estimate({ vehicleId: vehicle.id, annualKm: DEFAULT_ANNUAL_KM })
      .then((r) => active && setMonthly(r.monthlyTotal))
      .catch(() => {
        
      });
    return () => {
      active = false;
    };
  }, [vehicle]);

  useEffect(() => {
    if (!vehicle) return;
    let active = true;
    calculatorApi
      .estimate({
        vehicleId: vehicle.id,
        annualKm: DEFAULT_ANNUAL_KM,
        ownershipMode: 'leasing',
        leaseTermMonths: 36,
      })
      .then((r) => active && setLeaseEstimate(r))
      .catch(() => active && setLeaseEstimate(null));
    return () => {
      active = false;
    };
  }, [vehicle]);

  useEffect(() => {
    setFavorited(user?.favorites.includes(id) ?? false);
    setInCompare(user?.comparison.includes(id) ?? false);
  }, [user, id]);

  const requireAuth = useCallback((): boolean => {
    if (isAuthenticated) return true;
    toast.info('נדרשת התחברות', 'יש להתחבר כדי לשמור ולהשוות רכבים.');
    navigate('/login', { state: { from: `/vehicles/${id}` } });
    return false;
  }, [isAuthenticated, toast, navigate, id]);

  const toggleFavorite = useCallback(async () => {
    if (!requireAuth()) return;
    try {
      if (favorited) {
        const updated = await userApi.removeFavorite(id);
        updateUser(updated);
        setFavorited(false);
        toast.success('הוסר מהמועדפים');
      } else {
        const updated = await userApi.addFavorite(id);
        updateUser(updated);
        setFavorited(true);
        toast.success('נשמר במועדפים', 'הרכב נוסף לאזור האישי שלך.');
      }
    } catch (err) {
      toast.showApiError(err);
    }
  }, [favorited, id, requireAuth, toast, updateUser]);

  const addToCompare = useCallback(async () => {
    if (!requireAuth()) return;
    if (inCompare) {
      toast.info('כבר בהשוואה', 'הרכב כבר נמצא ברשימת ההשוואה שלך.');
      return;
    }
    try {
      const updated = await userApi.addToComparison(id);
      updateUser(updated);
      setInCompare(true);
      toast.success('נוסף להשוואה', 'אפשר להשוות עד 4 רכבים בו-זמנית.', {
        action: { label: 'למרכז ההשוואה', onClick: () => navigate('/compare') },
      });
    } catch (err) {
      toast.showApiError(err);
    }
  }, [inCompare, id, requireAuth, toast, updateUser, navigate]);

  const goToCalculator = useCallback(() => {
    navigate(`/calculator?vehicle=${id}`);
  }, [navigate, id]);

  const goToLeasingCalculator = useCallback(() => {
    navigate(`/calculator?vehicle=${id}&mode=leasing`);
  }, [navigate, id]);

  if (loading) return <DetailSkeleton />;

  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={TriangleAlert}
          title="הרכב לא נמצא"
          description="ייתכן שהרכב הוסר מהקטלוג או שהקישור שגוי."
          action={
            <Link to="/catalog" className="btn-primary">
              חזרה לקטלוג
            </Link>
          }
        />
      </div>
    );
  }

  const isElectric = vehicle.fuelType === FuelType.Electric;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/catalog" className="font-medium transition-colors hover:text-brand-700">
          קטלוג רכבים
        </Link>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-slate-700">
          {vehicleTitle(vehicle.make, vehicle.model)}
        </span>
      </nav>

      
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {imageLoading ? (
          <div
            className="glass-surface aspect-[16/11] w-full rounded-3xl shadow-glass skeleton"
            aria-label="טוען תמונת רכב"
          />
        ) : (
          <VehicleImage
            src={imageFailed ? DETAIL_IMAGE_FALLBACK : imageSrc}
            alt={vehicleTitle(vehicle.make, vehicle.model)}
            fallback={DETAIL_IMAGE_FALLBACK}
            className="glass-surface aspect-[16/11] w-full rounded-3xl shadow-glass"
          />
        )}

        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone={isElectric ? 'brand' : 'slate'}>
              {isElectric ? <Zap className="h-3.5 w-3.5" /> : <Fuel className="h-3.5 w-3.5" />}
              {FUEL_LABELS[vehicle.fuelType]}
            </Badge>
            <Badge tone="slate">
              <Calendar className="h-3.5 w-3.5" />
              {vehicle.year}
            </Badge>
            <Badge tone="slate">{VEHICLE_CLASS_LABELS[vehicle.vehicleClass]}</Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {vehicleTitle(vehicle.make, vehicle.model)}
          </h1>
          {vehicle.trim && <p className="mt-1 text-lg text-slate-500">{vehicle.trim}</p>}

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-400">מחיר מחירון משוער</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatPriceILS(vehicle.priceIls)}
            </p>
          </div>

          
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <QuickStat
              icon={Wallet}
              label="מחיר"
              value={formatPriceILS(vehicle.priceIls)}
            />
            <QuickStat
              icon={Calculator}
              label="עלות חודשית ב-NetCar"
              value={monthly !== null ? `${formatNumber(monthly)} ₪` : '—'}
              highlight
            />
            <QuickStat
              icon={isElectric ? Zap : Fuel}
              label={isElectric ? 'צריכת חשמל' : 'צריכת דלק'}
              value={formatConsumption(vehicle.consumption, vehicle.fuelType)}
            />
            <QuickStat
              icon={ShieldCheck}
              label="ציון בטיחות"
              value={vehicle.safetyRating !== null ? `${vehicle.safetyRating}/8` : '—'}
            />
          </div>

          
          <div className="mt-7 space-y-3">
            <button onClick={goToCalculator} className="btn-primary w-full justify-center py-3.5 text-base">
              <Calculator className="h-5 w-5" />
              מעבר למחשבון העלויות
            </button>
            <ImporterBuyLink vehicle={vehicle} variant="secondary" />
            <button
              onClick={goToLeasingCalculator}
              className="glass-action-btn w-full justify-center py-3"
            >
              חשב ליסינג תפעולי
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addToCompare}
                className={inCompare ? 'glass-action-btn-brand' : 'glass-action-btn'}
              >
                <GitCompareArrows className="h-4 w-4" />
                {inCompare ? 'נמצא בהשוואה' : 'הוסף להשוואה'}
              </button>
              <button
                onClick={toggleFavorite}
                className={favorited ? 'glass-action-btn-rose' : 'glass-action-btn'}
              >
                <Heart className={`h-4 w-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                {favorited ? 'שמור במועדפים ✓' : 'שמור במועדפים'}
              </button>
            </div>
          </div>
        </div>
      </section>

      
      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-slate-900">
          מפרט טכני מלא
        </h2>
        <div className="card overflow-hidden">
          <dl className="spec-grid grid grid-cols-1 sm:grid-cols-2">
            <SpecRow label="יצרן" value={vehicle.make} />
            <SpecRow
              label="יבואן רשמי"
              value={<ImporterSpecValue vehicle={vehicle} />}
            />
            <SpecRow label="דגם" value={vehicle.model} />
            <SpecRow label="שנת ייצור" value={vehicle.year} />
            <SpecRow label="סוג מנוע" value={FUEL_LABELS[vehicle.fuelType]} />
            <SpecRow
              label="נפח מנוע"
              value={vehicle.engineDisplacementCc ? `${formatNumber(vehicle.engineDisplacementCc)} סמ״ק` : '—'}
            />
            <SpecRow
              label="כוח סוס"
              value={vehicle.enginePowerHp ? `${vehicle.enginePowerHp} כ״ס` : '—'}
            />
            <SpecRow
              label={isElectric ? 'צריכת חשמל' : 'צריכת דלק'}
              value={formatConsumption(vehicle.consumption, vehicle.fuelType)}
            />
            <SpecRow label="הנעה" value={formatDrivetrain(vehicle.drivetrain)} />
            <SpecRow label="מספר מושבים" value={vehicle.seats ?? '—'} />
            <SpecRow label="מספר דלתות" value={vehicle.doors ?? '—'} />
            <SpecRow label="משקל" value={formatWeightKg(vehicle.weightKg)} />
            <SpecRow label="מידות" value={formatDimensions(vehicle.heightMm, vehicle.bodyType)} />
            <SpecRow
              label="ארץ ייצור"
              value={vehicle.countryOfOrigin || '—'}
              icon={MapPin}
            />
            <SpecRow
              label="רמת זיהום"
              value={vehicle.pollutionLevel !== null ? `${vehicle.pollutionLevel}/15` : '—'}
            />
            <SpecRow
              label="ציון בטיחות"
              value={vehicle.safetyRating !== null ? `${vehicle.safetyRating}/8` : '—'}
              icon={ShieldCheck}
            />
            <SpecRow label="סיווג רכב" value={VEHICLE_CLASS_LABELS[vehicle.vehicleClass]} />
          </dl>
        </div>
      </section>

      {leaseEstimate?.leasingOffers && leaseEstimate.breakdown.leasingMonthly !== null && (
        <LeasingOffers
          offers={leaseEstimate.leasingOffers}
          baselineMonthly={leaseEstimate.breakdown.leasingMonthly}
          termMonths={leaseEstimate.leaseTermMonths ?? 36}
          kmPackage={leaseEstimate.leasingOffers[0]?.kmPackage ?? 20000}
          residualValue={leaseEstimate.residualValue}
        />
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: 'brand' | 'slate'; children: ReactNode }) {
  return (
    <span className={tone === 'brand' ? 'glass-badge-brand' : 'glass-badge'}>
      {children}
    </span>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? 'glass-stat-highlight' : 'glass-stat'}>
      <span
        className={[
          'flex h-9 w-9 items-center justify-center rounded-xl',
          highlight ? 'glass-icon-wrap-brand' : 'glass-icon-wrap',
        ].join(' ')}
      >
        <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      </span>
      <p className="mt-3 text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function SpecRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: typeof Gauge;
}) {
  return (
    <>
      <dt className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </dt>
      <dd className="text-sm font-bold text-slate-900">{value}</dd>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="skeleton mb-6 h-4 w-48 rounded-md" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="skeleton aspect-[16/11] w-full rounded-3xl" />
        <div>
          <div className="skeleton h-7 w-2/3 rounded-md" />
          <div className="skeleton mt-3 h-5 w-1/3 rounded-md" />
          <div className="skeleton mt-6 h-9 w-2/5 rounded-md" />
          <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton mt-7 h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
