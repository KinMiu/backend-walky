import jwt from "jsonwebtoken";
import {errorResponse} from "../utils/response.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired. Please login again.", 401);
    }
    return errorResponse(res, "Invalid authentication token.", 401);
  }
};

export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Access denied for role '${req.user.role}'`,
        403,
      );
    }

    next();
  };
};

export const optionalToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token validation error for optional authentication
    }
  }
  next();
};
