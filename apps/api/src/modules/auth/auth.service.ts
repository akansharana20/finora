import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { Role } from '@prisma/client';

export interface RegisterDto {
  firmName: string;
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  private static jwtSecret = process.env.JWT_SECRET || 'finora-dev-jwt-secret-key-change-in-production-min-32-chars';
  private static jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  static async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestError('User with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create firm and admin user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const firm = await tx.firm.create({
        data: {
          name: dto.firmName,
          country: 'GB',
          currency: 'GBP',
        },
      });

      // Default VAT rates for new firm
      await tx.vatRate.createMany({
        data: [
          { firmId: firm.id, code: 'STANDARD', name: 'Standard Rate (20%)', rate: 20.0, isDefault: true, isSystem: true },
          { firmId: firm.id, code: 'REDUCED', name: 'Reduced Rate (5%)', rate: 5.0, isDefault: false, isSystem: true },
          { firmId: firm.id, code: 'ZERO', name: 'Zero Rate (0%)', rate: 0.0, isDefault: false, isSystem: true },
          { firmId: firm.id, code: 'EXEMPT', name: 'Exempt (0%)', rate: 0.0, isDefault: false, isSystem: true },
        ],
      });

      const user = await tx.user.create({
        data: {
          firmId: firm.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          role: Role.ADMIN,
        },
      });

      await tx.auditLog.create({
        data: {
          firmId: firm.id,
          userId: user.id,
          action: 'FIRM_REGISTERED',
          entity: 'Firm',
          entityId: firm.id,
          metadata: `Firm ${firm.name} created by admin ${user.email}`,
        },
      });

      return { firm, user };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        firmId: result.firm.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      AuthService.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        firmId: result.firm.id,
        firmName: result.firm.name,
      },
      token,
    };
  }

  static async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { firm: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        firmId: user.firmId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      AuthService.jwtSecret,
      { expiresIn: '7d' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        firmId: user.firmId,
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        metadata: `User ${user.email} logged in`,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firmId: user.firmId,
        firmName: user.firm.name,
      },
      token,
    };
  }

  static async getProfile(userId: string, firmId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, firmId },
      include: { firm: true },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firm: {
        id: user.firm.id,
        name: user.firm.name,
        companyNumber: user.firm.companyNumber,
        vatNumber: user.firm.vatNumber,
        address: user.firm.address,
        postcode: user.firm.postcode,
        country: user.firm.country,
        currency: user.firm.currency,
      },
    };
  }
}
