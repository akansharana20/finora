import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('🔥 Error caught in API handler:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  // Handle generic / unexpected error without leaking internal details
  const message = process.env.NODE_ENV === 'development' ? err.message : 'An unexpected server error occurred';
  return sendError(res, message, 500);
}
