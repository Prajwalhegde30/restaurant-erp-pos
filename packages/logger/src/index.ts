import pino from 'pino';

export interface LogContext {
  correlation_id?: string;
  tenant_id?: string;
  user_id?: string;
  [key: string]: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.access_token',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Creates a child logger with the provided context.
 * Use this to inject tenant_id, correlation_id, etc.
 */
export const createLoggerWithContext = (context: LogContext) => {
  return logger.child(context);
};
