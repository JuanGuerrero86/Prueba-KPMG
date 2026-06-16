import { useQuery } from '@tanstack/react-query';
import { ticketsService } from '../tickets/tickets.service';
import { useAuthStore } from '../../store/auth.store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.includes('ADMIN');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: () => ticketsService.getStats(),
  });

  if (isLoading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isAdmin ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Resumen de tickets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats && Object.entries(stats.byEstado).map(([estado, count]) => (
              <div key={estado} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 capitalize">{estado.replace('_', ' ')}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            ))}
          </div>
          <h2 className="text-lg font-semibold mb-4">Por prioridad</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats && Object.entries(stats.byPrioridad).map(([prioridad, count]) => (
              <div key={prioridad} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 capitalize">{prioridad}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Bienvenido, {user?.nombre}. Ve a <a href="/tickets" className="text-blue-600 underline">Tickets</a> para ver tus asignaciones.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {stats && ['abierto', 'en_progreso'].map((estado) => (
              <div key={estado} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 capitalize">{estado.replace('_', ' ')}</p>
                <p className="text-3xl font-bold">{stats.byEstado[estado as keyof typeof stats.byEstado] ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
