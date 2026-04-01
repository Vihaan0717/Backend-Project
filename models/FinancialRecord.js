const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');

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
    type: DataTypes.ENUM('income', 'expense'),
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
});

// Relationships
User.hasMany(FinancialRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
FinancialRecord.belongsTo(User, { foreignKey: 'userId' });

module.exports = FinancialRecord;
