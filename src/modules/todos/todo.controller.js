import {paginatedResponse, successResponse} from "../../utils/response.js";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  getTodos,
  toggleTodo,
  updateTodo,
} from "./todo.service.js";

export const createTodoController = async (req, res, next) => {
  try {
    const result = await createTodo(req.user.id, req.body);
    return successResponse(res, result, "Todo created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getTodosController = async (req, res, next) => {
  try {
    const {todos, pagination} = await getTodos(req.user, req.query);
    return paginatedResponse(res, todos, pagination, "Todos retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getTodoByIdController = async (req, res, next) => {
  try {
    const result = await getTodoById(req.user, req.params.id);
    return successResponse(res, result, "Todo retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const updateTodoController = async (req, res, next) => {
  try {
    const result = await updateTodo(req.user, req.params.id, req.body);
    return successResponse(res, result, "Todo updated successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const toggleTodoController = async (req, res, next) => {
  try {
    const result = await toggleTodo(req.user, req.params.id);
    return successResponse(res, result, "Todo completion status updated", 200);
  } catch (error) {
    next(error);
  }
};

export const deleteTodoController = async (req, res, next) => {
  try {
    const result = await deleteTodo(req.user, req.params.id);
    return successResponse(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};
