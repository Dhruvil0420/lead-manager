const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { signupSchema, loginSchema } = require('../validators/authSchema');

// Public auth routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);

// Protected auth route
router.get('/me', protect, authController.getMe);

module.exports = router;

