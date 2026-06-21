
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, icon: Icon, error, type = 'text', id, className = '', ...props }, ref) {
    const [reveal, setReveal] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && reveal ? 'text' : type;
    const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    const inputClassName = [
      'input-field',
      Icon ? 'ps-11' : '',
      isPassword ? 'pe-11' : '',
      hasError
        ? 'border-rose-300 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]'
        : '',
      className,
    ].join(' ');

    const sharedInputProps = {
      ref,
      id: fieldId,
      type: inputType,
      className: inputClassName,
      ...props,
    };

    return (
      <div className="w-full">
        <label htmlFor={fieldId} className="label-field">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              className={`pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                hasError ? 'text-rose-400' : 'text-slate-400'
              }`}
              style={{ width: 18, height: 18 }}
              aria-hidden
            />
          )}
          {hasError ? (
            <input
              {...sharedInputProps}
              aria-invalid="true"
              aria-describedby={`${fieldId}-error`}
            />
          ) : (
            <input {...sharedInputProps} />
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? 'הסתר סיסמה' : 'הצג סיסמה'}
              className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100/40 hover:text-slate-600"
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {hasError && (
          <p id={`${fieldId}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);
