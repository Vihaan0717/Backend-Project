const { Sequelize } = require('sequelize');
const path = require('path');

const storage = process.env.DB_STORAGE === ':memory:'
  ? ':memory:'
  : path.join(__dirname, process.env.DB_STORAGE || 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

module.exports = sequelize;
