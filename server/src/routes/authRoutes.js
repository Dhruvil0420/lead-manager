const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../validators/authSchema');

// Public auth routes protected by rate limiting against brute-force attacks
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected auth route
router.get('/me', protect, authController.getMe);

module.exports = router;
