import { Request, Response } from 'express';
import { ticketsService } from './tickets.service';
import { successResponse } from '../../shared/utils/response.util';

export class TicketsController {
  async findAll(req: Request, res: Response) {
    const result = await ticketsService.findPaginated(req.query as any, req.user!);
    res.json(successResponse(result.data, 'Tickets retrieved', result.meta));
  }

  async findUnassigned(req: Request, res: Response) {
    const data = await ticketsService.findUnassigned();
    res.json(successResponse(data));
  }

  async getStats(req: Request, res: Response) {
    const data = await ticketsService.getStats(req.user!);
    res.json(successResponse(data));
  }

  async findById(req: Request, res: Response) {
    const data = await ticketsService.findById(req.params.id as string);
    res.json(successResponse(data));
  }

  async create(req: Request, res: Response) {
    const data = await ticketsService.create(req.body, req.user!.id);
    res.status(201).json(successResponse(data, 'Ticket created'));
  }

  async update(req: Request, res: Response) {
    const data = await ticketsService.update(req.params.id as string, req.body, req.user!);
    res.json(successResponse(data, 'Ticket updated'));
  }

  async remove(req: Request, res: Response) {
    const data = await ticketsService.softDelete(req.params.id as string);
    res.json(successResponse(data));
  }

  async assign(req: Request, res: Response) {
    const data = await ticketsService.assign(req.body, req.user!.id);
    res.json(successResponse(data, 'Tickets assigned'));
  }

  async findByUser(req: Request, res: Response) {
    const result = await ticketsService.findByUser(req.params.userId as string, req.query as any);
    res.json(successResponse(result.data, 'Tickets retrieved', result.meta));
  }
}

export const ticketsController = new TicketsController();
