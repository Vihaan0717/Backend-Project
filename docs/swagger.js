const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Finance Data Processing and Access Control Backend',
    version: '1.0.0',
    description: 'API documentation for the finance dashboard backend assignment.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@finance.com' },
          password: { type: 'string', example: 'admin123' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', example: 'new.user@finance.com' },
          password: { type: 'string', example: 'secret123' },
          name: { type: 'string', example: 'New User' }
        }
      },
      RecordRequest: {
        type: 'object',
        required: ['amount', 'type', 'category'],
        properties: {
          amount: { type: 'number', example: 2500 },
          type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
          category: { type: 'string', example: 'Consulting' },
          date: { type: 'string', format: 'date-time', example: '2026-03-01T00:00:00.000Z' },
          notes: { type: 'string', example: 'Client billing' }
        }
      },
      ManagedUserRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email: { type: 'string', example: 'managed@finance.com' },
          password: { type: 'string', example: 'managed123' },
          name: { type: 'string', example: 'Managed User' },
          role: { type: 'string', enum: ['Admin', 'Analyst', 'Viewer'], example: 'Analyst' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' }
        }
      }
    }
  },
  tags: [
    { name: 'Health', description: 'Service status' },
    { name: 'Auth', description: 'Registration and login' },
    { name: 'Users', description: 'Admin user management' },
    { name: 'Records', description: 'Financial record management' },
    { name: 'Dashboard', description: 'Finance analytics and trends' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API is running'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a public user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Users fetched successfully' },
          403: { description: 'Admin only' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create a managed user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ManagedUserRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User created successfully' },
          403: { description: 'Admin only' }
        }
      }
    },
    '/api/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'User updated successfully' },
          400: { description: 'Invalid operation' },
          404: { description: 'User not found' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'User deleted successfully' },
          400: { description: 'Invalid operation' },
          404: { description: 'User not found' }
        }
      }
    },
    '/api/records': {
      get: {
        tags: ['Records'],
        summary: 'List financial records',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'minAmount', in: 'query', schema: { type: 'number' } },
          { name: 'maxAmount', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Records fetched successfully' },
          403: { description: 'Admin or Analyst only' }
        }
      },
      post: {
        tags: ['Records'],
        summary: 'Create a financial record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecordRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Record created successfully' },
          403: { description: 'Admin only' }
        }
      }
    },
    '/api/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get a record by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Record fetched successfully' },
          404: { description: 'Record not found' }
        }
      },
      put: {
        tags: ['Records'],
        summary: 'Update a financial record',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Record updated successfully' },
          404: { description: 'Record not found' }
        }
      },
      delete: {
        tags: ['Records'],
        summary: 'Delete a financial record',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Record deleted successfully' },
          404: { description: 'Record not found' }
        }
      }
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard summary',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Summary fetched successfully' }
        }
      }
    },
    '/api/dashboard/trends': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard trends',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'granularity', in: 'query', schema: { type: 'string', enum: ['monthly', 'weekly'] } }
        ],
        responses: {
          200: { description: 'Trends fetched successfully' },
          403: { description: 'Admin or Analyst only' }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: []
};

module.exports = swaggerJSDoc(options);
