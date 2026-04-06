const FinancialRecord = require('../models/FinancialRecord');
const sequelize = require('../models/database');
const RecordService = require('./recordService');
const { RECORD_TYPES } = require('../utils/constants');

class DashboardService {
  static async getSummary(filters = {}) {
    const where = RecordService.buildWhereClause(filters);

    const totalIncome = await FinancialRecord.sum('amount', { where: { ...where, type: RECORD_TYPES.INCOME } }) || 0;
    const totalExpenses = await FinancialRecord.sum('amount', { where: { ...where, type: RECORD_TYPES.EXPENSE } }) || 0;

    const categoryData = await FinancialRecord.findAll({
      attributes: [
        'category',
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where,
      group: ['category', 'type'],
      raw: true
    });

    const categoryTotals = [];
    categoryData.forEach(item => {
      categoryTotals.push({
        category: item.category,
        type: item.type,
        total: parseFloat(item.total)
      });
    });

    const recentActivity = await FinancialRecord.findAll({
      where,
      limit: 5,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    return {
      totalIncome: parseFloat(totalIncome),
      totalExpenses: parseFloat(totalExpenses),
      netBalance: parseFloat(totalIncome) - parseFloat(totalExpenses),
      categoryTotals: categoryTotals.sort((a, b) => b.total - a.total),
      recentActivity
    };
  }

  static async getTrends(filters = {}) {
    const where = RecordService.buildWhereClause(filters);
    const bucketFormat = filters.granularity === 'weekly' ? '%Y-W%W' : '%Y-%m';

    const trends = await FinancialRecord.findAll({
      attributes: [
        [sequelize.fn('strftime', bucketFormat, sequelize.col('date')), 'period'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where,
      group: ['period', 'type'],
      order: [[sequelize.col('period'), 'ASC']],
      raw: true
    });

    const formattedTrends = [];
    trends.forEach(item => {
      const existingPeriod = formattedTrends.find((trend) => trend.period === item.period);

      if (existingPeriod) {
        existingPeriod[item.type] = parseFloat(item.total);
        return;
      }

      formattedTrends.push({
        period: item.period,
        income: item.type === RECORD_TYPES.INCOME ? parseFloat(item.total) : 0,
        expense: item.type === RECORD_TYPES.EXPENSE ? parseFloat(item.total) : 0
      });
    });

    return formattedTrends;
  }
}

module.exports = DashboardService;
