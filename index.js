import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import {prisma} from "./src/config/prisma.js";
import logger from "./src/utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await prisma.$disconnect();
      logger.info("Database connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error("Error during database disconnect:", err);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful close hangs
  setTimeout(() => {
    logger.error("Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

startServer();
