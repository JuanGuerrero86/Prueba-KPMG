import { Router } from 'express';
import { ticketsController } from './tickets.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateTicketDto, UpdateTicketDto, AssignTicketsDto } from './tickets.dto';
import { historicoRouter } from '../historico/historico.routes';

export const ticketsRouter = Router();

ticketsRouter.get('/', authMiddleware, (req, res, next) =>
  ticketsController.findAll(req, res).catch(next),
);
ticketsRouter.post(
  '/',
  authMiddleware,
  requireRoles('ADMIN'),
  validate(CreateTicketDto),
  (req, res, next) => ticketsController.create(req, res).catch(next),
);
ticketsRouter.get('/unassigned', authMiddleware, requireRoles('ADMIN'), (req, res, next) =>
  ticketsController.findUnassigned(req, res).catch(next),
);
ticketsRouter.get('/stats', authMiddleware, (req, res, next) =>
  ticketsController.getStats(req, res).catch(next),
);
ticketsRouter.put(
  '/assign',
  authMiddleware,
  requireRoles('ADMIN'),
  validate(AssignTicketsDto),
  (req, res, next) => ticketsController.assign(req, res).catch(next),
);
ticketsRouter.get('/:id', authMiddleware, (req, res, next) =>
  ticketsController.findById(req, res).catch(next),
);
ticketsRouter.put('/:id', authMiddleware, validate(UpdateTicketDto), (req, res, next) =>
  ticketsController.update(req, res).catch(next),
);
ticketsRouter.delete('/:id', authMiddleware, requireRoles('ADMIN'), (req, res, next) =>
  ticketsController.remove(req, res).catch(next),
);
ticketsRouter.get('/user/:userId', authMiddleware, (req, res, next) =>
  ticketsController.findByUser(req, res).catch(next),
);

ticketsRouter.use('/:id/history', (req, _res, next) => {
  req.params.ticketId = req.params.id;
  next();
}, historicoRouter);
