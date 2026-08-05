import { WebSocketServer } from './server';
import { logger } from '@repo/logger';

const server = new WebSocketServer();

const shutdown = async () => {
  logger.info('Shutting down WebSocket Server...');
  if (server.eventBus) {
    await server.eventBus.disconnect();
  }
  server.httpServer.close(() => {
    logger.info('HTTP Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.start().catch((err) => {
  logger.error({ error: err }, 'Failed to start WebSocket Server');
  process.exit(1);
});
