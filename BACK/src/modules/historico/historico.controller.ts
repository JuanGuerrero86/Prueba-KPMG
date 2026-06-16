import { Request, Response } from 'express';
import { historicoService } from './historico.service';
import { successResponse } from '../../shared/utils/response.util';

export class HistoricoController {
  async getHistory(req: Request, res: Response) {
    const ticketId = req.params.ticketId as string || req.params.id as string;
    const data = await historicoService.getHistory(ticketId);
    res.json(successResponse(data));
  }

  async addGestion(req: Request, res: Response) {
    const ticketId = req.params.ticketId as string || req.params.id as string;
    const data = await historicoService.addGestion(ticketId, req.body, req.user!);
    res.status(201).json(successResponse(data, 'Gestión registrada'));
  }
}

export const historicoController = new HistoricoController();
