export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
  userId?: string;
  receiptId?: string;
  error?: Error;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(entry: LogEntry) {
    const logData = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logData, null, 2));
  }

  debug(message: string, context?: any) {
    this.log({ level: LogLevel.DEBUG, message, context, timestamp: new Date() });
  }

  info(message: string, context?: any) {
    this.log({ level: LogLevel.INFO, message, context, timestamp: new Date() });
  }

  warn(message: string, context?: any) {
    this.log({ level: LogLevel.WARN, message, context, timestamp: new Date() });
  }

  error(message: string, error?: Error, context?: any) {
    this.log({ level: LogLevel.ERROR, message, error, context, timestamp: new Date() });
  }

  receipt(receiptId: string, message: string, context?: any) {
    this.log({
      level: LogLevel.INFO,
      message,
      receiptId,
      context,
      timestamp: new Date(),
    });
  }
}

export const logger = Logger.getInstance();
