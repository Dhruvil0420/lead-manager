// 404 handler for routes that do not exist
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};

// Centralized error handler returning the standard error shape:
// { "message": string, "errors": [{ "field": string, "message": string }] }
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error (e.g. unique field conflict)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    errors = [{ field, message: `${field} is already in use` }];
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for ${err.path}`;
    errors = [{ field: err.path, message: `Resource not found or invalid ID` }];
  }

  res.status(statusCode).json({
    message,
    errors,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

