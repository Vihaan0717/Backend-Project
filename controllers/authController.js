const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  static async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
