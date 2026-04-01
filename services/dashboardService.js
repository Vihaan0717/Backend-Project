const FinancialRecord = require('../models/FinancialRecord');
const sequelize = require('../models/database');
const { Op } = require('sequelize');

class DashboardService {
  static async getSummary() {
    const totalIncome = await FinancialRecord.sum('amount', { where: { type: 'income' } }) || 0;
    const totalExpenses = await FinancialRecord.sum('amount', { where: { type: 'expense' } }) || 0;

    const categoryData = await FinancialRecord.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    const categoryTotals = {};
    categoryData.forEach(item => {
      categoryTotals[item.category] = parseFloat(item.total);
    });

    const recentActivity = await FinancialRecord.findAll({
      limit: 5,
      order: [['date', 'DESC']]
    });

    return {
      totalIncome: parseFloat(totalIncome),
      totalExpenses: parseFloat(totalExpenses),
      netBalance: parseFloat(totalIncome) - parseFloat(totalExpenses),
      categoryTotals,
      recentActivity
    };
  }

  static async getTrends() {
    // Group by month and type using SQLite-specific strftime
    const trends = await FinancialRecord.findAll({
      attributes: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('date')), 'month'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['month', 'type'],
      order: [[sequelize.col('month'), 'ASC']],
      raw: true
    });

    const formattedTrends = {};
    trends.forEach(item => {
      if (!formattedTrends[item.month]) {
        formattedTrends[item.month] = { income: 0, expense: 0 };
      }
      formattedTrends[item.month][item.type] = parseFloat(item.total);
    });

    return formattedTrends;
  }
}

module.exports = DashboardService;
