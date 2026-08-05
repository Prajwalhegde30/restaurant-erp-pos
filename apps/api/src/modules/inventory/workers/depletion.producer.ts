import {
  inventoryDepletionQueue,
  INVENTORY_DEPLETION_QUEUE_NAME,
} from '../../../lib/queue/inventory.queue';

export interface DepletionJobPayload {
  tenantId: string;
  branchId: string;
  orderItemId: string;
}

export class DepletionProducer {
  static async queueDepletionJob(payload: DepletionJobPayload) {
    // Generate a predictable job ID to prevent accidental exact duplicates in queue
    const jobId = `${payload.tenantId}:${payload.branchId}:${payload.orderItemId}`;

    await inventoryDepletionQueue.add(INVENTORY_DEPLETION_QUEUE_NAME, payload, {
      jobId, // Native BullMQ idempotency constraint for the pending queue
    });
  }
}
