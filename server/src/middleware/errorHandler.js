export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  const isSafeClientError = statusCode >= 400 && statusCode < 500;
  const isExplicitlySafe = err.expose === true;

  res.status(statusCode).json({
    error: isDevelopment || isSafeClientError || isExplicitlySafe
      ? err.message
      : "Internal server error",
    ...(err.clientCode ? { code: err.clientCode } : {}),
  });
}
