import { User } from '@supabase/supabase-js';
import { JwtPayload } from 'jsonwebtoken';
import { DatabaseUser } from '../services/userService';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      authUser?: User;
      tokenPayload?: JwtPayload | string | null;
      databaseUser?: DatabaseUser | null;
    }
  }
}

export {};
