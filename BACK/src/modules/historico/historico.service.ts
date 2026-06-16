import { AppDataSource } from '../../config/database.config';
import { HistoricoGestion, TipoAccion } from '../../entities/HistoricoGestion.entity';
import { Ticket } from '../../entities/Ticket.entity';
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from '../../shared/errors/AppError';
import { CreateHistoricoDto } from './historico.dto';

export class HistoricoService {
  private get repo() {
    return AppDataSource.getRepository(HistoricoGestion);
  }

  async addGestion(
    ticketId: string,
    dto: CreateHistoricoDto,
    currentUser: { id: string; roles: string[] },
  ) {
    const ticket = await AppDataSource.getRepository(Ticket).findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('TKT-001', 'Ticket not found');

    if (dto.tipoAccion === TipoAccion.COMENTARIO && !dto.comentario) {
      throw new BusinessRuleError('HIST-001', 'Comment is required for COMENTARIO type');
    }

    if (
      !currentUser.roles.includes('ADMIN') &&
      ticket.asignadoAId !== currentUser.id
    ) {
      throw new ForbiddenError('TKT-002', 'You can only manage your assigned tickets');
    }

    const entry = this.repo.create({
      ticketId,
      usuarioId: currentUser.id,
      tipoAccion: dto.tipoAccion,
      comentario: dto.comentario || null,
    });
    return this.repo.save(entry);
  }

  async getHistory(ticketId: string) {
    const ticket = await AppDataSource.getRepository(Ticket).findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('TKT-001', 'Ticket not found');

    return this.repo.find({
      where: { ticketId },
      relations: { usuario: true },
      order: { createdAt: 'ASC' },
    });
  }
}

export const historicoService = new HistoricoService();
