import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app';
import { setupSocket } from './socket/index';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Initialize Socket.io
const io = setupSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🚀 DevSync Backend Server           ║
  ║     Running on port ${PORT}                ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚══════════════════════════════════════════╝
  `);
});

export { io };
