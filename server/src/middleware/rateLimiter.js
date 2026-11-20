const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints: max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  // Return standard error response shape on rate limit violation
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many authentication attempts, please try again after 15 minutes',
      errors: [
        {
          field: 'general',
          message: 'Rate limit exceeded. Please wait a few minutes before retrying.',
        },
      ],
    });
  },
});

module.exports = { authLimiter };

