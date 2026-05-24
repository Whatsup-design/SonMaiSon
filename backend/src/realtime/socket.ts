import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { supabase } from '../lib/supabase';
import {
  dmJoinPayloadSchema,
  dmSendMessagePayloadSchema,
} from '../schemas/dm.schema';
import {
  channelJoinPayloadSchema,
  channelSendMessagePayloadSchema,
} from '../schemas/guild.schema';
import {
  assertDmParticipantByAuthId,
  sendDmMessage,
} from '../services/dmService';
import { getChannelWithMembership } from '../services/guild/guildShared';
import { sendChannelMessage } from '../services/guild/sendChannelMessage';
import { AppError } from '../utils/AppError';
import { assertSocketMessageRateLimit } from '../utils/socketMessageRateLimit';

type AuthenticatedSocket = Socket & {
  data: {
    authId: string;
  };
};

const getSocketToken = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim().replace(/^Bearer\s+/i, '');
  }

  const authorization = socket.handshake.headers.authorization;

  if (authorization?.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '').trim();
  }

  return null;
};

const getErrorPayload = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      details: null,
    };
  }

  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected socket error',
    details: null,
  };
};

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);

      if (!token) {
        next(new Error('Socket authentication token is required'));
        return;
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        next(new Error('Socket authentication token is invalid'));
        return;
      }

      socket.data.authId = data.user.id;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('Socket auth failed'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    console.log(`Socket connected: ${authenticatedSocket.id}`);

    authenticatedSocket.emit('connection:ready', {
      socketId: authenticatedSocket.id,
    });

    authenticatedSocket.on('ping:server', () => {
      authenticatedSocket.emit('pong:server', {
        timestamp: new Date().toISOString(),
      });
    });

    authenticatedSocket.on('dm:join', async (payload) => {
      try {
        const { conversationId } = dmJoinPayloadSchema.parse(payload);

        await assertDmParticipantByAuthId(
          authenticatedSocket.data.authId,
          conversationId,
        );

        await authenticatedSocket.join(`dm:${conversationId}`);
        authenticatedSocket.emit('dm:joined', {
          conversationId,
        });
      } catch (error) {
        authenticatedSocket.emit('dm:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('dm:message:send', async (payload) => {
      try {
        const { conversationId, content } =
          dmSendMessagePayloadSchema.parse(payload);

        assertSocketMessageRateLimit(authenticatedSocket.data.authId, 'dm');

        const message = await sendDmMessage(
          authenticatedSocket.data.authId,
          conversationId,
          content,
        );

        io.to(`dm:${conversationId}`).emit('dm:message:new', message);
      } catch (error) {
        authenticatedSocket.emit('dm:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('channel:join', async (payload) => {
      try {
        const { channelId } = channelJoinPayloadSchema.parse(payload);

        await getChannelWithMembership(
          authenticatedSocket.data.authId,
          channelId,
        );

        await authenticatedSocket.join(`channel:${channelId}`);
        authenticatedSocket.emit('channel:joined', {
          channelId,
        });
      } catch (error) {
        authenticatedSocket.emit('channel:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('channel:message:send', async (payload) => {
      try {
        const { channelId, content } =
          channelSendMessagePayloadSchema.parse(payload);

        assertSocketMessageRateLimit(
          authenticatedSocket.data.authId,
          'channel',
        );

        const message = await sendChannelMessage(
          authenticatedSocket.data.authId,
          channelId,
          content,
        );

        io.to(`channel:${channelId}`).emit('channel:message:new', message);
      } catch (error) {
        authenticatedSocket.emit('channel:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${authenticatedSocket.id} (${reason})`);
    });
  });

  return io;
};
