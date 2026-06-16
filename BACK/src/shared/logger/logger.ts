import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, colorize, simple } = winston.format;

const fileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  format: combine(timestamp(), json()),
});

const consoleTransport = new winston.transports.Console({
  format: combine(colorize(), timestamp(), simple()),
});

const transports: winston.transport[] = [fileTransport];
if (process.env.NODE_ENV !== 'production') {
  transports.push(consoleTransport);
}

const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
});

export function createLogger(module: string) {
  return baseLogger.child({ module });
}
