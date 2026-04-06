# Finance Data Processing and Access Control Backend

This project is a backend submission for the "Finance Data Processing and Access Control Backend" assignment. It is built as a clean Express + SQLite service with role-based access control, financial record management, dashboard analytics, validation, and integration tests.

## Why this matches the assignment

The backend covers the required areas:

- User and role management with `Admin`, `Analyst`, and `Viewer`
- Status management with `active` and `inactive` users
- Financial record CRUD with filtering and pagination
- Dashboard summary and trends APIs
- Backend-enforced access control using authentication and role middleware
- Input validation and structured error responses
- Persistent storage through SQLite with Sequelize ORM

It also includes a few thoughtful improvements:

- Public signup is intentionally limited to `Viewer` to avoid privilege escalation
- Admin-only managed user creation endpoint for controlled role assignment
- Protection against self-deletion and self-deactivation
- Guardrails to ensure at least one admin remains in the system
- Integration tests for the main business flows

## Tech Stack

- Node.js
- Express 5
- Sequelize
- SQLite
- JWT authentication
- bcrypt password hashing
- express-validator
- node:test + supertest
- Swagger UI
- Postman collection

## Quick Links

- Repository: [Backend-Project](https://github.com/Vihaan0717/Backend-Project)
- Local Swagger Docs: `http://localhost:5000/api/docs`
- Postman Collection: [docs/postman_collection.json](C:/Users/anger/Desktop/Backend-Project/docs/postman_collection.json)

## Project Structure

```text
app.js                    Express app wiring
index.js                  Database bootstrap and server startup
docs/                     Swagger config and Postman collection
controllers/              HTTP controllers
services/                 Business logic
models/                   Sequelize models
routes/                   Route definitions and validators
middleware/               Auth, validation, async, and error middleware
validators/               Shared request validation rules
utils/                    Constants and application error class
test/                     Integration tests
seed.js                   Local seed data
.env.example              Example environment configuration
```

## Detailed Backend Structure

### Request Flow

The application is structured around a simple and maintainable backend flow:

1. `routes/` defines the endpoint and attaches validation and access control
2. `middleware/` authenticates the request, validates input, and handles async/errors
3. `controllers/` stay thin and translate HTTP requests into service calls
4. `services/` contain the business rules and application logic
5. `models/` handle persistence through Sequelize and SQLite

This keeps transport concerns separate from business logic and makes the code easier to test and extend.

### Folder Responsibilities

#### `app.js`

- Creates the Express application
- Registers middleware and routes
- Adds health route, 404 handling, and global error middleware

#### `index.js`

- Loads the app
- Authenticates the database connection
- Syncs models
- Starts the HTTP server

#### `controllers/`

- `authController.js`: handles registration and login responses
- `recordController.js`: handles record CRUD endpoints
- `dashboardController.js`: handles summary and trend endpoints
- `userController.js`: handles admin user-management endpoints

Controllers are intentionally thin and defer all business rules to services.

#### `services/`

- `authService.js`: registration, login, JWT generation, user sanitization
- `recordService.js`: record creation, filters, pagination, lookup, update, delete
- `dashboardService.js`: financial aggregations, category totals, recent activity, monthly/weekly trends
- `userService.js`: user creation, update, delete, and admin protection rules

This is the main business-logic layer of the application.

#### `models/`

- `User.js`: user schema, password hashing hooks, role and status model
- `FinancialRecord.js`: finance record schema and relation to users
- `database.js`: Sequelize connection config

#### `middleware/`

- `authMiddleware.js`: validates JWT and checks active account status
- `roleMiddleware.js`: enforces role-based authorization
- `validateRequest.js`: returns structured validation errors
- `asyncHandler.js`: removes repeated try/catch wrappers for async handlers
- `errorMiddleware.js`: centralizes error formatting

#### `validators/`

- `commonValidators.js`: reusable query and param validators for pagination, filters, and UUIDs

#### `utils/`

- `AppError.js`: consistent application error object with status codes
- `constants.js`: centralized enums for roles, statuses, and record types

#### `test/`

- `api.test.js`: integration tests covering the main API flows and access-control rules

### Implementation Decisions

The backend was implemented with a few deliberate design choices:

- Thin controllers and service-first business logic for readability
- Shared validators to reduce duplication across routes
- Centralized error handling for consistent API responses
- SQLite for zero-setup persistence during evaluation
- In-memory SQLite for tests so automated tests do not mutate the local dev database
- Model indexes on common filter columns to improve lookup performance

### Business Rules Implemented

- Public signup creates only `Viewer` users
- Only `Admin` can create managed users with elevated roles
- Inactive users cannot access protected APIs
- `Viewer` cannot access record listing or record mutations
- `Analyst` can read records and insights but cannot mutate records
- `Admin` has full record and user-management access
- An admin cannot delete their own account
- An admin cannot deactivate their own account
- The system protects against unsafe admin removal scenarios

## Data Model

### User

- `id`: UUID
- `email`: unique email
- `password`: hashed password
- `name`: display name
- `role`: `Admin | Analyst | Viewer`
- `status`: `active | inactive`

### FinancialRecord

- `id`: UUID
- `amount`: positive decimal
- `type`: `income | expense`
- `category`: string
- `date`: transaction date
- `notes`: optional description
- `userId`: owner / creator

## Access Control Model

### Viewer

- Can log in
- Can access dashboard summary
- Cannot access record listing or trends
- Cannot modify users or records

### Analyst

- Can log in
- Can view records
- Can use dashboard summary and trends
- Cannot create, update, or delete records
- Cannot manage users

### Admin

- Full access to records
- Full access to user management
- Can access all dashboard endpoints

## API Overview

### Endpoint Summary

| Area | Method | Endpoint | Access |
| --- | --- | --- | --- |
| Health | `GET` | `/health` | Public |
| Auth | `POST` | `/api/auth/register` | Public |
| Auth | `POST` | `/api/auth/login` | Public |
| Users | `GET` | `/api/users` | Admin |
| Users | `POST` | `/api/users` | Admin |
| Users | `PUT` | `/api/users/:id` | Admin |
| Users | `DELETE` | `/api/users/:id` | Admin |
| Records | `GET` | `/api/records` | Admin, Analyst |
| Records | `GET` | `/api/records/:id` | Admin, Analyst |
| Records | `POST` | `/api/records` | Admin |
| Records | `PUT` | `/api/records/:id` | Admin |
| Records | `DELETE` | `/api/records/:id` | Admin |
| Dashboard | `GET` | `/api/dashboard/summary` | Admin, Analyst, Viewer |
| Dashboard | `GET` | `/api/dashboard/trends` | Admin, Analyst |

### Authentication

#### `POST /api/auth/register`

Public signup endpoint.

Notes:
- Any submitted role is ignored
- New users are always created as `Viewer`

Request:

```json
{
  "email": "new.user@finance.com",
  "password": "secret123",
  "name": "New User"
}
```

#### `POST /api/auth/login`

Returns a JWT token and user payload.

Example:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@finance.com\",\"password\":\"admin123\"}"
```

### Users

All user routes require an `Admin` token.

#### `GET /api/users`

List users.

Example:

```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### `POST /api/users`

Create a managed user with explicit role and optional status.

Example:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d "{\"email\":\"managed@finance.com\",\"password\":\"managed123\",\"name\":\"Managed User\",\"role\":\"Analyst\",\"status\":\"active\"}"
```

#### `PUT /api/users/:id`

Update `name`, `role`, or `status`.

Rules:
- Users cannot deactivate themselves
- Users cannot delete themselves
- The system prevents removing the last remaining admin

#### `DELETE /api/users/:id`

Delete a user.

### Financial Records

#### `GET /api/records`

Accessible by `Admin` and `Analyst`.

Supported query params:

- `type`
- `category`
- `startDate`
- `endDate`
- `minAmount`
- `maxAmount`
- `page`
- `limit`

Response includes:

- `data`: record list
- `meta.total`
- `meta.page`
- `meta.pageSize`
- `meta.totalPages`

Example:

```bash
curl "http://localhost:5000/api/records?type=expense&page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

#### `GET /api/records/:id`

Fetch one record by id.

#### `POST /api/records`

Admin only.

Example:

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d "{\"amount\":2500,\"type\":\"income\",\"category\":\"Consulting\",\"date\":\"2026-03-01T00:00:00.000Z\",\"notes\":\"Client billing\"}"
```

#### `PUT /api/records/:id`

Admin only.

#### `DELETE /api/records/:id`

Admin only.

### Dashboard

#### `GET /api/dashboard/summary`

Accessible by all authenticated roles.

Returns:

- `totalIncome`
- `totalExpenses`
- `netBalance`
- `categoryTotals`
- `recentActivity`

Supports the same record-style filters:

- `type`
- `category`
- `startDate`
- `endDate`
- `minAmount`
- `maxAmount`

Example:

```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer <TOKEN>"
```

#### `GET /api/dashboard/trends`

Accessible by `Admin` and `Analyst`.

Supported query params:

- `granularity=monthly|weekly`
- all supported summary filters

Example:

```bash
curl "http://localhost:5000/api/dashboard/trends?granularity=monthly" \
  -H "Authorization: Bearer <TOKEN>"
```

## Response Style

Successful responses follow a consistent pattern:

```json
{
  "status": "success",
  "message": "Optional human-readable message",
  "data": {}
}
```

Validation failures return:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0",
      "value": -10
    }
  ]
}
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Then update values if needed:

```env
PORT=5000
JWT_SECRET=super_secret_key_123!
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Start the API

```bash
npm start
```

Health check:

```bash
GET /health
```

Local API documentation:

```bash
http://localhost:5000/api/docs
```

## Test Accounts

Created by `seed.js`:

- Admin: `admin@finance.com` / `admin123`
- Analyst: `analyst@finance.com` / `analyst123`
- Viewer: `viewer@finance.com` / `viewer123`

## Running Tests

```bash
npm test
```

The integration suite covers:

- registration rules
- login flow
- role restrictions
- record CRUD behavior
- dashboard aggregation
- user management constraints
- validation failures

## How to Review This Project

If you are reviewing this submission, the fastest path is:

### 1. Setup

```bash
git clone <repository-url>
cd Backend-Project
npm install
npm run seed
npm start
```

The project uses SQLite, so no external database installation is required.

### 2. Verify the application is running

Open:

- `http://localhost:5000/health`

Expected response:

```json
{
  "status": "success",
  "message": "Finance Backend API is running"
}
```

### 3. Run automated tests

```bash
npm test
```

### 3.5. Optional interactive API review

- Open Swagger UI at `http://localhost:5000/api/docs`
- Or import `docs/postman_collection.json` into Postman

### 4. Review seeded credentials

- Admin: `admin@finance.com` / `admin123`
- Analyst: `analyst@finance.com` / `analyst123`
- Viewer: `viewer@finance.com` / `viewer123`

### 5. Suggested manual review checklist

- Login with each role and verify role-specific behavior
- Confirm that `Viewer` can access dashboard summary but not records
- Confirm that `Analyst` can read records and trends but cannot mutate records
- Confirm that `Admin` can manage users and records
- Review filtering and pagination on `GET /api/records`
- Review summary and trend responses on dashboard endpoints
- Review validation and error responses using invalid payloads

### 6. Suggested endpoint review order

1. `POST /api/auth/login`
2. `GET /api/dashboard/summary`
3. `GET /api/dashboard/trends`
4. `GET /api/records`
5. `POST /api/records`
6. `GET /api/users`
7. `POST /api/users`

## Assumptions and Tradeoffs

- SQLite is used for simplicity and portability in an assessment setting
- JWT auth is sufficient here; production systems would likely need refresh token strategy, secret rotation, and stronger audit trails
- Public registration is intentionally constrained to avoid open admin creation
- Soft delete was not added to keep the submission focused and readable
- Rate limiting and API docs tooling are optional and could be added next if needed

## Submission Notes

This solution is intentionally designed to be clear over clever:

- controllers stay thin
- services hold business logic
- middleware enforces auth, roles, and validation
- tests prove the main user flows

That keeps the backend small enough to review quickly while still demonstrating architecture, business-rule thinking, and API discipline.
