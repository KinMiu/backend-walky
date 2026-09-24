import {prisma} from "../../config/prisma.js";

export const createTodo = async (userId, payload) => {
  const {title, description, priority, dueDate} = payload;

  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId,
    },
  });

  return todo;
};

export const getTodos = async (user, query) => {
  const {page = 1, limit = 10, search, isCompleted, priority, sortBy = "createdAt", sortOrder = "desc"} = query;
  const skip = (page - 1) * limit;

  const where = {};

  // If role is MEMBER, only see own todos. Super Admin / Admin can see all or specify
  if (user.role === "MEMBER") {
    where.userId = user.id;
  }

  if (search) {
    where.OR = [
      {title: {contains: search, mode: "insensitive"}},
      {description: {contains: search, mode: "insensitive"}},
    ];
  }

  if (typeof isCompleted === "boolean") {
    where.isCompleted = isCompleted;
  }

  if (priority) {
    where.priority = priority;
  }

  const [todos, totalItems] = await Promise.all([
    prisma.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.todo.count({where}),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    todos,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getTodoById = async (user, todoId) => {
  const todo = await prisma.todo.findUnique({
    where: {id: todoId},
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!todo) {
    const error = new Error("Todo not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "MEMBER" && todo.userId !== user.id) {
    const error = new Error("Forbidden: You do not have access to this todo");
    error.statusCode = 403;
    throw error;
  }

  return todo;
};

export const updateTodo = async (user, todoId, payload) => {
  // Check existence and ownership first
  await getTodoById(user, todoId);

  const updateData = {};
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.isCompleted !== undefined) updateData.isCompleted = payload.isCompleted;
  if (payload.priority !== undefined) updateData.priority = payload.priority;
  if (payload.dueDate !== undefined) {
    updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
  }

  const updatedTodo = await prisma.todo.update({
    where: {id: todoId},
    data: updateData,
  });

  return updatedTodo;
};

export const toggleTodo = async (user, todoId) => {
  const existingTodo = await getTodoById(user, todoId);

  const updatedTodo = await prisma.todo.update({
    where: {id: todoId},
    data: {
      isCompleted: !existingTodo.isCompleted,
    },
  });

  return updatedTodo;
};

export const deleteTodo = async (user, todoId) => {
  // Check existence and ownership first
  await getTodoById(user, todoId);

  await prisma.todo.delete({
    where: {id: todoId},
  });

  return {message: "Todo deleted successfully"};
};
