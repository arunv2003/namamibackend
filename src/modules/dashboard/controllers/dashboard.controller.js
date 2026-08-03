import { getDashboardStatsService } from "../services/dashboard.service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService(req.query);
    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching dashboard statistics",
      error: error.message,
    });
  }
};
