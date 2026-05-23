import { env } from '../../config/env';
import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { createSupabaseUserClient, supabase } from '../../lib/supabase';
import { OAuthProvider } from '../../schemas/auth.schema';
import { AppError } from '../../utils/AppError';

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
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.AUTH_SIGNUP_FAILED,
      message: error.message,
      details: error,
    });
  }

  return formatAuthResponse(data);
};

export const loginUser = async ({ email, password }: AuthPayload) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError({
      statusCode: HttpStatus.UNAUTHORIZED,
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: error.message,
      details: error,
    });
  }

  return formatAuthResponse(data);
};

export const getOAuthUrl = async (provider: OAuthProvider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${env.clientUrl}/auth/callback`,
    },
  });

  if (error) {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.AUTH_OAUTH_FAILED,
      message: error.message,
      details: error,
    });
  }

  return {
    provider,
    url: data.url,
  };
};

export const logoutUser = async (accessToken?: string) => {
  if (!accessToken) {
    throw new AppError({
      statusCode: HttpStatus.UNAUTHORIZED,
      code: ErrorCode.AUTH_TOKEN_REQUIRED,
      message: 'Access token is required',
    });
  }

  const { error } = await createSupabaseUserClient(accessToken).auth.signOut();

  if (error) {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.AUTH_LOGOUT_FAILED,
      message: error.message,
      details: error,
    });
  }

  return {
    message: 'Logout successful',
  };
};
