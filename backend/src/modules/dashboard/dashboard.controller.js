const { getDashboardStats } = require("./dashboard.service");

async function getDashboard(req, res) {
  try {
    const stats = await getDashboardStats(req.user);

    return res.status(200).json({ success: true, ...stats });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to load dashboard data",
    });
  }
}

module.exports = {
  getDashboard,
};