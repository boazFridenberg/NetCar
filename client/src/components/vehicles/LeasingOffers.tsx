
import { ExternalLink, KeyRound } from 'lucide-react';
import { formatNumber, formatPriceILS } from '@/lib/format';
import type { ILeasingOffer } from '@/types';

interface LeasingOffersProps {
  offers: ILeasingOffer[];
  baselineMonthly: number;
  termMonths: number;
  kmPackage: number;
  residualValue?: number;
  compact?: boolean;
}

export function LeasingOffers({
  offers,
  baselineMonthly,
  termMonths,
  kmPackage,
  residualValue,
  compact = false,
}: LeasingOffersProps) {
  if (!offers.length) return null;

  const minOffer = offers[0]?.monthlyPayment ?? baselineMonthly;
  const maxOffer = offers[offers.length - 1]?.monthlyPayment ?? baselineMonthly;

  return (
    <div className={compact ? 'space-y-3' : 'card mt-6 p-6'}>
      {!compact && (
        <>
          <div className="mb-1 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-extrabold text-slate-900">ליסינג תפעולי</h2>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            הערכה ל-{termMonths} חודשים · {formatNumber(kmPackage)} ק״מ בשנה · כולל ביטוח, טיפולים ואגרה
            {residualValue ? ` · ערך שיורי ~${formatPriceILS(residualValue)}` : ''}
          </p>
          <div className="glass-page-card-brand mb-5">
            <p className="text-sm font-semibold text-brand-700">תשלום ליסינג חודשי משוער</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-700">
              {formatPriceILS(baselineMonthly)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              טווח בשוק: {formatPriceILS(minOffer)} – {formatPriceILS(maxOffer)} לפי חברה
            </p>
          </div>
        </>
      )}

      <ul className="space-y-2">
        {offers.map((offer) => (
          <li key={offer.companyId}>
            <a
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-row flex items-center justify-between gap-3 transition-colors hover:bg-slate-100/50"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900">{offer.companyName}</span>
                <span className="text-xs text-slate-500">
                  {formatPriceILS(offer.monthlyPayment)}/חודש · {termMonths} ח׳
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700">
                לפרטים
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      {!compact && (
        <p className="mt-4 text-center text-xs text-slate-400">
          ההערכות מבוססות על מחירון היצרן, ריבית שוק ותנאי ליסינג תפעולי ממוצעים — לא הצעה מחייבת.
        </p>
      )}
    </div>
  );
}
