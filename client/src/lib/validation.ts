
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'נא להזין כתובת אימייל';
  if (!EMAIL_RE.test(email.trim())) return 'כתובת האימייל אינה תקינה';
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} הוא שדה חובה`;
  return undefined;
}

export function validateFullName(name: string): string | undefined {
  if (!name.trim()) return 'נא להזין שם מלא';
  if (name.trim().length < 2) return 'השם קצר מדי';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'נא להזין סיסמה';
  if (password.length < 8) return 'הסיסמה חייבת להכיל לפחות 8 תווים';
  if (!/[a-z]/.test(password)) return 'נא להוסיף לפחות אות קטנה אחת (a-z)';
  if (!/[A-Z]/.test(password)) return 'נא להוסיף לפחות אות גדולה אחת (A-Z)';
  if (!/[0-9]/.test(password)) return 'נא להוסיף לפחות ספרה אחת';
  return undefined;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
}

export const STRENGTH_LABELS_HE = [
  'חלשה מאוד',
  'חלשה',
  'בינונית',
  'טובה',
  'חזקה',
] as const;

export function scorePassword(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  return { score: clamped };
}
