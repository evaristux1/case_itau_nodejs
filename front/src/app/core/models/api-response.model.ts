export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  path?: string;
  requestId?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  method: string;
  requestId?: string;
  timestamp: string;
}
