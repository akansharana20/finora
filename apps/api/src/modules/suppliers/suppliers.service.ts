import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { SupplierStatus } from '@prisma/client';

export interface SupplierQueryDto {
  search?: string;
  status?: SupplierStatus;
}

export interface CreateSupplierDto {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  vatNumber?: string;
  notes?: string;
}

export class SuppliersService {
  static async list(firmId: string, query: SupplierQueryDto) {
    const whereClause: any = { firmId };

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { expenses: true },
        },
        expenses: {
          select: {
            total: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return suppliers.map((s) => {
      const totalExpenses = s.expenses.reduce((sum, exp) => sum + Number(exp.total), 0);
      const { expenses, ...rest } = s;
      return {
        ...rest,
        totalExpenses,
      };
    });
  }

  static async getById(firmId: string, id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, firmId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const totalExpenses = supplier.expenses.reduce((sum, exp) => sum + Number(exp.total), 0);

    return {
      ...supplier,
      totalExpenses,
    };
  }

  static async create(firmId: string, dto: CreateSupplierDto) {
    return prisma.supplier.create({
      data: {
        firmId,
        ...dto,
      },
    });
  }

  static async update(firmId: string, id: string, dto: Partial<CreateSupplierDto>) {
    await SuppliersService.getById(firmId, id);
    return prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }
}
