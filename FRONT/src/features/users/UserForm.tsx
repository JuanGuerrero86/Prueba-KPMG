import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from './users.service';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserData } from '../../types/user.types';

const createSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  roleIds: z.array(z.string()).optional(),
});

const editSchema = createSchema.extend({ password: z.string().optional() });

type FormData = z.infer<typeof createSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  user?: UserData | null;
}

export function UserForm({ open, onClose, user }: Props) {
  const qc = useQueryClient();
  const isEdit = !!user;

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => usersService.getRoles(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as never,
    defaultValues: user ? { nombre: user.nombre, email: user.email, roleIds: user.roles.map((r) => r.id) } : {},
  });

  useEffect(() => {
    if (open) {
      reset(user ? { nombre: user.nombre, email: user.email, roleIds: user.roles.map((r) => r.id) } : {});
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? usersService.updateUser(user!.id, { nombre: data.nombre, email: data.email, ...(data.password && { password: data.password }), roleIds: data.roleIds })
        : usersService.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit((d) => mutation.mutate(d))} loading={isSubmitting}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Input id="nombre" label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
        <Input id="email" label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input id="password" label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password" {...register('password')} error={errors.password?.message} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Roles</label>
          <div className="flex flex-col gap-1 border rounded p-2">
            {roles.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={r.id} {...register('roleIds')} />
                {r.nombre}
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
