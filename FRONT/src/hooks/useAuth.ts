import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  return { user, isAuthenticated, setUser, clearUser };
}
