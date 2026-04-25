import { User } from '@supabase/supabase-js';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      authUser?: User;
      tokenPayload?: JwtPayload | string | null;
    }
  }
}

export {};
