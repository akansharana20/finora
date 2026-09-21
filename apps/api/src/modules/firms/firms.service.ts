import prisma from '../../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { isUserAuthorizedForFirm } from '../../middleware/auth';
import { Role } from '@prisma/client';

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

function validateVatNumber(vatNumber?: string) {
  if (vatNumber === undefined || vatNumber.trim() === '') return;
  const normalized = vatNumber.replace(/\D/g, '');
  if (normalized.length !== 9) {
    throw new BadRequestError('VAT Registration Number must contain 9 digits');
  }
}

export class FirmsService {
  static async list(userId: string, userFirmId?: string) {
    const memberships = await prisma.firmMembership.findMany({
      where: { userId },
      select: { firmId: true },
    });

    const firmIds = new Set<string>(memberships.map((membership) => membership.firmId));
    if (userFirmId) firmIds.add(userFirmId);

    const legacyCreatedFirms = await prisma.auditLog.findMany({
      where: {
        userId,
        action: { in: ['FIRM_CREATED', 'FIRM_REGISTERED'] },
      },
      select: { firmId: true },
    });

    for (const log of legacyCreatedFirms) {
      if (log.firmId) firmIds.add(log.firmId);
    }

    const authorizedFirmIds = [...firmIds];
    if (authorizedFirmIds.length === 0) {
      return [];
    }

    return prisma.firm.findMany({
      where: { id: { in: authorizedFirmIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: { where: { userId }, select: { role: true } },
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
    if (adminUserId) {
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

    validateVatNumber(dto.vatNumber);

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

      // The creator is explicitly assigned. Audit logs are not authorization records.
      if (adminUserId) {
        const creator = await tx.user.findUnique({ where: { id: adminUserId }, select: { role: true } });
        await tx.firmMembership.create({ data: { userId: adminUserId, firmId: createdFirm.id, role: creator?.role || Role.USER } });
      }
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
    if (!adminUserId) throw new ForbiddenError('Company administrator access is required');
    await FirmsService.requireCompanyAdmin(id, adminUserId);
    await FirmsService.getById(id, adminUserId, userFirmId);
    validateVatNumber(dto.vatNumber);

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
    if (!adminUserId) throw new ForbiddenError('Company administrator access is required');
    await FirmsService.requireCompanyAdmin(id, adminUserId);
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
    const memberships = await prisma.firmMembership.findMany({
      where: { firmId },
      select: { role: true, createdAt: true, user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return memberships.map((membership) => ({ ...membership.user, role: membership.role, createdAt: membership.createdAt }));
  }

  static async assignUser(firmId: string, userId: string, role: Role, actorId: string) {
    await FirmsService.requireCompanyAdmin(firmId, actorId);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundError('User not found');
    return prisma.firmMembership.upsert({
      where: { userId_firmId: { userId, firmId } },
      update: { role }, create: { userId, firmId, role },
    });
  }

  static async removeUserAssignment(firmId: string, userId: string, actorId: string) {
    await FirmsService.requireCompanyAdmin(firmId, actorId);
    await prisma.firmMembership.delete({ where: { userId_firmId: { userId, firmId } } });
    return { removed: true };
  }

  static async remove(id: string, actorId: string) {
    await FirmsService.requireCompanyAdmin(id, actorId);
    const firm = await prisma.firm.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!firm) throw new NotFoundError('Company not found');
    await prisma.$transaction(async (tx) => {
      // Explicit order makes the operation portable and prevents partial deletion.
      await tx.payment.deleteMany({ where: { firmId: id } });
      await tx.invoiceItem.deleteMany({ where: { invoice: { firmId: id } } });
      await tx.invoice.deleteMany({ where: { firmId: id } });
      await tx.expense.deleteMany({ where: { firmId: id } });
      await tx.customer.deleteMany({ where: { firmId: id } });
      await tx.supplier.deleteMany({ where: { firmId: id } });
      await tx.vatRate.deleteMany({ where: { firmId: id } });
      await tx.vatReturn.deleteMany({ where: { firmId: id } });
      await tx.vatObligation.deleteMany({ where: { firmId: id } });
      await tx.hmrcOAuthState.deleteMany({ where: { firmId: id } });
      await tx.hmrcConnection.deleteMany({ where: { firmId: id } });
      await tx.xeroConnection.deleteMany({ where: { firmId: id } });
      await tx.auditLog.deleteMany({ where: { firmId: id } });
      await tx.firmMembership.deleteMany({ where: { firmId: id } });
      await tx.user.updateMany({ where: { firmId: id }, data: { firmId: null } });
      await tx.firm.delete({ where: { id } });
    });
    return { id: firm.id, name: firm.name };
  }

  private static async requireCompanyAdmin(firmId: string, userId: string) {
    const membership = await prisma.firmMembership.findUnique({ where: { userId_firmId: { userId, firmId } }, select: { role: true } });
    if (!membership || membership.role !== Role.ADMIN) throw new ForbiddenError('Only a company administrator can manage this company');
  }
}

