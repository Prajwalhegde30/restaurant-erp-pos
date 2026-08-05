import { Server, Socket } from 'socket.io';
import { logger } from '@repo/logger';
import { EventBus, DomainEvent, OrderStatusUpdatedPayload } from '@repo/pubsub';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../contracts/events';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export class ConnectionManager {
  constructor(
    private io: TypedServer,
    private eventBus: EventBus,
  ) {}

  public handleConnection(socket: TypedSocket) {
    const { tenantId, branchId, userId } = socket.data;

    logger.info('Socket connected', { socketId: socket.id, tenantId, branchId, userId });

    const tenantRoom = `tenant:${tenantId}`;
    socket.join(tenantRoom);

    if (branchId) {
      const branchRoom = `tenant:${tenantId}:branch:${branchId}`;
      socket.join(branchRoom);
      socket.join(`kds:${branchId}`);

      this.subscribeToBranchEvents(tenantId, branchId);
    }

    // Ping-pong heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', {
        socketId: socket.id,
        reason,
        tenantId,
        branchId,
        userId,
      });
    });
  }

  // To prevent N callbacks for N sockets emitting to the room N times,
  // we can lazily initialize a single callback per branch.
  private branchSubscriptions = new Set<string>();

  public subscribeToBranchEvents(tenantId: string, branchId: string) {
    const key = `${tenantId}:${branchId}`;
    if (this.branchSubscriptions.has(key)) return;
    this.branchSubscriptions.add(key);

    const roomName = `tenant:${tenantId}:branch:${branchId}`;

    const callback = (event: DomainEvent<unknown>) => {
      if (event.eventType === 'OrderStatusUpdated') {
        const payload = event.payload as OrderStatusUpdatedPayload;
        this.io.to(roomName).emit('OrderStatusUpdated', {
          orderId: payload.orderId,
          status: payload.status,
        });
      }
      // other events (KitchenTicketCreated etc) can be handled similarly
    };

    this.eventBus.subscribe(tenantId, branchId, callback).catch((err) => {
      logger.error({ error: err }, 'Failed to subscribe to EventBus for branch');
      this.branchSubscriptions.delete(key);
    });
  }
}
