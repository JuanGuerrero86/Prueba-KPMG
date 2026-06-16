import { Request, Response } from 'express';
import { usersService } from './users.service';
import { successResponse } from '../../shared/utils/response.util';

export class UsersController {
  async findPaginated(req: Request, res: Response) {
    const result = await usersService.findPaginated(req.query as any);
    res.json(successResponse(result.data, 'Users retrieved', result.meta));
  }

  async findAll(req: Request, res: Response) {
    const data = await usersService.findAll();
    res.json(successResponse(data));
  }

  async findById(req: Request, res: Response) {
    const data = await usersService.findById(req.params.id as string);
    res.json(successResponse(data));
  }

  async create(req: Request, res: Response) {
    const data = await usersService.create(req.body);
    res.status(201).json(successResponse(data, 'User created'));
  }

  async update(req: Request, res: Response) {
    const data = await usersService.update(req.params.id as string, req.body);
    res.json(successResponse(data, 'User updated'));
  }

  async remove(req: Request, res: Response) {
    const data = await usersService.softDelete(req.params.id as string);
    res.json(successResponse(data));
  }

  async toggle(req: Request, res: Response) {
    const data = await usersService.toggle(req.params.id as string);
    res.json(successResponse(data, 'User status toggled'));
  }

  async assignRoles(req: Request, res: Response) {
    const data = await usersService.assignRoles(req.params.id as string, req.body);
    res.json(successResponse(data, 'Roles assigned'));
  }
}

export const usersController = new UsersController();
