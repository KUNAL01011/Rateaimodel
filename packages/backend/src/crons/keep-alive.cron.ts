import cron, { ScheduledTask } from "node-cron";
import { logger } from "@/utils";
import { myEnvironment } from "@/configs";

let task: ScheduledTask | null = null;

export const startKeepAliveCron = (): void => {
  task = cron.schedule("*/10 * * * *", async () => {
    try {
      const res = await fetch(myEnvironment.BACKEND_URL!);
      logger.info(
        `Keep alive ping -> ${res.status} (${new Date().toISOString()})`
      );
    } catch (error) {
      logger.error("Keep alive ping failed:", error);
    }
  });

  logger.info(
    "Keep alive cron started - pinging http://localhost:8080/health every 10 min"
  );
};

export const stopKeepAliveCron = (): void => {
  if (task) {
    task.stop();
    task = null;
    logger.info("Keep alive cron stopped");
  }
};
