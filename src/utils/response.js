export const successResponse = (
  res,
  data = null,
  message = "Success",
  code = 200,
  meta = null,
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(code).json(response);
};

export const errorResponse = (
  res,
  message = "Something went wrong",
  code = 500,
  errors = null,
) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(code).json(response);
};

export const paginatedResponse = (
  res,
  data,
  {page, limit, totalItems, totalPages},
  message = "Success",
  code = 200,
) => {
  return res.status(code).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages: Number(totalPages),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};
