export const health = (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
  });
};
