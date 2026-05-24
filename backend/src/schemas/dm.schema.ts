import { z } from 'zod';

export const createDmConversationSchema = z.object({
  body: z
    .object({
      targetUserId: z.coerce.number().int().positive(),
    })
    .strict(),
});

export const getDmMessagesSchema = z.object({
  params: z
    .object({
      conversationId: z.uuid(),
    })
    .strict(),
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(100).default(50),
      before: z.string().datetime().optional(),
    })
    .strict()
    .optional(),
});

export const dmJoinPayloadSchema = z
  .object({
    conversationId: z.uuid(),
  })
  .strict();

export const dmSendMessagePayloadSchema = z
  .object({
    conversationId: z.uuid(),
    content: z.string().trim().min(1).max(4000),
  })
  .strict();

export const dmCallInvitePayloadSchema = z
  .object({
    conversationId: z.uuid(),
  })
  .strict();

export const dmCallControlPayloadSchema = z
  .object({
    conversationId: z.uuid(),
    callId: z.uuid(),
  })
  .strict();

export const dmCallOfferPayloadSchema = z
  .object({
    conversationId: z.uuid(),
    callId: z.uuid(),
    offer: z
      .object({
        type: z.literal('offer'),
        sdp: z.string(),
      })
      .passthrough(),
  })
  .strict();

export const dmCallAnswerPayloadSchema = z
  .object({
    conversationId: z.uuid(),
    callId: z.uuid(),
    answer: z
      .object({
        type: z.literal('answer'),
        sdp: z.string(),
      })
      .passthrough(),
  })
  .strict();

export const dmCallIceCandidatePayloadSchema = z
  .object({
    conversationId: z.uuid(),
    callId: z.uuid(),
    candidate: z
      .object({
        candidate: z.string().optional(),
        sdpMid: z.string().nullable().optional(),
        sdpMLineIndex: z.number().nullable().optional(),
        usernameFragment: z.string().nullable().optional(),
      })
      .passthrough(),
  })
  .strict();
