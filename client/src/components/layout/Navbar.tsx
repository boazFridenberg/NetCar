
import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  GitCompareArrows,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useClickOutside } from '@/hooks/useClickOutside';
import { UserRole } from '@/types';

const NAV_LINKS = [
  { to: '/', label: 'בית', end: true },
  { to: '/catalog', label: 'קטלוג רכבים', end: false },
  { to: '/calculator', label: 'מחשבון עלויות', end: false },
];

function NavItem({ to, label, end, onClick }: { to: string; label: string; end: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => (isActive ? 'glass-nav-link-active' : 'glass-nav-link')}
    >
      {label}
    </NavLink>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('התנתקת בהצלחה', 'נתראה בקרוב!');
      navigate('/');
    } catch {
      toast.error('אירעה שגיאה בהתנתקות', 'נא לנסות שוב.');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-surface flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:bg-slate-100/45"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-sm">
          {initials(user.fullName)}
        </span>
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold text-slate-700 sm:block">
          {user.fullName.split(' ')[0]}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="glass-surface-strong absolute end-0 mt-2.5 w-60 origin-top animate-fade-in rounded-2xl p-2">
          <div className="border-b border-slate-300/40 px-3 py-2.5 text-start">
            <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="py-1.5">
            <DropdownLink to="/dashboard" icon={LayoutDashboard} label="איזור אישי" onClick={() => setOpen(false)} />
            <DropdownLink to="/compare" icon={GitCompareArrows} label="השוואת רכבים" onClick={() => setOpen(false)} />
            {user.role === UserRole.Admin && (
              <DropdownLink to="/admin" icon={Shield} label="ניהול מערכת" onClick={() => setOpen(false)} />
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            התנתקות
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof UserIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-black/[0.04] hover:text-slate-900"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="relative mx-auto max-w-5xl">
        
        <nav className="glass-surface pointer-events-auto flex h-[3.25rem] items-center justify-between rounded-full px-3 sm:px-4">
          <Logo />

          
          <div className="glass-nav-pill absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </div>

          
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-xs">
                  התחברות
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-xs">
                  הרשמה
                </Link>
              </>
            )}
          </div>

          
          {mobileOpen ? (
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/[0.05] md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="סגירת תפריט"
              aria-expanded="true"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/[0.05] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="פתיחת תפריט"
              aria-expanded="false"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </nav>

        
        {mobileOpen && (
          <div className="glass-surface-strong pointer-events-auto mt-2 animate-fade-in overflow-hidden rounded-3xl p-2 md:hidden">
            <div className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-100/60 text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:bg-black/[0.04] hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-1 border-t border-slate-300/40 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-black/[0.04]"
                  >
                    איזור אישי
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                    <Link to="/login" onClick={closeMobile} className="btn-secondary justify-center text-xs">
                      התחברות
                    </Link>
                    <Link to="/register" onClick={closeMobile} className="btn-primary justify-center text-xs">
                      הרשמה
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
