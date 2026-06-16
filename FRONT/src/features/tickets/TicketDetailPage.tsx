import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from './tickets.service';
import { useAuthStore } from '../../store/auth.store';
import { Badge, prioridadColor, estadoColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/format.util';
import { EstadoTicket, Prioridad, TipoAccion } from '../../types/ticket.types';

const PRIORIDAD_ORDER: Prioridad[] = ['baja', 'media', 'alta', 'critica'];

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.includes('ADMIN');

  const [comentario, setComentario] = useState('');
  const [tipoAccion, setTipoAccion] = useState<TipoAccion>('COMENTARIO');

  const { data: ticket } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsService.getTicketById(id!),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['ticket', id, 'history'],
    queryFn: () => ticketsService.getTicketHistory(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (dto: { estado?: EstadoTicket; prioridad?: Prioridad }) => ticketsService.updateTicket(id!, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  const gestionMutation = useMutation({
    mutationFn: () => ticketsService.addHistoricoGestion(id!, { tipoAccion, comentario }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id, 'history'] });
      setComentario('');
    },
  });

  if (!ticket) return <div className="p-6">Cargando...</div>;

  const currentPrioridadIdx = PRIORIDAD_ORDER.indexOf(ticket.prioridad);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{ticket.titulo}</h1>
      <div className="flex gap-2 mb-4">
        <Badge label={ticket.prioridad} color={prioridadColor[ticket.prioridad]} />
        <Badge label={ticket.estado.replace('_', ' ')} color={estadoColor[ticket.estado]} />
        {ticket.asignadoA && <span className="text-sm text-gray-500">Asignado a: {ticket.asignadoA.nombre}</span>}
      </div>
      <p className="text-gray-700 mb-6">{ticket.descripcion}</p>

      {isAdmin && ticket.estado !== 'cerrado' && (
        <div className="bg-gray-50 rounded p-4 mb-6 flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Estado</label>
            <select
              value={ticket.estado}
              onChange={(e) => updateMutation.mutate({ estado: e.target.value as EstadoTicket })}
              className="border rounded px-2 py-1 text-sm"
            >
              {(['abierto', 'en_progreso', 'resuelto', 'cerrado'] as EstadoTicket[]).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Prioridad</label>
            <select
              value={ticket.prioridad}
              onChange={(e) => updateMutation.mutate({ prioridad: e.target.value as Prioridad })}
              className="border rounded px-2 py-1 text-sm"
            >
              {PRIORIDAD_ORDER.map((p, i) => (
                <option key={p} value={p} disabled={i < currentPrioridadIdx}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Historial de gestiones</h2>
      <div className="space-y-3 mb-6">
        {history.map((h) => (
          <div key={h.id} className="bg-white border rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{h.tipoAccion}</span>
              <span className="text-xs text-gray-500">{h.usuario?.nombre}</span>
              <span className="text-xs text-gray-400 ml-auto">{formatDate(h.createdAt)}</span>
            </div>
            {h.comentario && <p className="text-sm text-gray-700">{h.comentario}</p>}
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-gray-400">Sin gestiones registradas.</p>}
      </div>

      {ticket.estado !== 'cerrado' && (
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-sm font-semibold mb-3">Agregar gestión</h3>
          <div className="flex flex-col gap-3">
            <select value={tipoAccion} onChange={(e) => setTipoAccion(e.target.value as TipoAccion)} className="border rounded px-3 py-2 text-sm">
              <option value="COMENTARIO">Comentario</option>
            </select>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Escribe un comentario..."
              className="border rounded px-3 py-2 text-sm"
            />
            <Button onClick={() => gestionMutation.mutate()} loading={gestionMutation.isPending} disabled={!comentario}>
              Agregar gestión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
