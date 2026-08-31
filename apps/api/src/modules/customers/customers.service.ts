import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { CustomerStatus } from '@prisma/client';

export interface CustomerQueryDto {
  search?: string;
  status?: CustomerStatus;
}

export interface CreateCustomerDto {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  vatNumber?: string;
  notes?: string;
}

export class CustomersService {
  static async list(firmId: string, query: CustomerQueryDto) {
    const whereClause: any = { firmId };

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { postcode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { invoices: true },
        },
        invoices: {
          select: {
            balanceDue: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((c) => {
      const outstandingBalance = c.invoices
        .filter((inv) => inv.status !== 'CANCELLED')
        .reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

      const { invoices, ...rest } = c;
      return {
        ...rest,
        outstandingBalance,
      };
    });
  }

  static async getById(firmId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, firmId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const outstandingBalance = customer.invoices
      .filter((inv) => inv.status !== 'CANCELLED')
      .reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

    return {
      ...customer,
      outstandingBalance,
    };
  }

  static async create(firmId: string, dto: CreateCustomerDto) {
    return prisma.customer.create({
      data: {
        firmId,
        ...dto,
      },
    });
  }

  static async update(firmId: string, id: string, dto: Partial<CreateCustomerDto>) {
    await CustomersService.getById(firmId, id);
    return prisma.customer.update({
      where: { id },
      data: dto,
    });
  }
}
