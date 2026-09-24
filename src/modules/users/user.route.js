import express from "express";
import {
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  updateUserRoleController,
} from "./user.controller.js";
import {authorizeRole, verifyToken} from "../../middleware/auth.middleware.js";
import {validate} from "../../middleware/validate.middleware.js";
import {
  queryUserSchema,
  updateRoleSchema,
  updateUserSchema,
} from "./user.validator.js";

const router = express.Router();

// Require login for all user endpoints
router.use(verifyToken);

// Admin & SuperAdmin can list all users
router.get(
  "/",
  authorizeRole(["SUPER_ADMIN", "ADMIN"]),
  validate(queryUserSchema, "query"),
  getAllUsersController,
);

// Get single user by ID
router.get("/:id", getUserByIdController);

// Update user details
router.put("/:id", validate(updateUserSchema), updateUserController);

// Only SuperAdmin can change user roles
router.patch(
  "/:id/role",
  authorizeRole(["SUPER_ADMIN"]),
  validate(updateRoleSchema),
  updateUserRoleController,
);

// Admin & SuperAdmin can delete a user
router.delete(
  "/:id",
  authorizeRole(["SUPER_ADMIN", "ADMIN"]),
  deleteUserController,
);

export default router;
