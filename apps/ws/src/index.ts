import { WebSocketServer } from './server';
import { logger } from '@repo/logger';

const server = new WebSocketServer();

process.on('SIGINT', () => {
  logger.info('Shutting down WebSocket Server...');
  server.httpServer.close(() => {
    logger.info('HTTP Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Shutting down WebSocket Server...');
  server.httpServer.close(() => {
    logger.info('HTTP Server closed.');
    process.exit(0);
  });
});

server.start();
