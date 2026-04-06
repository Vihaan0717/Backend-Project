const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.DB_STORAGE = ':memory:';

const app = require('../app');
const sequelize = require('../models/database');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

let adminToken;
let analystToken;
let viewerToken;
let adminUser;
let createdRecordId;
let viewerUserId;

async function login(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.data.token;
}

test.before(async () => {
  await sequelize.sync({ force: true });

  adminUser = await User.create({
    email: 'admin@finance.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'Admin'
  });

  await User.create({
    email: 'analyst@finance.com',
    password: 'analyst123',
    name: 'Analyst User',
    role: 'Analyst'
  });

  const viewer = await User.create({
    email: 'viewer@finance.com',
    password: 'viewer123',
    name: 'Viewer User',
    role: 'Viewer'
  });

  viewerUserId = viewer.id;

  await FinancialRecord.bulkCreate([
    {
      amount: 4000,
      type: 'income',
      category: 'Salary',
      date: new Date('2026-01-10'),
      notes: 'January salary',
      userId: adminUser.id
    },
    {
      amount: 1200,
      type: 'expense',
      category: 'Rent',
      date: new Date('2026-01-12'),
      notes: 'Office rent',
      userId: adminUser.id
    },
    {
      amount: 600,
      type: 'expense',
      category: 'Tools',
      date: new Date('2026-02-02'),
      notes: 'Subscriptions',
      userId: adminUser.id
    }
  ]);

  adminToken = await login('admin@finance.com', 'admin123');
  analystToken = await login('analyst@finance.com', 'analyst123');
  viewerToken = await login('viewer@finance.com', 'viewer123');
});

test.after(async () => {
  await sequelize.close();
});

test('public registration always creates a viewer account', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'selfsignup@finance.com',
      password: 'secret123',
      name: 'Self Signup',
      role: 'Admin'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.role, 'Viewer');
});

test('viewer cannot access record listing', async () => {
  const response = await request(app)
    .get('/api/records')
    .set('Authorization', `Bearer ${viewerToken}`);

  assert.equal(response.status, 403);
});

test('admin can create a financial record', async () => {
  const response = await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      amount: 2500,
      type: 'income',
      category: 'Consulting',
      date: '2026-03-01',
      notes: 'Client billing'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.category, 'Consulting');
  createdRecordId = response.body.data.id;
});

test('analyst can read filtered records with pagination metadata', async () => {
  const response = await request(app)
    .get('/api/records?type=expense&page=1&limit=5')
    .set('Authorization', `Bearer ${analystToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.meta.page, 1);
  assert.equal(response.body.meta.pageSize, 5);
  assert.equal(response.body.data.length, 2);
});

test('dashboard summary returns aggregate values', async () => {
  const response = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', `Bearer ${viewerToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.totalIncome, 6500);
  assert.equal(response.body.data.totalExpenses, 1800);
  assert.equal(response.body.data.netBalance, 4700);
});

test('dashboard trends support weekly or monthly grouping', async () => {
  const response = await request(app)
    .get('/api/dashboard/trends?granularity=monthly')
    .set('Authorization', `Bearer ${analystToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.some((item) => item.period === '2026-01'));
});

test('admin can create and update managed users', async () => {
  const createResponse = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      email: 'managed@finance.com',
      password: 'managed123',
      name: 'Managed User',
      role: 'Analyst',
      status: 'active'
    });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.data.role, 'Analyst');

  const updateResponse = await request(app)
    .put(`/api/users/${viewerUserId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      role: 'Analyst',
      status: 'inactive'
    });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.data.status, 'inactive');
});

test('system prevents admin self deletion', async () => {
  const response = await request(app)
    .delete(`/api/users/${adminUser.id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 400);
  assert.match(response.body.message, /cannot delete your own account/i);
});

test('system prevents deactivating the last admin', async () => {
  const response = await request(app)
    .put(`/api/users/${adminUser.id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      status: 'inactive'
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /cannot deactivate your own account/i);
});

test('record validation rejects invalid payloads', async () => {
  const response = await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      amount: -10,
      type: 'income',
      category: ''
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Validation failed');
});

test('admin can delete a record', async () => {
  const response = await request(app)
    .delete(`/api/records/${createdRecordId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
});
