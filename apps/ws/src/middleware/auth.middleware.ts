import { Socket } from 'socket.io';
import { loadJwtConfig, verifyAccessToken } from '@repo/auth';
import { logger } from '@repo/logger';

export const authMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
    if (!token) {
      logger.warn('Socket connection attempted without token', { id: socket.id });
      return next(new Error('Authentication error: Token missing'));
    }

    const tokenString = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    const config = loadJwtConfig();
    const payload = verifyAccessToken(tokenString, config);

    if (!payload || !payload.userId || !payload.tenantId) {
      logger.warn('Socket connection attempted with invalid token', { id: socket.id });
      return next(new Error('Authentication error: Invalid token'));
    }

    // Attach data to socket
    socket.data = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      roleId: payload.roleId,
      branchId: payload.branchId,
    };

    next();
  } catch (error) {
    logger.error('Socket authentication failed', { id: socket.id, error });
    next(new Error('Authentication error'));
  }
};
