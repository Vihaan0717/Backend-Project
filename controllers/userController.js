const UserService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');
const AuthService = require('../services/authService');

class UserController {
  static getAll = asyncHandler(async (req, res) => {
    const users = await UserService.getAll();
    res.status(200).json({
      status: 'success',
      data: users
    });
  });

  static create = asyncHandler(async (req, res) => {
    const user = await UserService.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user
    });
  });

  static update = asyncHandler(async (req, res) => {
    const user = await UserService.update(req.params.id, req.body, req.user);
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: AuthService.sanitizeUser(user)
    });
  });

  static delete = asyncHandler(async (req, res) => {
    await UserService.delete(req.params.id, req.user);
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  });
}

module.exports = UserController;
