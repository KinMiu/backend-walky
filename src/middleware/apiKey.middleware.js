import crypto from "crypto";
import dotenv from "dotenv";
import {errorResponse} from "../utils/response.js";

dotenv.config();

const HEADER = (process.env.API_KEY_HEADER || "x-api-key").toLowerCase();
const KEYS = String(process.env.API_KEYS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const timingSafeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ""), "utf8");
  const bufB = Buffer.from(String(b || ""), "utf8");

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const extractKey = (req) => {
  let key = req.headers[HEADER];
  if (Array.isArray(key)) key = key[0];

  if (!key && req.headers.authorization) {
    const match = /^ApiKey\s+(.+)$/i.exec(req.headers.authorization);
    if (match) key = match[1];
  }
  return key;
};

export function requireApiKey() {
  return (req, res, next) => {
    // If no API keys are defined in environment, allow requests through
    if (KEYS.length === 0) {
      return next();
    }

    const key = extractKey(req);
    if (!key) {
      return errorResponse(res, "API key is required in headers", 401);
    }

    if (!KEYS.some((validKey) => timingSafeEqual(key, validKey))) {
      return errorResponse(res, "Invalid API key", 403);
    }

    next();
  };
}
