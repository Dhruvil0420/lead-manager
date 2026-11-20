require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin) return callback(null, true);
      const clientUrl = process.env.CLIENT_URL;
      if (
        !clientUrl ||
        origin === clientUrl ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Ensure MongoDB connection before handling any request (critical for serverless / Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Favicon handler to avoid 404 logs in browsers
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root API Welcome / Status
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lead Manager API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      leads: '/api/leads',
      stats: '/api/leads/stats',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (mounted on both /api/* and /* for full URL resilience)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/leads', leadRoutes);
app.use('/leads', leadRoutes);

// 404 Catch-all for unhandled routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
