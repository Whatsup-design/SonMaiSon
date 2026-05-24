import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.emit('connection:ready', {
      socketId: socket.id,
    });

    socket.on('ping:server', () => {
      socket.emit('pong:server', {
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};
