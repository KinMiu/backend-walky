import {errorResponse} from "../utils/response.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route '${req.method} ${req.originalUrl}' not found.`, 404);
};
