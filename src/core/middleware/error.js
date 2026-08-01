import { ApiError } from '../utils/api.Errors.js';

/**
 * Centralized secure error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Always log detailed error information (Method, URL, Timestamp, Stack) for server logs
  const reqInfo = `${req.method} ${req.originalUrl || req.url}`;
  console.error(`[ERROR] [${new Date().toISOString()}] ${reqInfo} - Name: ${err.name || 'Error'}, Message: ${err.message}`);
  if (err.stack) {
    console.error(`[STACK TRACE]\n${err.stack}`);
  }

  // 1. Zod Validation Error
  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const message = issues
      .map((e) => `${e.path && e.path.length ? `${e.path.join('.')}: ` : ''}${e.message}`)
      .join(', ');
    error = new ApiError(400, `Validation Error: ${message}`);
  }

  // 2. Sequelize Validation Error
  else if (err.name === 'SequelizeValidationError') {
    const errors = err.errors || [];
    const message = errors.map((e) => e.message).join(', ');
    error = new ApiError(400, message);
  }

  // 3. Sequelize Unique Constraint Error
  else if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors || [];
    const message = errors.map((e) => e.message).join(', ');
    error = new ApiError(400, message);
  }

  // 3. Sequelize Database Error (e.g. invalid syntax, foreign key violation, etc.)
  else if (err.name === 'SequelizeDatabaseError') {
    const message = process.env.NODE_ENV === 'production'
      ? 'A database error occurred.'
      : err.message;
    error = new ApiError(400, message);
  }

  // 4. JWT JsonWebTokenError (e.g. malformed token)
  else if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route, token is invalid.';
    error = new ApiError(401, message);
  }

  // 5. JWT TokenExpiredError
  else if (err.name === 'TokenExpiredError') {
    const message = 'Session expired. Please log in again.';
    error = new ApiError(401, message);
  }

  // Ensure the error is an instance of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const statusCode = error.statusCode || 500;
  // Fail-safe message to avoid leaking stack traces or configuration information in production
  const responseMessage =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : error.message;

  res.status(statusCode).json({
    success: error.success,
    statusCode,
    message: responseMessage,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
