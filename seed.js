const sequelize = require('./models/database');
const User = require('./models/User');
const FinancialRecord = require('./models/FinancialRecord');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (force: true).');

    // Create Users
    const admin = await User.create({
      email: 'admin@finance.com',
      password: 'admin123',
      name: 'System Admin',
      role: 'Admin'
    });

    const analyst = await User.create({
      email: 'analyst@finance.com',
      password: 'analyst123',
      name: 'Financial Analyst',
      role: 'Analyst'
    });

    const viewer = await User.create({
      email: 'viewer@finance.com',
      password: 'viewer123',
      name: 'Executive Viewer',
      role: 'Viewer'
    });

    console.log('Users created.');

    // Create Financial Records
    const records = [
      {
        amount: 5000.00,
        type: 'income',
        category: 'Salary',
        date: new Date('2024-03-01'),
        notes: 'Monthly salary credit',
        userId: admin.id
      },
      {
        amount: 1200.50,
        type: 'expense',
        category: 'Rent',
        date: new Date('2024-03-05'),
        notes: 'Office rent',
        userId: admin.id
      },
      {
        amount: 150.00,
        type: 'expense',
        category: 'Utilities',
        date: new Date('2024-03-10'),
        notes: 'Electricity bill',
        userId: admin.id
      },
      {
        amount: 2000.00,
        type: 'income',
        category: 'Freelance',
        date: new Date('2024-03-15'),
        notes: 'Project milestone payment',
        userId: admin.id
      },
      {
        amount: 300.00,
        type: 'expense',
        category: 'Dining',
        date: new Date('2024-03-20'),
        notes: 'Client lunch',
        userId: admin.id
      },
      {
        amount: 500.00,
        type: 'expense',
        category: 'Software',
        date: new Date('2024-03-22'),
        notes: 'SaaS subscriptions',
        userId: admin.id
      }
    ];

    await FinancialRecord.bulkCreate(records);
    console.log('Financial records created.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
