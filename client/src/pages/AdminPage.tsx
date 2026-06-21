
import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  Car,
  Calculator,
  Heart,
  Mail,
  MessageSquare,
  Pencil,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { adminApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNumber } from '@/lib/format';
import { validateEmail, validateFullName } from '@/lib/validation';
import {
  UserRole,
  type AdminStats,
  type AdminUser,
  type ContactMessage,
  type EngineGroup,
} from '@/types';

const CONTACT_CATEGORY_LABELS: Record<ContactMessage['category'], string> = {
  bug: 'תקלה',
  question: 'שאלה',
  feedback: 'משוב',
  other: 'אחר',
};

const ENGINE_META: Record<EngineGroup, { label: string; bar: string; fill: string; dot: string }> = {
  electric: { label: 'חשמלי', bar: 'bg-brand-500', fill: 'fill-brand-500', dot: 'bg-brand-500' },
  hybrid: { label: 'היברידי', bar: 'bg-amber-400', fill: 'fill-amber-400', dot: 'bg-amber-400' },
  ice: { label: 'בנזין / דיזל', bar: 'bg-slate-400', fill: 'fill-slate-400', dot: 'bg-slate-400' },
};

const ACTIVITY_LABELS: Record<string, string> = {
  search: 'חיפוש',
  calculation: 'חישוב עלות',
  signup: 'הרשמה',
  login: 'התחברות',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) => toast.showApiError(err, 'טעינת הנתונים נכשלה'))
      .finally(() => setLoadingStats(false));
    adminApi
      .users()
      .then(setUsers)
      .catch((err) => toast.showApiError(err, 'טעינת המשתמשים נכשלה'))
      .finally(() => setLoadingUsers(false));
    adminApi
      .messages()
      .then(setMessages)
      .catch((err) => toast.showApiError(err, 'טעינת ההודעות נכשלה'))
      .finally(() => setLoadingMessages(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markMessageRead = async (msg: ContactMessage, read: boolean) => {
    if (msg.read === read) return;
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read } : m)));
    try {
      const updated = await adminApi.markMessageRead(msg.id, read);
      setMessages((list) => list.map((m) => (m.id === msg.id ? updated : m)));
      setStats((s) =>
        s
          ? {
              ...s,
              totals: {
                ...s.totals,
                unreadMessages: Math.max(0, s.totals.unreadMessages + (read ? -1 : 1)),
              },
            }
          : s,
      );
    } catch (err) {
      setMessages((list) =>
        list.map((m) => (m.id === msg.id ? { ...m, read: msg.read } : m)),
      );
      toast.showApiError(err);
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    if (expandedMessageId === msg.id) {
      setExpandedMessageId(null);
      return;
    }
    setExpandedMessageId(msg.id);
    if (!msg.read) await markMessageRead(msg, true);
  };

  const toggleRole = async (u: AdminUser) => {
    const next = u.role === UserRole.Admin ? UserRole.User : UserRole.Admin;
    if (u.id === currentUser?.id && next !== UserRole.Admin) {
      toast.warning('פעולה חסומה', 'לא ניתן להסיר את הרשאות הניהול מעצמך.');
      return;
    }
    setRoleBusyId(u.id);
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
    try {
      const updated = await adminApi.updateRole(u.id, next);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
      toast.success('תפקיד המשתמש שונה בהצלחה!');
    } catch (err) {
      setUsers((list) => list.map((x) => (x.id === u.id ? u : x)));
      toast.showApiError(err);
    } finally {
      setRoleBusyId(null);
    }
  };

  const handleSaved = (updated: AdminUser) => {
    setUsers((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md">
          <Shield className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            פאנל ניהול מערכת
          </h1>
          <p className="mt-1 text-slate-500">
            מרכז בקרה תפעולי — נתונים, הודעות משתמשים וניהול חשבונות.
          </p>
        </div>
      </div>

      
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loadingStats || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="סה״כ משתמשים רשומים"
              value={stats.totals.users}
              tint="brand"
            />
            <StatCard
              icon={Calculator}
              label="חישובי עלות שבוצעו"
              value={stats.totals.calculations}
              tint="indigo"
            />
            <StatCard
              icon={Heart}
              label="רכבים שמורים במועדפים"
              value={stats.totals.bookmarked}
              tint="rose"
            />
            <StatCard
              icon={Car}
              label="רכבים בקטלוג"
              value={stats.totals.vehicles}
              tint="amber"
            />
          </>
        )}
      </div>

      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="המותגים המבוקשים ביותר בקטלוג" className="lg:col-span-2">
          {loadingStats || !stats ? (
            <BarsSkeleton rows={5} />
          ) : stats.topBrands.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">אין נתונים להצגה.</p>
          ) : (
            <ul className="space-y-3.5">
              {stats.topBrands.map((b) => {
                const max = stats.topBrands[0].count || 1;
                return (
                  <li key={b.make}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{b.make}</span>
                      <span className="font-bold text-slate-500">{b.count}</span>
                    </div>
                    <RatioBar pct={(b.count / max) * 100} fillClass="fill-brand-700" />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="פילוח סוגי מנוע">
          {loadingStats || !stats ? (
            <BarsSkeleton rows={3} />
          ) : (
            <EngineSplit data={stats.engineSplit} />
          )}
        </Panel>
      </div>

      
      <div className="mt-6">
        <Panel
          title="ניהול משתמשים"
          icon={UserCog}
          subtitle="עריכת פרטים ושינוי הרשאות בזמן אמת"
        >
          <UserTable
            users={users}
            loading={loadingUsers}
            currentUserId={currentUser?.id}
            roleBusyId={roleBusyId}
            onEdit={setEditing}
            onToggleRole={toggleRole}
          />
        </Panel>
      </div>

      
      <div className="mt-6">
        <Panel
          title="הודעות ממשתמשים"
          icon={MessageSquare}
          subtitle={
            stats
              ? `${stats.totals.unreadMessages} הודעות שלא נקראו`
              : 'פניות, תקלות ומשוב מהאתר'
          }
        >
          <ContactMessagesPanel
            messages={messages}
            loading={loadingMessages}
            expandedId={expandedMessageId}
            onToggle={openMessage}
            onMarkRead={markMessageRead}
          />
        </Panel>
      </div>

      
      <div className="mt-6">
        <Panel title="פעילות אחרונה" icon={Activity}>
          {loadingStats || !stats ? (
            <BarsSkeleton rows={4} />
          ) : stats.recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">אין פעילות להצגה עדיין.</p>
          ) : (
            <ul className="divide-y divide-white/30">
              {stats.recentActivity.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="glass-badge px-2 py-0.5 text-[11px] font-bold">
                      {ACTIVITY_LABELS[a.type] ?? a.type}
                    </span>
                    <span className="truncate text-sm text-slate-700">{a.detail}</span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Intl.DateTimeFormat('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(a.at))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}

const TINTS: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tint: keyof typeof TINTS;
}) {
  const c = TINTS[tint];
  return (
    <div className="card p-5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        {formatNumber(value)}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  className = '',
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`card p-6 ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        {Icon && (
          <span className="glass-icon-wrap h-8 w-8 rounded-lg">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function RatioBar({ pct, fillClass }: { pct: number; fillClass: string }) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div className="glass-surface h-2.5 w-full overflow-hidden rounded-full" aria-hidden>
      <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="h-full w-full">
        <rect x={100 - width} y={0} width={width} height={1} rx={0.5} className={fillClass} />
      </svg>
    </div>
  );
}

function StackedRatioBar({
  segments,
}: {
  segments: Array<{ key: string; pct: number; fillClass: string }>;
}) {
  let offset = 0;
  return (
    <div className="glass-surface h-3 w-full overflow-hidden rounded-full" aria-hidden>
      <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="h-full w-full">
        {segments.map((segment) => {
          const width = Math.max(0, Math.min(100 - offset, segment.pct));
          const bar = (
            <rect
              key={segment.key}
              x={offset}
              y={0}
              width={width}
              height={1}
              className={segment.fillClass}
            />
          );
          offset += width;
          return bar;
        })}
      </svg>
    </div>
  );
}

function EngineSplit({ data }: { data: AdminStats['engineSplit'] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <div>
      <StackedRatioBar
        segments={data.map((d) => ({
          key: d.group,
          pct: (d.count / total) * 100,
          fillClass: ENGINE_META[d.group].fill,
        }))}
      />
      <ul className="mt-4 space-y-2.5">
        {data.map((d) => (
          <li key={d.group} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${ENGINE_META[d.group].dot}`} />
              <span className="font-medium text-slate-600">{ENGINE_META[d.group].label}</span>
            </span>
            <span className="font-bold text-slate-700">
              {Math.round((d.count / total) * 100)}%{' '}
              <span className="text-xs font-medium text-slate-400">({d.count})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactMessagesPanel({
  messages,
  loading,
  expandedId,
  onToggle,
  onMarkRead,
}: {
  messages: ContactMessage[];
  loading: boolean;
  expandedId: string | null;
  onToggle: (msg: ContactMessage) => void;
  onMarkRead: (msg: ContactMessage, read: boolean) => void;
}) {
  if (loading) return <BarsSkeleton rows={4} />;

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="אין הודעות עדיין"
        description="כשמשתמשים ישלחו פניות מדף יצירת הקשר, הן יופיעו כאן."
      />
    );
  }

  return (
    <ul className="divide-y divide-white/30">
      {messages.map((msg) => {
        const expanded = expandedId === msg.id;
        return (
          <li key={msg.id} className="py-3">
            <button
              type="button"
              onClick={() => onToggle(msg)}
              className="flex w-full items-start justify-between gap-3 text-start"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!msg.read && (
                    <span className="glass-badge-brand px-2 py-0.5 text-[10px] font-bold">
                      חדש
                    </span>
                  )}
                  <span className="glass-badge px-2 py-0.5 text-[10px] font-bold">
                    {CONTACT_CATEGORY_LABELS[msg.category]}
                  </span>
                  <span className="truncate text-sm font-bold text-slate-900">{msg.subject}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {msg.fullName} · {msg.email} · {formatDate(msg.createdAt)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
              <div className="glass-surface mt-3 rounded-2xl p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {msg.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${msg.email}`} className="glass-action-btn text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    השב במייל
                  </a>
                  <button
                    type="button"
                    onClick={() => onMarkRead(msg, !msg.read)}
                    className="glass-chip px-3 py-1.5 text-xs font-semibold"
                  >
                    {msg.read ? 'סמן כלא נקרא' : 'סמן כנקרא'}
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function UserTable({
  users,
  loading,
  currentUserId,
  roleBusyId,
  onEdit,
  onToggleRole,
}: {
  users: AdminUser[];
  loading: boolean;
  currentUserId?: string;
  roleBusyId: string | null;
  onEdit: (u: AdminUser) => void;
  onToggleRole: (u: AdminUser) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="אין משתמשים רשומים"
        description="משתמשים חדשים שיירשמו יופיעו כאן לניהול."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-start">
        <thead>
          <tr className="text-start text-xs font-bold uppercase tracking-wide text-slate-400">
            <th className="border-b border-slate-100 px-4 py-3 text-start">משתמש</th>
            <th className="border-b border-slate-100 px-4 py-3 text-start">הצטרפות</th>
            <th className="border-b border-slate-100 px-4 py-3 text-start">תפקיד</th>
            <th className="border-b border-slate-100 px-4 py-3 text-start">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isAdmin = u.role === UserRole.Admin;
            const isSelf = u.id === currentUserId;
            const busy = roleBusyId === u.id;
            return (
              <tr key={u.id} className="transition-colors hover:bg-slate-100/15">
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
                      {u.fullName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {u.fullName}
                        {isSelf && <span className="ms-1.5 text-xs font-medium text-slate-400">(אתה)</span>}
                      </p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
                  {formatDate(u.createdAt)}
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <span
                    className={[
                      'inline-flex items-center gap-1 text-xs font-bold',
                      isAdmin ? 'glass-badge-brand' : 'glass-badge',
                    ].join(' ')}
                  >
                    {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                    {isAdmin ? 'מנהל מערכת' : 'משתמש רשום'}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(u)}
                      className="glass-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      עריכה
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleRole(u)}
                      disabled={busy || (isSelf && isAdmin)}
                      title={isSelf && isAdmin ? 'לא ניתן לשנות את התפקיד של עצמך' : undefined}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50',
                        isAdmin
                          ? 'glass-chip text-xs font-semibold'
                          : 'btn-primary px-2.5 py-1.5 text-xs',
                      ].join(' ')}
                    >
                      <UserCog className="h-3.5 w-3.5" />
                      {isAdmin ? 'הפוך למשתמש רגיל' : 'הפוך למנהל'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: (u: AdminUser) => void;
}) {
  const toast = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
    };
    setErrors(nextErrors);
    if (nextErrors.fullName || nextErrors.email) {
      triggerShake();
      return;
    }

    setSaving(true);
    try {
      const updated = await adminApi.updateUser(user.id, {
        fullName: fullName.trim(),
        email: email.trim(),
      });
      toast.success('פרטי המשתמש עודכנו בהצלחה!');
      onSaved(updated);
    } catch (err) {
      triggerShake();
      toast.showApiError(err, 'עדכון המשתמש נכשל');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="עריכת פרטי משתמש">
      <form onSubmit={submit} className={`space-y-4 ${shake ? 'animate-shake' : ''}`} noValidate>
        <TextField
          label="שם מלא"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="ישראל ישראלי"
          autoFocus
        />
        <TextField
          label="כתובת אימייל"
          name="email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="name@example.com"
          dir="ltr"
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
            ביטול
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'שומר…' : 'שמור שינויים'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BarsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-6 rounded-md" />
      ))}
    </div>
  );
}
