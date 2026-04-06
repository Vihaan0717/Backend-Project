const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUSES } = require('../utils/constants');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
    defaultValue: ROLES.VIEWER
  },
  status: {
    type: DataTypes.ENUM(USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE),
    defaultValue: USER_STATUSES.ACTIVE
  }
}, {
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
    { fields: ['status'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
