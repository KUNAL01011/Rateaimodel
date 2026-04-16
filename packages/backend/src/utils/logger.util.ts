import { myEnvironment } from "@/configs";
import morgan from "morgan";
import winston from "winston";

const stream = {
  write: (message: string) => logger.http(message.trim())
};

const skip = () => {
  const env = myEnvironment.NODE_ENV || "development";
  return env !== "development";
}

const levels = {
  error: 0,
  warn: 1, 
  info: 2, 
  http: 3,
  debug: 4,
};

const level = () => {
  const env = myEnvironment.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "megenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({format: "DD MMM, YYYY - HH:mm:ss:ms"}),
  winston.format.colorize({all: true}),
  winston.format.printf(
    info => `[${info.timestamp} ${info.level}: ${info.message}]`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({filename: "logs/error.log", level: "error"}),
  new winston.transports.File({filename: "logs/info.log", level: "info"}),
  new winston.transports.File({filename: "logs/http.log", level: "http"}),
];

export const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  {stream, skip}
);

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});