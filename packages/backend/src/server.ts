import http from "http";
import {connectDB, disconnectDB, myEnvironment } from "@/configs";
import {startKeepAliveCron, stopKeepAliveCron} from "@/crons";
import app from "./app";
import {logger} from "./utils";

const PORT = myEnvironment.PORT || 8080;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`Server running on port: ${myEnvironment.PORT}`);
      logger.info(
        `Health check: ${myEnvironment.FRONTEND_URL}/health`
      )

      startKeepAliveCron();
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1)
  }
};

startServer();

let isShuttingDown = false;

const shutdown = async (signal:string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`\n${signal} received. Starting graceful shutdown...`)

  try {
    
    await new Promise<void>(resolve => {
      server.close(() => {
        logger.info("HTTP server closed");
        resolve();
      });
    });

    stopKeepAliveCron();

    await disconnectDB();
    logger.info("Database disconnected");
    logger.info("Shutdown complete. Exiting process.");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERN", shutdown);