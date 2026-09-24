import logger from "../utils/logger.js";
import {errorResponse} from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  // Prisma Known Request Error
  if (err.code && err.code.startsWith("P")) {
    switch (err.code) {
      case "P2002": {
        const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
        return errorResponse(res, `Duplicate entry. A record with this value already exists${target}.`, 409);
      }
      case "P2025":
        return errorResponse(res, "Record not found.", 404);
      case "P2003":
        return errorResponse(res, "Foreign key constraint failed.", 400);
      default:
        return errorResponse(
          res,
          process.env.NODE_ENV === "development" ? `Database error: ${err.message}` : "Database error occurred.",
          400,
        );
    }
  }

  // Syntax error / JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return errorResponse(res, "Invalid JSON payload format.", 400);
  }

  // Generic HTTP error with custom status code
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  return errorResponse(res, message, statusCode, err.errors || null);
};
