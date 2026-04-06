const DashboardService = require('../services/dashboardService');
const asyncHandler = require('../middleware/asyncHandler');

class DashboardController {
  static getSummary = asyncHandler(async (req, res) => {
    const summary = await DashboardService.getSummary(req.query);
    res.status(200).json({
      status: 'success',
      data: summary
    });
  });

  static getTrends = asyncHandler(async (req, res) => {
    const trends = await DashboardService.getTrends(req.query);
    res.status(200).json({
      status: 'success',
      data: trends
    });
  });
}

module.exports = DashboardController;
