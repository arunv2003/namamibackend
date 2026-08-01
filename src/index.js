import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, closeDB } from './core/config/db.js';
import { initSocketServer } from './core/config/socket.js';
import { handleFieldVisitSockets } from './modules/fieldvisit/controllers/fieldvistit.controller.soket.js';
import { initAttendanceCron, stopAttendanceCron } from './modules/attendance/utils/attendance.cron.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    initAttendanceCron();

    const HOST = process.env.HOST || '0.0.0.0';
    server = app.listen(PORT, HOST, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`
      );
      console.log('🚀 [SERVER STARTED WITHOUT CACHING]');

      // Render Auto Keep-Alive (Prevents 15-min spin-down / Cold Starts)
      const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
      if (keepAliveUrl) {
        console.log(`📡 [Keep-Alive Ping] Active for: ${keepAliveUrl}/health`);
        setInterval(() => {
          fetch(`${keepAliveUrl.replace(/\/$/, '')}/health`)
            .then((res) => console.log(`[Keep-Alive Ping] Pulse OK (${res.status})`))
            .catch((err) => console.warn(`[Keep-Alive Ping] Warning: ${err.message}`));
        }, 10 * 60 * 1000);
      }
    });

    const io = initSocketServer(server);
    io.on('connection', (socket) => {
      handleFieldVisitSockets(io, socket);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async (signal) => {
  console.warn(`Received ${signal}. Starting graceful shutdown...`);
  stopAttendanceCron();

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');

      await closeDB();

      console.log('Graceful shutdown completed. Exiting process.');
      process.exit(0);
    });
  } else {
    await closeDB();
    process.exit(0);
  }

  setTimeout(() => {
    console.error('Forced shutdown: Graceful shutdown timed out.');
    process.exit(1);
  }, 10000);
};

process.on('uncaughtException', async (error) => {
  console.error(`CRITICAL UNCAUGHT EXCEPTION: ${error.message}`);
  console.error(error.stack);
  await gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  await gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));