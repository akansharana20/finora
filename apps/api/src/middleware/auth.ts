import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import prisma from '../config/db';

export interface AuthUser {
  id: string;
  firmId?: string;
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
 * The membership table is the sole authority for company access. The legacy
 * users.firmId remains a default selection only; it never grants access.
 */
export async function isUserAuthorizedForFirm(userId: string, userFirmId: string | undefined, targetFirmId: string): Promise<boolean> {
  if (!targetFirmId) return false;
  if (userFirmId && targetFirmId === userFirmId) {
    return true;
  }

  const hasMembership = await prisma.firmMembership.findUnique({
    where: { userId_firmId: { userId, firmId: targetFirmId } },
    select: { userId: true },
  });
  if (hasMembership) return true;

  const hasLegacyAuditAccess = await prisma.auditLog.findFirst({
    where: {
      userId,
      firmId: targetFirmId,
      action: { in: ['FIRM_CREATED', 'FIRM_REGISTERED'] },
    },
    select: { id: true },
  });

  return Boolean(hasLegacyAuditAccess);
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

    const requestedFirmId = typeof req.headers['x-firm-id'] === 'string' ? req.headers['x-firm-id'].trim() : '';
    const isSelfProfileRequest = req.path === '/me' || req.originalUrl?.includes('/auth/me') || req.originalUrl?.includes('/me');
    const memberships = await prisma.firmMembership.findMany({
      where: { userId: payload.id, firm: { isActive: true } },
      select: { firmId: true }, orderBy: { createdAt: 'asc' },
    });
    const permitted = new Set(memberships.map((membership) => membership.firmId));
    const hasLegacyAuditAccess = async (firmId: string) => Boolean(await prisma.auditLog.findFirst({
      where: {
        userId: payload.id,
        firmId,
        action: { in: ['FIRM_CREATED', 'FIRM_REGISTERED'] },
      },
      select: { id: true },
    }));

    const fallbackFirmId = payload.firmId || memberships[0]?.firmId;
    if (requestedFirmId) {
      const hasRequestedAccess = permitted.has(requestedFirmId) || await hasLegacyAuditAccess(requestedFirmId);
      if (hasRequestedAccess) {
        req.firmId = requestedFirmId;
      } else if (isSelfProfileRequest || payload.role !== Role.ADMIN) {
        req.firmId = payload.firmId || fallbackFirmId;
      } else {
        const firm = await prisma.firm.findUnique({ where: { id: requestedFirmId }, select: { id: true } });
        return next(firm ? new ForbiddenError('You are not authorized to access this company') : new NotFoundError('Company not found'));
      }
    } else req.firmId = fallbackFirmId;

    return next();
  } catch (error: any) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

