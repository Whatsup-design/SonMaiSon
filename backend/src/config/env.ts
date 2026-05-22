import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 5000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return port;
};

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  supabaseUrl: requiredEnv('SUPABASE_URL'),
  supabaseAnonKey: requiredEnv('SUPABASE_ANON_KEY'),
};
