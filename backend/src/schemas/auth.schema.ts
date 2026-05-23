import { z } from 'zod';

const emailPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(6),
  })
  .strict();

export const signupSchema = z.object({
  body: emailPasswordSchema.extend({
    username: z.string().trim().min(1).max(50).optional(),
  }),
});

export const loginSchema = z.object({
  body: emailPasswordSchema,
});

export const oauthProviderSchema = z.object({
  params: z
    .object({
      provider: z.literal('google'),
    })
    .strict(),
});

export type OAuthProvider = z.infer<
  typeof oauthProviderSchema
>['params']['provider'];
