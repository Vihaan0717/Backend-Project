const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');
const { RECORD_TYPES } = require('../utils/constants');

const FinancialRecord = sequelize.define('FinancialRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(RECORD_TYPES.INCOME, RECORD_TYPES.EXPENSE),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  indexes: [
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['date'] },
    { fields: ['userId'] },
    { fields: ['type', 'date'] },
    { fields: ['category', 'date'] }
  ]
});

// Relationships
User.hasMany(FinancialRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
FinancialRecord.belongsTo(User, { foreignKey: 'userId' });

module.exports = FinancialRecord;
