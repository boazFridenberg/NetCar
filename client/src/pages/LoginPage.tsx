
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { validateEmail, validateRequired } from '@/lib/validation';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const validate = (): boolean => {
    const next: FieldErrors = {
      email: validateEmail(email),
      password: validateRequired(password, 'סיסמה'),
    };
    setErrors(next);
    return !next.email && !next.password;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ email, password });
      toast.success('ברוך שובך', `טוב לראות אותך, ${user.fullName.split(' ')[0]}.`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      triggerShake();
      toast.showApiError(err, 'ההתחברות נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="ברוך שובך"
      subtitle="התחברו לחשבון ה-NetCar שלכם כדי להמשיך."
      shake={shake}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="אימייל"
          name="email"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <TextField
            label="סיסמה"
            name="password"
            type="password"
            autoComplete="current-password"
            icon={Lock}
            placeholder="הסיסמה שלך"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <div className="mt-2 text-start">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              שכחת סיסמה?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              התחברות
              <ArrowLeft className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        חדשים ב-NetCar?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          יצירת חשבון
        </Link>
      </p>
    </AuthShell>
  );
}
