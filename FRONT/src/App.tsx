import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from './router';
import { useAuthStore } from './store/auth.store';
import apiClient from './services/api.client';
import { ApiResponse } from './types/api.types';
import { User } from './types/auth.types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function AppContent() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    apiClient
      .get<ApiResponse<User>>('/api/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {});
  }, [setUser]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
