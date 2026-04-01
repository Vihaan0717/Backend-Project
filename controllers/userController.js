const UserService = require('../services/userService');

class UserController {
  static async getAll(req, res) {
    try {
      const users = await UserService.getAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await UserService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
