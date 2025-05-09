import { UserFromJwt } from '../auth/interfaces/user-from-jwt.interface';

declare module 'express' {
  interface Request {
    user?: UserFromJwt;
  }
}
