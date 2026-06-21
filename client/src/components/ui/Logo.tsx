
import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';

interface LogoProps {
  
  asLink?: boolean;
  className?: string;
  iconClassName?: string;
}

export function Logo({ asLink = true, className = '', iconClassName = '' }: LogoProps) {
  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-sm ${iconClassName}`}
      >
        <Gauge className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="text-base font-extrabold tracking-tight text-slate-900">
        Net<span className="text-brand-600">Car</span>
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link to="/" aria-label="NetCar דף הבית" className="transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
