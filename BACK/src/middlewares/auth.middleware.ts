import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { UnauthorizedError } from '../shared/errors/AppError';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(new UnauthorizedError('AUTH-002', 'Access token required'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new UnauthorizedError('AUTH-002', 'Access token expired'));
    }
    if (err instanceof JsonWebTokenError) {
      return next(new UnauthorizedError('AUTH-003', 'Invalid access token'));
    }
    next(err);
  }
}
