import { StatusCodes } from 'http-status-codes';
import { ErrorCode } from './error-codes';

export class AppError extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    public readonly httpStatus: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VAL-001', message, StatusCodes.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(errorCode, message, StatusCodes.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(errorCode, message, StatusCodes.FORBIDDEN, details);
  }
}

export class NotFoundError extends AppError {
  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(errorCode, message, StatusCodes.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(errorCode, message, StatusCodes.CONFLICT, details);
  }
}

export class BusinessRuleError extends AppError {
  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(errorCode, message, StatusCodes.UNPROCESSABLE_ENTITY, details);
  }
}

export class SystemError extends AppError {
  constructor(message: string, details?: unknown) {
    super('SYS-001', message, StatusCodes.INTERNAL_SERVER_ERROR, details);
  }
}
