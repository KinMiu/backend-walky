export const safeMessage = (devMessage, prodMessage = "An error occurred") => {
  const message = process.env.NODE_ENV === "development" ? devMessage : prodMessage;
  return new Error(message);
};
