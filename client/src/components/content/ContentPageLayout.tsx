
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ContentPageDef } from '@/content/footerPages';

export function ContentPageLayout({ page }: { page: ContentPageDef }) {
  const Icon = page.icon;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="glass-surface inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-brand-700">
          <Icon className="h-3.5 w-3.5" />
          {page.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-500">{page.subtitle}</p>
      </div>

      <article className="card space-y-8 p-6 sm:p-8">
        {page.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="mb-3 text-lg font-bold text-slate-900">{section.heading}</h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="mb-3 text-sm leading-relaxed text-slate-600 last:mb-0">
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-2 space-y-2">
                {section.bullets.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-sm leading-relaxed text-slate-600 before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-brand-500 before:content-['']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {page.cta && (
          <div className="border-t border-slate-300/30 pt-6">
            <Link
              to={page.cta.to}
              className={
                page.cta.variant === 'secondary' ? 'btn-secondary inline-flex' : 'btn-primary inline-flex'
              }
            >
              {page.cta.label}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
