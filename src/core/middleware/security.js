import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';

/**
 * Global Rate Limiter to prevent DOS / Bruteforce attacks
 */
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Default: 100 requests per IP per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      data: null,
      message: 'Too many requests. Please wait a few moments and try again.',
    });
  },
});

/**
 * Strict Rate Limiter for sensitive endpoints like auth (Login, Register, Password Reset)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 authentication requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      data: null,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});



/**
 * Sanitize input fields recursively to strip out malicious HTML/Script tags (XSS Prevention)
 * Preserves base64 image payloads
 */
const deepSanitize = (val, keyName = '') => {
  if (typeof val === 'string') {
    if (
      keyName === 'image' ||
      keyName === 'thumbnail' ||
      keyName === 'file' ||
      val.startsWith('data:image/') ||
      val.startsWith('http://') ||
      val.startsWith('https://')
    ) {
      return val;
    }
    return sanitizeHtml(val, {
      allowedTags: [], // Strip all HTML tags entirely
      allowedAttributes: {}, // Strip all attributes
    });
  }
  if (Array.isArray(val)) {
    return val.map((item) => deepSanitize(item, keyName));
  }
  if (val !== null && typeof val === 'object') {
    const cleaned = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        cleaned[key] = deepSanitize(val[key], key);
      }
    }
    return cleaned;
  }
  return val;
};

export const sanitizeRequests = (req, res, next) => {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query) {
    const sanitizedQuery = deepSanitize(req.query);
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (req.params) {
    const sanitizedParams = deepSanitize(req.params);
    Object.defineProperty(req, 'params', {
      value: sanitizedParams,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
};
