import { prisma } from '@repo/database';

export interface ExplodedIngredient {
  ingredientId: string;
  ingredientName: string;
  nominalQuantity: number;
  unit: string;
  yieldLossPct: number;
  spoilagePct: number;
  consumptionQuantity: number;
}

export class RecipeExplosionService {
  /**
   * Explodes a MenuItem into its base ingredients, considering branch-level substitutions,
   * yield loss, and spoilage percentages.
   */
  static async explodeMenuItem(
    tenantId: string,
    menuItemId: string,
    branchId: string,
    requestedQuantity: number = 1,
  ): Promise<{ recipeId: string; recipeName: string; ingredients: ExplodedIngredient[] } | null> {
    const recipe = await prisma.recipe.findFirst({
      where: {
        tenantId,
        menuItemId,
        isDeleted: false,
      },
      include: {
        recipeIngredients: {
          where: { isDeleted: false },
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return null;
    }

    // Handle Branch Substitutions:
    // If a RecipeIngredient exists for the specific branch, it overrides the central one (branchId === null).
    // Let's group by ingredientId (or just resolve the active ones).
    // Actually, branch substitutions in standard systems either replace the entire ingredient or just the quantity.
    // The schema says: "Optional branchId enables branch-level ingredient substitutions per documented rule (§25.3)."
    // We will group by ingredientId and prefer the one with matching branchId over null.
    // Wait, what if a branch substitutes Ingredient A with Ingredient B? Then grouping by ingredientId won't work.
    // Usually, branch substitutions are modeled by having multiple recipes or the RecipeIngredient itself acts as the override.
    // Let's group by `ingredientId` for now, preferring `branchId === current branchId` over `branchId === null`.
    const resolvedIngredientsMap = new Map<string, (typeof recipe.recipeIngredients)[0]>();

    for (const ri of recipe.recipeIngredients) {
      if (ri.branchId && ri.branchId !== branchId) {
        continue; // Belongs to another branch, ignore
      }

      const existing = resolvedIngredientsMap.get(ri.ingredientId);
      if (!existing) {
        resolvedIngredientsMap.set(ri.ingredientId, ri);
      } else {
        // If we already have one, prefer the branch-specific one over the central one
        if (ri.branchId === branchId) {
          resolvedIngredientsMap.set(ri.ingredientId, ri);
        }
      }
    }

    const exploded: ExplodedIngredient[] = [];

    for (const ri of resolvedIngredientsMap.values()) {
      const yieldLoss = Number(ri.yieldLossPct) || 0;
      const spoilage = Number(ri.spoilagePct) || 0;
      const nominalQty = Number(ri.quantity) * requestedQuantity;

      // Prevent division by zero if data is malformed (e.g. 100% loss)
      const effectiveYield = 1 - yieldLoss;
      const effectiveSpoilage = 1 - spoilage;
      const denominator =
        (effectiveYield <= 0 ? 1 : effectiveYield) *
        (effectiveSpoilage <= 0 ? 1 : effectiveSpoilage);

      const consumptionQuantity = nominalQty / denominator;

      exploded.push({
        ingredientId: ri.ingredientId,
        ingredientName: ri.ingredient.name,
        nominalQuantity: nominalQty,
        unit: ri.unit,
        yieldLossPct: yieldLoss,
        spoilagePct: spoilage,
        consumptionQuantity,
      });
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredients: exploded,
    };
  }

  /**
   * Generates the immutable snapshot of the recipe for an order item.
   * This guarantees that future changes to the recipe do not affect historical COGS.
   */
  static async snapshotOrderItemRecipe(
    tenantId: string,
    orderItemId: string,
    branchId: string,
  ): Promise<void> {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        tenantId,
        isDeleted: false,
      },
    });

    if (!orderItem) {
      throw new Error('OrderItem not found');
    }

    const explosionResult = await this.explodeMenuItem(
      tenantId,
      orderItem.menuItemId,
      branchId,
      orderItem.quantity,
    );

    if (!explosionResult) {
      // Menu item has no recipe, nothing to snapshot
      return;
    }

    // Insert snapshots
    await prisma.$transaction(
      explosionResult.ingredients.map((ing) =>
        prisma.orderItemRecipeSnapshot.create({
          data: {
            orderItemId,
            recipeId: explosionResult.recipeId,
            recipeName: explosionResult.recipeName,
            ingredientId: ing.ingredientId,
            ingredientName: ing.ingredientName,
            quantity: ing.consumptionQuantity,
            unit: ing.unit,
            yieldLossPct: ing.yieldLossPct,
            spoilagePct: ing.spoilagePct,
          },
        }),
      ),
    );
  }
}
