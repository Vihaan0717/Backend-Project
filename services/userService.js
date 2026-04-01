const User = require('../models/User');

class UserService {
  static async getAll() {
    return await User.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  static async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found.');
    
    // Don't allow updating password here for simplicity, use a separate logic if needed
    delete data.password;

    return await user.update(data);
  }

  static async delete(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found.');
    await user.destroy();
    return true;
  }
}

module.exports = UserService;
