
import { Link } from 'react-router-dom';
import { Quote, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  shake?: boolean;
}

const HIGHLIGHTS = [
  { icon: TrendingDown, text: 'רואים את עלות הבעלות האמיתית עוד לפני הקנייה' },
  { icon: ShieldCheck, text: 'התחברות מאובטחת ברמה בנקאית' },
  { icon: Sparkles, text: 'רק רכבים חדשים מדגמי 2025 ו-2026' },
];

export function AuthShell({ title, subtitle, children, shake = false }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      
      <aside className="relative hidden w-1/2 overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute inset-0 bg-auth-panel-glow opacity-30" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">NetCar</span>
          </Link>
        </div>

        <div className="relative">
          <Quote className="h-9 w-9 text-white/40" />
          <p className="mt-4 max-w-md text-2xl font-semibold leading-snug text-white">
            ״סוף סוף תמונה ברורה של כמה באמת עולה רכב חדש — חודש אחרי חודש,
            קילומטר אחרי קילומטר.״
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} NetCar · מבוסס נתוני data.gov.il
        </p>
      </aside>

      
      <main className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className={`w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="card glass-surface-strong p-7 sm:p-9">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
