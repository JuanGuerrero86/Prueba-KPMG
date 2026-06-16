import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from './tickets.service';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Prioridad } from '../../types/ticket.types';

const schema = z.object({
  titulo: z.string().min(1, 'Requerido'),
  descripcion: z.string().min(1, 'Requerido'),
  prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TicketForm({ open, onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { prioridad: 'baja' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => ticketsService.createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      reset();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Nuevo ticket"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit((d) => mutation.mutate(d))} loading={isSubmitting}>Crear</Button>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Input id="titulo" label="Título" {...register('titulo')} error={errors.titulo?.message} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Descripción</label>
          <textarea {...register('descripcion')} rows={3} className={`border rounded px-3 py-2 text-sm ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Prioridad</label>
          <select {...register('prioridad')} className="border rounded px-3 py-2 text-sm">
            {(['baja', 'media', 'alta', 'critica'] as Prioridad[]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  );
}
