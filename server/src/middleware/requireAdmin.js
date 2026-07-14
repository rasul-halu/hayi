export default function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  return next();
}
