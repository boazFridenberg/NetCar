
import { scorePassword, STRENGTH_LABELS_HE } from '@/lib/validation';

const BAR_COLORS = [
  'bg-rose-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-brand-500',
];
const TEXT_COLORS = [
  'text-rose-500',
  'text-amber-500',
  'text-yellow-600',
  'text-brand-600',
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score } = scorePassword(password);
  const label = STRENGTH_LABELS_HE[score];
  const filled = Math.max(score, 1);
  const colorIndex = Math.min(filled - 1, 3);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < filled ? BAR_COLORS[colorIndex] : 'bg-slate-200/45'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${TEXT_COLORS[colorIndex]}`}>
        חוזק הסיסמה: {label}
      </p>
    </div>
  );
}
