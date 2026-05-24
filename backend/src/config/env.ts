import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CLIENT_URL: z.string().trim().pipe(z.url()).default('http://localhost:3001'),
  SUPABASE_URL: z.string().trim().pipe(z.url()),
  SUPABASE_ANON_KEY: z.string().trim().min(1),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  clientUrl: parsedEnv.CLIENT_URL,
  supabaseUrl: parsedEnv.SUPABASE_URL,
  supabaseAnonKey: parsedEnv.SUPABASE_ANON_KEY,
};
