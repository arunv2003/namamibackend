import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { errorHandler } from './core/middleware/error.js';
import { globalLimiter, sanitizeRequests } from './core/middleware/security.js';
import { ApiError } from './core/utils/api.Errors.js';

import apiRouter from './routes.js';

dotenv.config();

const app = express();

if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Configure Helmet with cross-origin resource policy for static uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === 'development'
    ) {
      callback(null, true);
    } else {
      callback(new ApiError(403, 'Not allowed by CORS security policy.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(globalLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(sanitizeRequests);

// Ensure uploads folder exists and serve static files
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));
app.use('/upload', express.static(uploadsDir));
app.use(express.static(uploadsDir));

app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Namami Backend API is running',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.originalUrl} not found`));
});

app.use(errorHandler);

export default app;
