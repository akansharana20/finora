import prisma from '../../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { isUserAuthorizedForFirm } from '../../middleware/auth';

export interface CreateFirmDto {
  name: string;
  legalName?: string;
  companyNumber?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  vatScheme?: string;
  vatRegistered?: boolean;
  financialYearStart?: number;
  isActive?: boolean;
}

export interface UpdateFirmDto extends Partial<CreateFirmDto> {}

export class FirmsService {
  static async list(adminUserId?: string, userFirmId?: string) {
    let whereClause: any = {};

    if (adminUserId) {
      const createdLogs = await prisma.auditLog.findMany({
        where: {
          userId: adminUserId,
          action: { in: ['FIRM_CREATED', 'FIRM_REGISTERED'] },
        },
        select: { firmId: true },
      });

      const authorizedFirmIds = new Set<string>();
      if (userFirmId) {
        authorizedFirmIds.add(userFirmId);
      }
      createdLogs.forEach((log) => {
        if (log.firmId) authorizedFirmIds.add(log.firmId);
      });

      whereClause = {
        id: { in: Array.from(authorizedFirmIds) },
      };
    }

    return prisma.firm.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            invoices: true,
            expenses: true,
          },
        },
      },
    });
  }

  static async getById(id: string, adminUserId?: string, userFirmId?: string) {
    if (adminUserId && userFirmId) {
      const authorized = await isUserAuthorizedForFirm(adminUserId, userFirmId, id);
      if (!authorized) {
        throw new ForbiddenError('You are not authorized to access this company');
      }
    }

    const firm = await prisma.firm.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            suppliers: true,
            invoices: true,
            expenses: true,
            payments: true,
          },
        },
        vatRates: true,
      },
    });

    if (!firm) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    return firm;
  }

  static async create(dto: CreateFirmDto, adminUserId?: string) {
    const trimmedName = dto.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new BadRequestError('Company trading name is required (minimum 2 characters)');
    }

    if (dto.financialYearStart !== undefined) {
      const fys = Number(dto.financialYearStart);
      if (isNaN(fys) || fys < 1 || fys > 12) {
        throw new BadRequestError('Financial year start month must be between 1 (January) and 12 (December)');
      }
    }

    if (dto.vatScheme && !['STANDARD', 'FLAT_RATE', 'CASH'].includes(dto.vatScheme)) {
      throw new BadRequestError('Invalid VAT scheme. Must be STANDARD, FLAT_RATE, or CASH');
    }

    const firm = await prisma.$transaction(async (tx) => {
      const createdFirm = await tx.firm.create({
        data: {
          name: trimmedName,
          legalName: dto.legalName?.trim() || trimmedName,
          companyNumber: dto.companyNumber?.trim() || null,
          vatNumber: dto.vatNumber?.trim() || null,
          address: dto.address?.trim() || null,
          city: dto.city?.trim() || null,
          county: dto.county?.trim() || null,
          postcode: dto.postcode?.trim() || null,
          country: dto.country?.trim() || 'GB',
          currency: dto.currency?.trim() || 'GBP',
          contactEmail: dto.contactEmail?.trim() || null,
          contactPhone: dto.contactPhone?.trim() || null,
          vatScheme: dto.vatScheme || 'STANDARD',
          vatRegistered: dto.vatRegistered !== undefined ? dto.vatRegistered : true,
          financialYearStart: dto.financialYearStart ? Number(dto.financialYearStart) : 4,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      // Initialize default UK VAT rates for bookkeeping in the new company
      await tx.vatRate.createMany({
        data: [
          { firmId: createdFirm.id, code: 'STANDARD', name: 'Standard Rate (20%)', rate: 20.0, isDefault: true, isSystem: true },
          { firmId: createdFirm.id, code: 'REDUCED', name: 'Reduced Rate (5%)', rate: 5.0, isDefault: false, isSystem: true },
          { firmId: createdFirm.id, code: 'ZERO', name: 'Zero Rate (0%)', rate: 0.0, isDefault: false, isSystem: true },
          { firmId: createdFirm.id, code: 'EXEMPT', name: 'Exempt (0%)', rate: 0.0, isDefault: false, isSystem: true },
        ],
      });

      // NOTE: NO dummy/fabricated VAT obligations are created for newly created companies.
      // In Phase 2, actual quarterly VAT obligations will be retrieved directly from HMRC MTD API.

      // Audit log to record company creation and establish administrative ownership
      await tx.auditLog.create({
        data: {
          firmId: createdFirm.id,
          userId: adminUserId || null,
          action: 'FIRM_CREATED',
          entity: 'Firm',
          entityId: createdFirm.id,
          metadata: `Created new company: ${createdFirm.name}`,
        },
      });

      return createdFirm;
    });

    return firm;
  }

  static async update(id: string, dto: UpdateFirmDto, adminUserId?: string, userFirmId?: string) {
    await FirmsService.getById(id, adminUserId, userFirmId);

    const updated = await prisma.firm.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        legalName: dto.legalName !== undefined ? dto.legalName?.trim() : undefined,
        companyNumber: dto.companyNumber !== undefined ? dto.companyNumber?.trim() : undefined,
        vatNumber: dto.vatNumber !== undefined ? dto.vatNumber?.trim() : undefined,
        address: dto.address !== undefined ? dto.address?.trim() : undefined,
        city: dto.city !== undefined ? dto.city?.trim() : undefined,
        county: dto.county !== undefined ? dto.county?.trim() : undefined,
        postcode: dto.postcode !== undefined ? dto.postcode?.trim() : undefined,
        country: dto.country !== undefined ? dto.country?.trim() : undefined,
        currency: dto.currency !== undefined ? dto.currency?.trim() : undefined,
        contactEmail: dto.contactEmail !== undefined ? dto.contactEmail?.trim() : undefined,
        contactPhone: dto.contactPhone !== undefined ? dto.contactPhone?.trim() : undefined,
        vatScheme: dto.vatScheme !== undefined ? dto.vatScheme : undefined,
        vatRegistered: dto.vatRegistered !== undefined ? dto.vatRegistered : undefined,
        financialYearStart: dto.financialYearStart !== undefined ? Number(dto.financialYearStart) : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        firmId: id,
        userId: adminUserId || null,
        action: 'FIRM_UPDATED',
        entity: 'Firm',
        entityId: id,
        metadata: `Updated company details for ${updated.name}`,
      },
    });

    return updated;
  }

  static async setStatus(id: string, isActive: boolean, adminUserId?: string, userFirmId?: string) {
    await FirmsService.getById(id, adminUserId, userFirmId);

    const updated = await prisma.firm.update({
      where: { id },
      data: { isActive },
    });

    await prisma.auditLog.create({
      data: {
        firmId: id,
        userId: adminUserId || null,
        action: isActive ? 'FIRM_ACTIVATED' : 'FIRM_DEACTIVATED',
        entity: 'Firm',
        entityId: id,
        metadata: `${isActive ? 'Activated' : 'Deactivated'} company ${updated.name}`,
      },
    });

    return updated;
  }

  static async getProfile(firmId: string) {
    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
    });

    if (!firm) {
      throw new NotFoundError(`Firm not found`);
    }

    return firm;
  }

  static async updateProfile(firmId: string, dto: UpdateFirmDto, userId?: string) {
    return FirmsService.update(firmId, dto, userId, firmId);
  }

  static async getUsers(firmId: string) {
    return prisma.user.findMany({
      where: { firmId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

