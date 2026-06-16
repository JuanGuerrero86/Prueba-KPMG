import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleGuard } from './components/layout/RoleGuard';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TicketsPage } from './features/tickets/TicketsPage';
import { TicketDetailPage } from './features/tickets/TicketDetailPage';
import { UsersPage } from './features/users/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'tickets/:id', element: <TicketDetailPage /> },
      {
        element: <RoleGuard requiredRole="ADMIN" />,
        children: [{ path: 'users', element: <UsersPage /> }],
      },
    ],
  },
]);
