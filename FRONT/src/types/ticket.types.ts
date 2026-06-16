export type Prioridad = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoTicket = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
export type TipoAccion = 'CREACION' | 'ESTADO_CAMBIADO' | 'PRIORIDAD_CAMBIADA' | 'ASIGNACION' | 'COMENTARIO';

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  creadoPor?: { id: string; nombre: string; email: string };
  asignadoA?: { id: string; nombre: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricoGestion {
  id: string;
  tipoAccion: TipoAccion;
  comentario?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  prioridadAnterior?: string;
  prioridadNueva?: string;
  usuario?: { id: string; nombre: string; email: string };
  createdAt: string;
}

export interface TicketStats {
  byEstado: Record<EstadoTicket, number>;
  byPrioridad: Record<Prioridad, number>;
  total: number;
}

export interface CreateTicketDto {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
}

export interface UpdateTicketDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: Prioridad;
  estado?: EstadoTicket;
}

export interface AssignTicketsDto {
  ticketIds: string[];
  usuarioId: string;
}

export interface TicketQuery {
  page?: number;
  limit?: number;
  estado?: EstadoTicket;
  prioridad?: Prioridad;
}
