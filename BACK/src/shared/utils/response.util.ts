export function successResponse<T>(data: T, message = 'Success', meta?: Record<string, unknown>) {
  return {
    success: true as const,
    data,
    message,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  errorCode: string,
  message: string,
  correlationId: string,
  details?: unknown,
) {
  return {
    success: false as const,
    errorCode,
    message,
    ...(details !== undefined ? { details } : {} as Record<string, unknown>),
    timestamp: new Date().toISOString(),
    correlationId,
  };
}
