import pino from "pino";
import { CONFIG } from "./env.config";

const isDevelopment = CONFIG.APP_NODE_ENV !== "production";

export const logger = pino({
  level: isDevelopment ? "debug" : "info",

  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  redact: {
    paths: [
      "password",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },
});
