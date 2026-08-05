import { prisma } from '@repo/database';
import { IngredientSchema } from '@repo/types';
import { z } from 'zod';

type CreateIngredientDtoType = Omit<
  z.infer<typeof IngredientSchema>,
  | 'id'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
>;
type UpdateIngredientDtoType = Partial<CreateIngredientDtoType>;

export class IngredientService {
  static async createIngredient(tenantId: string, data: CreateIngredientDtoType) {
    return prisma.ingredient.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async getIngredients(tenantId: string) {
    return prisma.ingredient.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async getIngredientById(tenantId: string, id: string) {
    return prisma.ingredient.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
    });
  }

  static async updateIngredient(tenantId: string, id: string, data: UpdateIngredientDtoType) {
    return prisma.ingredient.updateMany({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      data,
    });
  }

  static async deleteIngredient(tenantId: string, id: string) {
    return prisma.ingredient.updateMany({
      where: {
        id,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
