import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate as classValidate } from 'class-validator';
import { ValidationError } from '../shared/errors/AppError';

export function validate<T extends object>(DtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await classValidate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const details = errors.map((e) => ({
        field: e.property,
        message: Object.values(e.constraints || {}).join(', '),
      }));
      return next(new ValidationError('Validation failed', details));
    }

    req.body = instance;
    next();
  };
}
