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
  ? process.env.CORS_ORIGIN.replace(/[\r\n]/g, '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(cleanOrigin) ||
      process.env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
  ],
  optionsSuccessStatus: 200,
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

// Fallback handler for missing static upload files (e.g. after Render restart)
app.use(['/uploads', '/upload'], (req, res) => {
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#e2e8f0" rx="64"/>
    <circle cx="64" cy="50" r="24" fill="#94a3b8"/>
    <path d="M28,108 C28,82 44,70 64,70 C84,70 100,82 100,108 Z" fill="#94a3b8"/>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).send(svgPlaceholder);
});

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
