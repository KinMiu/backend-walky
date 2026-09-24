import express from "express";
import {
  createTodoController,
  deleteTodoController,
  getTodoByIdController,
  getTodosController,
  toggleTodoController,
  updateTodoController,
} from "./todo.controller.js";
import {verifyToken} from "../../middleware/auth.middleware.js";
import {validate} from "../../middleware/validate.middleware.js";
import {
  createTodoSchema,
  queryTodoSchema,
  updateTodoSchema,
} from "./todo.validator.js";

const router = express.Router();

// All Todo endpoints require authentication
router.use(verifyToken);

router.post(
  "/",
  validate(createTodoSchema),
  createTodoController,
);

router.get(
  "/",
  validate(queryTodoSchema, "query"),
  getTodosController,
);

router.get("/:id", getTodoByIdController);

router.put(
  "/:id",
  validate(updateTodoSchema),
  updateTodoController,
);

router.patch("/:id/toggle", toggleTodoController);

router.delete("/:id", deleteTodoController);

export default router;
