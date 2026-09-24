import {successResponse} from "../../utils/response.js";
import {
  createRoom,
  endRoom,
  getMyActiveRoom,
  joinRoom,
  syncRoomPresence,
} from "./room.service.js";

export const createRoomController = async (req, res, next) => {
  try {
    const result = await createRoom(req.user.id);
    return successResponse(res, result, "Room created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const joinRoomController = async (req, res, next) => {
  try {
    const {pin_code} = req.body;
    const result = await joinRoom(req.user.id, pin_code);
    return successResponse(res, result, "Joined room successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const endRoomController = async (req, res, next) => {
  try {
    const result = await endRoom(req.user.id);
    return successResponse(res, null, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const getMyRoomController = async (req, res, next) => {
  try {
    const result = await getMyActiveRoom(req.user.id);
    return successResponse(res, result, "Active room retrieved", 200);
  } catch (error) {
    next(error);
  }
};

export const syncRoomController = async (req, res, next) => {
  try {
    const {pin_code, latitude, longitude, is_speaking} = req.body;
    const result = await syncRoomPresence(req.user.id, req.user.username, {
      pinCode: pin_code,
      latitude,
      longitude,
      isSpeaking: is_speaking,
    });
    return successResponse(res, result, "Room state synced", 200);
  } catch (error) {
    next(error);
  }
};
