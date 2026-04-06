const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');

class AuthService {
  static sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };
  }

  static async register({ email, password, name }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists.', 409);
    }

    const user = await User.create({
      email,
      password,
      name,
      role: ROLES.VIEWER
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token 
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Your account is inactive. Please contact an admin.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token 
    };
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_key_123!',
      { expiresIn: '24h' }
    );
  }
}

module.exports = AuthService;
