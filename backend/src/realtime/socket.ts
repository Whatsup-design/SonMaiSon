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
  getAppUserByAuthId,
  getDmConversationIdsByAuthId,
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
    appUserId: number;
  };
};

type SocketAck = (response: {
  success: boolean;
  data?: unknown;
  error?: ReturnType<typeof getErrorPayload>;
}) => void;

type CallRecipientSocket = {
  id: string;
  emit: (eventName: string, payload: unknown) => void;
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
const getAppUserRoom = (userId: number) => `app-user:${userId}`;

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

    rooms.add(getAppUserRoom(participant.user_id));
  }

  return [...rooms];
};

const emitSocketAck = (
  ack: unknown,
  response: Parameters<SocketAck>[0],
) => {
  if (typeof ack === 'function') {
    (ack as SocketAck)(response);
  }
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
      const appUser = await getAppUserByAuthId(data.user.id);

      socket.data.appUserId = appUser.id;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('Socket auth failed'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const getCallRecipientSockets = async (
      conversationId: string,
      recipientParticipants: DmParticipant[],
    ) => {
      const recipientSockets = new Map<string, CallRecipientSocket>();
      const recipientRooms = getRecipientUserRooms(recipientParticipants);

      for (const room of recipientRooms) {
        const sockets = await io.in(room).fetchSockets();

        for (const recipientSocket of sockets) {
          if (recipientSocket.id !== authenticatedSocket.id) {
            recipientSockets.set(recipientSocket.id, recipientSocket);
          }
        }
      }

      const dmSockets = await io.in(`dm:${conversationId}`).fetchSockets();

      for (const dmSocket of dmSockets) {
        if (dmSocket.id !== authenticatedSocket.id) {
          recipientSockets.set(dmSocket.id, dmSocket);
        }
      }

      return [...recipientSockets.values()];
    };

    const getCallDeliveryState = async (
      conversationId: string,
      recipientParticipants: DmParticipant[],
    ) => {
      const recipientSockets = await getCallRecipientSockets(
        conversationId,
        recipientParticipants,
      );

      return {
        recipientCount: recipientParticipants.length,
        onlineRecipientSocketCount: recipientSockets.length,
      };
    };
    const emitToCallRecipients = async (
      conversationId: string,
      recipientParticipants: DmParticipant[],
      eventName: string,
      eventPayload: unknown,
    ) => {
      const recipientSockets = await getCallRecipientSockets(
        conversationId,
        recipientParticipants,
      );

      for (const recipientSocket of recipientSockets) {
        recipientSocket.emit(eventName, eventPayload);
      }

      return {
        deliveredSocketCount: recipientSockets.length,
      };
    };

    console.log(`Socket connected: ${authenticatedSocket.id}`);

    authenticatedSocket.join(getUserRoom(authenticatedSocket.data.authId));
    authenticatedSocket.join(getAppUserRoom(authenticatedSocket.data.appUserId));

    getDmConversationIdsByAuthId(authenticatedSocket.data.authId)
      .then((conversationIds) => {
        for (const conversationId of conversationIds) {
          authenticatedSocket.join(`dm:${conversationId}`);
        }

        console.log('Socket auto-joined DM rooms', {
          socketId: authenticatedSocket.id,
          userId: authenticatedSocket.data.appUserId,
          count: conversationIds.length,
        });
      })
      .catch((error) => {
        console.error('Failed to auto-join DM rooms', {
          socketId: authenticatedSocket.id,
          userId: authenticatedSocket.data.appUserId,
          error,
        });
      });

    authenticatedSocket.emit('connection:ready', {
      socketId: authenticatedSocket.id,
      authId: authenticatedSocket.data.authId,
      userId: authenticatedSocket.data.appUserId,
    });

    authenticatedSocket.on('ping:server', () => {
      authenticatedSocket.emit('pong:server', {
        timestamp: new Date().toISOString(),
      });
    });

    authenticatedSocket.on('socket:debug', async (_payload, ack) => {
      const userRoom = getUserRoom(authenticatedSocket.data.authId);
      const appUserRoom = getAppUserRoom(authenticatedSocket.data.appUserId);
      const userRoomSockets = await io.in(userRoom).fetchSockets();
      const appUserRoomSockets = await io.in(appUserRoom).fetchSockets();

      const debugPayload = {
        socketId: authenticatedSocket.id,
        authId: authenticatedSocket.data.authId,
        userId: authenticatedSocket.data.appUserId,
        rooms: [...authenticatedSocket.rooms],
        userRoom,
        userRoomSocketCount: userRoomSockets.length,
        appUserRoom,
        appUserRoomSocketCount: appUserRoomSockets.length,
      };

      emitSocketAck(ack, {
        success: true,
        data: debugPayload,
      });
      authenticatedSocket.emit('socket:debug:result', debugPayload);
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

    authenticatedSocket.on('call:invite', async (payload, ack) => {
      try {
        const { conversationId, callType } =
          dmCallInvitePayloadSchema.parse(payload);
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
          callType,
          caller,
          recipients,
          createdAt: new Date().toISOString(),
        };
        const invitedPayload = {
          ...baseCallPayload,
          direction: 'outgoing',
          callee: recipients[0] ?? null,
          delivery: {
            recipientCount: callContext.recipientParticipants.length,
            onlineRecipientSocketCount: null,
            status: 'pending',
          },
        };

        emitSocketAck(ack, {
          success: true,
          data: invitedPayload,
        });
        authenticatedSocket.emit('call:invited', invitedPayload);

        const incomingDelivery = await emitToCallRecipients(
          conversationId,
          callContext.recipientParticipants,
          'call:incoming',
          {
            ...baseCallPayload,
            direction: 'incoming',
          },
        );

        const delivery = await getCallDeliveryState(
          conversationId,
          callContext.recipientParticipants,
        );

        console.log('Call invite delivery', {
          callId,
          conversationId,
          callerAuthId: authenticatedSocket.data.authId,
          recipientCount: delivery.recipientCount,
          onlineRecipientSocketCount: delivery.onlineRecipientSocketCount,
          deliveredSocketCount: incomingDelivery.deliveredSocketCount,
        });

        authenticatedSocket.emit('call:delivery', {
          callId,
          conversationId,
          delivery: {
            ...delivery,
            deliveredSocketCount: incomingDelivery.deliveredSocketCount,
          },
        });
      } catch (error) {
        const errorPayload = getErrorPayload(error);

        emitSocketAck(ack, {
          success: false,
          error: errorPayload,
        });
        authenticatedSocket.emit('call:error', errorPayload);
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

        await emitToCallRecipients(
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

        await emitToCallRecipients(
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

        await emitToCallRecipients(
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

        await emitToCallRecipients(
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

        await emitToCallRecipients(
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

        await emitToCallRecipients(
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
