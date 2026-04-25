import { supabase } from '../lib/supabase';
import { createSupabaseUserClient } from '../lib/supabase';
import { env } from '../config/env';

type AuthPayload = {
  email: string;
  password: string;
  username?: string;
};

type SupabaseAuthData = {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  session: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    expires_at?: number;
  } | null;
};

const validateAuthPayload = ({ email, password }: AuthPayload) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
};

const formatAuthResponse = (data: SupabaseAuthData) => ({
  user: data.user,
  session: data.session
    ? {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        tokenType: data.session.token_type,
        expiresIn: data.session.expires_in,
        expiresAt: data.session.expires_at,
      }
    : null,
});

export const signupUser = async ({ email, password, username }: AuthPayload) => {
  validateAuthPayload({ email, password });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return formatAuthResponse(data);
};

export const loginUser = async ({ email, password }: AuthPayload) => {
  validateAuthPayload({ email, password });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return formatAuthResponse(data);
};

export const getOAuthUrl = async (provider: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github' | 'facebook' | 'discord',
    options: {
      redirectTo: `${env.clientUrl}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    provider,
    url: data.url,
  };
};

export const logoutUser = async (accessToken?: string) => {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  const { error } = await createSupabaseUserClient(accessToken).auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return {
    message: 'Logout successful',
  };
};
