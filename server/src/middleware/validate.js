// Reusable Zod validation middleware adhering to standard error shape:
// { "message": string, "errors": [{ "field": string, "message": string }] }
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const rawIssues = result.error.issues || result.error.errors || [];
    const errors = rawIssues.map((issue) => ({
      field: Array.isArray(issue.path) && issue.path.length > 0 ? issue.path.join('.') : 'general',
      message: issue.message,
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  // Assign validated and sanitized data back to req.body
  req.body = result.data;
  next();
};

module.exports = validate;
