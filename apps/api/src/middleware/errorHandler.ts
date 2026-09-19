import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { HmrcApiError } from '../modules/hmrc/hmrc.error';
import { sendError } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Log HMRC errors with correlation ID for production debugging (secrets are never included)
  if (err instanceof HmrcApiError) {
    console.error('[HMRC Error]', {
      operation: err.operation,
      correlationId: err.correlationId,
      hmrcCode: err.hmrcCode,
      statusCode: err.statusCode,
      message: err.message,
    });
    return sendError(res, err.message, err.statusCode, err.details);
  }

  if (err instanceof AppError) {
    console.error('🔥 Error caught in API handler:', { name: err.name, statusCode: err.statusCode, message: err.message });
    return sendError(res, err.message, err.statusCode, err.details);
  }

  console.error('🔥 Unexpected error in API handler:', err);

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
