const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async register({ email, password, name, role }) {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    // Create user
    const user = await User.create({ email, password, name, role });
    
    // Generate token
    const token = this.generateToken(user);

    return { 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }, 
      token 
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new Error('Your account is inactive. Please contact an admin.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);

    return { 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }, 
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
