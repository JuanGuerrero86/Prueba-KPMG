import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

interface RoleGuardProps {
  requiredRole: string;
}

export function RoleGuard({ requiredRole }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const hasRole = user?.roles?.includes(requiredRole) ?? false;
  return hasRole ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
