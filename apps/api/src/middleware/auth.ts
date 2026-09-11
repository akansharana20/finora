import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import prisma from '../config/db';

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

/**
 * Check if a user is authorized to access a given firm.
 * A user is authorized if:
 * 1. The target firm is their primary firm (user.firmId === targetFirmId), OR
 * 2. The user is an ADMIN who created or registered the target firm (recorded in AuditLog).
 */
export async function isUserAuthorizedForFirm(userId: string, userFirmId: string, targetFirmId: string): Promise<boolean> {
  if (!targetFirmId) return false;
  if (targetFirmId === userFirmId) return true;

  try {
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        firmId: targetFirmId,
        userId,
        action: { in: ['FIRM_CREATED', 'FIRM_REGISTERED'] },
      },
      select: { id: true },
    });
    return Boolean(auditRecord);
  } catch {
    return false;
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'finora-dev-jwt-secret-key-change-in-production-min-32-chars';

  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;

    const requestedFirmId = req.headers['x-firm-id'] as string | undefined;
    const isAuthMe = req.path === '/me' || req.originalUrl?.endsWith('/auth/me');

    if (payload.role === Role.ADMIN && requestedFirmId && typeof requestedFirmId === 'string' && requestedFirmId.trim() !== '') {
      const targetFirmId = requestedFirmId.trim();

      if (targetFirmId === payload.firmId) {
        req.firmId = payload.firmId;
      } else {
        // Verify target firm exists and is active
        const firm = await prisma.firm.findUnique({
          where: { id: targetFirmId },
          select: { id: true, isActive: true },
        });

        if (!firm) {
          if (isAuthMe) {
            req.firmId = payload.firmId;
            return next();
          }
          return next(new NotFoundError('Company not found'));
        }

        if (!firm.isActive) {
          if (isAuthMe) {
            req.firmId = payload.firmId;
            return next();
          }
          return next(new ForbiddenError('Company is deactivated'));
        }

        // Verify user authorization for this company
        const authorized = await isUserAuthorizedForFirm(payload.id, payload.firmId, targetFirmId);
        if (!authorized) {
          if (isAuthMe) {
            req.firmId = payload.firmId;
            return next();
          }
          return next(new ForbiddenError('You are not authorized to access this company'));
        }

        req.firmId = targetFirmId;
      }
    } else {
      req.firmId = payload.firmId;
    }

    return next();
  } catch (error: any) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

