import { z } from 'zod';

export const createGuildSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(80),
      iconUrl: z.url().optional(),
    })
    .strict(),
});

export const guildIdParamSchema = z.object({
  params: z
    .object({
      guildId: z.uuid(),
    })
    .strict(),
});

export const createGuildChannelSchema = z.object({
  params: z
    .object({
      guildId: z.uuid(),
    })
    .strict(),
  body: z
    .object({
      name: z.string().trim().min(1).max(80),
      type: z.enum(['text', 'voice']).default('text'),
      position: z.coerce.number().int().min(0).optional(),
    })
    .strict(),
});

export const getChannelMessagesSchema = z.object({
  params: z
    .object({
      channelId: z.uuid(),
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

export const sendChannelMessageSchema = z.object({
  params: z
    .object({
      channelId: z.uuid(),
    })
    .strict(),
  body: z
    .object({
      content: z.string().trim().min(1).max(4000),
    })
    .strict(),
});

export const channelJoinPayloadSchema = z
  .object({
    channelId: z.uuid(),
  })
  .strict();

export const channelSendMessagePayloadSchema = z
  .object({
    channelId: z.uuid(),
    content: z.string().trim().min(1).max(4000),
  })
  .strict();
