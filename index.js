require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./models/database');
const User = require('./models/User');
const FinancialRecord = require('./models/FinancialRecord');

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Root Route - Serve Premium Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic Route for Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance Backend API is running' });
});

// Error Middleware (Must be last)
app.use(errorMiddleware);

// Sync Database and Start Server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ force: false });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
