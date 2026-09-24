import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from "../../config/prisma.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export const register = async ({username, email, password}) => {
  const existingUser = await prisma.user.findUnique({
    where: {email},
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword,
      role: "MEMBER",
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const token = generateToken(user);

  return {user, token};
};

export const login = async ({email, password}) => {
  const user = await prisma.user.findUnique({
    where: {email},
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is inactive. Please contact administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const changePassword = async (userId, {currentPassword, newPassword}) => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error("Current password does not match");
    error.statusCode = 400;
    throw error;
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {id: userId},
    data: {passwordHash: hashedNewPassword},
  });

  return {message: "Password changed successfully"};
};
