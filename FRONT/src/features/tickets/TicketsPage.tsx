import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from './tickets.service';
import { useAuthStore } from '../../store/auth.store';
import { Table } from '../../components/ui/Table';
import { Badge, prioridadColor, estadoColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { TicketForm } from './TicketForm';
import { AssignTicketModal } from './AssignTicketModal';
import { EstadoTicket, Prioridad, Ticket } from '../../types/ticket.types';

export function TicketsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.includes('ADMIN');

  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<EstadoTicket | ''>('');
  const [prioridad, setPrioridad] = useState<Prioridad | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', { page, estado, prioridad }],
    queryFn: () => ticketsService.getTickets({ page, limit: 10, ...(estado && { estado }), ...(prioridad && { prioridad }) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ticketsService.deleteTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const columns = [
    { header: 'Título', accessor: (r: Ticket) => r.titulo },
    { header: 'Prioridad', accessor: (r: Ticket) => <Badge label={r.prioridad} color={prioridadColor[r.prioridad]} /> },
    { header: 'Estado', accessor: (r: Ticket) => <Badge label={r.estado.replace('_', ' ')} color={estadoColor[r.estado]} /> },
    { header: 'Asignado a', accessor: (r: Ticket) => r.asignadoA?.nombre ?? 'Sin asignar' },
    ...(isAdmin ? [{
      header: 'Acciones',
      accessor: (r: Ticket) => (
        <Button variant="danger" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(r.id); }}>
          Eliminar
        </Button>
      ),
    }] : []),
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tickets</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setShowAssign(true)} variant="secondary">Asignar tickets</Button>
            <Button onClick={() => setShowForm(true)}>Nuevo ticket</Button>
          </div>
        )}
      </div>
      <div className="flex gap-3 mb-4">
        <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoTicket | '')} className="border rounded px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          {['abierto', 'en_progreso', 'resuelto', 'cerrado'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad | '')} className="border rounded px-3 py-2 text-sm">
          <option value="">Todas las prioridades</option>
          {['baja', 'media', 'alta', 'critica'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {isLoading ? <p>Cargando...</p> : (
        <>
          <Table columns={columns} data={data?.data ?? []} onRowClick={(r) => navigate(`/tickets/${r.id}`)} />
          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
      <TicketForm open={showForm} onClose={() => setShowForm(false)} />
      <AssignTicketModal open={showAssign} onClose={() => setShowAssign(false)} />
    </div>
  );
}
