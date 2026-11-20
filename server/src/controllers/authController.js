const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/signup - Register a new user
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email is already registered' }],
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login - Authenticate existing user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Password has select: false in schema, so explicitly include it here
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
        errors: [],
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me - Get currently authenticated user profile
const getMe = async (req, res) => {
  res.status(200).json({
    message: 'User profile fetched successfully',
    data: req.user,
  });
};

module.exports = {
  signup,
  login,
  getMe,
};

