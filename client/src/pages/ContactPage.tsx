
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail, MessageSquare, Send, User } from 'lucide-react';
import { contactApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { TextField } from '@/components/ui/TextField';
import { validateEmail, validateFullName } from '@/lib/validation';
import type { ContactCategory } from '@/types';

const CATEGORIES: Array<{ id: ContactCategory; label: string; hint: string }> = [
  { id: 'bug', label: 'דיווח תקלה', hint: 'משהו לא עובד באתר' },
  { id: 'question', label: 'שאלה', hint: 'עזרה בשימוש ב-NetCar' },
  { id: 'feedback', label: 'משוב', hint: 'הצעה לשיפור' },
  { id: 'other', label: 'אחר', hint: 'כל נושא אחר' },
];

export function ContactPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactCategory>('bug');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    if (nameErr) next.fullName = nameErr;
    if (emailErr) next.email = emailErr;
    if (subject.trim().length < 3) next.subject = 'נא להזין נושא (לפחות 3 תווים)';
    if (body.trim().length < 10) next.body = 'נא לפרט את ההודעה (לפחות 10 תווים)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await contactApi.send({
        fullName: fullName.trim(),
        email: email.trim(),
        category,
        subject: subject.trim(),
        body: body.trim(),
      });
      setSent(true);
      toast.success('ההודעה נשלחה', 'צוות NetCar יקבל את פנייתך ויחזור אליך בהקדם.');
    } catch (err) {
      toast.showApiError(err, 'שליחת ההודעה נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="glass-surface inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-brand-700">
          <MessageSquare className="h-3.5 w-3.5" />
          יצירת קשר
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          דברו איתנו
        </h1>
        <p className="mt-3 text-slate-500">
          מצאתם תקלה? יש שאלה על חישוב או הצעה לשיפור? שלחו הודעה לצוות NetCar —
          האדמין יראה אותה בפאנל הניהול.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">ההודעה נשלחה בהצלחה</h2>
            <p className="mt-2 text-sm text-slate-500">
              תודה שפנית אלינו. נבדוק את הפנייה ונחזור אליך לכתובת{' '}
              <span className="font-semibold text-slate-700">{email}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/" className="btn-secondary justify-center">
                חזרה לדף הבית
              </Link>
              <button
                type="button"
                className="btn-primary justify-center"
                onClick={() => {
                  setSent(false);
                  setSubject('');
                  setBody('');
                }}
              >
                שליחת הודעה נוספת
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="שם מלא"
                name="fullName"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                autoComplete="name"
              />
              <TextField
                label="אימייל"
                name="email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-field">סוג הפנייה</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={category === c.id ? 'glass-chip-active text-center' : 'glass-chip text-center'}
                  >
                    <span className="block text-sm font-bold">{c.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-slate-400">
                      {c.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <TextField
              label="נושא"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
              placeholder="למשל: מחיר לא מוצג בעמוד הרכב"
            />

            <div>
              <label htmlFor="contact-body" className="label-field">
                תוכן ההודעה
              </label>
              <textarea
                id="contact-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="פרטו את הבעיה, השאלה או ההצעה שלכם..."
                className={[
                  'input-field min-h-[140px] resize-y',
                  errors.body ? 'border-rose-300' : '',
                ].join(' ')}
              />
              {errors.body && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.body}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3.5"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {submitting ? 'שולח…' : 'שליחה לצוות NetCar'}
            </button>

            {!user && (
              <p className="text-center text-xs text-slate-400">
                יש לכם חשבון?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                  התחברו
                </Link>{' '}
                כדי לקשר את הפנייה לפרופיל שלכם.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
