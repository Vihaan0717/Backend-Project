const FinancialRecord = require('../models/FinancialRecord');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const User = require('../models/User');

class RecordService {
  static async create(data, userId) {
    return await FinancialRecord.create({ ...data, userId });
  }

  static buildWhereClause({ type, category, startDate, endDate, minAmount, maxAmount }) {
    const where = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount[Op.gte] = Number(minAmount);
      if (maxAmount) where.amount[Op.lte] = Number(maxAmount);
    }

    return where;
  }

  static async getAll(filters) {
    const limit = Number(filters.limit || 10);
    const page = Number(filters.page || 1);
    const offset = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const { count, rows } = await FinancialRecord.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      limit,
      offset,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        pageSize: limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getById(id) {
    const record = await FinancialRecord.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    if (!record) throw new AppError('Record not found.', 404);
    return record;
  }

  static async update(id, data) {
    const record = await FinancialRecord.findByPk(id);
    if (!record) throw new AppError('Record not found.', 404);
    return await record.update(data);
  }

  static async delete(id) {
    const record = await FinancialRecord.findByPk(id);
    if (!record) throw new AppError('Record not found.', 404);
    await record.destroy();
    return true;
  }
}

module.exports = RecordService;
