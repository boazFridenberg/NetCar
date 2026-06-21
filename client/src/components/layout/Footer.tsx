
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const COLUMNS: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'המוצר',
    links: [
      { label: 'קטלוג רכבים', to: '/catalog' },
      { label: 'מחשבון עלויות', to: '/calculator' },
      { label: 'השוואת רכבים', to: '/compare' },
      { label: 'מועדפים', to: '/dashboard' },
    ],
  },
  {
    title: 'החברה',
    links: [
      { label: 'אודות NetCar', to: '/about' },
      { label: 'איך זה עובד', to: '/how-it-works' },
      { label: 'דרושים', to: '/careers' },
      { label: 'עיתונות', to: '/press' },
    ],
  },
  {
    title: 'מידע שימושי',
    links: [
      { label: 'מאגר משרד התחבורה', to: '/gov-registry' },
      { label: 'שיטת החישוב', to: '/calculation-method' },
      { label: 'מרכז עזרה', to: '/help' },
      { label: 'יצירת קשר', to: '/contact' },
    ],
  },
  {
    title: 'מידע משפטי',
    links: [
      { label: 'מדיניות פרטיות', to: '/privacy' },
      { label: 'תנאי שימוש', to: '/terms' },
      { label: 'מדיניות עוגיות', to: '/cookies' },
      { label: 'מקורות הנתונים', to: '/data-sources' },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, label: 'Twitter', to: '/press' },
  { icon: Linkedin, label: 'LinkedIn', to: '/careers' },
  { icon: Github, label: 'GitHub', to: '/contact' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-300/40 glass-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              גלו בדיוק כמה עולה להחזיק רכב חדש — בעזרת נתונים רשמיים בזמן אמת
              ממשרד התחבורה ומחשבון עלויות שקוף ומדויק.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass-surface text-slate-500 transition-all duration-300 hover:text-brand-600"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 transition-colors duration-200 hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-300/30 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} NetCar. כל הזכויות שמורות.
          </p>
          <p className="text-xs text-slate-400">
            נתוני הרכבים מבוססים על מאגר משרד התחבורה (data.gov.il).
          </p>
        </div>
      </div>
    </footer>
  );
}
