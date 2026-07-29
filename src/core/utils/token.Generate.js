import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessAndRefreshTokens = (employee) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : null);

  if (!accessTokenSecret) {
    throw new Error("Critical Security Configuration Error: ACCESS_TOKEN_SECRET or JWT_SECRET is not configured.");
  }
  
  if (!refreshTokenSecret) {
    throw new Error("Critical Security Configuration Error: REFRESH_TOKEN_SECRET is not configured.");
  }

  // Ensure secrets are long enough (at least 256 bits / 32 bytes)
  if (process.env.NODE_ENV === 'production') {
    if (accessTokenSecret.length < 32) {
      console.warn("Security Warning: Access Token Secret is too short. It should be at least 32 characters long.");
    }
    if (refreshTokenSecret.length < 32) {
      console.warn("Security Warning: Refresh Token Secret is too short. It should be at least 32 characters long.");
    }
  }

  // Generate unique ID for token tracking & replay attack prevention (jti claim)
  const accessTokenId = crypto.randomUUID();
  const refreshTokenId = crypto.randomUUID();

  // Access Token Payload
  const accessPayload = {
    id: employee.id,
    email: employee.email,
    role_id: employee.type,
    jti: accessTokenId,
  };

  // Sign Access Token
  const accessToken = jwt.sign(
    accessPayload,
    accessTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || process.env.JWT_EXPIRE || '1d',
      issuer: process.env.JWT_ISSUER || 'satya-collection-api',
      audience: process.env.JWT_AUDIENCE || 'satya-collection-client',
    }
  );

  // Refresh Token Payload (Only include essential identifier and jti)
  const refreshPayload = {
    id: employee.id,
    jti: refreshTokenId,
  };

  // Sign Refresh Token
  const refreshToken = jwt.sign(
    refreshPayload,
    refreshTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
      issuer: process.env.JWT_ISSUER || 'satya-collection-api',
      audience: process.env.JWT_AUDIENCE || 'satya-collection-client',
    }
  );

  return { accessToken, refreshToken };
};
