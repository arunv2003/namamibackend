import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocketServer = (httpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''))
    : '*';

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use((socket, next) => {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    const token = rawToken && rawToken.startsWith('Bearer ')
      ? rawToken.substring(7).trim()
      : rawToken;

    if (token) {
      try {
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
        socket.emp_id = decoded.id;
      } catch (err) {
        console.warn(`⚠️ [SOCKET AUTH WARNING] Invalid token for socket ${socket.id}: ${err.message}`);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [SOCKET CONNECTED] Client ID: ${socket.id}${socket.emp_id ? ` (Employee ID: ${socket.emp_id})` : ''}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [SOCKET DISCONNECTED] Client ID: ${socket.id}, Reason: ${reason}`);
    });
  });

  console.log('⚡ [SOCKET.IO SERVER INITIALIZED WITH AUTH MIDDLEWARE]');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io server not initialized!');
  }
  return io;
};
