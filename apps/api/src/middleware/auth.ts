import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  firmId: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      firmId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'finora-dev-jwt-secret-key-change-in-production-min-32-chars';

  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
    req.firmId = payload.firmId;
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}
