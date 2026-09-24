import {errorResponse} from "../utils/response.js";

export const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed;
      next();
    } catch (error) {
      if (error.issues) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        const summaryMessage = formattedErrors.map((e) => e.message).join(", ");
        return errorResponse(res, summaryMessage || "Validation failed", 400, formattedErrors);
      }
      return errorResponse(res, error.message || "Validation failed", 400);
    }
  };
