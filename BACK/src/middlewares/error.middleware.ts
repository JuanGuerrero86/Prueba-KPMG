import { Request, Response, NextFunction } from 'express';
import { QueryFailedError } from 'typeorm';
import { AppError } from '../shared/errors/AppError';
import { errorResponse } from '../shared/utils/response.util';
import { createLogger } from '../shared/logger/logger';

const logger = createLogger('ErrorMiddleware');

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  const correlationId = req.correlationId || 'unknown';

  if (err instanceof AppError) {
    logger.warn({
      correlationId,
      errorCode: err.errorCode,
      message: err.message,
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return res
      .status(err.httpStatus)
      .json(errorResponse(err.errorCode, err.message, correlationId, err.details));
  }

  if (err instanceof QueryFailedError) {
    logger.error({
      correlationId,
      errorCode: 'SYS-001',
      message: 'Database query failed',
      original: err.message,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
    return res.status(500).json(errorResponse('SYS-001', 'Database error occurred', correlationId));
  }

  logger.error({
    correlationId,
    errorCode: 'SYS-001',
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  return res.status(500).json(
    errorResponse(
      'SYS-001',
      'Internal server error',
      correlationId,
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
    ),
  );
}
