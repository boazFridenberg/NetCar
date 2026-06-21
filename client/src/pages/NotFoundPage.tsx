import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <div className="glass-page-card flex flex-col items-center text-center">
        <span className="glass-icon-wrap h-16 w-16 rounded-2xl">
          <Compass className="h-8 w-8" strokeWidth={1.8} />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          העמוד הזה לקח פנייה שגויה
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-500">
          העמוד שחיפשתם לא קיים או שהועבר למקום אחר. בואו נחזיר אתכם לכביש.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <ArrowRight className="h-4 w-4" />
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
