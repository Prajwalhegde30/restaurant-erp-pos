import { Prisma, prisma } from '@repo/database';
import { CustomerStatus } from '@repo/database';

export class CustomerService {
  /**
   * Create a new Customer
   */
  static async createCustomer(
    tenantId: string,
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
      status?: CustomerStatus;
    },
  ) {
    return await prisma.customer.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Get all customers for a tenant with cursor pagination
   */
  static async getCustomers(tenantId: string, limit = 50, cursor?: string) {
    const args: Prisma.CustomerFindManyArgs = {
      where: {
        tenantId,
        isDeleted: false,
      },
      take: limit + 1,
      orderBy: { id: 'asc' },
    };

    if (cursor) {
      args.cursor = { id: cursor };
    }

    const data = await prisma.customer.findMany(args);

    let nextCursor: string | null = null;
    const hasMore = data.length > limit;

    if (hasMore) {
      const nextItem = data.pop();
      nextCursor = nextItem!.id;
    }

    return { data, nextCursor, hasMore };
  }

  /**
   * Get a single customer by ID
   */
  static async getCustomerById(tenantId: string, customerId: string) {
    return await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        isDeleted: false,
      },
    });
  }

  /**
   * Update a customer
   */
  static async updateCustomer(
    tenantId: string,
    customerId: string,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string | null;
      phone?: string | null;
      status?: CustomerStatus;
    },
  ) {
    return await prisma.customer.updateMany({
      where: {
        id: customerId,
        tenantId,
        isDeleted: false,
      },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Soft delete a customer
   */
  static async deleteCustomer(tenantId: string, customerId: string, userId: string) {
    return await prisma.customer.updateMany({
      where: {
        id: customerId,
        tenantId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
