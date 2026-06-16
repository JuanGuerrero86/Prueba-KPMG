import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from './users.service';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { UserForm } from './UserForm';
import { UserData } from '../../types/user.types';

export function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserData | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => usersService.getUsers({ page, limit: 10, ...(search && { search }) }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersService.toggleUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const columns = [
    { header: 'Nombre', accessor: (u: UserData) => u.nombre },
    { header: 'Email', accessor: (u: UserData) => u.email },
    { header: 'Roles', accessor: (u: UserData) => (
      <div className="flex gap-1">
        {u.roles.map((r) => <Badge key={r.id} label={r.key} color="blue" />)}
      </div>
    )},
    { header: 'Estado', accessor: (u: UserData) => (
      <Badge label={u.isActive ? 'Activo' : 'Inactivo'} color={u.isActive ? 'green' : 'gray'} />
    )},
    { header: 'Acciones', accessor: (u: UserData) => (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setEditing(u); setShowForm(true); }}>
          Editar
        </Button>
        <Button variant={u.isActive ? 'danger' : 'primary'} onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(u.id); }}>
          {u.isActive ? 'Deshabilitar' : 'Habilitar'}
        </Button>
      </div>
    )},
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>Nuevo usuario</Button>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o email..."
        className="border rounded px-3 py-2 text-sm mb-4 w-full max-w-sm"
      />
      {isLoading ? <p>Cargando...</p> : (
        <>
          <Table columns={columns} data={data?.data ?? []} />
          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
      <UserForm open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} user={editing} />
    </div>
  );
}
