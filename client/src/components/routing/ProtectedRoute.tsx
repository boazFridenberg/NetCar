
import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { UserRole } from '@/types';
import { FullScreenLoader } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const notified = useRef(false);

  const deniedGuest = !isLoading && !isAuthenticated;
  const deniedAdmin =
    !isLoading && isAuthenticated && requireAdmin && user?.role !== UserRole.Admin;

  useEffect(() => {
    if (notified.current) return;
    if (deniedGuest) {
      notified.current = true;
      toast.info('נדרשת התחברות', 'יש להתחבר לחשבון כדי לצפות בעמוד הזה.');
    } else if (deniedAdmin) {
      notified.current = true;
      toast.warning('למנהלים בלבד', 'אין לך הרשאות גישה לאזור הזה.');
    }
  }, [deniedGuest, deniedAdmin, toast]);

  if (isLoading) return <FullScreenLoader label="בודק את החיבור שלך…" />;

  if (deniedGuest) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (deniedAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
