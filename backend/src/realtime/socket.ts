import { Server as HttpServer } from 'http';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { supabase } from '../lib/supabase';
import {
  dmCallAnswerPayloadSchema,
  dmCallControlPayloadSchema,
  dmCallIceCandidatePayloadSchema,
  dmCallInvitePayloadSchema,
  dmCallOfferPayloadSchema,
  dmJoinPayloadSchema,
  dmSendMessagePayloadSchema,
} from '../schemas/dm.schema';
import {
  channelJoinPayloadSchema,
  channelSendMessagePayloadSchema,
} from '../schemas/guild.schema';
import {
  assertDmParticipantByAuthId,
  DmParticipant,
  getDmCallContext,
  getSingleRelation,
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

const getUserRoom = (authId: string) => `user:${authId}`;

const formatCallUser = (participant: DmParticipant) => {
  const user = getSingleRelation(participant.user);

  return {
    userId: participant.user_id,
    authId: user?.auth_id ?? null,
    username: user?.username ?? null,
    displayName: user?.display_name ?? null,
    avatarUrl: user?.avatar_url ?? null,
  };
};

const getRecipientUserRooms = (participants: DmParticipant[]) => {
  const rooms = new Set<string>();

  for (const participant of participants) {
    const user = getSingleRelation(participant.user);

    if (user?.auth_id) {
      rooms.add(getUserRoom(user.auth_id));
    }
  }

  return [...rooms];
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
    const emitToCallRecipients = (
      conversationId: string,
      recipientParticipants: DmParticipant[],
      eventName: string,
      eventPayload: unknown,
    ) => {
      const recipientRooms = getRecipientUserRooms(recipientParticipants);
      let target = authenticatedSocket.to(`dm:${conversationId}`);

      for (const room of recipientRooms) {
        target = target.to(room);
      }

      target.emit(eventName, eventPayload);
    };

    console.log(`Socket connected: ${authenticatedSocket.id}`);

    authenticatedSocket.join(getUserRoom(authenticatedSocket.data.authId));

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

    authenticatedSocket.on('call:invite', async (payload) => {
      try {
        const { conversationId } = dmCallInvitePayloadSchema.parse(payload);
        const callId = randomUUID();
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const callerParticipant = callContext.participants.find(
          (participant) => participant.user_id === callContext.currentUser.id,
        );
        const caller = callerParticipant
          ? formatCallUser(callerParticipant)
          : {
              userId: callContext.currentUser.id,
              authId: callContext.currentUser.auth_id,
              username: callContext.currentUser.username,
              displayName: callContext.currentUser.display_name ?? null,
              avatarUrl: callContext.currentUser.avatar_url ?? null,
            };
        const recipients = callContext.recipientParticipants.map(formatCallUser);
        const baseCallPayload = {
          callId,
          conversationId,
          callType: 'voice',
          caller,
          recipients,
          createdAt: new Date().toISOString(),
        };

        authenticatedSocket.emit('call:invited', {
          ...baseCallPayload,
          direction: 'outgoing',
          callee: recipients[0] ?? null,
        });

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:incoming',
          {
            ...baseCallPayload,
            direction: 'incoming',
          },
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:accept', async (payload) => {
      try {
        const { conversationId, callId } =
          dmCallControlPayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const acceptorParticipant = callContext.participants.find(
          (participant) => participant.user_id === callContext.currentUser.id,
        );
        const eventPayload = {
          callId,
          conversationId,
          acceptedBy: acceptorParticipant
            ? formatCallUser(acceptorParticipant)
            : null,
          acceptedAt: new Date().toISOString(),
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:accepted',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:reject', async (payload) => {
      try {
        const { conversationId, callId } =
          dmCallControlPayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const eventPayload = {
          callId,
          conversationId,
          rejectedAt: new Date().toISOString(),
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:rejected',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:end', async (payload) => {
      try {
        const { conversationId, callId } =
          dmCallControlPayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const eventPayload = {
          callId,
          conversationId,
          endedAt: new Date().toISOString(),
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:ended',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:webrtc:offer', async (payload) => {
      try {
        const { conversationId, callId, offer } =
          dmCallOfferPayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const eventPayload = {
          callId,
          conversationId,
          offer,
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:webrtc:offer',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:webrtc:answer', async (payload) => {
      try {
        const { conversationId, callId, answer } =
          dmCallAnswerPayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const eventPayload = {
          callId,
          conversationId,
          answer,
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:webrtc:answer',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
      }
    });

    authenticatedSocket.on('call:webrtc:ice-candidate', async (payload) => {
      try {
        const { conversationId, callId, candidate } =
          dmCallIceCandidatePayloadSchema.parse(payload);
        const callContext = await getDmCallContext(
          authenticatedSocket.data.authId,
          conversationId,
        );
        const eventPayload = {
          callId,
          conversationId,
          candidate,
        };

        emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:webrtc:ice-candidate',
          eventPayload,
        );
      } catch (error) {
        authenticatedSocket.emit('call:error', getErrorPayload(error));
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
