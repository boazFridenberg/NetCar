
import { ExternalLink, ShoppingBag } from 'lucide-react';
import type { IVehicle } from '@/types';

interface ImporterBuyLinkProps {
  vehicle: Pick<IVehicle, 'importerName' | 'importerUrl' | 'make'>;
  variant?: 'primary' | 'secondary' | 'inline';
  className?: string;
}

export function ImporterBuyLink({
  vehicle,
  variant = 'secondary',
  className = '',
}: ImporterBuyLinkProps) {
  if (!vehicle.importerUrl) return null;

  const label = vehicle.importerName
    ? `קנה אצל ${vehicle.importerName}`
    : 'קנה אצל היבואן הרשמי';

  const classes =
    variant === 'primary'
      ? 'btn-primary w-full justify-center py-3.5 text-base'
      : variant === 'inline'
        ? 'inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800'
        : 'glass-action-btn w-full justify-center';

  return (
    <a
      href={vehicle.importerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${classes} ${className}`.trim()}
    >
      {variant === 'inline' ? (
        <ExternalLink className="h-4 w-4" />
      ) : (
        <ShoppingBag className="h-4 w-4" />
      )}
      {label}
      {variant !== 'inline' && <ExternalLink className="h-3.5 w-3.5 opacity-70" />}
    </a>
  );
}

export function ImporterSpecValue({
  vehicle,
}: {
  vehicle: Pick<IVehicle, 'importerName' | 'importerUrl'>;
}) {
  if (!vehicle.importerName) return <>—</>;

  if (!vehicle.importerUrl) return <>{vehicle.importerName}</>;

  return (
    <a
      href={vehicle.importerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-brand-700 transition-colors hover:text-brand-800"
    >
      {vehicle.importerName}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
