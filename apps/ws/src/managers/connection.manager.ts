import { Server, Socket } from 'socket.io';
import { logger } from '@repo/logger';
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
  constructor(private io: TypedServer) {}

  public handleConnection(socket: TypedSocket) {
    const { tenantId, branchId, userId } = socket.data;

    logger.info('Socket connected', { socketId: socket.id, tenantId, branchId, userId });

    // Join tenant global room
    socket.join(`tenant:${tenantId}`);

    // Join branch specific room if branchId exists
    if (branchId) {
      socket.join(`tenant:${tenantId}:branch:${branchId}`);
      // Join specific POS or KDS room logic can be expanded here
      socket.join(`kds:${branchId}`); // Automatically join KDS room for now to receive kitchen updates
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
}
