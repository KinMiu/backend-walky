import express from "express";
import {
  changePasswordController,
  getMeController,
  loginController,
  registerController,
} from "./auth.controller.js";
import {verifyToken} from "../../middleware/auth.middleware.js";
import {validate} from "../../middleware/validate.middleware.js";
import {authLimiter} from "../../middleware/rateLimiter.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "./auth.validator.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerController,
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  loginController,
);

router.get("/me", verifyToken, getMeController);

router.put(
  "/change-password",
  verifyToken,
  validate(changePasswordSchema),
  changePasswordController,
);

export default router;
