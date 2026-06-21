
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  ExternalLink,
  GitCompareArrows,
  Heart,
  KeyRound,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { statsApi } from '@/services';
import { useCountUp } from '@/hooks/useCountUp';
import type { PublicStats } from '@/types';

export function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let active = true;
    statsApi
      .publicStats()
      .then((data) => active && setStats(data))
      .catch(() => {
        
      });
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalog?search=${encodeURIComponent(q)}` : '/catalog');
  };

  const floating = focused || query.length > 0;

  return (
    <div>
      
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="glass-surface inline-flex animate-fade-in items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              רק רכבים חדשים מדגמי 2025 ו-2026
            </span>

            <h1 className="mt-6 animate-fade-in-up text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-6xl">
              מגלים את{' '}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                העלות האמיתית
              </span>{' '}
              של הרכב החדש שלך
            </h1>

            <p className="mx-auto mt-5 max-w-2xl animate-fade-in-up text-base leading-relaxed text-slate-500 sm:text-lg">
              NetCar מחשב עבורך את עלות הבעלות המלאה — דלק או חשמל, אגרת רישוי,
              ירידת ערך, ביטוח ותחזוקה — או{' '}
              <span className="font-semibold text-slate-700">ליסינג תפעולי</span> עם
              הערכת תשלום חודשי וקישורים ישירים לחברות ליסינג, על בסיס נתונים
              רשמיים בזמן אמת ממשרד התחבורה.
            </p>

            
            <form
              onSubmit={submitSearch}
              className="mx-auto mt-9 max-w-xl animate-fade-in-up"
            >
              <div
                className={[
                  'glass-surface-strong group relative flex items-center rounded-full p-1.5 transition-all duration-300',
                  focused ? 'shadow-focus-brand ring-1 ring-brand-400/40' : '',
                ].join(' ')}
              >
                <Search className="ms-3 h-5 w-5 shrink-0 text-slate-400" />
                <div className="relative flex-1">
                  <label
                    htmlFor="hero-search"
                    className={[
                      'pointer-events-none absolute start-3 origin-[right] text-slate-400 transition-all duration-200',
                      floating
                        ? 'top-1.5 text-[11px] font-medium text-brand-600'
                        : 'top-1/2 -translate-y-1/2 text-sm',
                    ].join(' ')}
                  >
                    חפש יצרן, דגם או שנת ייצור (למשל: יונדאי איוניק 5)...
                  </label>
                  <input
                    id="hero-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full bg-transparent px-3 pb-1.5 pt-4 text-sm text-slate-800 outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary shrink-0">
                  חיפוש
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-5 flex animate-fade-in flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <RadioTower className="h-3.5 w-3.5 text-brand-500" />
                עדכון בזמן אמת
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                נתונים רשמיים ממשרד התחבורה
              </span>
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-brand-500" />
                ליסינג תפעולי + קישורים לחברות
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                חישוב שקוף ומדויק
              </span>
            </div>
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="glass-surface-strong grid grid-cols-1 gap-6 rounded-3xl p-6 sm:grid-cols-3 sm:gap-4 sm:p-8">
          <StatBlock
            count={stats?.vehiclesMonitored ?? 16}
            label="דגמי 2025-2026 מעודכנים בזמן אמת"
          />
          <StatBlock
            text="מדויק"
            label="חישוב מדויק של אגרות, דלק וירידת ערך"
            divider
          />
          <StatBlock text="אלפי" label="נתונים רשמיים ממשרד התחבורה" />
        </div>
      </section>

      
      <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="glass-page-card-brand relative overflow-hidden p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100/55 px-3 py-1 text-xs font-bold text-brand-800">
                <KeyRound className="h-3.5 w-3.5" />
                חדש ב-NetCar
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                רכישה או ליסינג? תראו את ההפרש
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                בכל רכב באתר אפשר לראות הערכת{' '}
                <strong className="font-semibold text-slate-800">ליסינג תפעולי</strong>{' '}
                לפי מחירון היצרן — בלי ירידת ערך, עם ביטוח וטיפולים כלולים — ולהשוות
                מול עלות רכישה. מקבלים גם קישורים ישירים לחברות ליסינג מובילות.
              </p>
            </div>
            <Link
              to="/calculator?mode=leasing"
              className="btn-primary shrink-0 justify-center sm:min-w-[200px]"
            >
              למחשבון ליסינג
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            היתרון של NetCar
          </h2>
          <p className="mt-3 text-base text-slate-500">
            כל מה שצריך כדי לבחור את הרכב הבא שלך בראש שקט ובבהירות מלאה.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon={Calculator}
            title="מחשבון שקוף ומדויק"
            description="פירוט מלא של עלות הבעלות — דלק או חשמל, אגרת רישוי, ירידת ערך, ביטוח ותחזוקה — עד לרמת השקלים לכל קילומטר."
          />
          <ValueCard
            icon={KeyRound}
            title="ליסינג תפעולי"
            description="הערכת תשלום חודשי לפי מחירון הרכב, ללא פחת, עם קישורים לאלבר, אלדן, צמה, Sixt ועוד — ישירות מעמוד הרכב ומהמחשבון."
          />
          <ValueCard
            icon={Search}
            title="חיפוש חכם במאגר הרשמי"
            description="סינון קטלוג הרכבים החדשים מדגמי 2025–2026 לפי יצרן, סוג מנוע, מחיר ונפח מנוע — עם מפרט אמיתי ומלא."
          />
          <ValueCard
            icon={GitCompareArrows}
            title="מועדפים והשוואה"
            description="שמרו את הרכבים שאהבתם והציבו אותם זה לצד זה כדי להשוות עלויות תחזוקה, אגרות וניקוד NetCar הכולל."
            badge={<Heart className="h-3.5 w-3.5" />}
          />
        </div>
      </section>
    </div>
  );
}

function StatBlock({
  count,
  text,
  label,
  divider = false,
}: {
  count?: number;
  text?: string;
  label: string;
  divider?: boolean;
}) {
  const animated = useCountUp(count ?? 0);
  const display = count !== undefined ? animated.toLocaleString() : text;
  return (
    <div
      className={[
        'flex animate-fade-in flex-col items-center justify-center text-center',
        divider ? 'sm:border-x sm:border-slate-300/30' : '',
      ].join(' ')}
    >
      <p className="bg-brand-gradient bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
        {display}
      </p>
      <p className="mt-1.5 max-w-[14rem] text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: typeof Calculator;
  title: string;
  description: string;
  badge?: ReactNode;
}) {
  return (
    <article className="card card-hover group p-7">
      <div className="glass-icon-wrap-brand relative mb-5 h-12 w-12 rounded-2xl">
        <Icon className="h-6 w-6" strokeWidth={2} />
        {badge && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </article>
  );
}
