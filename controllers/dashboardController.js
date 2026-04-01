const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async getSummary(req, res) {
    try {
      const summary = await DashboardService.getSummary();
      res.status(200).json(summary);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTrends(req, res) {
    try {
      const trends = await DashboardService.getTrends();
      res.status(200).json(trends);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;
