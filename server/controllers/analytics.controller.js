const { getDashboardStats } = require("../services/analytics.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats(req.user.id);
    return successResponse(res, stats, "Dashboard stats fetched");
  } catch (error) {
    console.error("Analytics Error:", error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { dashboard };
