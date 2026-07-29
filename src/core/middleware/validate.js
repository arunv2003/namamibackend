import { ApiError } from '../utils/api.Errors.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorMessage = issues
      .map((err) => `${err.path && err.path.length ? `${err.path.join('.')}: ` : ''}${err.message}`)
      .join(', ');

    return next(new ApiError(400, `Validation Error: ${errorMessage}`));
  }

  req.body = result.data;
  next();
};
