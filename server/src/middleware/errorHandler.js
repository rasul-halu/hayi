export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  const isSafeClientError = statusCode >= 400 && statusCode < 500;

  res.status(statusCode).json({
    error: isDevelopment || isSafeClientError
      ? err.message
      : "Internal server error",
  });
}
