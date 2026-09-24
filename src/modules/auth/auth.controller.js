import {successResponse} from "../../utils/response.js";
import {changePassword, getMe, login, register} from "./auth.service.js";

export const registerController = async (req, res, next) => {
  try {
    const result = await register(req.body);
    return successResponse(res, result, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.body);
    return successResponse(res, result, "Login successful", 200);
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req, res, next) => {
  try {
    const result = await getMe(req.user.id);
    return successResponse(res, result, "User profile retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const result = await changePassword(req.user.id, req.body);
    return successResponse(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};
