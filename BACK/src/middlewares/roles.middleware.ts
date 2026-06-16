import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors/AppError';

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('AUTH-006', 'Insufficient permissions'));
    }
    next();
  };
}
