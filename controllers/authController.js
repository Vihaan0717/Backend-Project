const AuthService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

class AuthController {
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result
    });
  });

  static login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  });
}

module.exports = AuthController;
