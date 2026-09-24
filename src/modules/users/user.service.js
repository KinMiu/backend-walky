import {prisma} from "../../config/prisma.js";

export const getAllUsers = async (query) => {
  const {page = 1, limit = 10, search, role, isActive} = query;
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      {username: {contains: search, mode: "insensitive"}},
      {email: {contains: search, mode: "insensitive"}},
    ];
  }

  if (role) {
    where.role = role;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {todos: true, activeRooms: true},
        },
      },
      orderBy: {createdAt: "desc"},
    }),
    prisma.user.count({where}),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    users,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getUserById = async (requestingUser, targetUserId) => {
  // MEMBER can only view their own user details
  if (requestingUser.role === "MEMBER" && requestingUser.id !== targetUserId) {
    const error = new Error("Forbidden: You cannot view other users' profiles");
    error.statusCode = 403;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {id: targetUserId},
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      activeRooms: {
        take: 5,
        orderBy: {createdAt: "desc"},
      },
      todos: {
        take: 5,
        orderBy: {createdAt: "desc"},
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUser = async (requestingUser, targetUserId, payload) => {
  // MEMBER can only update their own profile (username, email)
  if (requestingUser.role === "MEMBER" && requestingUser.id !== targetUserId) {
    const error = new Error("Forbidden: You cannot update other users' profiles");
    error.statusCode = 403;
    throw error;
  }

  const updatedUsername = payload.username || payload.name;

  // Only SUPER_ADMIN and ADMIN can change isActive
  const data = {
    ...(updatedUsername && {username: updatedUsername}),
    ...(payload.email && {email: payload.email}),
  };

  if (payload.isActive !== undefined && (requestingUser.role === "SUPER_ADMIN" || requestingUser.role === "ADMIN")) {
    data.isActive = payload.isActive;
  }

  const updatedUser = await prisma.user.update({
    where: {id: targetUserId},
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const updateUserRole = async (requestingUser, targetUserId, newRole) => {
  // Only SUPER_ADMIN can change roles
  if (requestingUser.role !== "SUPER_ADMIN") {
    const error = new Error("Forbidden: Only SUPER_ADMIN can modify user roles");
    error.statusCode = 403;
    throw error;
  }

  // Prevent modifying own role to avoid accidental lock-out
  if (requestingUser.id === targetUserId) {
    const error = new Error("You cannot modify your own role");
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {id: targetUserId},
    data: {role: newRole},
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (requestingUser, targetUserId) => {
  // Only SUPER_ADMIN or ADMIN can delete users
  if (requestingUser.role !== "SUPER_ADMIN" && requestingUser.role !== "ADMIN") {
    const error = new Error("Forbidden: Access denied");
    error.statusCode = 403;
    throw error;
  }

  if (requestingUser.id === targetUserId) {
    const error = new Error("You cannot delete your own account");
    error.statusCode = 400;
    throw error;
  }

  await prisma.user.delete({
    where: {id: targetUserId},
  });

  return {message: "User deleted successfully"};
};
