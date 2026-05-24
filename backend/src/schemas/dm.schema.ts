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
