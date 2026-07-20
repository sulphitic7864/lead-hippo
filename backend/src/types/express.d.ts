import type { AdminSession } from './models.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSession;
    }
  }
}
export {};
