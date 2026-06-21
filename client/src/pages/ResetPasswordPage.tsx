
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { authApi } from '@/services';
import { useToast } from '@/hooks/useToast';
import { validatePassword } from '@/lib/validation';

export function ResetPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nextPasswordError = validatePassword(password);
    let nextConfirmError: string | undefined;
    if (!confirm.trim()) nextConfirmError = 'נא לאשר את הסיסמה';
    else if (password !== confirm) nextConfirmError = 'הסיסמאות אינן תואמות';

    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextPasswordError || nextConfirmError) {
      triggerShake();
      return;
    }

    if (!token) {
      triggerShake();
      toast.error('קישור לא תקין', 'הקישור חסר או פג תוקף. בקשו קישור איפוס חדש.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      toast.success('הסיסמה עודכנה', 'אפשר להתחבר עם הסיסמה החדשה.');
    } catch (err) {
      triggerShake();
      toast.showApiError(err, 'איפוס הסיסמה נכשל');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token && !done) {
    return (
      <AuthShell
        title="קישור לא תקין"
        subtitle="הקישור לאיפוס הסיסמה חסר או שפג תוקפו."
      >
        <div className="text-center">
          <p className="text-sm text-slate-500">
            בקשו קישור חדש מעמוד &quot;שכחתי סיסמה&quot;.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-6 inline-flex w-full justify-center">
            בקשת קישור חדש
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="סיסמה חדשה"
      subtitle="בחרו סיסמה חזקה לחשבון NetCar שלכם."
      shake={shake}
    >
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">הסיסמה עודכנה</h2>
          <p className="mt-2 text-sm text-slate-500">
            אפשר להתחבר עכשיו עם הסיסמה החדשה.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="btn-primary mt-6 inline-flex w-full justify-center"
          >
            מעבר להתחברות
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <TextField
            label="סיסמה חדשה"
            name="password"
            type="password"
            autoComplete="new-password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
          <PasswordStrengthMeter password={password} />

          <TextField
            label="אימות סיסמה"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            icon={Lock}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirmError}
          />

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                שמירת סיסמה חדשה
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              חזרה להתחברות
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
