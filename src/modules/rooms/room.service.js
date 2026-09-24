import crypto from "crypto";
import {prisma} from "../../config/prisma.js";
import agoraService from "../../services/agora.service.js";
import mqttService from "../../services/mqtt.service.js";

/**
 * Generates a unique 4-digit PIN code for an active room.
 * Retries if a collision is detected.
 */
export const generateUniquePin = async (maxAttempts = 50) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random 4-digit string from 0000 to 9999
    const pin = String(crypto.randomInt(0, 10000)).padStart(4, "0");

    const existingRoom = await prisma.activeRoom.findUnique({
      where: {pinCode: pin},
    });

    if (!existingRoom) {
      return pin;
    }
  }

  const error = new Error("Unable to generate unique room PIN. System capacity full.");
  error.statusCode = 503;
  throw error;
};

/**
 * Creates a new active room for real-time coordination.
 * @param {string} hostId - User ID of the room creator
 */
export const createRoom = async (hostId) => {
  const pinCode = await generateUniquePin();
  const roomId = crypto.randomUUID();

  // If host already has an active room, remove existing to keep only 1 active room per host
  await prisma.activeRoom.deleteMany({
    where: {hostId},
  });

  const room = await prisma.activeRoom.create({
    data: {
      id: roomId,
      pinCode,
      hostId,
    },
    select: {
      id: true,
      pinCode: true,
      hostId: true,
      createdAt: true,
    },
  });

  const mqttTopic = mqttService.getChannelTopic(room.id);
  const agoraToken = agoraService.generateVoiceToken({
    channelName: room.id,
    uid: hostId,
    role: "publisher",
  });

  return {
    pin_code: room.pinCode,
    mqtt_topic: mqttTopic,
    agora_token: agoraToken,
  };
};

/**
 * Allows a user to join an active room via 4-digit PIN code.
 * @param {string} userId - User ID of the joining user
 * @param {string} pinCode - 4-digit room PIN code
 */
export const joinRoom = async (userId, pinCode) => {
  const room = await prisma.activeRoom.findUnique({
    where: {pinCode},
    include: {
      host: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!room) {
    const error = new Error("Room not found or invalid PIN code");
    error.statusCode = 404;
    throw error;
  }

  const mqttTopic = mqttService.getChannelTopic(room.id);
  const agoraToken = agoraService.generateVoiceToken({
    channelName: room.id,
    uid: userId,
    role: "publisher",
  });

  return {
    mqtt_topic: mqttTopic,
    agora_token: agoraToken,
  };
};

/**
 * Ends/dismisses active room(s) created by the authenticated host.
 * Only the host/creator can end their room.
 * @param {string} hostId - User ID of the host
 */
export const endRoom = async (hostId) => {
  const existingRoom = await prisma.activeRoom.findFirst({
    where: {hostId},
  });

  if (!existingRoom) {
    const error = new Error("No active room found for this host");
    error.statusCode = 404;
    throw error;
  }

  await prisma.activeRoom.deleteMany({
    where: {hostId},
  });

  // Notify via MQTT topic if needed
  await mqttService.publish(mqttService.getChannelTopic(existingRoom.id), {
    event: "ROOM_ENDED",
    roomId: existingRoom.id,
    timestamp: new Date().toISOString(),
  });

  return {message: "Room ended successfully"};
};

// In-memory active room presence map: pinCode -> Map(userId -> memberData)
const roomPresenceMap = new Map();

// Periodic cleanup of inactive members (stale > 45s)
setInterval(() => {
  const now = Date.now();
  for (const [pin, members] of roomPresenceMap.entries()) {
    for (const [userId, data] of members.entries()) {
      if (now - data.lastSeen > 45000) {
        members.delete(userId);
      }
    }
  }
}, 15000);

/**
 * Synchronizes user position & speaking state with the room and returns active participants.
 */
export const syncRoomPresence = async (userId, username, {pinCode, latitude, longitude, isSpeaking}) => {
  if (!pinCode) {
    const error = new Error("pinCode is required for room sync");
    error.statusCode = 400;
    throw error;
  }

  const room = await prisma.activeRoom.findUnique({
    where: {pinCode},
  });

  if (!room) {
    const error = new Error("Room not found or has been closed");
    error.statusCode = 404;
    throw error;
  }

  if (!roomPresenceMap.has(pinCode)) {
    roomPresenceMap.set(pinCode, new Map());
  }

  const members = roomPresenceMap.get(pinCode);
  const isHost = room.hostId === userId;

  members.set(userId, {
    userId,
    username,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    isSpeaking: Boolean(isSpeaking),
    isHost,
    lastSeen: Date.now(),
  });

  const memberList = Array.from(members.values());

  return {
    pin_code: pinCode,
    total_members: memberList.length,
    members: memberList,
  };
};

/**
 * Gets details of the host's currently active room.
 * @param {string} hostId - User ID of the host
 */
export const getMyActiveRoom = async (hostId) => {
  const room = await prisma.activeRoom.findFirst({
    where: {hostId},
  });

  if (!room) {
    return null;
  }

  return {
    id: room.id,
    pin_code: room.pinCode,
    mqtt_topic: mqttService.getChannelTopic(room.id),
    created_at: room.createdAt,
  };
};
