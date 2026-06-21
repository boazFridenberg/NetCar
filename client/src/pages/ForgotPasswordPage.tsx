
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { authApi } from '@/services';
import { useToast } from '@/hooks/useToast';
import { validateEmail } from '@/lib/validation';

export function ForgotPasswordPage() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [sent, setSent] = useState(false);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success(
        'הבקשה נשלחה',
        'אם קיים חשבון המשויך לכתובת זו, יישלח אליו קישור לאיפוס הסיסמה.',
      );
    } catch (err) {
      triggerShake();
      toast.showApiError(err, 'שליחת הבקשה נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="איפוס סיסמה"
      subtitle="הזינו את כתובת האימייל שלכם ונשלח אליכם קישור לאיפוס הסיסמה."
      shake={shake}
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">הבקשה התקבלה</h2>
          <p className="mt-2 text-sm text-slate-500">
            אם קיים חשבון המשויך לכתובת{' '}
            <span className="font-semibold text-slate-700">{email}</span>, יישלח
            אליו קישור לאיפוס הסיסמה בדקות הקרובות. כדאי לבדוק גם בתיקיית
            הספאם.
          </p>
          <Link to="/login" className="btn-primary mt-6 inline-flex w-full justify-center">
            חזרה להתחברות
          </Link>
        </div>
      ) : (
        <>
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
              error={error}
            />

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  שליחת קישור לאיפוס
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            נזכרתם בסיסמה?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              חזרה להתחברות
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
