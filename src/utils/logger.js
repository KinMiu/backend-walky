const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, ...args) => {
    console.log(`\x1b[36m[INFO]\x1b[0m ${getTimestamp()} - ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${getTimestamp()} - ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${getTimestamp()} - ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`\x1b[35m[DEBUG]\x1b[0m ${getTimestamp()} - ${message}`, ...args);
    }
  },
};

export default logger;
