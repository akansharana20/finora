import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode: number = 500, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: getErrorCode(statusCode),
      message,
      details,
    },
  });
};

function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 422: return 'UNPROCESSABLE_ENTITY';
    default: return 'INTERNAL_SERVER_ERROR';
  }
}
