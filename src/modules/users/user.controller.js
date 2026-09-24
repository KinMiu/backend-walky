import {paginatedResponse, successResponse} from "../../utils/response.js";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
} from "./user.service.js";

export const getAllUsersController = async (req, res, next) => {
  try {
    const {users, pagination} = await getAllUsers(req.query);
    return paginatedResponse(res, users, pagination, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const user = await getUserById(req.user, req.params.id);
    return successResponse(res, user, "User retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const user = await updateUser(req.user, req.params.id, req.body);
    return successResponse(res, user, "User updated successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleController = async (req, res, next) => {
  try {
    const user = await updateUserRole(req.user, req.params.id, req.body.role);
    return successResponse(res, user, `User role changed to ${req.body.role}`, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const result = await deleteUser(req.user, req.params.id);
    return successResponse(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};
