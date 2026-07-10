export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    error: isDevelopment ? err.message : "Internal server error",
  });
}
