const FinancialRecord = require('../models/FinancialRecord');
const { Op } = require('sequelize');

class RecordService {
  static async create(data, userId) {
    return await FinancialRecord.create({ ...data, userId });
  }

  static async getAll({ type, category, startDate, endDate, limit = 10, offset = 0 }) {
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    return await FinancialRecord.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });
  }

  static async getById(id) {
    const record = await FinancialRecord.findByPk(id);
    if (!record) throw new Error('Record not found.');
    return record;
  }

  static async update(id, data) {
    const record = await FinancialRecord.findByPk(id);
    if (!record) throw new Error('Record not found.');
    return await record.update(data);
  }

  static async delete(id) {
    const record = await FinancialRecord.findByPk(id);
    if (!record) throw new Error('Record not found.');
    await record.destroy();
    return true;
  }
}

module.exports = RecordService;
