import { z } from 'zod';

const emailPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(6),
  })
  .strict();

const signupBodySchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    username: z.string().trim().min(1).max(50).optional(),
    ' username': z.string().trim().min(1).max(50).optional(),
  })
  .strict()
  .transform(({ ' username': usernameWithSpace, username, ...body }) => ({
    ...body,
    username: username ?? usernameWithSpace,
  }));

export const signupSchema = z.object({
  body: signupBodySchema,
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
