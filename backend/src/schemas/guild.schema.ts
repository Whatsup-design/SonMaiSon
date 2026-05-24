import { z } from 'zod';

const optionalUrlSchema = z.preprocess((value) => {
  if (value === null || value === '') {
    return undefined;
  }

  return value;
}, z.url().optional());

export const createGuildSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(80),
      iconUrl: optionalUrlSchema,
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

export const createGuildInviteSchema = z.object({
  params: z
    .object({
      guildId: z.uuid(),
    })
    .strict(),
  body: z
    .object({
      maxUses: z.coerce.number().int().positive().max(1000).nullable().optional(),
      expiresInMinutes: z.coerce
        .number()
        .int()
        .positive()
        .max(60 * 24 * 30)
        .nullable()
        .optional(),
    })
    .strict()
    .optional(),
});

export const inviteCodeParamSchema = z.object({
  params: z
    .object({
      code: z.string().trim().min(4).max(64),
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
