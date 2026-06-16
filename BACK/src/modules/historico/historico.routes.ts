import { Router } from 'express';
import { historicoController } from './historico.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateHistoricoDto } from './historico.dto';

export const historicoRouter = Router({ mergeParams: true });

historicoRouter.get('/', authMiddleware, (req, res, next) =>
  historicoController.getHistory(req, res).catch(next),
);
historicoRouter.post(
  '/',
  authMiddleware,
  validate(CreateHistoricoDto),
  (req, res, next) => historicoController.addGestion(req, res).catch(next),
);
