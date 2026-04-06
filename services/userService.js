const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const AuthService = require('./authService');

class UserService {
  static async getAll() {
    return await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
  }

  static async create(data) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('User with this email already exists.', 409);
    }

    const user = await User.create(data);
    return AuthService.sanitizeUser(user);
  }

  static async update(id, data, actingUser) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found.', 404);

    delete data.password;

    if (actingUser.id === user.id && data.status === 'inactive') {
      throw new AppError('You cannot deactivate your own account.', 400);
    }

    if (user.role === ROLES.ADMIN && (data.role && data.role !== ROLES.ADMIN || data.status === 'inactive')) {
      const adminCount = await User.count({ where: { role: ROLES.ADMIN } });
      if (adminCount <= 1) {
        throw new AppError('At least one admin account must remain in the system.', 400);
      }
    }

    return await user.update(data);
  }

  static async delete(id, actingUser) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found.', 404);

    if (actingUser.id === user.id) {
      throw new AppError('You cannot delete your own account.', 400);
    }

    if (user.role === ROLES.ADMIN) {
      const adminCount = await User.count({ where: { role: ROLES.ADMIN } });
      if (adminCount <= 1) {
        throw new AppError('At least one admin account must remain in the system.', 400);
      }
    }

    await user.destroy();
    return true;
  }
}

module.exports = UserService;
