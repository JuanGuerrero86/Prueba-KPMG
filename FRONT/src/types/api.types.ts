export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  details?: { field: string; message: string }[];
  timestamp: string;
  correlationId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
