import { AppError } from "@/types/index.js";
import { Next } from "koa";
import { Context } from "node:vm";
import winston from "winston";
import { generateResponseBody } from "./index.js";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // ← very important
    winston.format.splat(),
    winston.format.json(), // good for prod
    winston.format.prettyPrint(), // ← nicer for dev (uncomment if you prefer)
  ),
  defaultMeta: { service: "my-koa-app" },
  transports: [
    // always log to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),

    // log errors & warnings to file (optional but very useful)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// ────────────────────────────────────────────────
// Catch unhandled rejections & uncaught exceptions
// (these are **outside** of Koa request lifecycle)

logger.exceptions.handle(
  new winston.transports.Console(),
  new winston.transports.File({ filename: "logs/exceptions.log" }),
);

logger.rejections.handle(
  new winston.transports.Console(),
  new winston.transports.File({ filename: "logs/rejections.log" }),
);

// Optional: also listen manually (some people prefer explicit control)
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION", { error: err });
  // Usually you want graceful shutdown here in production
  // setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UNHANDLED REJECTION", { reason, promise });
  // Same as above – consider exiting in production
});

const loggerMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();

    if (ctx.status === 404 && !ctx.body) {
      ctx.body = generateResponseBody({ message: "Not Found" });
    }
  } catch (err: AppError | Error | any) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    ctx.status = status;
    ctx.body =
      ctx.body ??
      generateResponseBody({
        message: message,
        // ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      });

    // Log with useful context
    logger.error(`${status} - ${message}`, {
      method: ctx.method,
      url: ctx.originalUrl,
      ip: ctx.ip,
      error: err,
      stack: err.stack,
      body: ctx.request.body,
      user: ctx.state.user,
    });
  }
};

export { logger, loggerMiddleware };
