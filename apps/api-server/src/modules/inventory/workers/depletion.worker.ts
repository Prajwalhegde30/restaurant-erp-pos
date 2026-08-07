import { Worker, Job } from 'bullmq';
import { prisma } from '@repo/database';
import { connection, INVENTORY_DEPLETION_QUEUE_NAME } from '../../../lib/queue/inventory.queue';
import { DepletionJobPayload } from './depletion.producer';

export const startDepletionWorker = () => {
  const worker = new Worker<DepletionJobPayload>(
    INVENTORY_DEPLETION_QUEUE_NAME,
    async (job: Job<DepletionJobPayload>) => {
      const { tenantId, branchId, orderItemId } = job.data;

      // Ensure deterministic processing with a transaction
      await prisma.$transaction(async (tx) => {
        // 1. Idempotency Check
        // Have we already depleted inventory for this order item?
        const existingMovement = await tx.stockMovement.findFirst({
          where: {
            tenantId,
            referenceId: orderItemId,
            referenceType: 'OrderItem',
          },
        });

        if (existingMovement) {
          // Already processed, exit safely (job completes)
          return;
        }

        // 2. Fetch the recipe snapshot (Single Source of Truth)
        const snapshots = await tx.orderItemRecipeSnapshot.findMany({
          where: {
            orderItemId,
          },
        });

        if (!snapshots || snapshots.length === 0) {
          // Nothing to deplete (e.g., item has no recipe)
          return;
        }

        // 3. Process each ingredient from the snapshot
        for (const snap of snapshots) {
          const qtyToDeplete = Number(snap.quantity);

          if (qtyToDeplete <= 0) continue;

          // Find batches for FIFO (oldest received, oldest expires first)
          const availableBatches = await tx.inventoryBatch.findMany({
            where: {
              tenantId,
              branchId,
              ingredientId: snap.ingredientId,
              isDeleted: false,
              remainingQty: { gt: 0 },
            },
            orderBy: [{ expiresAt: 'asc' }, { receivedAt: 'asc' }],
          });

          let remainingToDeplete = qtyToDeplete;

          for (const batch of availableBatches) {
            if (remainingToDeplete <= 0) break;

            const batchRemaining = Number(batch.remainingQty);
            const deduct = Math.min(batchRemaining, remainingToDeplete);

            // Deduct from batch
            await tx.inventoryBatch.update({
              where: { id: batch.id },
              data: {
                remainingQty: {
                  decrement: deduct,
                },
              },
            });

            // Write ledger entry
            await tx.stockMovement.create({
              data: {
                tenantId,
                branchId,
                ingredientId: snap.ingredientId,
                movementType: 'CONSUMPTION',
                quantityDelta: -deduct, // Negative for consumption
                unitCost: batch.unitCost, // Cost from this specific batch
                referenceId: orderItemId,
                referenceType: 'OrderItem',
                notes: `Auto-depletion for order item ${orderItemId}, batch ${batch.batchNumber}`,
              },
            });

            remainingToDeplete -= deduct;
          }

          // Note: If remainingToDeplete > 0, it means we don't have enough physical batch stock.
          // In many systems, we still allow actualQty to go negative (theoretical vs actual divergence),
          // or we create a stock movement with cost 0 (or average cost).
          // We must record the remaining depletion so actualQty remains accurate (goes negative if needed).
          if (remainingToDeplete > 0) {
            // Find base ingredient cost for the negative spillover
            const ingredient = await tx.ingredient.findFirst({
              where: { id: snap.ingredientId, tenantId },
            });
            const fallbackCost = ingredient ? ingredient.unitCost : 0;

            await tx.stockMovement.create({
              data: {
                tenantId,
                branchId,
                ingredientId: snap.ingredientId,
                movementType: 'CONSUMPTION',
                quantityDelta: -remainingToDeplete,
                unitCost: fallbackCost,
                referenceId: orderItemId,
                referenceType: 'OrderItem',
                notes: `Auto-depletion (out of batch stock) for order item ${orderItemId}`,
              },
            });
          }

          // 4. Update InventoryItem actualQty (decrement by total required)
          const inventoryItem = await tx.inventoryItem.findFirst({
            where: {
              tenantId,
              branchId,
              ingredientId: snap.ingredientId,
              isDeleted: false,
            },
          });

          if (inventoryItem) {
            await tx.inventoryItem.update({
              where: { id: inventoryItem.id },
              data: {
                actualQty: {
                  decrement: qtyToDeplete,
                },
                version: {
                  increment: 1, // OCC
                },
              },
            });
          } else {
            // In case inventory item doesn't exist yet, create it with negative quantity
            await tx.inventoryItem.create({
              data: {
                tenantId,
                branchId,
                ingredientId: snap.ingredientId,
                actualQty: -qtyToDeplete,
                theoreticalQty: -qtyToDeplete, // Deduct theoretical as well
                version: 1,
              },
            });
          }
        }
      });
    },
    { connection },
  );

  worker.on('failed', (job, err) => {
    console.error(`Depletion Job ${job?.id} failed:`, err);
  });

  return worker;
};
