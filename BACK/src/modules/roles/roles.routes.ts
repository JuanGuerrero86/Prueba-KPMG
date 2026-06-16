import { Router } from 'express';
import { rolesController } from './roles.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateRolDto, UpdateRolDto } from './roles.dto';

export const rolesRouter = Router();

rolesRouter.use(authMiddleware, requireRoles('ADMIN'));

rolesRouter.get('/', (req, res, next) => rolesController.findAll(req, res).catch(next));
rolesRouter.post('/', validate(CreateRolDto), (req, res, next) =>
  rolesController.create(req, res).catch(next),
);
rolesRouter.put('/:id', validate(UpdateRolDto), (req, res, next) =>
  rolesController.update(req, res).catch(next),
);
rolesRouter.delete('/:id', (req, res, next) => rolesController.remove(req, res).catch(next));
