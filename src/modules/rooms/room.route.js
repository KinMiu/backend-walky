import express from "express";
import {
  createRoomController,
  endRoomController,
  getMyRoomController,
  joinRoomController,
  syncRoomController,
} from "./room.controller.js";
import {verifyToken} from "../../middleware/auth.middleware.js";
import {validate} from "../../middleware/validate.middleware.js";
import {joinRoomSchema} from "./room.validator.js";

const router = express.Router();

// All Room endpoints require authentication
router.use(verifyToken);

router.post("/create", createRoomController);
router.post("/join", validate(joinRoomSchema), joinRoomController);
router.post("/sync", syncRoomController);
router.delete("/end", endRoomController);
router.get("/me", getMyRoomController);

export default router;
