import { Request, Response } from 'express';
import { rolesService } from './roles.service';
import { successResponse } from '../../shared/utils/response.util';

export class RolesController {
  async findAll(req: Request, res: Response) {
    const data = await rolesService.findAll();
    res.json(successResponse(data));
  }

  async create(req: Request, res: Response) {
    const data = await rolesService.create(req.body);
    res.status(201).json(successResponse(data, 'Role created'));
  }

  async update(req: Request, res: Response) {
    const data = await rolesService.update(req.params.id as string, req.body);
    res.json(successResponse(data, 'Role updated'));
  }

  async remove(req: Request, res: Response) {
    const data = await rolesService.softDelete(req.params.id as string);
    res.json(successResponse(data));
  }
}

export const rolesController = new RolesController();
