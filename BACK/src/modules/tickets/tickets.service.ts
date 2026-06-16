import { AppDataSource } from '../../config/database.config';
import { Ticket, Prioridad, EstadoTicket } from '../../entities/Ticket.entity';
import { HistoricoGestion, TipoAccion } from '../../entities/HistoricoGestion.entity';
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from '../../shared/errors/AppError';
import { CreateTicketDto, UpdateTicketDto, AssignTicketsDto, TicketQueryDto } from './tickets.dto';

const PRIORIDAD_ESCALA: Record<Prioridad, number> = {
  [Prioridad.BAJA]: 1,
  [Prioridad.MEDIA]: 2,
  [Prioridad.ALTA]: 3,
  [Prioridad.CRITICA]: 4,
};

export class TicketsService {
  private get repo() {
    return AppDataSource.getRepository(Ticket);
  }
  private get histRepo() {
    return AppDataSource.getRepository(HistoricoGestion);
  }

  async findPaginated(
    query: TicketQueryDto,
    currentUser: { id: string; roles: string[] },
  ) {
    const { page = 1, limit = 10, estado, prioridad, asignadoA } = query;
    const qb = this.repo.createQueryBuilder('t')
      .leftJoinAndSelect('t.creadoPor', 'cp')
      .leftJoinAndSelect('t.asignadoA', 'aa')
      .where('t.deletedAt IS NULL');

    if (!currentUser.roles.includes('ADMIN')) {
      qb.andWhere('t.asignadoAId = :uid', { uid: currentUser.id });
    }
    if (estado) qb.andWhere('t.estado = :estado', { estado });
    if (prioridad) qb.andWhere('t.prioridad = :prioridad', { prioridad });
    if (asignadoA) qb.andWhere('t.asignadoAId = :asignadoA', { asignadoA });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('t.createdAt', 'DESC')
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findUnassigned() {
    return this.repo.find({ where: { asignadoAId: null as any } });
  }

  async getStats(currentUser: { id: string; roles: string[] }) {
    const qb = this.repo.createQueryBuilder('t').where('t.deletedAt IS NULL');
    if (!currentUser.roles.includes('ADMIN')) {
      qb.andWhere('t.asignadoAId = :uid', { uid: currentUser.id });
    }
    const tickets = await qb.getMany();
    const byEstado = Object.values(EstadoTicket).reduce(
      (acc, e) => ({ ...acc, [e]: tickets.filter((t) => t.estado === e).length }),
      {} as Record<string, number>,
    );
    const byPrioridad = Object.values(Prioridad).reduce(
      (acc, p) => ({ ...acc, [p]: tickets.filter((t) => t.prioridad === p).length }),
      {} as Record<string, number>,
    );
    return { byEstado, byPrioridad, total: tickets.length };
  }

  async findById(id: string) {
    const ticket = await this.repo.findOne({
      where: { id },
      relations: { creadoPor: true, asignadoA: true },
    });
    if (!ticket) throw new NotFoundError('TKT-001', 'Ticket not found');
    return ticket;
  }

  async create(dto: CreateTicketDto, creadoPorId: string) {
    return AppDataSource.transaction(async (manager) => {
      const ticket = manager.create(Ticket, {
        ...dto,
        estado: dto.estado || EstadoTicket.ABIERTO,
        creadoPorId,
      });
      await manager.save(ticket);

      const hist = manager.create(HistoricoGestion, {
        ticketId: ticket.id,
        usuarioId: creadoPorId,
        tipoAccion: TipoAccion.CREACION,
      });
      await manager.save(hist);

      return ticket;
    });
  }

  async update(
    id: string,
    dto: UpdateTicketDto,
    currentUser: { id: string; roles: string[] },
  ) {
    const ticket = await this.findById(id);

    if (ticket.estado === EstadoTicket.CERRADO) {
      throw new BusinessRuleError('TKT-004', 'Cannot modify a closed ticket');
    }

    if (
      dto.prioridad &&
      PRIORIDAD_ESCALA[dto.prioridad] < PRIORIDAD_ESCALA[ticket.prioridad]
    ) {
      throw new BusinessRuleError('TKT-003', 'Cannot reduce ticket priority');
    }

    if (
      !currentUser.roles.includes('ADMIN') &&
      ticket.asignadoAId !== currentUser.id
    ) {
      throw new ForbiddenError('TKT-002', 'You can only edit your assigned tickets');
    }

    return AppDataSource.transaction(async (manager) => {
      const estadoChanged = dto.estado && dto.estado !== ticket.estado;
      const prioridadChanged = dto.prioridad && dto.prioridad !== ticket.prioridad;

      Object.assign(ticket, dto);
      await manager.save(ticket);

      if (estadoChanged) {
        await manager.save(
          manager.create(HistoricoGestion, {
            ticketId: id,
            usuarioId: currentUser.id,
            tipoAccion: TipoAccion.ESTADO_CAMBIADO,
            metadata: { from: ticket.estado, to: dto.estado },
          }),
        );
      }

      if (prioridadChanged) {
        await manager.save(
          manager.create(HistoricoGestion, {
            ticketId: id,
            usuarioId: currentUser.id,
            tipoAccion: TipoAccion.PRIORIDAD_CAMBIADA,
            metadata: { from: ticket.prioridad, to: dto.prioridad },
          }),
        );
      }

      return ticket;
    });
  }

  async softDelete(id: string) {
    const ticket = await this.findById(id);
    await this.repo.softDelete(id);
    return { message: 'Ticket deleted' };
  }

  async assign(dto: AssignTicketsDto, currentUserId: string) {
    return AppDataSource.transaction(async (manager) => {
      for (const ticketId of dto.ticketIds) {
        const ticket = await manager.findOne(Ticket, { where: { id: ticketId } });
        if (!ticket) throw new NotFoundError('TKT-001', `Ticket ${ticketId} not found`);
        ticket.asignadoAId = dto.usuarioId;
        await manager.save(ticket);
        await manager.save(
          manager.create(HistoricoGestion, {
            ticketId,
            usuarioId: currentUserId,
            tipoAccion: TipoAccion.ASIGNACION,
            metadata: { asignadoA: dto.usuarioId },
          }),
        );
      }
      return { message: 'Tickets assigned' };
    });
  }

  async findByUser(userId: string, query: TicketQueryDto) {
    return this.findPaginated(query, { id: userId, roles: ['OPERATIVO'] });
  }
}

export const ticketsService = new TicketsService();
