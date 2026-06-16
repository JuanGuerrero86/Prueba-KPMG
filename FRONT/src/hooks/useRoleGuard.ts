import { useAuthStore } from '../store/auth.store';

export function useRoleGuard(requiredRole: string): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.roles?.includes(requiredRole) ?? false;
}
