import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from './users.dto';

export const usersRouter = Router();

usersRouter.use(authMiddleware, requireRoles('ADMIN'));

usersRouter.get('/', (req, res, next) => usersController.findPaginated(req, res).catch(next));
usersRouter.get('/all', (req, res, next) => usersController.findAll(req, res).catch(next));
usersRouter.get('/:id', (req, res, next) => usersController.findById(req, res).catch(next));
usersRouter.post('/', validate(CreateUserDto), (req, res, next) =>
  usersController.create(req, res).catch(next),
);
usersRouter.put('/:id', validate(UpdateUserDto), (req, res, next) =>
  usersController.update(req, res).catch(next),
);
usersRouter.delete('/:id', (req, res, next) => usersController.remove(req, res).catch(next));
usersRouter.patch('/:id/toggle', (req, res, next) =>
  usersController.toggle(req, res).catch(next),
);
usersRouter.put('/:id/roles', validate(AssignRolesDto), (req, res, next) =>
  usersController.assignRoles(req, res).catch(next),
);
