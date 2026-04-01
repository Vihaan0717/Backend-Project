const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message: message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;
