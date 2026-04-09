import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  base: {
    service: "billing-api",
    version: process.env.npm_package_version || "0.0.1",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export function createRequestLogger(requestId: string, path: string) {
  return logger.child({
    requestId,
    path,
  });
}

export function createWebhookLogger(eventId: string, eventType: string) {
  return logger.child({
    eventId,
    eventType,
    source: "stripe-webhook",
  });
}
