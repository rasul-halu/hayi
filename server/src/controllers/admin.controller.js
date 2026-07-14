export function getAdminMe(req, res) {
  return res.json({
    admin: true,
    user: {
      id: req.user.id,
      telegramId: req.user.telegramId,
      firstName: req.user.firstName,
      username: req.user.username,
      role: req.user.role,
    },
  });
}
