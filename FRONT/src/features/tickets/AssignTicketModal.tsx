import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from './tickets.service';
import { usersService } from '../users/users.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AssignTicketModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [usuarioId, setUsuarioId] = useState('');

  const { data: unassigned = [] } = useQuery({
    queryKey: ['tickets', 'unassigned'],
    queryFn: () => ticketsService.getUnassigned(),
    enabled: open,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersService.getAllUsers(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => ticketsService.assignTickets({ ticketIds: selectedTickets, usuarioId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      setSelectedTickets([]);
      setUsuarioId('');
      onClose();
    },
  });

  const toggle = (id: string) =>
    setSelectedTickets((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <Modal open={open} onClose={onClose} title="Asignar tickets"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!selectedTickets.length || !usuarioId}>
            Asignar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Tickets sin asignar</p>
          <div className="max-h-40 overflow-y-auto border rounded divide-y">
            {unassigned.map((t) => (
              <label key={t.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={selectedTickets.includes(t.id)} onChange={() => toggle(t.id)} />
                <span className="text-sm">{t.titulo}</span>
              </label>
            ))}
            {unassigned.length === 0 && <p className="text-sm text-gray-400 p-3">No hay tickets sin asignar</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Asignar a</label>
          <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="">Seleccionar usuario...</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}
