import { CONFIG } from "./config/env.config";
import express from "express";
import { httpPinoLogger } from "./middleware/logger.middleware";
import { logger } from "./config/logger.config";
import rootRouter from "./route";
import { sessionMiddleware } from "./middleware/session.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(sessionMiddleware);

app.use(httpPinoLogger);

app.use("/api", rootRouter);

app.use("/health", (_req, res) => {
  logger.info("Health check");
  res.status(200).json("Server is heathly");
});

app.use((_req, res) => {
  logger.warn("Route not found");
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(CONFIG.APP_PORT, () => {
  logger.info(`Server is running on port ${CONFIG.APP_PORT}`);
  logger.info(` http://${CONFIG.APP_HOST}:${CONFIG.APP_PORT}`);
});
