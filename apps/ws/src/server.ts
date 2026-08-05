import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import cors from 'cors';
import { logger } from '@repo/logger';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './contracts/events';
import { authMiddleware } from './middleware/auth.middleware';
import { ConnectionManager } from './managers/connection.manager';

export class WebSocketServer {
  public app: express.Application;
  public httpServer: HttpServer;
  public io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    this.app = express();
    this.app.use(cors());

    this.httpServer = createServer(this.app);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3002'];

    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
      },
    });

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.pubClient = new Redis(redisUrl);
    this.subClient = this.pubClient.duplicate();

    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupMiddleware() {
    this.io.use(authMiddleware);
  }

  private setupRoutes() {
    this.app.get('/health/liveness', (req, res) => {
      res.status(200).json({ status: 'ok', service: 'ws-server' });
    });

    this.app.get('/health/readiness', async (req, res) => {
      try {
        await this.pubClient.ping();
        res.status(200).json({ status: 'ok', redis: 'connected' });
      } catch {
        res.status(503).json({ status: 'error', redis: 'disconnected' });
      }
    });
  }

  private setupSocketHandlers() {
    const connectionManager = new ConnectionManager(this.io);

    this.io.on('connection', (socket) => {
      connectionManager.handleConnection(socket);
    });
  }

  public start() {
    const port = process.env.WS_PORT || 4000;
    this.httpServer.listen(port, () => {
      logger.info(`WebSocket Server running on port ${port}`);
    });
  }
}
