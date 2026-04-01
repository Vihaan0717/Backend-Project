# Finance Data Processing & Access Control Backend

A robust Node.js backend for financial data management with Role-Based Access Control (RBAC).

## Features
- **User Management**: Signup, Login, and Admin-level user control.
- **RBAC**: Three roles implemented:
  - `Admin`: Full management of records and users.
  - `Analyst`: View records and access dashboard summaries/trends.
  - `Viewer`: Access dashboard summaries only.
- **Financial Records**: CRUD operations with filtering (type, category, date) and pagination.
- **Dashboard**: Real-time aggregation of income, expenses, balance, and category-wise totals.
- **Security**: JWT authentication, password hashing (bcrypt), and account status (active/inactive) enforcement.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via Sequelize ORM)
- **Authentication**: JSON Web Tokens (JWT)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
A `.env` file is already provided:
```env
PORT=5000
JWT_SECRET=super_secret_key_123!
```

### 3. Seed the Database
Populate the database with test users and records:
```bash
node seed.js
```

### 4. Run the Server
```bash
npm start
```
The server will run on `http://localhost:5000`.

## API Documentation

### Auth
- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Authenticate and receive a JWT.

### Records (Admin/Analyst)
- `GET /api/records`: List records (supports `type`, `category`, `startDate`, `endDate` queries).
- `GET /api/records/:id`: Get record details.
- `POST /api/records`: Create record (Admin only).
- `PUT /api/records/:id`: Update record (Admin only).
- `DELETE /api/records/:id`: Delete record (Admin only).

### Dashboard (All Roles)
- `GET /api/dashboard/summary`: Total income, expenses, balance, and categories.
- `GET /api/dashboard/trends`: Monthly income/expense trends (Admin/Analyst only).

### Users (Admin Only)
- `GET /api/users`: List all users.
- `PUT /api/users/:id`: Update user role or status.
- `DELETE /api/users/:id`: Remove user.

## Initial Test Accounts (from seed.js)
- **Admin**: `admin@finance.com` / `admin123`
- **Analyst**: `analyst@finance.com` / `analyst123`
- **Viewer**: `viewer@finance.com` / `viewer123`
