
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, Heart, X } from 'lucide-react';
import { userApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleGridSkeleton } from '@/components/vehicles/VehicleCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { IVehicle } from '@/types';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function DashboardPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [favorites, setFavorites] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    userApi
      .favorites()
      .then((list) => active && setFavorites(list))
      .catch((err) => toast.showApiError(err, 'טעינת המועדפים נכשלה'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFavorite = useCallback(
    async (id: string) => {
      const prev = favorites;
      setFavorites((list) => list.filter((v) => v.id !== id));
      try {
        const updated = await userApi.removeFavorite(id);
        updateUser(updated);
        toast.success('הוסר מהמועדפים');
      } catch (err) {
        setFavorites(prev);
        toast.showApiError(err);
      }
    },
    [favorites, toast, updateUser],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-extrabold text-white shadow-md">
              {user ? initials(user.fullName) : '—'}
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                שלום, {user?.fullName ?? 'נהג/ת'}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-stat px-5 py-3 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{favorites.length}</p>
              <p className="text-xs font-medium text-slate-500">רכבים שמורים</p>
            </div>
            <div className="glass-stat px-5 py-3 text-center">
              <p className="text-2xl font-extrabold text-slate-900">
                {user?.comparison.length ?? 0}
              </p>
              <p className="text-xs font-medium text-slate-500">בהשוואה</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
            <Heart className="h-5 w-5 text-rose-500" />
            הרכבים השמורים שלי
          </h2>
          <Link to="/compare" className="btn-secondary">
            <GitCompareArrows className="h-4 w-4" />
            מרכז ההשוואה
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <VehicleGridSkeleton count={6} />
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="עדיין לא שמרת רכבים"
            description="סמנו רכבים שאהבתם בלחיצה על הלב, והם יופיעו כאן לצפייה והשוואה מהירה."
            action={
              <Link to="/catalog" className="btn-primary">
                גלו רכבים בקטלוג
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((v) => (
              <div key={v.id} className="relative">
                <button
                  type="button"
                  onClick={() => removeFavorite(v.id)}
                  aria-label="הסר מהמועדפים"
                  className="glass-surface absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-rose-500/15 hover:text-rose-500 active:scale-90"
                >
                  <X className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </button>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
