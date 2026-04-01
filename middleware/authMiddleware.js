const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_123!');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'User account is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
