
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail, User } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/lib/validation';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
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
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    return !next.fullName && !next.email && !next.password;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({ fullName, email, password });
      toast.success('החשבון נוצר בהצלחה', `ברוכים הבאים ל-NetCar, ${user.fullName.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      triggerShake();
      toast.showApiError(err, 'ההרשמה נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="יצירת חשבון"
      subtitle="התחילו לגלות רכבים חדשים ואת העלות האמיתית שלהם."
      shake={shake}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="שם מלא"
          name="fullName"
          autoComplete="name"
          icon={User}
          placeholder="ישראל ישראלי"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
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
            autoComplete="new-password"
            icon={Lock}
            placeholder="בחרו סיסמה חזקה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              יצירת חשבון
              <ArrowLeft className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs leading-relaxed text-slate-400">
          ביצירת חשבון אתם מאשרים את תנאי השימוש ומדיניות הפרטיות של NetCar.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        כבר יש לכם חשבון?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          התחברות
        </Link>
      </p>
    </AuthShell>
  );
}
