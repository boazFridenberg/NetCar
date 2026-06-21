
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Fuel, Gauge, Zap } from 'lucide-react';
import { FUEL_LABELS, formatPriceILS, vehicleTitle } from '@/lib/format';
import { ImporterBuyLink } from '@/components/vehicles/ImporterBuyLink';
import { FuelType, type IVehicle } from '@/types';

import { CATALOG_PLACEHOLDER } from '@/lib/format';

export function VehicleCard({ vehicle }: { vehicle: IVehicle }) {
  const isElectric = vehicle.fuelType === FuelType.Electric;

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link to={`/vehicles/${vehicle.id}`} className="block overflow-hidden">
        <img
          src={CATALOG_PLACEHOLDER}
          alt={`${vehicleTitle(vehicle.make, vehicle.model)} — לחצו לצפייה בפרטי הרכב`}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              isElectric ? 'glass-badge-brand' : 'glass-badge',
            ].join(' ')}
          >
            {isElectric ? <Zap className="h-3.5 w-3.5" /> : <Fuel className="h-3.5 w-3.5" />}
            {FUEL_LABELS[vehicle.fuelType]}
          </span>
          <span className="glass-badge inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {vehicle.year}
          </span>
          {vehicle.enginePowerHp ? (
            <span className="glass-badge inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.enginePowerHp} כ״ס
            </span>
          ) : null}
        </div>

        
        <h3 className="text-lg font-bold leading-tight text-slate-900">
          {vehicleTitle(vehicle.make, vehicle.model)}
        </h3>
        {vehicle.trim && (
          <p className="mt-0.5 truncate text-sm text-slate-500">{vehicle.trim}</p>
        )}

        
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-400">מחיר מחירון משוער</p>
          <p className="text-xl font-extrabold text-slate-900">
            {formatPriceILS(vehicle.priceIls)}
          </p>
        </div>

        
        <Link
          to={`/vehicles/${vehicle.id}`}
          className="btn-primary mt-5 w-full justify-center"
        >
          לפרטים וחישוב עלויות
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>

        {vehicle.importerUrl && (
          <ImporterBuyLink vehicle={vehicle} variant="secondary" className="mt-2" />
        )}
      </div>
    </article>
  );
}
